"use client";

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, User, Phone, MapPin, ShieldAlert, Award, Calendar, Wallet } from "lucide-react"

export default function WorkerProfilePage({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWorkerDetails() {
      try {
        const res = await fetch(`/api/workers/${id}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
        } else {
          toast({ title: "Error", description: "Failed to load worker details", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Connection error", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchWorkerDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium">Aggregating worker historical ledger entries...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Worker profile not found.</p>
        <Link href="/workers" className="text-indigo-600 font-semibold hover:underline">Go Back</Link>
      </div>
    );
  }

  const { worker, stats, ledger } = data;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <a href="/workers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
      </a>

      {/* Header Profile Info Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/40 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl text-white">
            {worker.name.charAt(0)}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">{worker.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 border border-indigo-500/25 rounded-full text-indigo-200">
                {worker.role}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-slate-300 text-xs">
              <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {worker.mobileNumber}</div>
              <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-slate-400" /> Aadhaar: {worker.aadhaarNumber}</div>
              <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined: {formatDate(worker.joiningDate)}</div>
            </div>
            {worker.address && (
              <div className="flex items-center gap-1.5 text-slate-300 text-xs pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {worker.address}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="hover-lift border-l-4 border-l-blue-500 bg-white dark:bg-slate-900">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Days Worked</p></CardHeader>
          <CardContent><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.totalDaysWorked} Days</p></CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Earnings</p></CardHeader>
          <CardContent><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalEarnings)}</p></CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-rose-500 bg-white dark:bg-slate-900">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Advances</p></CardHeader>
          <CardContent><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(stats.totalAdvances)}</p></CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-sky-500 bg-white dark:bg-slate-900">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Salary Settlements</p></CardHeader>
          <CardContent><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(stats.totalSalaryPaid)}</p></CardContent>
        </Card>
        <Card className={`hover-lift col-span-2 md:col-span-1 border-l-4 ${
          stats.pendingSalary >= 0 
            ? "bg-indigo-50/30 border-l-indigo-500 dark:bg-indigo-950/20" 
            : "bg-rose-50/30 border-l-rose-500 dark:bg-rose-950/20"
        }`}>
          <CardHeader className="pb-1.5">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${
              stats.pendingSalary >= 0 ? "text-indigo-500 dark:text-indigo-400" : "text-rose-500 dark:text-rose-400"
            }`}>
              Outstanding Balance
            </p>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-bold ${stats.pendingSalary >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(Math.abs(stats.pendingSalary))}
              <span className="text-[9px] block text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                {stats.pendingSalary >= 0 ? "Owed to Worker" : "Worker owes Company"}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid containing Ledger + Emergency verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passbook Ledger (Table) */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="h-4.5 w-4.5 text-indigo-600" />
            Worker Ledger Passbook
          </h3>
          {ledger.length === 0 ? (
            <Card className="py-12 text-center bg-white border-dashed">
              <CardContent className="text-slate-400 text-sm">No ledger entries recorded yet.</CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction Description</TableHead>
                  <TableHead>Credit (+)</TableHead>
                  <TableHead>Debit (-)</TableHead>
                  <TableHead>Balance Owed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="text-slate-500 font-mono text-xs">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-medium text-slate-900 text-xs">
                      {entry.transactionType}
                      <span className="text-[10px] block text-slate-400 font-normal mt-0.5">{entry.notes}</span>
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold text-xs">{entry.credit > 0 ? `+${formatCurrency(entry.credit)}` : "--"}</TableCell>
                    <TableCell className="text-red-500 font-semibold text-xs">{entry.debit > 0 ? `-${formatCurrency(entry.debit)}` : "--"}</TableCell>
                    <TableCell className={`font-bold text-xs ${entry.balanceAfter >= 0 ? "text-indigo-600" : "text-red-600"}`}>
                      {formatCurrency(entry.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Sidebar panels (Emergency contact details) */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100/60 pb-3">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                Emergency Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</p>
                <p className="text-sm font-semibold text-slate-950 mt-0.5">{worker.emergencyContact.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Relationship</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{worker.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{worker.emergencyContact.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
