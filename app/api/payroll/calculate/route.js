import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Worker from "@/models/Worker"
import Attendance from "@/models/Attendance"
import Ledger from "@/models/Ledger"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId");
    const periodStartStr = searchParams.get("periodStart");
    const periodEndStr = searchParams.get("periodEnd");

    if (!workerId || !periodStartStr || !periodEndStr) {
      return NextResponse.json({ error: "workerId, periodStart, and periodEnd are required" }, { status: 400 });
    }

    const start = new Date(periodStartStr);
    const end = new Date(periodEndStr);
    end.setHours(23, 59, 59, 999);

    await dbConnect();

    // 1. Verify worker belongs to tenant
    const worker = await Worker.findOne({ _id: workerId, tenantId: session.user.tenantId }).lean();
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // 2. Fetch Attendance for dates range
    const attendance = await Attendance.find({
      tenantId: session.user.tenantId,
      workerId,
      date: { $gte: start, $lte: end }
    }).lean();

    const presentDays = attendance.filter(a => a.status === "present").length;
    const halfDays = attendance.filter(a => a.status === "half-day").length;
    const daysWorked = presentDays + (halfDays * 0.5);

    // Sum earnings in this period
    const grossEarnings = attendance.reduce((acc, curr) => acc + curr.wageEarned, 0);

    // 3. Fetch outstanding balance (current ledger balance)
    const latestLedger = await Ledger.findOne({
      tenantId: session.user.tenantId,
      workerId
    }).sort({ date: -1, createdAt: -1 }).lean();

    const currentBalance = latestLedger ? latestLedger.balanceAfter : 0;

    // Separate outstanding advances (sum of advance debits that haven't been settled yet)
    // In this simple ledger model, currentBalance represents the net amount company owes worker.
    // If currentBalance is negative, it means the worker has taken more advances than earned.
    // If positive, it means the company owes the worker money.
    // So the net pending salary is simply the currentBalance (if positive) or 0 (if negative).
    const pendingSalary = currentBalance > 0 ? currentBalance : 0;
    const outstandingAdvance = currentBalance < 0 ? Math.abs(currentBalance) : 0;

    return NextResponse.json({
      workerId,
      workerName: worker.name,
      dailyWage: worker.dailyWage,
      presentDays,
      halfDays,
      daysWorked,
      grossEarnings,
      currentBalance,
      outstandingAdvance,
      pendingSalary
    });

  } catch (error) {
    console.error("GET calculate payroll error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
