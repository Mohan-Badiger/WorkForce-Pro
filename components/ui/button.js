import * as React from "react"
import { slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        {
          "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/10": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm": variant === "destructive",
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100": variant === "outline",
          "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300": variant === "ghost",
          "text-indigo-600 underline-offset-4 hover:underline": variant === "link",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
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
