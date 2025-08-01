"use client"

import { useState, useMemo } from "react"
import type { Subscription } from "@/types/subscription"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SubscriptionRingChartProps {
  subscriptions: Subscription[]
  themeClasses: {
    accent: string
  }
}

// Helper function to calculate amount for a given period
const getAmountForPeriod = (sub: Subscription, period: "monthly" | "quarterly" | "yearly"): number => {
  switch (period) {
    case "monthly":
      if (sub.billingCycle === "yearly") return sub.amount / 12
      if (sub.billingCycle === "quarterly") return sub.amount / 3
      return sub.amount
    case "quarterly":
      if (sub.billingCycle === "yearly") return sub.amount / 4
      if (sub.billingCycle === "monthly") return sub.amount * 3
      return sub.amount
    case "yearly":
      if (sub.billingCycle === "monthly") return sub.amount * 12
      if (sub.billingCycle === "quarterly") return sub.amount * 4
      return sub.amount
    default:
      return 0
  }
}

const SubscriptionRingChart = ({ subscriptions, themeClasses }: SubscriptionRingChartProps) => {
  const [timePeriodIndex, setTimePeriodIndex] = useState(0)
  const timePeriods: Array<"monthly" | "quarterly" | "yearly"> = ["monthly", "quarterly", "yearly"]
  const currentTimePeriod = timePeriods[timePeriodIndex]

  const { chartData, totalForPeriod } = useMemo(() => {
    if (subscriptions.length === 0) return { chartData: [], totalForPeriod: 0 }

    const total = subscriptions.reduce((acc, sub) => acc + getAmountForPeriod(sub, currentTimePeriod), 0)

    if (total === 0) return { chartData: [], totalForPeriod: 0 }

    let cumulativeAngle = -90 // Start from the top
    const data = subscriptions
      .filter((sub) => sub.amount > 0)
      .map((sub) => ({
        ...sub,
        periodAmount: getAmountForPeriod(sub, currentTimePeriod),
      }))
      .sort((a, b) => b.periodAmount - a.periodAmount)
      .map((sub) => {
        const percentage = (sub.periodAmount / total) * 100
        const angle = (percentage / 100) * 360
        const startAngle = cumulativeAngle
        const endAngle = cumulativeAngle + angle
        cumulativeAngle = endAngle
        return { ...sub, percentage, startAngle, endAngle, angle }
      })

    return { chartData: data, totalForPeriod: total }
  }, [subscriptions, currentTimePeriod])

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number, gap: number = 8) => {
    // Add gap to start and subtract from end to create proper spacing
    const adjustedStartAngle = startAngle + gap / 2
    const adjustedEndAngle = endAngle - gap / 2
    
    const start = polarToCartesian(x, y, radius, adjustedEndAngle)
    const end = polarToCartesian(x, y, radius, adjustedStartAngle)
    const largeArcFlag = adjustedEndAngle - adjustedStartAngle <= 180 ? "0" : "1"
    
    const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ")
    return d
  }

  const radius = 85
  const strokeWidth = 30
  const size = 250

  if (subscriptions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full p-6 bg-fence-light/50 rounded-2xl text-venetian-light/70"
        style={{ width: size, height: size + 50 }}
      >
        Añade una suscripción para ver el gráfico.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          initial={{ rotate: -90 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            {/* Background Ring */}
            <circle cx="0" cy="0" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={strokeWidth} />

            <AnimatePresence>
              {chartData.map((sub, index) => (
                <motion.path
                  key={sub.id}
                  d={describeArc(0, 0, radius, sub.startAngle, sub.endAngle)}
                  fill="none"
                  stroke={sub.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </g>
        </motion.svg>

        {/* Logos inside segments */}
        <div className="absolute inset-0 pointer-events-none">
          {chartData.map((sub) => {
            if (sub.angle < 12) return null // Don't show logo if segment is too small
            // Calculate midpoint accounting for the gap
            const gap = 8
            const adjustedStartAngle = sub.startAngle + gap / 2
            const adjustedEndAngle = sub.endAngle - gap / 2
            const midAngle = adjustedStartAngle + (adjustedEndAngle - adjustedStartAngle) / 2
            const logoPlacementRadius = radius - strokeWidth / 2 // Position logo in the middle of the stroke
            const logoCenter = polarToCartesian(size / 2, size / 2, logoPlacementRadius, midAngle)

            return (
              <motion.div
                key={`logo-${sub.id}`}
                className="absolute w-12 h-12 flex items-center justify-center"
                style={{
                  left: logoCenter.x,
                  top: logoCenter.y,
                  transform: `translate(-50%, -50%)`, // Center the div itself
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Image
                    src={sub.logo || "/placeholder.svg"}
                    alt={sub.name}
                    width={20}
                    height={20}
                    className="object-contain rounded w-auto h-auto"
                    style={{ width: 'auto', height: 'auto', maxWidth: '20px', maxHeight: '20px' }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs text-venetian-light/70 uppercase tracking-wider">
              {currentTimePeriod === "monthly"
                ? "Total Mensual"
                : currentTimePeriod === "quarterly"
                  ? "Total Trimestral"
                  : "Total Anual"}
            </div>
            <div className={cn("text-4xl font-bold", themeClasses.accent)}>${totalForPeriod.toFixed(0)}</div>
            <div className="text-sm text-venetian-light/70">en {subscriptions.length} suscripciones</div>
          </div>
        </div>
      </div>

      <div className="w-48 mt-6">
        <Slider
          min={0}
          max={2}
          step={1}
          value={[timePeriodIndex]}
          onValueChange={(value) => setTimePeriodIndex(value[0])}
        />
        <div className="flex justify-between text-xs text-venetian-light/70 mt-1">
          <span>Mensual</span>
          <span>Trimestral</span>
          <span>Anual</span>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionRingChart
