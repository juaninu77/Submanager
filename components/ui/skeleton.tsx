import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:animate-shimmer before:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

// Skeleton Variants
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  )
}

function SkeletonSubscriptionCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 border rounded-lg space-y-4", className)} {...props}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[60%]" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-6 w-[80px]" />
        <Skeleton className="h-6 w-[60px]" />
      </div>
    </div>
  )
}

function SkeletonDashboard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      
      {/* Search Bar */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
      
      {/* Subscription Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSubscriptionCard key={i} />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonSubscriptionCard, SkeletonDashboard }
