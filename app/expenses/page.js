"use client";

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TrendingDown, Plus, Search, Tag, Filter, Trash2 } from "lucide-react"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  
  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Form states
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("Material");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/expenses?";
      if (selectedProjectId) url += `projectId=${selectedProjectId}&`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setExpenses(d.expenses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, selectedCategory]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const d = await res.json();
          setProjects(d.projects || []);
        }
        await fetchExpenses();
      } catch (err) {
        console.error(err);
      }
    }
    loadInitialData();
  }, [fetchExpenses]);

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!amount || !date || !category) {
      toast({
        title: "Validation Error",
        description: "Please specify Category, Amount, and Date.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId || null,
          category,
          amount: Number(amount),
          date,
          notes
        })
      });

      if (res.ok) {
        toast({
          title: "Expense Logged",
          description: "Operational/Project cost logged successfully.",
          variant: "success"
        });
        setOpenAdd(false);
        setAmount("");
        setProjectId("");
        setCategory("Material");
        setNotes("");
        await fetchExpenses();
      } else {
        const d = await res.json();
        toast({ title: "Failed to log", description: d.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Log request connection failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Record Deleted", description: "Expense item removed.", variant: "success" });
        await fetchExpenses();
      } else {
        const d = await res.json();
        toast({ title: "Deletion Failed", description: d.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to connect to delete endpoint", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Business Expenses</h1>
          <p className="text-slate-500 text-sm">Log materials, equipment hires, transports, food bills, and track overheads.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="flex items-center gap-1.5 font-semibold">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Filter Widgets */}
      <Card className="bg-white/70 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">All Projects / Overhead Costs</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-56">
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Material">Material</option>
              <option value="Transport">Transport</option>
              <option value="Food">Food</option>
              <option value="Equipment">Equipment</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Retrieving expense invoices...</p>
        </div>
      ) : expenses.length === 0 ? (
        <Card className="py-16 text-center bg-white border-dashed">
          <CardContent className="text-slate-400 text-sm">No expenses recorded for this project/category.</CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Billed</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Attributed Project</TableHead>
              <TableHead>Amount Billed</TableHead>
              <TableHead>Remarks / Notes</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp._id}>
                <TableCell className="font-mono text-xs text-slate-500">{formatDate(exp.date)}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                    {exp.category}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-xs">
                  {exp.projectId?.name || <span className="text-slate-400 italic">General Company Overhead</span>}
                </TableCell>
                <TableCell className="font-bold text-red-500">{formatCurrency(exp.amount)}</TableCell>
                <TableCell className="text-slate-500 text-xs italic">{exp.notes || "None"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExpense(exp._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Log Expense Dialog Form */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-indigo-600" />
            Log New Cost / Expense
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleLogExpense} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cost Category *</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Material">Material</option>
                <option value="Transport">Transport</option>
                <option value="Food">Food</option>
                <option value="Equipment">Equipment</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Expense Amount (Rs) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold">₹</span>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Log Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Attribute to Project</label>
              <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">General Company Overhead (No project scoping)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Invoices description / notes</label>
              <Input
                placeholder="Cement delivery, tractor diesel, worker lunches..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>Log Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
