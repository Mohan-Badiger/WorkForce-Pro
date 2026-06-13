"use client";

import { useState, useEffect, useCallback } from "react"
import Link from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Briefcase, Calendar, Users, TrendingUp, DollarSign, Wallet } from "lucide-react"

export default function ProjectDetailsPage({ params }) {
  const { id } = params;
  const [projectData, setProjectData] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const profRes = await fetch(`/api/projects/${id}/profitability`);
      
      if (res.ok && profRes.ok) {
        const pData = await res.json();
        const profData = await profRes.json();
        setProjectData(pData.project);
        setProfitability(profData);
      } else {
        toast({ title: "Error", description: "Failed to load project metrics", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium">Computing labor wages & operational overheads...</p>
      </div>
    );
  }

  if (!projectData || !profitability) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project details not found.</p>
        <a href="/projects" className="text-indigo-600 font-semibold hover:underline">Go Back</a>
      </div>
    );
  }

  const { costs, netProfit, profitMarginPercentage } = profitability;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <a href="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 uppercase tracking-wider transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
      </a>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{projectData.name}</h2>
          <p className="text-slate-500 text-sm">Client: {projectData.clientName} | Registered Start: {formatDate(projectData.startDate)}</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            projectData.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-800"
          }`}>
            {projectData.status}
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Value</p></CardHeader>
          <CardContent><p className="text-xl font-bold text-slate-900">{formatCurrency(projectData.projectValue)}</p></CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Labor Wages Cost</p></CardHeader>
          <CardContent><p className="text-xl font-bold text-slate-900">{formatCurrency(costs.laborCost)}</p></CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Material & Overheads</p></CardHeader>
          <CardContent><p className="text-xl font-bold text-slate-900">{formatCurrency(costs.totalCost - costs.laborCost)}</p></CardContent>
        </Card>
        <Card className={`col-span-1 border-none text-white ${netProfit >= 0 ? "bg-green-600 shadow-green-600/10" : "bg-red-600 shadow-red-600/10"}`}>
          <CardHeader className="pb-1.5"><p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Net Profit margin</p></CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(netProfit)}</p>
            <span className="text-[10px] block opacity-90 mt-0.5">Margin: {profitMarginPercentage}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown & Worker list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Costs allocation breakdown */}
        <Card className="bg-white lg:col-span-1">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Cost Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Labor Wages</span>
                <span>{formatCurrency(costs.laborCost)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${costs.totalCost > 0 ? (costs.laborCost / costs.totalCost) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Material Cost</span>
                <span>{formatCurrency(costs.materialCost)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${costs.totalCost > 0 ? (costs.materialCost / costs.totalCost) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Transport & Fuel</span>
                <span>{formatCurrency(costs.transportCost)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${costs.totalCost > 0 ? (costs.transportCost / costs.totalCost) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Equipment Rent</span>
                <span>{formatCurrency(costs.equipmentCost)}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${costs.totalCost > 0 ? (costs.equipmentCost / costs.totalCost) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Workers list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-indigo-600" />
            Assigned Worker Force ({projectData.assignedWorkers?.length || 0})
          </h3>
          {projectData.assignedWorkers?.length === 0 ? (
            <Card className="py-12 text-center bg-white border-dashed">
              <CardContent className="text-slate-400 text-sm">No workers currently assigned to this project.</CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Daily Wage Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.assignedWorkers.map((w) => (
                  <TableRow key={w._id}>
                    <TableCell className="font-semibold text-slate-900">{w.name}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
                        {w.role}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-xs">{formatCurrency(w.dailyWage)}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold text-xs uppercase">{w.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
