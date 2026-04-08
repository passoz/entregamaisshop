import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantStyles = "bg-slate-900 text-slate-50 hover:bg-slate-900/80"
  if (variant === "secondary") variantStyles = "bg-slate-100 text-slate-900 hover:bg-slate-100/80"
  if (variant === "destructive") variantStyles = "bg-brand-pink text-white hover:bg-brand-pink/80"
  if (variant === "outline") variantStyles = "text-slate-950 border border-slate-200"
  if (variant === "success") variantStyles = "bg-emerald-500 text-white hover:bg-emerald-500/80"
  if (variant === "warning") variantStyles = "bg-brand-amber text-slate-900 hover:bg-brand-amber/80"

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        variantStyles,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
