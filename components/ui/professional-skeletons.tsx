import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Professional skeleton components that maintain layout consistency
interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  )
}

// Subscription card skeleton
export function SubscriptionCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard widget skeleton
export function DashboardWidgetSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Form field skeleton
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

// Professional loading spinner
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <motion.div
      className={`${sizes[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg 
        className="w-full h-full" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeDasharray="31.416" 
          strokeDashoffset="31.416"
          className="opacity-25"
        />
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeDasharray="31.416" 
          strokeDashoffset="23.562"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  )
}

// Professional page loading state
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SubscriptionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Empty state with professional styling
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Professional error state
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorState({ 
  title = 'Algo salió mal', 
  message, 
  onRetry, 
  onDismiss 
}: ErrorStateProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
      <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        {title}
      </h3>
      <p className="text-red-700 dark:text-red-300 mb-4">
        {message}
      </p>
      <div className="flex justify-center space-x-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}