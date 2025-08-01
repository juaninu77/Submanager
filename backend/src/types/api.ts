// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    [key: string]: any
  }
  timestamp?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  timestamp: string
  path: string
  method: string
}

// Request/Response types for authentication
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
  }
  accessToken: string
  expiresIn: string
}

// Subscription types
export interface CreateSubscriptionRequest {
  name: string
  description?: string
  amount: number
  currency?: string
  billingCycle?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  paymentDate: number
  category: string
  logo?: string
  color?: string
  startDate?: string
  isActive?: boolean
  isTrial?: boolean
  trialEnd?: string
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  endDate?: string
}

export interface SubscriptionResponse {
  id: string
  userId: string
  name: string
  description?: string
  amount: number
  currency: string
  billingCycle: string
  paymentDate: number
  nextPayment?: string
  category: string
  logo?: string
  color: string
  isActive: boolean
  isTrial: boolean
  trialEnd?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyTotal: number
  yearlyTotal: number
  averageAmount: number
  categoryBreakdown: Record<string, { count: number; total: number }>
  upcomingPayments: Array<{
    subscription: SubscriptionResponse
    daysUntilPayment: number
  }>
}

// Budget types
export interface CreateBudgetRequest {
  name: string
  description?: string
  amount: number
  currency?: string
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  category?: string
  rollover?: boolean
  isDefault?: boolean
  alerts?: BudgetAlert[]
}

export interface BudgetAlert {
  threshold: number
  type: 'email' | 'push' | 'sms'
  message: string
  isActive: boolean
}

// User types
export interface UserProfileResponse {
  id: string
  email: string
  name?: string
  avatar?: string
  phone?: string
  language: string
  timezone: string
  currency: string
  settings: Record<string, any>
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface UpdateUserProfileRequest {
  name?: string
  avatar?: string
  phone?: string
  language?: string
  timezone?: string
  currency?: string
  settings?: Record<string, any>
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Query parameters
export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface SubscriptionFilters {
  category?: string
  isActive?: boolean
  search?: string
  startDate?: string
  endDate?: string
}

export interface BudgetFilters {
  category?: string
  period?: string
  isDefault?: boolean
}

// Utility types
export type SortOrder = 'asc' | 'desc'
export type DateRange = {
  start: string
  end: string
}

export interface SortOptions {
  field: string
  order: SortOrder
}