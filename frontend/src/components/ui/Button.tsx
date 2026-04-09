import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "brand" | "ze-dark" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Quick handwritten utility since we might not have cva yet
    let variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"
    if (variant === "outline") variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
    if (variant === "ghost") variantStyles = "hover:bg-accent hover:text-accent-foreground"
    if (variant === "link") variantStyles = "text-primary underline-offset-4 hover:underline"
    if (variant === "brand") variantStyles = "bg-ze-yellow text-ze-black shadow-sm font-black hover:bg-ze-yellow/90 transition-all active:scale-95"
    if (variant === "ze-dark") variantStyles = "bg-ze-black text-ze-yellow shadow-md font-black hover:bg-ze-black/90 transition-all active:scale-95"
    if (variant === "destructive") variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90"

    let sizeStyles = "h-11 px-6"
    if (size === "sm") sizeStyles = "h-9 rounded-md px-3 text-xs"
    if (size === "lg") sizeStyles = "h-12 rounded-xl px-10 text-base"
    if (size === "icon") sizeStyles = "h-10 w-10 px-0"

    return (
      <Comp
        type={asChild ? undefined : type}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className || ""}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
