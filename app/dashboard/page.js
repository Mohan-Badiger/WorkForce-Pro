import { auth } from "@/auth"
import dbConnect from "@/lib/dbConnect"
import Worker from "@/models/Worker"
import Project from "@/models/Project"
import Attendance from "@/models/Attendance"
import Advance from "@/models/Advance"
import Expense from "@/models/Expense"
import Ledger from "@/models/Ledger"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import WageTrendChart from "@/components/charts/wage-trend"
import CashFlowChart from "@/components/charts/cash-flow"
import CostBreakdownChart from "@/components/charts/cost-breakdown"
import { 
  Users, 
  CheckCircle, 
  Briefcase, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight 
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth();
  const tenantId = session.user.tenantId;

  await dbConnect();

  // 1. Total Workers Count
  const totalWorkers = await Worker.countDocuments({ tenantId, status: "active" });

  // 2. Active Projects Count
  const activeProjectsCount = await Project.countDocuments({ tenantId, status: "active" });

  // 3. Present Today Count
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const presentToday = await Attendance.countDocuments({
    tenantId,
    date: today,
    status: { $in: ["present", "half-day"] }
  });

  // 4. Advances Given Total
  const advances = await Advance.find({ tenantId }).lean();
  const totalAdvances = advances.reduce((acc, curr) => acc + curr.amount, 0);

  // 5. Total Project Contract Values (Revenue pipeline)
  const projects = await Project.find({ tenantId }).lean();
  const totalRevenue = projects.reduce((acc, curr) => acc + curr.projectValue, 0);

  // 6. Total Expenses
  const expenses = await Expense.find({ tenantId }).lean();
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 7. Wages logged from attendance (Labor Cost)
  const attendanceLogs = await Attendance.find({ tenantId }).lean();
  const totalLaborCost = attendanceLogs.reduce((acc, curr) => acc + (curr.wageEarned || 0), 0);

  // 8. Net profit pipeline calculation
  const totalCosts = totalLaborCost + totalExpenses;
  const netProfit = totalRevenue - totalCosts;

  // 9. Pending salaries to settle (sum of current positive balances in ledger)
  // Retrieve the latest ledger entry for all workers
  const workers = await Worker.find({ tenantId, status: "active" }).select("_id").lean();
  let pendingSalaries = 0;
  for (const w of workers) {
    const latestLedger = await Ledger.findOne({ tenantId, workerId: w._id }).sort({ date: -1, createdAt: -1 }).lean();
    if (latestLedger && latestLedger.balanceAfter > 0) {
      pendingSalaries += latestLedger.balanceAfter;
    }
  }

  // Calculate weekly / monthly wage expenses
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const weeklyWagesRecords = await Attendance.find({ tenantId, date: { $gte: startOfWeek } }).lean();
  const weeklyWages = weeklyWagesRecords.reduce((acc, curr) => acc + curr.wageEarned, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(startOfMonth.getDate() - 30);
  const monthlyWagesRecords = await Attendance.find({ tenantId, date: { $gte: startOfMonth } }).lean();
  const monthlyWages = monthlyWagesRecords.reduce((acc, curr) => acc + curr.wageEarned, 0);

  const stats = [
    { title: "Total Workers", value: totalWorkers, icon: Users, desc: "Active employees" },
    { title: "Present Today", value: presentToday, icon: CheckCircle, desc: "Workers logged today" },
    { title: "Active Projects", value: activeProjectsCount, icon: Briefcase, desc: "In progress" },
    { title: "Weekly Wages", value: formatCurrency(weeklyWages), icon: IndianRupee, desc: "Past 7 days" },
    { title: "Monthly Wages", value: formatCurrency(monthlyWages), icon: IndianRupee, desc: "Past 30 days" },
    { title: "Total Advances", value: formatCurrency(totalAdvances), icon: TrendingUp, desc: "Disbursed amount" },
    { title: "Pending Payroll", value: formatCurrency(pendingSalaries), icon: IndianRupee, desc: "Owed to workers" },
    { title: "Revenue Pipeline", value: formatCurrency(totalRevenue), icon: ArrowUpRight, desc: "Total project value" },
    { title: "Other Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, desc: "Material & operations" },
    { title: "Project Net Profit", value: formatCurrency(netProfit), icon: IndianRupee, desc: "Revenue - Total Costs", highlight: true }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Overview Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time indicators and operational financial health metrics.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className={stat.highlight ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/10" : "bg-white"}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-xs font-semibold uppercase tracking-wider ${stat.highlight ? "text-indigo-200" : "text-slate-400"}`}>
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4.5 w-4.5 ${stat.highlight ? "text-white" : "text-indigo-600"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-xl font-bold tracking-tight">{stat.value}</div>
                <p className={`text-[10px] mt-1 ${stat.highlight ? "text-indigo-100" : "text-slate-400"}`}>{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Revenue Pipeline vs Total Expenses</CardTitle>
            <p className="text-xs text-slate-400">Monthly invoice revenues comparison with operational costs.</p>
          </CardHeader>
          <CardContent>
            <CashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Project Budget Allocations</CardTitle>
            <p className="text-xs text-slate-400">Expense categories breakdowns.</p>
          </CardHeader>
          <CardContent>
            <CostBreakdownChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Daily Worker Wage Trend</CardTitle>
            <p className="text-xs text-slate-400">Weekly wage disbursements overview.</p>
          </CardHeader>
          <CardContent>
            <WageTrendChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
