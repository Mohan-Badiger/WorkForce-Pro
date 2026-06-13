import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Worker from "@/models/Worker"
import Ledger from "@/models/Ledger"
import Attendance from "@/models/Attendance"

export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    // Verify worker belongs to tenant
    const worker = await Worker.findOne({ _id: id, tenantId: session.user.tenantId }).lean();
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Aggregate Worker Stats:
    // 1. Total days worked (Attendance 'present' = 1, 'half-day' = 0.5)
    const attendanceRecords = await Attendance.find({ 
      workerId: id, 
      tenantId: session.user.tenantId,
      status: { $in: ["present", "half-day"] } 
    }).lean();

    const totalDaysWorked = attendanceRecords.reduce((acc, curr) => {
      return acc + (curr.status === "present" ? 1 : 0.5);
    }, 0);

    // 2. Fetch all Ledger entries for full history and balances
    const ledgerEntries = await Ledger.find({
      workerId: id,
      tenantId: session.user.tenantId
    }).sort({ date: -1, createdAt: -1 }).lean();

    // Sum credits (earnings)
    const totalEarnings = ledgerEntries.reduce((acc, curr) => acc + (curr.credit || 0), 0);

    // Outstanding Balance is the most recent ledger entry balance
    const outstandingBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balanceAfter : 0;

    // Total Advances: Sum debit entries where type is 'Advance Payments'
    const totalAdvances = ledgerEntries
      .filter(entry => entry.transactionType === "Advance Payments")
      .reduce((acc, curr) => acc + (curr.debit || 0), 0);

    // Total Salaries Paid: Sum debit entries where type is 'Salary Settlements'
    const totalSalaryPaid = ledgerEntries
      .filter(entry => entry.transactionType === "Salary Settlements")
      .reduce((acc, curr) => acc + (curr.debit || 0), 0);

    return NextResponse.json({
      worker,
      stats: {
        totalDaysWorked,
        totalEarnings,
        totalAdvances,
        totalSalaryPaid,
        pendingSalary: outstandingBalance // positive means we owe worker, negative means worker owes us
      },
      ledger: ledgerEntries
    });
  } catch (error) {
    console.error("GET worker details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    await dbConnect();

    // Verify ownership and update
    const updatedWorker = await Worker.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedWorker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error) {
    console.error("PUT worker error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden. Only contractors can delete workers." }, { status: 403 });
    }

    const { id } = params;
    await dbConnect();

    // Soft delete: Change status to 'inactive' to preserve ledger history integrity
    const worker = await Worker.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: { status: "inactive" } },
      { new: true }
    );

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Worker marked as inactive." });
  } catch (error) {
    console.error("DELETE worker error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
