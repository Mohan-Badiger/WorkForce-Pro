import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Expense from "@/models/Expense"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");

    await dbConnect();

    const query = { tenantId: session.user.tenantId };
    
    if (projectId) {
      query.projectId = projectId;
    }
    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query)
      .populate("projectId", "name")
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "supervisor") {
      return NextResponse.json({ error: "Forbidden. Supervisors cannot log expenses." }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    const expense = await Expense.create({
      ...body,
      tenantId: session.user.tenantId,
      loggedBy: session.user.id
    });

    return NextResponse.json({ success: true, expenseId: expense._id }, { status: 201 });
  } catch (error) {
    console.error("POST expense error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
