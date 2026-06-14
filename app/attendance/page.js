"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { Check, X, Calendar, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AttendancePage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [workers, setWorkers] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const d = await res.json();
          setProjects(d.projects || []);
          if (d.projects && d.projects.length > 0) {
            setSelectedProjectId(d.projects[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;

    async function loadProjectWorkers() {
      setLoading(true);
      try {
        // Fetch detailed project to get assignedWorkers
        const res = await fetch(`/api/projects/${selectedProjectId}`);
        if (res.ok) {
          const d = await res.json();
          const list = d.project?.assignedWorkers || [];
          setWorkers(list);
          
          // Initialise status mapping (default all to 'present')
          const initial = {};
          list.forEach((w) => {
            initial[w._id] = { status: "present", notes: "" };
          });
          setRecords(initial);

          // Check if attendance already marked for this date
          const attRes = await fetch(`/api/attendance?projectId=${selectedProjectId}&date=${attendanceDate}`);
          if (attRes.ok) {
            const attData = await attRes.json();
            if (attData.attendance && attData.attendance.length > 0) {
              const loadedRecords = { ...initial };
              attData.attendance.forEach((att) => {
                loadedRecords[att.workerId] = { status: att.status, notes: att.notes || "" };
              });
              setRecords(loadedRecords);
              toast({
                title: "Logs Loaded",
                description: "Attendance records loaded for the selected date.",
                variant: "default"
              });
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProjectWorkers();
  }, [selectedProjectId, attendanceDate, toast]);

  const updateStatus = (workerId, status) => {
    setRecords((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], status }
    }));
  };

  const updateNotes = (workerId, notes) => {
    setRecords((prev) => ({
      ...prev,
      [workerId]: { ...prev[workerId], notes }
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsArray = Object.entries(records).map(([workerId, val]) => ({
        workerId,
        status: val.status,
        notes: val.notes
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          projectId: selectedProjectId,
          records: recordsArray
        })
      });

      if (res.ok) {
        toast({
          title: "Attendance Saved",
          description: "Daily wage credits posted to worker ledgers.",
          variant: "success"
        });
      } else {
        const d = await res.json();
        toast({ title: "Failed to Save", description: d.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Log Daily Attendance</h1>
          <p className="text-slate-500 text-sm">Select project and date, mark attendance, and post credits with one-click.</p>
        </div>
      </div>

      {/* Selectors Card */}
      <Card className="glass-panel hover-lift">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Construction Project</label>
            <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Log Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
              </span>
              <Input
                type="date"
                className="pl-10"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Sheet */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">Loading project worker assignments...</p>
        </div>
      ) : workers.length === 0 ? (
        <Card className="py-16 text-center bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <UserCheck className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No workers assigned to this project yet.</p>
            <a href="/projects" className="text-indigo-505 font-bold hover:underline text-xs">Assign Workers in Projects Panel</a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Worker Name</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Role</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Daily Wage</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Status Selection</TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400">Daily Remarks / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => {
                const currentRecord = records[worker._id] || { status: "present", notes: "" };
                return (
                  <TableRow key={worker._id}>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{worker.name}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/35 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30">
                        {worker.role}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400 font-medium">₹{worker.dailyWage}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-2xl w-max border border-slate-200/30 dark:border-slate-800/20 shadow-inner">
                        <button
                          onClick={() => updateStatus(worker._id, "present")}
                          className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 active-scale",
                            currentRecord.status === "present"
                              ? "bg-emerald-600 text-white shadow shadow-emerald-600/20"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" /> Present
                        </button>
                        <button
                          onClick={() => updateStatus(worker._id, "half-day")}
                          className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active-scale",
                            currentRecord.status === "half-day"
                              ? "bg-amber-500 text-white shadow shadow-amber-500/20"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          Half-Day
                        </button>
                        <button
                          onClick={() => updateStatus(worker._id, "absent")}
                          className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all duration-200 active-scale",
                            currentRecord.status === "absent"
                              ? "bg-rose-500 text-white shadow shadow-rose-500/20"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          <X className="h-3.5 w-3.5" /> Absent
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Log delay or reason..."
                        className="h-10"
                        value={currentRecord.notes}
                        onChange={(e) => updateNotes(worker._id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
            <Button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="font-bold flex items-center gap-1.5 h-11 px-6 shadow-lg shadow-indigo-600/10 active-scale"
            >
              {saving ? "Posting Wage Credits..." : "Post Attendance & Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
