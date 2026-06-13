import { NextResponse } from "next/server"
import { auth } from "@/auth"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"
import Payroll from "@/models/Payroll"
import Ledger from "@/models/Ledger"

export async function POST(req) {
  const conn = await dbConnect();
  const dbSession = await mongoose.startSession();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supervisor") {
      return NextResponse.json({ error: "Forbidden. Supervisors cannot settle payroll." }, { status: 403 });
    }

    const {
      workerId,
      periodStart,
      periodEnd,
      grossEarnings,
      advanceDeductions,
      netAmountPaid,
      paymentMethod,
      transactionReference,
      paymentNotes
    } = await req.json();

    if (!workerId || !periodStart || !periodEnd || netAmountPaid === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    dbSession.startTransaction();

    // 1. Create the Payroll Settlement document
    const payroll = new Payroll({
      tenantId: session.user.tenantId,
      workerId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      presentDays: 0, // Mock or optional as aggregated from view
      grossEarnings,
      advanceDeductions,
      netAmountPaid,
      paymentMethod,
      transactionReference,
      paymentNotes,
      status: "paid",
      paidBy: session.user.id
    });

    await payroll.save({ session: dbSession });

    // 2. Fetch the latest Ledger balance
    const latestLedger = await Ledger.findOne({
      tenantId: session.user.tenantId,
      workerId
    }).sort({ date: -1, createdAt: -1 }).session(dbSession);

    const previousBalance = latestLedger ? latestLedger.balanceAfter : 0;

    // 3. Post the Debit transaction to the Ledger
    // Debit represents money paid OUT to the worker, so it reduces the company's debt (reduces outstanding balance)
    const newBalance = previousBalance - netAmountPaid;

    await Ledger.create([{
      tenantId: session.user.tenantId,
      workerId,
      date: new Date(),
      transactionType: "Salary Settlements",
      referenceId: payroll._id,
      referenceModel: "Payroll",
      credit: 0,
      debit: netAmountPaid,
      balanceAfter: newBalance,
      notes: paymentNotes || `Salary settlement of ₹${netAmountPaid} paid via ${paymentMethod}`
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json({ success: true, payrollId: payroll._id });

  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("POST settle payroll error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
