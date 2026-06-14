import * as React from "react"
import { slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] active:opacity-95 active:translate-y-[0.5px]",
        {
          "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/15 border border-indigo-700/20": variant === "default",
          "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/15": variant === "destructive",
          "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-200 hover:shadow-sm": variant === "outline",
          "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:text-slate-300 dark:hover:text-slate-100": variant === "ghost",
          "text-indigo-600 underline-offset-4 hover:underline font-bold": variant === "link",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-lg px-3.5": size === "sm",
          "h-11 rounded-xl px-8": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
