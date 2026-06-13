import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Project from "@/models/Project"
import Attendance from "@/models/Attendance"
import Expense from "@/models/Expense"

export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await dbConnect();

    // 1. Fetch project to ensure existence and verify values
    const project = await Project.findOne({ _id: id, tenantId: session.user.tenantId }).lean();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Aggregate Labor Costs: Sum 'wageEarned' from attendance logs on this project
    const attendanceRecords = await Attendance.find({ projectId: id, tenantId: session.user.tenantId }).lean();
    const laborCost = attendanceRecords.reduce((acc, curr) => acc + (curr.wageEarned || 0), 0);

    // 3. Aggregate Expenses by Category
    const expenses = await Expense.find({ projectId: id, tenantId: session.user.tenantId }).lean();

    const categoryBreakdown = {
      Material: 0,
      Transport: 0,
      Food: 0,
      Equipment: 0,
      Miscellaneous: 0
    };

    let totalExpenseCost = 0;

    expenses.forEach((exp) => {
      const cat = exp.category;
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += exp.amount;
      } else {
        categoryBreakdown.Miscellaneous += exp.amount;
      }
      totalExpenseCost += exp.amount;
    });

    // 4. Calculate Net Profit
    const totalCost = laborCost + totalExpenseCost;
    const netProfit = project.projectValue - totalCost;
    const profitMarginPercentage = project.projectValue > 0 
      ? ((netProfit / project.projectValue) * 100).toFixed(2)
      : 0;

    return NextResponse.json({
      projectId: id,
      projectName: project.name,
      projectValue: project.projectValue,
      status: project.status,
      costs: {
        laborCost,
        materialCost: categoryBreakdown.Material,
        transportCost: categoryBreakdown.Transport,
        foodCost: categoryBreakdown.Food,
        equipmentCost: categoryBreakdown.Equipment,
        miscellaneousCost: categoryBreakdown.Miscellaneous,
        totalCost
      },
      netProfit,
      profitMarginPercentage: parseFloat(profitMarginPercentage)
    });

  } catch (error) {
    console.error("GET project profitability error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
