import { NextResponse } from "next/server"
import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Attendance from "@/models/Attendance"
import Payroll from "@/models/Payroll"
import Advance from "@/models/Advance"
import Expense from "@/models/Expense"
import Project from "@/models/Project"
import Worker from "@/models/Worker"
import { generatePDFReport } from "@/lib/pdf-generator"

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // attendance | payroll | advance | expense | project-profit
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const projectId = searchParams.get("projectId");

    if (!type) {
      return new Response("Report type is required", { status: 400 });
    }

    const start = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDateStr ? new Date(endDateStr) : new Date();
    end.setHours(23, 59, 59, 999);

    await dbConnect();

    let title = "";
    let headers = [];
    let rows = [];
    let summaryMetrics = {};
    const tenantId = session.user.tenantId;

    if (type === "attendance") {
      title = `Worker Attendance Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
      headers = ["Date", "Worker Name", "Role", "Project", "Status", "Notes"];

      const query = { tenantId, date: { $gte: start, $lte: end } };
      if (projectId) query.projectId = projectId;

      const records = await Attendance.find(query)
        .populate("workerId", "name role")
        .populate("projectId", "name")
        .sort({ date: -1 })
        .lean();

      records.forEach((rec) => {
        rows.push([
          new Date(rec.date).toLocaleDateString("en-IN"),
          rec.workerId?.name || "N/A",
          rec.workerId?.role || "N/A",
          rec.projectId?.name || "N/A",
          rec.status,
          rec.notes || ""
        ]);
      });

      const totalPresent = records.filter(r => r.status === "present").length;
      const totalHalfDays = records.filter(r => r.status === "half-day").length;
      summaryMetrics = {
        "Total Days Logged": records.length,
        "Present Logs": totalPresent,
        "Half-Day Logs": totalHalfDays,
        "Absent Logs": records.filter(r => r.status === "absent").length
      };

    } else if (type === "payroll") {
      title = `Payroll Payout Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
      headers = ["Date Paid", "Worker Name", "Period Start", "Period End", "Gross Wage", "Advances Ded.", "Net Paid", "Method"];

      const records = await Payroll.find({ tenantId, paymentDate: { $gte: start, $lte: end } })
        .populate("workerId", "name")
        .sort({ paymentDate: -1 })
        .lean();

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNetPaid = 0;

      records.forEach((rec) => {
        totalGross += rec.grossEarnings;
        totalDeductions += rec.advanceDeductions;
        totalNetPaid += rec.netAmountPaid;

        rows.push([
          new Date(rec.paymentDate).toLocaleDateString("en-IN"),
          rec.workerId?.name || "N/A",
          new Date(rec.periodStart).toLocaleDateString("en-IN"),
          new Date(rec.periodEnd).toLocaleDateString("en-IN"),
          `Rs. ${rec.grossEarnings}`,
          `Rs. ${rec.advanceDeductions}`,
          `Rs. ${rec.netAmountPaid}`,
          rec.paymentMethod
        ]);
      });

      summaryMetrics = {
        "Total Settlement Payouts": records.length,
        "Gross Wages Billed": `Rs. ${totalGross}`,
        "Advances Deducted": `Rs. ${totalDeductions}`,
        "Net Salary Disbursed": `Rs. ${totalNetPaid}`
      };

    } else if (type === "advance") {
      title = `Worker Advances Disbursed (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
      headers = ["Date", "Worker Name", "Role", "Amount Disbursed", "Notes"];

      const records = await Advance.find({ tenantId, date: { $gte: start, $lte: end } })
        .populate("workerId", "name role")
        .sort({ date: -1 })
        .lean();

      let totalAmount = 0;

      records.forEach((rec) => {
        totalAmount += rec.amount;
        rows.push([
          new Date(rec.date).toLocaleDateString("en-IN"),
          rec.workerId?.name || "N/A",
          rec.workerId?.role || "N/A",
          `Rs. ${rec.amount}`,
          rec.notes || ""
        ]);
      });

      summaryMetrics = {
        "Total Advance Items": records.length,
        "Total Advances Disbursed": `Rs. ${totalAmount}`
      };

    } else if (type === "expense") {
      title = `Business Operational Expenses (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
      headers = ["Date Billed", "Category", "Billed Against Project", "Amount Billed", "Notes"];

      const query = { tenantId, date: { $gte: start, $lte: end } };
      if (projectId) query.projectId = projectId;

      const records = await Expense.find(query)
        .populate("projectId", "name")
        .sort({ date: -1 })
        .lean();

      let grandTotal = 0;

      records.forEach((rec) => {
        grandTotal += rec.amount;
        rows.push([
          new Date(rec.date).toLocaleDateString("en-IN"),
          rec.category,
          rec.projectId?.name || "General Overhead",
          `Rs. ${rec.amount}`,
          rec.notes || ""
        ]);
      });

      summaryMetrics = {
        "Total Expense Records": records.length,
        "Grand Expenses Total": `Rs. ${grandTotal}`
      };

    } else if (type === "project-profit") {
      title = "Active Projects Profitability Summary";
      headers = ["Project Name", "Client", "Project Value", "Labor Costs", "Material/Overheads", "Net Profit", "Margin %"];

      const projects = await Project.find({ tenantId }).populate("assignedWorkers").lean();
      
      let totalRevenue = 0;
      let totalCosts = 0;

      for (const p of projects) {
        // Labor
        const attendance = await Attendance.find({ projectId: p._id, tenantId }).lean();
        const labor = attendance.reduce((a, c) => a + c.wageEarned, 0);

        // Overhead
        const expenses = await Expense.find({ projectId: p._id, tenantId }).lean();
        const overheads = expenses.reduce((a, c) => a + c.amount, 0);

        const projectCost = labor + overheads;
        const profit = p.projectValue - projectCost;
        const margin = p.projectValue > 0 ? ((profit / p.projectValue) * 100).toFixed(1) : 0;

        totalRevenue += p.projectValue;
        totalCosts += projectCost;

        rows.push([
          p.name,
          p.clientName,
          `Rs. ${p.projectValue}`,
          `Rs. ${labor}`,
          `Rs. ${overheads}`,
          `Rs. ${profit}`,
          `${margin}%`
        ]);
      }

      summaryMetrics = {
        "Total Project Contracts": projects.length,
        "Total Revenue Pipeline": `Rs. ${totalRevenue}`,
        "Total Labor & Overheads": `Rs. ${totalCosts}`,
        "Net Business Profit": `Rs. ${totalRevenue - totalCosts}`,
        "Cumulative Margin": totalRevenue > 0 ? `${(((totalRevenue - totalCosts) / totalRevenue) * 100).toFixed(1)}%` : "0%"
      };
    } else {
      return new Response("Unknown report type", { status: 400 });
    }

    const pdfBuffer = generatePDFReport(title, headers, rows, summaryMetrics);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-report-${Date.now()}.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error("GET API report generation error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
