import { Request, Response } from 'express'
import { z } from 'zod'
import { subscriptionService } from '@/services/subscriptionService'
import { asyncHandler, ValidationError } from '@/middleware/errorHandler'
import { AuthenticatedRequest } from '@/middleware/auth'

// Validation schemas
const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  billingCycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  paymentDate: z.number().int().min(1).max(31, 'Payment date must be between 1 and 31'),
  category: z.string().min(1, 'Category is required'),
  logo: z.string().url('Logo must be a valid URL').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  startDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  isTrial: z.boolean().optional(),
  trialEnd: z.string().datetime().optional()
})

const updateSubscriptionSchema = createSubscriptionSchema.partial()

const subscriptionFiltersSchema = z.object({
  category: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().transform(str => new Date(str)).optional(),
  endDate: z.string().datetime().transform(str => new Date(str)).optional()
})

class SubscriptionController {
  // Create new subscription
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = createSubscriptionSchema.parse(req.body)
    
    const subscription = await subscriptionService.createSubscription(
      req.user.id,
      validatedData
    )

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    })
  })

  // Get all user subscriptions
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const filters = subscriptionFiltersSchema.parse(req.query)
    
    const subscriptions = await subscriptionService.getUserSubscriptions(
      req.user.id,
      filters
    )

    res.json({
      success: true,
      data: subscriptions,
      meta: {
        total: subscriptions.length,
        filters
      }
    })
  })

  // Get subscription by ID
  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    const subscription = await subscriptionService.getSubscriptionById(id, req.user.id)

    res.json({
      success: true,
      data: subscription
    })
  })

  // Update subscription
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const validatedData = updateSubscriptionSchema.parse(req.body)
    
    const subscription = await subscriptionService.updateSubscription(
      id,
      req.user.id,
      validatedData
    )

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    })
  })

  // Delete subscription
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    await subscriptionService.deleteSubscription(id, req.user.id)

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    })
  })

  // Toggle subscription status
  toggleStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    
    const subscription = await subscriptionService.toggleSubscriptionStatus(id, req.user.id)

    res.json({
      success: true,
      message: `Subscription ${subscription.isActive ? 'activated' : 'deactivated'} successfully`,
      data: subscription
    })
  })

  // Get subscription statistics
  getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await subscriptionService.getSubscriptionStats(req.user.id)

    res.json({
      success: true,
      data: stats
    })
  })

  // Get subscriptions by category
  getByCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const subscriptionsByCategory = await subscriptionService.getSubscriptionsByCategory(req.user.id)

    res.json({
      success: true,
      data: subscriptionsByCategory
    })
  })

  // Search subscriptions
  search = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q } = req.query
    
    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query is required')
    }

    const subscriptions = await subscriptionService.searchSubscriptions(req.user.id, q)

    res.json({
      success: true,
      data: subscriptions,
      meta: {
        query: q,
        total: subscriptions.length
      }
    })
  })

  // Get upcoming renewals
  getUpcomingRenewals = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7
    
    if (days < 1 || days > 365) {
      throw new ValidationError('Days must be between 1 and 365')
    }

    const renewals = await subscriptionService.getUpcomingRenewals(req.user.id, days)

    res.json({
      success: true,
      data: renewals,
      meta: {
        days,
        total: renewals.length
      }
    })
  })

  // Bulk operations
  bulkUpdate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const schema = z.object({
      subscriptionIds: z.array(z.string().cuid()),
      updates: updateSubscriptionSchema
    })

    const { subscriptionIds, updates } = schema.parse(req.body)

    if (subscriptionIds.length === 0) {
      throw new ValidationError('At least one subscription ID is required')
    }

    if (subscriptionIds.length > 50) {
      throw new ValidationError('Cannot update more than 50 subscriptions at once')
    }

    const results = await Promise.allSettled(
      subscriptionIds.map(id => 
        subscriptionService.updateSubscription(id, req.user.id, updates)
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - successful

    res.json({
      success: true,
      message: `Bulk update completed: ${successful} successful, ${failed} failed`,
      data: {
        successful,
        failed,
        total: results.length
      }
    })
  })

  // Bulk delete
  bulkDelete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const schema = z.object({
      subscriptionIds: z.array(z.string().cuid())
    })

    const { subscriptionIds } = schema.parse(req.body)

    if (subscriptionIds.length === 0) {
      throw new ValidationError('At least one subscription ID is required')
    }

    if (subscriptionIds.length > 50) {
      throw new ValidationError('Cannot delete more than 50 subscriptions at once')
    }

    const results = await Promise.allSettled(
      subscriptionIds.map(id => 
        subscriptionService.deleteSubscription(id, req.user.id)
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - successful

    res.json({
      success: true,
      message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
      data: {
        successful,
        failed,
        total: results.length
      }
    })
  })

  // Export subscriptions
  export = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const format = req.query.format as string || 'json'
    const filters = subscriptionFiltersSchema.parse(req.query)
    
    const subscriptions = await subscriptionService.getUserSubscriptions(
      req.user.id,
      filters
    )

    switch (format.toLowerCase()) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=subscriptions.csv')
        
        // Simple CSV export
        const csvHeader = 'Name,Amount,Currency,Billing Cycle,Payment Date,Category,Status,Start Date\n'
        const csvRows = subscriptions.map(sub => 
          `"${sub.name}",${sub.amount},${sub.currency},${sub.billingCycle},${sub.paymentDate},"${sub.category}",${sub.isActive ? 'Active' : 'Inactive'},"${sub.startDate?.toISOString() || ''}"`
        ).join('\n')
        
        res.send(csvHeader + csvRows)
        break

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename=subscriptions.json')
        res.json({
          success: true,
          data: subscriptions,
          exportedAt: new Date().toISOString(),
          total: subscriptions.length
        })
        break
    }
  })
}

export const subscriptionController = new SubscriptionController()