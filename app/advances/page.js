"use client";

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { IndianRupee, History, PlusCircle, Calendar, MessageSquare } from "lucide-react"

export default function AdvancesPage() {
  const [workers, setWorkers] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  const fetchAdvances = useCallback(async () => {
    try {
      const res = await fetch("/api/advances");
      if (res.ok) {
        const d = await res.json();
        setAdvances(d.advances || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const d = await res.json();
          setWorkers(d.workers || []);
          if (d.workers && d.workers.length > 0) {
            setSelectedWorkerId(d.workers[0]._id);
          }
        }
        await fetchAdvances();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [fetchAdvances]);

  const handleLogAdvance = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId || !amount || !date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory parameters.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/advances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          amount: Number(amount),
          date,
          notes
        })
      });

      const d = await res.json();

      if (res.ok) {
        toast({
          title: "Advance Disbursed",
          description: `Disbursed ₹${amount} and posted debit log successfully.`,
          variant: "success"
        });
        setAmount("");
        setNotes("");
        await fetchAdvances();
      } else {
        toast({
          title: "Disbursement Failed",
          description: d.error || "Failed to log advance",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network connection failed",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Worker Advance Loans</h1>
          <p className="text-slate-500 text-sm">Issue salary advances, record notes, and audit outstanding loan entries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Disburse Form Panel */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-indigo-600" />
              Disburse Advance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogAdvance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Worker</label>
                <Select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>{w.name} ({w.role})</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Advance Amount (Rs) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold">₹</span>
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Disbursement Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <Input
                    type="date"
                    className="pl-9"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Reason / Remarks Notes</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-slate-400">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <Input
                    placeholder="Family emergency, travel costs etc..."
                    className="pl-10"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full font-bold flex items-center justify-center gap-1.5 h-11 shadow-indigo-600/10"
              >
                {submitting ? "Processing Debit Entry..." : "Confirm & Pay Advance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Table Panel */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-4.5 w-4.5 text-indigo-600" />
            Recent Advances Ledger
          </h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-sm font-medium">Retrieving loan passbooks...</p>
            </div>
          ) : advances.length === 0 ? (
            <Card className="py-12 text-center bg-white border-dashed">
              <CardContent className="text-slate-400 text-sm">No advance payouts recorded yet.</CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Worker Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Amount Billed</TableHead>
                  <TableHead>Disbursement Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances.map((adv) => (
                  <TableRow key={adv._id}>
                    <TableCell className="font-mono text-xs text-slate-500">{formatDate(adv.date)}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{adv.workerId?.name || "Archived Worker"}</TableCell>
                    <TableCell className="text-xs">{adv.workerId?.role || "N/A"}</TableCell>
                    <TableCell className="font-bold text-red-500">-{formatCurrency(adv.amount)}</TableCell>
                    <TableCell className="text-slate-500 text-xs italic">{adv.notes || "None"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

      </div>
    </div>
  )
}
