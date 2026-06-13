import * as React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onChange, id, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      id={id}
      ref={ref}
      checked={checked}
      onChange={onChange}
      className={cn(
        "peer h-4.5 w-4.5 shrink-0 rounded border border-slate-300 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-offset-slate-900 cursor-pointer accent-indigo-600",
        className
      )}
      {...props}
    />
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
