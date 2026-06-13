"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { FileDown, Calendar, AlertCircle } from "lucide-react"

const reportTypes = [
  { value: "attendance", label: "Attendance Report" },
  { value: "payroll", label: "Payroll Settlement Report" },
  { value: "advance", label: "Worker Advances Report" },
  { value: "expense", label: "Business Expenses Report" },
  { value: "project-profit", label: "Project Profitability Summary" }
]

export default function ReportsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [reportType, setReportType] = useState("attendance");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const d = await res.json();
          setProjects(d.projects || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  const handleDownload = () => {
    if (!reportType) return;
    
    setGenerating(true);
    try {
      let downloadUrl = `/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`;
      if (selectedProjectId) {
        downloadUrl += `&projectId=${selectedProjectId}`;
      }

      // Redirect browser tab to start download directly
      window.open(downloadUrl, "_blank");

      toast({
        title: "Report Download Started",
        description: `Generating and compiling ${reportType} PDF bytes stream. Check your downloads folder.`,
        variant: "success"
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not compile PDF report.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Operational Financial Reports</h1>
          <p className="text-slate-500 text-sm">Download audit-ready PDF summaries of worker balances, attendance logs, and project profitability margins.</p>
        </div>
      </div>

      <div className="max-w-xl">
        <Card className="bg-white border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileDown className="h-4.5 w-4.5 text-indigo-600" />
              Download Report Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Select Report Type</label>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                {reportTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            {/* Conditionally show Project switcher for relevant reports */}
            {["attendance", "expense"].includes(reportType) && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Attribute to Project</label>
                <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                  <option value="">All Projects / General Overheads</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </Select>
              </div>
            )}

            {/* Date inputs (Except project-profit summary which operates cumulatively) */}
            {reportType !== "project-profit" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <Input
                      type="date"
                      className="pl-9"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <Input
                      type="date"
                      className="pl-9"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-normal">
                All generated PDF files include high-integrity ledger transaction hashes and contractor subscription audits. These files are ready to print or share with project owners and accountants.
              </p>
            </div>

            <Button
              onClick={handleDownload}
              disabled={generating}
              className="w-full font-bold flex items-center justify-center gap-1.5 h-11 shadow-indigo-600/10 mt-2"
            >
              <FileDown className="h-4.5 w-4.5" />
              {generating ? "Compiling PDF data..." : "Download PDF Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
