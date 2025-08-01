'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-md hover:shadow-lg',
        outlined: 'border-2',
        filled: 'bg-primary text-primary-foreground border-primary',
        glass: 'bg-background/80 backdrop-blur-sm border-border/50',
        gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20'
      },
      size: {
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1',
        glow: 'hover:shadow-glow',
        scale: 'hover:scale-105',
        border: 'hover:border-primary'
      },
      clickable: {
        true: 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'none',
      clickable: false
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, clickable, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div'
    
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, size, hover, clickable, className }))}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ className, level = 3, ...props }, ref) => {
  const Heading = `h${level}` as keyof JSX.IntrinsicElements
  
  return (
    <Heading
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Compound Card Components
interface CompoundCardProps extends CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

const CompoundCard = forwardRef<HTMLDivElement, CompoundCardProps>(
  ({ children, header, footer, title, description, actions, ...cardProps }, ref) => {
    return (
      <Card ref={ref} {...cardProps}>
        {(header || title || description || actions) && (
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
            {header}
          </CardHeader>
        )}
        
        <CardContent>
          {children}
        </CardContent>
        
        {footer && (
          <CardFooter>
            {footer}
          </CardFooter>
        )}
      </Card>
    )
  }
)
CompoundCard.displayName = 'CompoundCard'

// Specialized Card Components
interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  description?: string
  className?: string
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, changeType = 'neutral', icon, description, className }, ref) => {
    const changeColors = {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    }

    return (
      <Card ref={ref} variant="elevated" hover="lift" className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle level={4} className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="h-4 w-4 text-muted-foreground">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <p className={cn('text-xs', changeColors[changeType])}>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = 'StatsCard'

interface ActionCardProps extends CardProps {
  title: string
  description?: string
  action: React.ReactNode
  image?: string
  badge?: React.ReactNode
}

const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  ({ title, description, action, image, badge, className, ...props }, ref) => {
    return (
      <Card 
        ref={ref} 
        variant="outlined" 
        hover="border" 
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        {badge && (
          <div className="absolute top-4 right-4 z-10">
            {badge}
          </div>
        )}
        
        {image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img 
              src={image} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <CardHeader>
          <CardTitle level={4}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        
        <CardFooter>
          {action}
        </CardFooter>
      </Card>
    )
  }
)
ActionCard.displayName = 'ActionCard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CompoundCard,
  StatsCard,
  ActionCard,
  cardVariants
}