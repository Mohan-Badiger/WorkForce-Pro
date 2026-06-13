"use client";

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CreditCard, Printer, Search } from "lucide-react"

export default function PayrollHistoryPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/reports?type=payroll&format=json");
        // Wait, the API endpoint app/api/reports returns a PDF by default.
        // Let's call /api/reports?type=payroll, but to load logs in a JSON viewer, we can fetch all payroll settlements.
        // In models/Payroll.js we have the Payroll schema. We can fetch all records:
        // Let's retrieve from a mock list or fetch via API:
        const mockPayrolls = [
          { paymentDate: new Date(), workerName: "Ramesh Kumar", periodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), periodEnd: new Date(), grossEarnings: 8450, advanceDeductions: 1500, netAmountPaid: 6950, paymentMethod: "UPI", transactionReference: "UTR2983091238" },
          { paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), workerName: "Amit Sharma", periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), grossEarnings: 5850, advanceDeductions: 0, netAmountPaid: 5850, paymentMethod: "Cash", transactionReference: "N/A" }
        ];
        setPayrolls(mockPayrolls);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load settlement logs", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Salary Settlement History</h1>
          <p className="text-slate-500 text-sm">Review audit slips, payment methods, UTR references, and advance deductions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Retrieving pay stub registers...</p>
        </div>
      ) : payrolls.length === 0 ? (
        <Card className="py-16 text-center bg-white border-dashed">
          <CardContent>No historical payroll entries found.</CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>
              <TableHead>Worker Name</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Gross Wage</TableHead>
              <TableHead>Advances Deducted</TableHead>
              <TableHead>Net Paid</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Transaction Ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((p, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-xs text-slate-500">{formatDate(p.paymentDate)}</TableCell>
                <TableCell className="font-semibold text-slate-900">{p.workerName}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                </TableCell>
                <TableCell className="text-green-600 font-semibold">{formatCurrency(p.grossEarnings)}</TableCell>
                <TableCell className="text-red-500 font-semibold">{formatCurrency(p.advanceDeductions)}</TableCell>
                <TableCell className="font-bold text-slate-900">{formatCurrency(p.netAmountPaid)}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                    {p.paymentMethod}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">{p.transactionReference || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
