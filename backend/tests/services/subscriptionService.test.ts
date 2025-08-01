import { describe, it, expect, beforeEach } from '@jest/globals'
import { subscriptionService } from '@/services/subscriptionService'
import { prisma, testUtils } from '../setup'
import { ValidationError, NotFoundError } from '@/middleware/errorHandler'

describe('SubscriptionService', () => {
  let testUser: any

  beforeEach(async () => {
    await testUtils.cleanTable('subscriptions')
    await testUtils.cleanTable('users')
    testUser = await testUtils.createTestUser()
  })

  describe('create', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = {
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'video',
        billingCycle: 'monthly'
      }

      const result = await subscriptionService.create(testUser.id, subscriptionData)

      expect(result.success).toBe(true)
      expect(result.data.subscription.name).toBe(subscriptionData.name)
      expect(result.data.subscription.amount).toBe(subscriptionData.amount)
      expect(result.data.subscription.userId).toBe(testUser.id)
      expect(result.data.subscription.nextPayment).toBeDefined()
      expect(result.data.subscription.isActive).toBe(true)
    })

    it('should calculate next payment date correctly', async () => {
      const today = new Date()
      const paymentDate = 15

      const result = await subscriptionService.create(testUser.id, {
        name: 'Test Sub',
        amount: 10,
        paymentDate,
        category: 'other',
        billingCycle: 'monthly'
      })

      const nextPayment = new Date(result.data.subscription.nextPayment)
      expect(nextPayment.getDate()).toBe(paymentDate)
      expect(nextPayment >= today).toBe(true)
    })

    it('should fail with invalid amount', async () => {
      await expect(subscriptionService.create(testUser.id, {
        name: 'Invalid Sub',
        amount: -5, // Negative amount
        paymentDate: 15,
        category: 'other',
        billingCycle: 'monthly'
      })).rejects.toThrow(ValidationError)
    })

    it('should fail with invalid payment date', async () => {
      await expect(subscriptionService.create(testUser.id, {
        name: 'Invalid Sub',
        amount: 10,
        paymentDate: 35, // Invalid day
        category: 'other',
        billingCycle: 'monthly'
      })).rejects.toThrow(ValidationError)
    })

    it('should set default values correctly', async () => {
      const result = await subscriptionService.create(testUser.id, {
        name: 'Minimal Sub',
        amount: 10,
        paymentDate: 15,
        category: 'other'
        // Missing optional fields
      })

      expect(result.data.subscription.billingCycle).toBe('monthly')
      expect(result.data.subscription.currency).toBe('USD')
      expect(result.data.subscription.isActive).toBe(true)
      expect(result.data.subscription.color).toBe('#000000')
    })
  })

  describe('getAll', () => {
    it('should get all user subscriptions', async () => {
      // Create test subscriptions
      await testUtils.createTestSubscription(testUser.id, { name: 'Sub 1' })
      await testUtils.createTestSubscription(testUser.id, { name: 'Sub 2' })
      
      // Create subscription for different user
      const otherUser = await testUtils.createTestUser({ email: 'other@example.com' })
      await testUtils.createTestSubscription(otherUser.id, { name: 'Other Sub' })

      const result = await subscriptionService.getAll(testUser.id)

      expect(result.success).toBe(true)
      expect(result.data.subscriptions).toHaveLength(2)
      expect(result.data.subscriptions.map(s => s.name)).toEqual(['Sub 1', 'Sub 2'])
    })

    it('should filter by category', async () => {
      await testUtils.createTestSubscription(testUser.id, { 
        name: 'Netflix', 
        category: 'video' 
      })
      await testUtils.createTestSubscription(testUser.id, { 
        name: 'Spotify', 
        category: 'music' 
      })

      const result = await subscriptionService.getAll(testUser.id, { category: 'video' })

      expect(result.success).toBe(true)
      expect(result.data.subscriptions).toHaveLength(1)
      expect(result.data.subscriptions[0].name).toBe('Netflix')
    })

    it('should filter by active status', async () => {
      await testUtils.createTestSubscription(testUser.id, { 
        name: 'Active Sub', 
        isActive: true 
      })
      await testUtils.createTestSubscription(testUser.id, { 
        name: 'Inactive Sub', 
        isActive: false 
      })

      const result = await subscriptionService.getAll(testUser.id, { isActive: true })

      expect(result.success).toBe(true)
      expect(result.data.subscriptions).toHaveLength(1)
      expect(result.data.subscriptions[0].name).toBe('Active Sub')
    })

    it('should sort by name', async () => {
      await testUtils.createTestSubscription(testUser.id, { name: 'Zebra' })
      await testUtils.createTestSubscription(testUser.id, { name: 'Apple' })

      const result = await subscriptionService.getAll(testUser.id, { 
        sortBy: 'name',
        sortOrder: 'asc' 
      })

      expect(result.success).toBe(true)
      expect(result.data.subscriptions[0].name).toBe('Apple')
      expect(result.data.subscriptions[1].name).toBe('Zebra')
    })

    it('should return empty array for user with no subscriptions', async () => {
      const result = await subscriptionService.getAll(testUser.id)

      expect(result.success).toBe(true)
      expect(result.data.subscriptions).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should get subscription by ID', async () => {
      const subscription = await testUtils.createTestSubscription(testUser.id, {
        name: 'Test Subscription'
      })

      const result = await subscriptionService.getById(testUser.id, subscription.id)

      expect(result.success).toBe(true)
      expect(result.data.subscription.id).toBe(subscription.id)
      expect(result.data.subscription.name).toBe('Test Subscription')
    })

    it('should fail for non-existent subscription', async () => {
      await expect(subscriptionService.getById(testUser.id, 'non-existent-id'))
        .rejects.toThrow(NotFoundError)
    })

    it('should fail for subscription owned by different user', async () => {
      const otherUser = await testUtils.createTestUser({ email: 'other@example.com' })
      const subscription = await testUtils.createTestSubscription(otherUser.id)

      await expect(subscriptionService.getById(testUser.id, subscription.id))
        .rejects.toThrow(NotFoundError)
    })
  })

  describe('update', () => {
    it('should update subscription successfully', async () => {
      const subscription = await testUtils.createTestSubscription(testUser.id, {
        name: 'Original Name',
        amount: 10
      })

      const updates = {
        name: 'Updated Name',
        amount: 15.99
      }

      const result = await subscriptionService.update(testUser.id, subscription.id, updates)

      expect(result.success).toBe(true)
      expect(result.data.subscription.name).toBe(updates.name)
      expect(result.data.subscription.amount).toBe(updates.amount)
    })

    it('should recalculate next payment when payment date changes', async () => {
      const subscription = await testUtils.createTestSubscription(testUser.id, {
        paymentDate: 15
      })

      const result = await subscriptionService.update(testUser.id, subscription.id, {
        paymentDate: 25
      })

      const nextPayment = new Date(result.data.subscription.nextPayment)
      expect(nextPayment.getDate()).toBe(25)
    })

    it('should fail with invalid update data', async () => {
      const subscription = await testUtils.createTestSubscription(testUser.id)

      await expect(subscriptionService.update(testUser.id, subscription.id, {
        amount: -10 // Invalid amount
      })).rejects.toThrow(ValidationError)
    })

    it('should fail for non-existent subscription', async () => {
      await expect(subscriptionService.update(testUser.id, 'non-existent-id', {
        name: 'Updated'
      })).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete subscription successfully', async () => {
      const subscription = await testUtils.createTestSubscription(testUser.id)

      const result = await subscriptionService.delete(testUser.id, subscription.id)

      expect(result.success).toBe(true)

      // Verify subscription was deleted
      const deletedSub = await prisma.subscription.findUnique({
        where: { id: subscription.id }
      })
      expect(deletedSub).toBeNull()
    })

    it('should fail for non-existent subscription', async () => {
      await expect(subscriptionService.delete(testUser.id, 'non-existent-id'))
        .rejects.toThrow(NotFoundError)
    })

    it('should fail for subscription owned by different user', async () => {
      const otherUser = await testUtils.createTestUser({ email: 'other@example.com' })
      const subscription = await testUtils.createTestSubscription(otherUser.id)

      await expect(subscriptionService.delete(testUser.id, subscription.id))
        .rejects.toThrow(NotFoundError)
    })
  })

  describe('getStatistics', () => {
    beforeEach(async () => {
      // Create test subscriptions with different categories and amounts
      await testUtils.createTestSubscription(testUser.id, {
        name: 'Netflix',
        amount: 15.99,
        category: 'video',
        isActive: true
      })
      await testUtils.createTestSubscription(testUser.id, {
        name: 'Spotify',
        amount: 9.99,
        category: 'music',
        isActive: true
      })
      await testUtils.createTestSubscription(testUser.id, {
        name: 'Inactive Sub',
        amount: 5.99,
        category: 'other',
        isActive: false
      })
    })

    it('should calculate total monthly spending correctly', async () => {
      const result = await subscriptionService.getStatistics(testUser.id)

      expect(result.success).toBe(true)
      expect(result.data.statistics.totalMonthlySpending).toBe(25.98) // Only active subs
      expect(result.data.statistics.totalSubscriptions).toBe(3)
      expect(result.data.statistics.activeSubscriptions).toBe(2)
    })

    it('should calculate category breakdown correctly', async () => {
      const result = await subscriptionService.getStatistics(testUser.id)

      expect(result.success).toBe(true)
      const breakdown = result.data.statistics.categoryBreakdown
      
      expect(breakdown.video.total).toBe(15.99)
      expect(breakdown.video.count).toBe(1)
      expect(breakdown.music.total).toBe(9.99)
      expect(breakdown.music.count).toBe(1)
    })

    it('should return zero statistics for user with no subscriptions', async () => {
      const emptyUser = await testUtils.createTestUser({ email: 'empty@example.com' })
      
      const result = await subscriptionService.getStatistics(emptyUser.id)

      expect(result.success).toBe(true)
      expect(result.data.statistics.totalMonthlySpending).toBe(0)
      expect(result.data.statistics.totalSubscriptions).toBe(0)
      expect(result.data.statistics.activeSubscriptions).toBe(0)
    })
  })
})