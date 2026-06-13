import { NextResponse } from "next/server"
import { auth } from "@/auth"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"
import Advance from "@/models/Advance"
import Ledger from "@/models/Ledger"
import Worker from "@/models/Worker"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch advances and populate worker details
    const advances = await Advance.find({ tenantId: session.user.tenantId })
      .populate("workerId", "name role")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ advances });
  } catch (error) {
    console.error("GET advances error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  const conn = await dbConnect();
  const dbSession = await mongoose.startSession();

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supervisor") {
      return NextResponse.json({ error: "Forbidden. Supervisors cannot log advances." }, { status: 403 });
    }

    const { workerId, amount, date, notes } = await req.json();

    if (!workerId || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    dbSession.startTransaction();

    // 1. Verify worker belongs to tenant
    const worker = await Worker.findOne({ _id: workerId, tenantId: session.user.tenantId }).session(dbSession);
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // 2. Create the Advance record
    const advance = new Advance({
      tenantId: session.user.tenantId,
      workerId,
      amount,
      date: new Date(date),
      notes,
      paidBy: session.user.id
    });

    await advance.save({ session: dbSession });

    // 3. Fetch latest Ledger balance
    const latestLedger = await Ledger.findOne({
      tenantId: session.user.tenantId,
      workerId
    }).sort({ date: -1, createdAt: -1 }).session(dbSession);

    const previousBalance = latestLedger ? latestLedger.balanceAfter : 0;

    // 4. Create Ledger Debit transaction (advances decrease what company owes worker)
    const newBalance = previousBalance - amount;

    await Ledger.create([{
      tenantId: session.user.tenantId,
      workerId,
      date: new Date(date),
      transactionType: "Advance Payments",
      referenceId: advance._id,
      referenceModel: "Advance",
      credit: 0,
      debit: amount,
      balanceAfter: newBalance,
      notes: notes || `Disbursed advance cash payment of ₹${amount}`
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json({ success: true, advanceId: advance._id, balanceAfter: newBalance }, { status: 201 });

  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("POST advance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
