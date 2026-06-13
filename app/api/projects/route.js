import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const projects = await Project.find({ tenantId: session.user.tenantId })
      .populate("assignedWorkers", "name role")
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden. Only contractors can create projects." }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    const project = await Project.create({
      ...body,
      tenantId: session.user.tenantId
    });

    return NextResponse.json({ success: true, projectId: project._id }, { status: 201 });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
