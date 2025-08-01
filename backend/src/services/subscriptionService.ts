import { PrismaClient, Subscription } from '@prisma/client'
import { NotFoundError, ValidationError, ForbiddenError } from '@/middleware/errorHandler'
import { logBusinessEvent } from '@/utils/logger'

const prisma = new PrismaClient()

export interface CreateSubscriptionData {
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

export interface UpdateSubscriptionData {
  name?: string
  description?: string
  amount?: number
  currency?: string
  billingCycle?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  paymentDate?: number
  category?: string
  logo?: string
  color?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  isTrial?: boolean
  trialEnd?: string
}

export interface SubscriptionFilters {
  category?: string
  isActive?: boolean
  search?: string
  startDate?: Date
  endDate?: Date
}

export interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyTotal: number
  yearlyTotal: number
  averageAmount: number
  categoryBreakdown: Record<string, { count: number; total: number }>
  upcomingPayments: Array<{
    subscription: Subscription
    daysUntilPayment: number
  }>
}

class SubscriptionService {
  // Create subscription
  async createSubscription(userId: string, data: CreateSubscriptionData): Promise<Subscription> {
    // Validate payment date
    if (data.paymentDate < 1 || data.paymentDate > 31) {
      throw new ValidationError('Payment date must be between 1 and 31')
    }

    // Calculate next payment date
    const nextPayment = this.calculateNextPaymentDate(data.paymentDate, data.billingCycle || 'monthly')

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        ...data,
        nextPayment,
        currency: data.currency || 'USD',
        billingCycle: data.billingCycle || 'monthly',
        color: data.color || '#000000',
        startDate: data.startDate ? new Date(data.startDate) : new Date()
      }
    })

    logBusinessEvent('subscription_created', userId, {
      subscriptionId: subscription.id,
      name: subscription.name,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle
    })

    return subscription
  }

  // Get user subscriptions with filters
  async getUserSubscriptions(
    userId: string, 
    filters: SubscriptionFilters = {}
  ): Promise<Subscription[]> {
    const where: any = { userId }

    // Apply filters
    if (filters.category) {
      where.category = filters.category
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    return await prisma.subscription.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { nextPayment: 'asc' }
      ]
    })
  }

  // Get subscription by ID
  async getSubscriptionById(id: string, userId: string): Promise<Subscription> {
    const subscription = await prisma.subscription.findFirst({
      where: { id, userId }
    })

    if (!subscription) {
      throw new NotFoundError('Subscription')
    }

    return subscription
  }

  // Update subscription
  async updateSubscription(
    id: string, 
    userId: string, 
    data: UpdateSubscriptionData
  ): Promise<Subscription> {
    // Verify ownership
    const existingSubscription = await this.getSubscriptionById(id, userId)

    // Validate payment date if provided
    if (data.paymentDate && (data.paymentDate < 1 || data.paymentDate > 31)) {
      throw new ValidationError('Payment date must be between 1 and 31')
    }

    // Recalculate next payment if payment date or billing cycle changed
    let nextPayment = existingSubscription.nextPayment
    if (data.paymentDate || data.billingCycle) {
      const paymentDate = data.paymentDate || existingSubscription.paymentDate
      const billingCycle = data.billingCycle || existingSubscription.billingCycle
      nextPayment = this.calculateNextPaymentDate(paymentDate, billingCycle)
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        nextPayment,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        trialEnd: data.trialEnd ? new Date(data.trialEnd) : undefined
      }
    })

    logBusinessEvent('subscription_updated', userId, {
      subscriptionId: id,
      changes: data
    })

    return subscription
  }

  // Delete subscription
  async deleteSubscription(id: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getSubscriptionById(id, userId)

    await prisma.subscription.delete({
      where: { id }
    })

    logBusinessEvent('subscription_deleted', userId, {
      subscriptionId: id
    })
  }

  // Toggle subscription active status
  async toggleSubscriptionStatus(id: string, userId: string): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id, userId)

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        isActive: !subscription.isActive,
        endDate: !subscription.isActive ? null : new Date()
      }
    })

    logBusinessEvent('subscription_status_changed', userId, {
      subscriptionId: id,
      newStatus: updatedSubscription.isActive ? 'active' : 'inactive'
    })

    return updatedSubscription
  }

  // Get subscription statistics
  async getSubscriptionStats(userId: string): Promise<SubscriptionStats> {
    const subscriptions = await this.getUserSubscriptions(userId, { isActive: true })
    
    const totalSubscriptions = await prisma.subscription.count({
      where: { userId }
    })

    const activeSubscriptions = subscriptions.length

    // Calculate totals
    const monthlyTotal = subscriptions.reduce((total, sub) => {
      return total + this.normalizeToMonthly(sub.amount, sub.billingCycle)
    }, 0)

    const yearlyTotal = monthlyTotal * 12

    const averageAmount = activeSubscriptions > 0 ? monthlyTotal / activeSubscriptions : 0

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; total: number }> = {}
    subscriptions.forEach(sub => {
      if (!categoryBreakdown[sub.category]) {
        categoryBreakdown[sub.category] = { count: 0, total: 0 }
      }
      categoryBreakdown[sub.category].count++
      categoryBreakdown[sub.category].total += this.normalizeToMonthly(sub.amount, sub.billingCycle)
    })

    // Upcoming payments (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const upcomingPayments = subscriptions
      .filter(sub => sub.nextPayment && sub.nextPayment <= nextWeek)
      .map(sub => ({
        subscription: sub,
        daysUntilPayment: sub.nextPayment 
          ? Math.ceil((sub.nextPayment.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
          : 0
      }))
      .sort((a, b) => a.daysUntilPayment - b.daysUntilPayment)

    return {
      totalSubscriptions,
      activeSubscriptions,
      monthlyTotal,
      yearlyTotal,
      averageAmount,
      categoryBreakdown,
      upcomingPayments
    }
  }

  // Get subscriptions by category
  async getSubscriptionsByCategory(userId: string): Promise<Record<string, Subscription[]>> {
    const subscriptions = await this.getUserSubscriptions(userId, { isActive: true })
    
    const byCategory: Record<string, Subscription[]> = {}
    subscriptions.forEach(sub => {
      if (!byCategory[sub.category]) {
        byCategory[sub.category] = []
      }
      byCategory[sub.category].push(sub)
    })

    return byCategory
  }

  // Search subscriptions
  async searchSubscriptions(userId: string, query: string): Promise<Subscription[]> {
    return await this.getUserSubscriptions(userId, { search: query, isActive: true })
  }

  // Get upcoming renewals
  async getUpcomingRenewals(userId: string, days: number = 7): Promise<Subscription[]> {
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)

    return await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
        nextPayment: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { nextPayment: 'asc' }
    })
  }

  // Helper method to normalize amounts to monthly
  private normalizeToMonthly(amount: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'weekly':
        return amount * 4.33 // Average weeks per month
      case 'monthly':
        return amount
      case 'quarterly':
        return amount / 3
      case 'yearly':
        return amount / 12
      default:
        return amount
    }
  }

  // Helper method to calculate next payment date
  private calculateNextPaymentDate(paymentDate: number, billingCycle: string): Date {
    const today = new Date()
    let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDate)

    // If payment date has passed this month, move to next period
    if (nextPayment <= today) {
      switch (billingCycle) {
        case 'weekly':
          nextPayment = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, paymentDate)
          break
        case 'quarterly':
          nextPayment = new Date(today.getFullYear(), today.getMonth() + 3, paymentDate)
          break
        case 'yearly':
          nextPayment = new Date(today.getFullYear() + 1, today.getMonth(), paymentDate)
          break
      }
    }

    return nextPayment
  }
}

export const subscriptionService = new SubscriptionService()