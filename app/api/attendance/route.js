import { NextResponse } from "next/server"
import { auth } from "@/auth"
import mongoose from "mongoose"
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
    const dateStr = searchParams.get("date");
    const projectId = searchParams.get("projectId");

    if (!dateStr || !projectId) {
      return NextResponse.json({ error: "date and projectId are required query parameters" }, { status: 400 });
    }

    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    await dbConnect();

    const attendance = await Attendance.find({
      tenantId: session.user.tenantId,
      projectId,
      date
    }).lean();

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("GET attendance error:", error);
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

    const { date: rawDate, projectId, records } = await req.json();

    if (!rawDate || !projectId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize date to midnight UTC
    const date = new Date(rawDate);
    date.setUTCHours(0, 0, 0, 0);

    dbSession.startTransaction();

    let updatedCount = 0;

    for (const record of records) {
      const { workerId, status, notes } = record;

      // 1. Fetch Worker to verify wage rate
      const worker = await Worker.findOne({ _id: workerId, tenantId: session.user.tenantId }).session(dbSession);
      if (!worker) continue;

      // Calculate daily wage earned
      let wageEarned = 0;
      if (status === "present") {
        wageEarned = worker.dailyWage;
      } else if (status === "half-day") {
        wageEarned = worker.dailyWage / 2;
      }

      // Check if attendance already logged for this worker + date
      let existingAttendance = await Attendance.findOne({
        tenantId: session.user.tenantId,
        workerId,
        date
      }).session(dbSession);

      let deltaWage = wageEarned;
      let attendanceDocId = null;

      if (existingAttendance) {
        // Adjust delta wage if changing status
        deltaWage = wageEarned - existingAttendance.wageEarned;
        
        existingAttendance.status = status;
        existingAttendance.wageEarned = wageEarned;
        existingAttendance.projectId = projectId;
        existingAttendance.notes = notes;
        existingAttendance.markedBy = session.user.id;
        
        await existingAttendance.save({ session: dbSession });
        attendanceDocId = existingAttendance._id;
      } else {
        // Create new log
        const newAttendance = new Attendance({
          tenantId: session.user.tenantId,
          workerId,
          projectId,
          date,
          status,
          wageEarned,
          markedBy: session.user.id,
          notes
        });
        await newAttendance.save({ session: dbSession });
        attendanceDocId = newAttendance._id;
      }

      // 2. Adjust Ledger Entry
      // Retrieve the latest ledger entry to compute the outstanding balance
      const latestLedger = await Ledger.findOne({
        tenantId: session.user.tenantId,
        workerId
      }).sort({ date: -1, createdAt: -1 }).session(dbSession);

      const previousBalance = latestLedger ? latestLedger.balanceAfter : 0;

      // If ledger entry already exists for this attendance reference, update it
      let existingLedger = await Ledger.findOne({
        tenantId: session.user.tenantId,
        workerId,
        referenceId: attendanceDocId
      }).session(dbSession);

      if (existingLedger) {
        existingLedger.credit = wageEarned;
        existingLedger.balanceAfter = existingLedger.balanceAfter + deltaWage;
        await existingLedger.save({ session: dbSession });

        // Cascading update for any future ledger entries to correct running balances
        const futureEntries = await Ledger.find({
          tenantId: session.user.tenantId,
          workerId,
          createdAt: { $gt: existingLedger.createdAt }
        }).sort({ date: 1, createdAt: 1 }).session(dbSession);

        let runningBal = existingLedger.balanceAfter;
        for (const entry of futureEntries) {
          entry.balanceAfter = runningBal + entry.credit - entry.debit;
          await entry.save({ session: dbSession });
          runningBal = entry.balanceAfter;
        }
      } else {
        // Create new Credit ledger post
        const newBalance = previousBalance + wageEarned;
        await Ledger.create([{
          tenantId: session.user.tenantId,
          workerId,
          date,
          transactionType: "Attendance Earnings",
          referenceId: attendanceDocId,
          referenceModel: "Attendance",
          credit: wageEarned,
          debit: 0,
          balanceAfter: newBalance,
          notes: `Wages earned for attendance (${status}) on ${date.toLocaleDateString()}`
        }], { session: dbSession });
      }

      updatedCount++;
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json({ success: true, recordsUpdated: updatedCount });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("POST attendance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
