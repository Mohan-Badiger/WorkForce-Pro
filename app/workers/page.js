"use client";

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { formatCurrency } from "@/lib/utils"
import { Users, Search, Plus, UserPlus, Eye, Archive, IndianRupee, Briefcase } from "lucide-react"

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const { toast } = useToast();

  // Form states for creating worker
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState("Mason");
  const [dailyWage, setDailyWage] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers?search=${search}&status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data.workers || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load workers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!name || !mobileNumber || !dailyWage || !aadhaarNumber || !emergencyName || !emergencyPhone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobileNumber,
          role,
          dailyWage: Number(dailyWage),
          aadhaarNumber,
          address,
          emergencyContact: {
            name: emergencyName,
            relationship: emergencyRelationship || "Spouse",
            phone: emergencyPhone
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to create worker profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Worker Profile Added",
          description: "New worker profile created successfully.",
          variant: "success"
        });
        setOpenAdd(false);
        // Clear form
        setName("");
        setMobileNumber("");
        setRole("Mason");
        setDailyWage("");
        setAadhaarNumber("");
        setAddress("");
        setEmergencyName("");
        setEmergencyRelationship("");
        setEmergencyPhone("");
        fetchWorkers();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleArchiveWorker = async (id) => {
    if (!confirm("Are you sure you want to archive this worker?")) return;
    try {
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Profile Archived",
          description: "Worker has been marked as inactive.",
          variant: "success"
        });
        fetchWorkers();
      } else {
        const d = await res.json();
        toast({ title: "Archive Failed", description: d.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to archive worker", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Worker Directory</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Add, edit, archive workers, and audit active wage profiles.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="flex items-center gap-1.5 font-bold shadow-lg shadow-indigo-600/10 active-scale">
          <Plus className="h-4 w-4" /> Add Worker
        </Button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift border-l-4 border-l-blue-500 bg-white/70 backdrop-blur-md dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Workforce</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{workers.filter(w => w.status === "active").length} Workers</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift border-l-4 border-l-emerald-500 bg-white/70 backdrop-blur-md dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Average Daily Wage</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {formatCurrency(
                  workers.filter(w => w.status === "active").length > 0
                    ? Math.round(workers.filter(w => w.status === "active").reduce((acc, curr) => acc + curr.dailyWage, 0) / workers.filter(w => w.status === "active").length)
                    : 0
                )}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="hover-lift border-l-4 border-l-violet-500 bg-white/70 backdrop-blur-md dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Specialist Roles</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {new Set(workers.filter(w => w.status === "active").map(w => w.role)).size} Categories
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-500 dark:text-violet-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Filter Widgets */}
      <Card className="glass-panel hover-lift">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Search by worker name or role..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active Workers</option>
              <option value="inactive">Archived Workers</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Retrieving worker ledger profiles...</p>
        </div>
      ) : workers.length === 0 ? (
        <Card className="py-16 text-center bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center gap-3">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No worker records found matching filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Worker Name</TableHead>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Role</TableHead>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Mobile</TableHead>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Daily Wage</TableHead>
              <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Aadhaar Number</TableHead>
              <TableHead className="text-right font-semibold text-slate-500 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker._id}>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{worker.name}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/30 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30">
                    {worker.role}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400 text-xs font-medium">{worker.mobileNumber}</TableCell>
                <TableCell className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(worker.dailyWage)}</TableCell>
                <TableCell className="text-slate-400 dark:text-slate-500 font-mono text-xs">{worker.aadhaarNumber}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/workers/${worker._id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 active-scale text-xs">
                        <Eye className="h-3.5 w-3.5" /> View Ledger
                      </Button>
                    </Link>
                    {worker.status === "active" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleArchiveWorker(worker._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 active-scale"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal Dialog Add Worker Form */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Add New Worker Profile
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleAddWorker} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Worker Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number *</label>
                <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="9876543210" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Daily Wage Rate *</label>
                <Input type="number" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} placeholder="e.g. 650" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Worker Category / Role *</label>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="Mason">Mason</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Helper">Helper</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Bar Bender">Bar Bender</option>
                  <option value="Supervisor">Supervisor</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Aadhaar Number (UIDAI) *</label>
              <Input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} placeholder="xxxx-xxxx-xxxx" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Residential Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street name, City, Zip" />
            </div>

            <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 mt-4">Emergency Contact Verification</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Contact Name *</label>
                <Input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Guardian / Spouse Name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Relationship</label>
                <Input value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} placeholder="Spouse / Parent" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Contact Phone *</label>
              <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="Emergency Contact Mobile" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button type="submit">Onboard Worker</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
