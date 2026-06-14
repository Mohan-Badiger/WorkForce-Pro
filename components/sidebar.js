"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  IndianRupee,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workers", href: "/workers", icon: Users },
  { label: "Attendance", href: "/attendance", icon: CalendarCheck },
  { label: "Advances", href: "/advances", icon: IndianRupee },
  { label: "Payroll", href: "/payroll", icon: CreditCard },
  { label: "Expenses", href: "/expenses", icon: TrendingUp },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Reports", href: "/reports", icon: FileText }
]

export default function Sidebar({ userRole }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Filter routes based on user authorization roles
  const allowedItems = navItems.filter((item) => {
    if (userRole === "supervisor") {
      return ["Dashboard", "Workers", "Attendance", "Reports"].includes(item.label);
    }
    if (userRole === "accountant") {
      return ["Dashboard", "Workers", "Attendance", "Payroll", "Expenses", "Reports"].includes(item.label);
    }
    return true; // Admin/Contractor has full visibility
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-4 left-4 z-50 md:hidden bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95 transition-all duration-200"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Wrapper */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:relative"
      )}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/40 backdrop-blur-md">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-all duration-300">
              W
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-base leading-none group-hover:text-indigo-400 transition-colors">WorkForce Pro</h1>
              <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-1 block">SaaS ERP</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                {item.label}
                {isActive && (
                  <span className="absolute right-3.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0 text-slate-400 transition-colors group-hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
