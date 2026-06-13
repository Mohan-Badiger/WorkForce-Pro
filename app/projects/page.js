"use client";

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Briefcase, Plus, FolderKanban, Users, TrendingUp, Calendar, ArrowRight } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectValue, setProjectValue] = useState("");
  const [status, setStatus] = useState("planning");
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const d = await res.json();
        setProjects(d.projects || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const d = await res.json();
          setWorkers(d.workers || []);
        }
        await fetchProjects();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fetchProjects]);

  const toggleWorkerSelection = (workerId) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name || !clientName || !startDate || !projectValue) {
      toast({
        title: "Validation Error",
        description: "Please specify Project Name, Client, Start Date, and Value.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          clientName,
          startDate,
          projectValue: Number(projectValue),
          status,
          assignedWorkers: selectedWorkers
        })
      });

      if (res.ok) {
        toast({
          title: "Project Registered",
          description: "New project registered successfully in the active pipeline.",
          variant: "success"
        });
        setOpenAdd(false);
        setName("");
        setClientName("");
        setProjectValue("");
        setStatus("planning");
        setSelectedWorkers([]);
        await fetchProjects();
      } else {
        const d = await res.json();
        toast({ title: "Failed to Register", description: d.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Register project connection failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Construction Projects</h1>
          <p className="text-slate-500 text-sm">Create and oversee construction projects, assign workers, and view profitability dashboards.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)} className="flex items-center gap-1.5 font-semibold">
          <Plus className="h-4 w-4" /> Create Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Retrieving active projects register...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="py-16 text-center bg-white border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <FolderKanban className="h-10 w-10 text-slate-300" />
            <p className="text-slate-500 font-semibold text-sm">No construction projects registered yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id} className="bg-white flex flex-col justify-between hover:border-indigo-200 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{project.name}</h3>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                    project.status === "active"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : project.status === "completed"
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <CardDescription className="text-xs">Client: {project.clientName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-4.5 pt-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Contract Value</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{formatCurrency(project.projectValue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Assigned Force</p>
                    <p className="font-semibold text-slate-900 mt-0.5">{project.assignedWorkers?.length || 0} Workers</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> Start: {formatDate(project.startDate)}
                </div>
              </CardContent>
              <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 rounded-b-xl">
                <Link href={`/projects/${project._id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    Manage Finance <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Create New Project
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleCreateProject} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Project Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metro Flyover" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. City Corp" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Contract Value (Rs) *</label>
                <Input type="number" value={projectValue} onChange={(e) => setProjectValue(e.target.value)} placeholder="e.g. 5000000" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Project Status</label>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Start Date *</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            {/* Checklist of workers */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Assign Initial Worker Roster</h4>
              {workers.length === 0 ? (
                <p className="text-xs text-slate-400">Register workers first before assignment.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                  {workers.map((worker) => (
                    <div key={worker._id} className="flex items-center gap-2">
                      <Checkbox
                        id={`w-${worker._id}`}
                        checked={selectedWorkers.includes(worker._id)}
                        onChange={() => toggleWorkerSelection(worker._id)}
                      />
                      <label htmlFor={`w-${worker._id}`} className="text-xs font-semibold text-slate-700 cursor-pointer">
                        {worker.name} ({worker.role})
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>Onboard Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
