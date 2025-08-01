import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'spinner' | 'skeleton'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  text 
}: LoadingSpinnerProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary-500 rounded-full animate-pulse',
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
        {text && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn(
          'bg-primary-500 rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
      {text && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  )
}

interface PageLoadingProps {
  title?: string
  description?: string
  className?: string
}

export function PageLoading({ 
  title = 'Cargando', 
  description = 'Por favor espera un momento...',
  className 
}: PageLoadingProps) {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900',
      'flex items-center justify-center p-4',
      className
    )}>
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <div className="absolute inset-0 bg-primary-500/20 rounded-2xl animate-ping" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <LoadingSpinner variant="dots" size="lg" className="mt-4" />
      </div>
    </div>
  )
}

interface ComponentLoadingProps {
  height?: string
  className?: string
  text?: string
}

export function ComponentLoading({ 
  height = 'h-64', 
  className,
  text = 'Cargando...'
}: ComponentLoadingProps) {
  return (
    <div className={cn(
      'flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg',
      height,
      className
    )}>
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'default',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{ 
              width: i === lines - 1 ? '75%' : '100%',
              height 
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{ width: width || '3rem', height: height || '3rem' }}
      />
    )
  }

  return (
    <div
      className={cn(baseClasses, 'rounded', className)}
      style={{ width, height }}
    />
  )
}

// Componente para skeleton de tarjetas de suscripción
export function SubscriptionCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton variant="text" width="4rem" />
              <Skeleton variant="text" width="3rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para skeleton de dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
              </div>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Skeleton variant="text" width="50%" className="mb-4" />
          <Skeleton variant="rectangular" width="100%" height="16rem" />
        </div>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Skeleton variant="text" width="50%" className="mb-4" />
          <SubscriptionCardSkeleton count={3} />
        </div>
      </div>
    </div>
  )
}