'use client'

import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"
import { forwardRef } from "react"

interface AnimatedButtonProps extends ButtonProps {
  animation?: "scale" | "bounce" | "wiggle" | "glow" | "slide"
  children: React.ReactNode
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ animation = "scale", className, children, ...props }, ref) => {
    const getAnimationClasses = () => {
      switch (animation) {
        case "bounce":
          return "hover:animate-bounce-subtle active:scale-95"
        case "wiggle":
          return "hover:animate-wiggle active:scale-95"
        case "glow":
          return "hover:shadow-glow-strong transition-shadow duration-300 active:scale-95"
        case "slide":
          return "hover:translate-x-1 transition-transform duration-200 active:scale-95"
        case "scale":
        default:
          return "hover:scale-105 active:scale-95 transition-transform duration-200"
      }
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-white/10 before:scale-x-0 before:transition-transform before:duration-300 before:origin-left",
          "hover:before:scale-x-100",
          getAnimationClasses(),
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }