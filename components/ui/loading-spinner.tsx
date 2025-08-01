'use client'

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "dots" | "pulse" | "bars"
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  variant = "default"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary-500 animate-pulse",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s"
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "rounded-full bg-primary-500 animate-pulse",
          sizeClasses[size],
          className
        )}
      />
    )
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary-500 animate-pulse rounded-sm",
              size === "sm" ? "h-4 w-1" : size === "md" ? "h-6 w-1" : "h-8 w-1"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.8s"
            }}
          />
        ))}
      </div>
    )
  }

  // Default spinner
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary-500",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  delay = 0 
}: LoadingStateProps) {
  if (!isLoading) return <>{children}</>

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {fallback || defaultFallback}
    </div>
  )
}