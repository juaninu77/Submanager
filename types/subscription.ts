export type SubscriptionCategory =
  | "entertainment"
  | "productivity"
  | "utilities"
  | "gaming"
  | "music"
  | "video"
  | "other"

export interface Subscription {
  id: string
  name: string
  amount: number
  paymentDate: number
  logo: string
  color: string
  category: SubscriptionCategory
  description?: string
  billingCycle?: "monthly" | "yearly" | "quarterly"
  startDate?: string
  nextPayment?: string
  reminder?: boolean
  reminderDays?: number
}

export type AppTheme = "default" | "neon" | "minimal" | "gradient" | "brutalist"
