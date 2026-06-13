import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200" 
        onClick={() => onOpenChange(false)}
      />
      {/* Modal */}
      <div className="relative z-50 w-full max-w-lg p-6 bg-white rounded-xl shadow-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {children}
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}

const DialogContent = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-4", className)}>
    {children}
  </div>
)

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4", className)} {...props} />
)

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
