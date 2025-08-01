'use client'

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { PlusCircle, Search, AlertCircle, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  className?: string
  variant?: "default" | "search" | "error" | "loading"
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = "default"
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return <Search className="h-12 w-12 text-neutral-400" />
      case "error":
        return <AlertCircle className="h-12 w-12 text-error-500" />
      case "loading":
        return <RefreshCw className="h-12 w-12 text-neutral-400 animate-spin" />
      default:
        return <PlusCircle className="h-12 w-12 text-neutral-400" />
    }
  }

  const getStyles = () => {
    switch (variant) {
      case "error":
        return "border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-950"
      case "search":
        return "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950"
      default:
        return "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed text-center space-y-4",
        "animate-fade-in-up",
        getStyles(),
        className
      )}
    >
      {icon || getDefaultIcon()}
      
      <div className="space-y-2">
        <h3 className={cn(
          "text-lg font-semibold",
          variant === "error" ? "text-error-900 dark:text-error-100" : 
          "text-neutral-900 dark:text-neutral-100"
        )}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(
            "text-sm max-w-sm",
            variant === "error" ? "text-error-600 dark:text-error-400" :
            "text-neutral-500 dark:text-neutral-400"
          )}>
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Predefined Empty States
export function EmptySubscriptions({ onAddSubscription }: { onAddSubscription: () => void }) {
  return (
    <EmptyState
      title="No tienes suscripciones"
      description="Comienza agregando tu primera suscripción para empezar a gestionar tus gastos mensuales"
      icon={<PlusCircle className="h-12 w-12 text-primary-400" />}
      action={{
        label: "Agregar Suscripción",
        onClick: onAddSubscription,
        variant: "default"
      }}
      className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950"
    />
  )
}

export function EmptySearchResults({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No se encontraron resultados"
      description="Intenta con otros términos de búsqueda o borra los filtros aplicados"
      action={{
        label: "Limpiar búsqueda",
        onClick: onClearSearch,
        variant: "outline"
      }}
    />
  )
}

export function ErrorState({ 
  title = "Algo salió mal",
  description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.",
  onRetry 
}: { 
  title?: string
  description?: string
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={onRetry ? {
        label: "Intentar de nuevo",
        onClick: onRetry,
        variant: "outline"
      } : undefined}
    />
  )
}