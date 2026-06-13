"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, Calculator, DollarSign, Wallet, ArrowRight, FileText } from "lucide-react"

export default function PayrollPage() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 15); // Default 15 days cycle
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Forecast values
  const [forecast, setForecast] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [settling, setSettling] = useState(false);

  // Settlement Form states
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    async function loadWorkers() {
      try {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const d = await res.json();
          setWorkers(d.workers || []);
          if (d.workers && d.workers.length > 0) {
            setSelectedWorkerId(d.workers[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadWorkers();
  }, []);

  const handleCalculate = async () => {
    if (!selectedWorkerId || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please specify the worker and pay period.",
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);
    try {
      const res = await fetch(`/api/payroll/calculate?workerId=${selectedWorkerId}&periodStart=${startDate}&periodEnd=${endDate}`);
      if (res.ok) {
        const d = await res.json();
        setForecast(d);
        toast({ title: "Calculation Complete", description: "Wage statements compiled.", variant: "default" });
      } else {
        const err = await res.json();
        toast({ title: "Calculation Failed", description: err.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setCalculating(false);
    }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!forecast) return;

    setSettling(true);
    try {
      const res = await fetch("/api/payroll/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          periodStart: startDate,
          periodEnd: endDate,
          grossEarnings: forecast.grossEarnings,
          advanceDeductions: forecast.outstandingAdvance,
          netAmountPaid: forecast.pendingSalary,
          paymentMethod,
          transactionReference: transactionRef,
          paymentNotes: notes
        })
      });

      if (res.ok) {
        toast({
          title: "Payroll Settled",
          description: `Disbursed ${formatCurrency(forecast.pendingSalary)} and recorded ledger debit.`,
          variant: "success"
        });
        setForecast(null); // Clear forecast
        setTransactionRef("");
        setNotes("");
      } else {
        const err = await res.json();
        toast({ title: "Settlement Failed", description: err.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Settle execution error", variant: "destructive" });
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Payroll Wage Settlements</h1>
          <p className="text-slate-500 text-sm">Calculate worker salaries, deduct outstanding advances, and record payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Form Panel */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-indigo-600" />
              1. Compile Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Worker</label>
              <Select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} ({w.role})</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full flex items-center justify-center gap-1.5 font-bold mt-2"
            >
              {calculating ? "Calculating..." : "Compile Salary Slip"}
            </Button>
          </CardContent>
        </Card>

        {/* Calculations / Settlement Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!forecast ? (
            <Card className="h-full border-dashed flex items-center justify-center py-20 text-center text-slate-400 bg-white">
              <CardContent className="space-y-2">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold">Select parameters and click Compile to build pay stubs.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              
              {/* Slip Summary */}
              <Card className="bg-slate-900 text-white border-none shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-xl" />
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Salary Statement Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Worker Profile</span>
                    <span className="text-xs font-semibold">{forecast.workerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Days Present / Worked</span>
                    <span className="text-xs font-semibold">{forecast.daysWorked} Days</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Gross Wage Earnings</span>
                    <span className="text-xs font-semibold text-green-400">{formatCurrency(forecast.grossEarnings)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">Outstanding Advances (Loan)</span>
                    <span className="text-xs font-semibold text-red-400">-{formatCurrency(forecast.outstandingAdvance)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-sm font-bold text-slate-300">Net Pending Settlement</span>
                    <span className="text-lg font-extrabold text-indigo-400">{formatCurrency(forecast.pendingSalary)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Settle Form */}
              <Card className="bg-white border-slate-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-indigo-600" />
                    2. Disburse Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSettle} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Payment Channel</label>
                      <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI Transfer</option>
                        <option value="Bank Transfer">Bank NetBanking (IMPS/NEFT)</option>
                      </Select>
                    </div>

                    {paymentMethod !== "Cash" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Transaction ID / Reference (UTR)</label>
                        <Input
                          placeholder="e.g. Txn1290382093"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Settlement Memo Notes</label>
                      <Input
                        placeholder="Log any cash settlement notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={settling}
                      className="w-full font-bold flex items-center justify-center gap-1.5 h-11 shadow-indigo-600/10"
                    >
                      {settling ? "Executing Ledger Post..." : "Authorize Settlement & Settle"}
                      {!settling && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
