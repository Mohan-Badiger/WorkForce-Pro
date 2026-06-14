"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children, open, onOpenChange }) => {
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (open && containerRef.current && !containerRef.current.contains(event.target)) {
        onOpenChange(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onOpenChange])

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (!child) return null;
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { open, onOpenChange });
        }
        if (child.type === DropdownMenuContent) {
          return open ? child : null;
        }
        return child;
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, open, onOpenChange, asChild }) => {
  const Comp = asChild ? "span" : "button"
  return (
    <Comp 
      onClick={() => onOpenChange(!open)} 
      className="cursor-pointer"
    >
      {children}
    </Comp>
  )
}

const DropdownMenuContent = ({ children, className }) => {
  return (
    <div className={cn(
      "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100",
      className
    )}>
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ children, className, onClick, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 text-left",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
