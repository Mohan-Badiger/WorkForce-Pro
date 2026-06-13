import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Worker from "@/models/Worker"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "active";

    await dbConnect();

    // Base query scoping to the contractor's Tenant
    const query = { tenantId: session.user.tenantId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } }
      ];
    }

    const workers = await Worker.find(query).sort({ name: 1 }).lean();

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("GET workers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only Contractor/Admin can register new staff
    if (session.user.role !== "contractor") {
      return NextResponse.json({ error: "Forbidden. Only contractors can create workers." }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    // Check Aadhaar uniqueness for this tenant to prevent duplicate hires
    const existingWorker = await Worker.findOne({ 
      tenantId: session.user.tenantId, 
      aadhaarNumber: body.aadhaarNumber 
    });
    
    if (existingWorker) {
      return NextResponse.json({ error: "Worker with this Aadhaar Number already exists." }, { status: 400 });
    }

    const worker = await Worker.create({
      ...body,
      tenantId: session.user.tenantId,
      status: "active"
    });

    return NextResponse.json({ success: true, workerId: worker._id }, { status: 201 });
  } catch (error) {
    console.error("POST worker error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
