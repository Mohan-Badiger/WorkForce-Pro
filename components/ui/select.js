import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/80 dark:bg-slate-950/80 px-3.5 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 appearance-none dark:border-slate-800 dark:text-slate-100 dark:focus:ring-indigo-500/10",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  )
})
Select.displayName = "Select"

export { Select }
