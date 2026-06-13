import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Expense from "@/models/Expense"

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supervisor") {
      return NextResponse.json({ error: "Forbidden. Supervisors cannot edit expenses." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    await dbConnect();

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return NextResponse.json({ error: "Expense record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.error("PUT expense error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supervisor") {
      return NextResponse.json({ error: "Forbidden. Supervisors cannot delete expenses." }, { status: 403 });
    }

    const { id } = params;
    await dbConnect();

    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId
    });

    if (!deletedExpense) {
      return NextResponse.json({ error: "Expense record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense record deleted." });
  } catch (error) {
    console.error("DELETE expense error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
