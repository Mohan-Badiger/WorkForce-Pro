import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Tenant from "@/models/Tenant"
import User from "@/models/User"

export async function POST(req) {
  try {
    const { companyName, adminName, email, password } = await req.json();

    if (!companyName || !adminName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 1. Create Tenant (Contractor Company context)
    const newTenant = await Tenant.create({
      name: companyName,
      email: email.toLowerCase(),
      subscription: {
        plan: "growth",
        status: "trialing",
      }
    });

    // 2. Create Contractor (Admin) User
    // Real-world: Hash password first. (e.g. const hashedPassword = await bcrypt.hash(password, 10))
    // Storing password plainly here for design skeleton representation.
    const newUser = await User.create({
      name: adminName,
      email: email.toLowerCase(),
      password: password, // Plain text for mock layout logic
      role: "contractor",
      tenantId: newTenant._id,
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      message: "Company and Contractor Admin registered successfully." 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
