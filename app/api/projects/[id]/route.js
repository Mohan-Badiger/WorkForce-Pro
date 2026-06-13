import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"

export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    const project = await Project.findOne({ _id: id, tenantId: session.user.tenantId })
      .populate("assignedWorkers", "name role dailyWage status")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET single project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden. Only contractors can edit projects." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    await dbConnect();

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, tenantId: session.user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("PUT project error:", error);
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
      return NextResponse.json({ error: "Forbidden. Only contractors can delete projects." }, { status: 403 });
    }

    const { id } = params;
    await dbConnect();

    const deletedProject = await Project.findOneAndDelete({
      _id: id,
      tenantId: session.user.tenantId
    });

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
