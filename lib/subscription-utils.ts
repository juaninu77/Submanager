import type { Subscription } from "@/types/subscription"

export type TimePeriod = "monthly" | "quarterly" | "yearly"

export const getAmountForPeriod = (sub: Subscription, period: TimePeriod): number => {
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

export const calculateTotalForPeriod = (subscriptions: Subscription[], period: TimePeriod): number => {
  return subscriptions.reduce((acc, sub) => acc + getAmountForPeriod(sub, period), 0)
}

export const createChartData = (subscriptions: Subscription[], period: TimePeriod) => {
  if (subscriptions.length === 0) return { chartData: [], totalForPeriod: 0 }

  const total = calculateTotalForPeriod(subscriptions, period)
  if (total === 0) return { chartData: [], totalForPeriod: 0 }

  let cumulativeAngle = -90
  const data = subscriptions
    .filter((sub) => sub.amount > 0)
    .map((sub) => ({
      ...sub,
      periodAmount: getAmountForPeriod(sub, period),
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
}

export const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

export const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ")
}