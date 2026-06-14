import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-white/80 dark:bg-slate-950/80 px-3.5 py-2 text-sm transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-100 dark:focus-visible:ring-indigo-500/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
