"use client";

import { usePathname } from "next/navigation"
import { Bell, User, ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"

export default function Header({ user }) {
  const pathname = usePathname();
  const [openUser, setOpenUser] = useState(false);
  const [openProject, setOpenProject] = useState(false);
  
  // List of mock projects for quick context switcher
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    // Fetch projects for switcher
    async function fetchSwitcherProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
            setActiveProject(data.projects[0]);
          }
        }
      } catch (err) {
        console.error("Switcher fetch err", err);
      }
    }
    fetchSwitcherProjects();
  }, []);

  // Format page path to Title
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Overview";
    const title = segments[0];
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 dark:bg-slate-900/70 dark:border-slate-800/80">
      
      {/* Page Title & Project Switcher */}
      <div className="flex items-center gap-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 hidden md:block">
          {getPageTitle()}
        </h2>

        {projects.length > 0 && (
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Project:</span>
            <DropdownMenu open={openProject} onOpenChange={setOpenProject}>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {activeProject?.name || "Select Project"}
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                {projects.map((p) => (
                  <DropdownMenuItem
                    key={p._id}
                    onClick={() => {
                      setActiveProject(p);
                      setOpenProject(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Value: {formatCurrency(p.projectValue)}</p>
                    </div>
                    {activeProject?._id === p._id && <Check className="h-4 w-4 text-indigo-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4.5 ml-auto">
        {/* Notifications Icon */}
        <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200/60 text-slate-500 hover:bg-slate-50 transition-colors relative dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4.5">
          <DropdownMenu open={openUser} onOpenChange={setOpenUser}>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none mb-0.5">{user?.name}</p>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.role}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem className="mt-1 text-slate-600 hover:text-slate-900">
                Billing & Subscription
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-600 hover:text-slate-900">
                Company Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
