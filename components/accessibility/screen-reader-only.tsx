'use client'

import { cn } from '@/lib/utils'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function ScreenReaderOnly({ 
  children, 
  className,
  as: Component = 'span' 
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-all duration-200"
    >
      Saltar al contenido principal
    </a>
  )
}