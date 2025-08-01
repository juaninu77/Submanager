import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/index'
import { prisma, testUtils } from '../setup'

describe('Subscriptions API', () => {
  let accessToken: string
  let userId: string

  beforeEach(async () => {
    await testUtils.cleanTable('subscriptions')
    await testUtils.cleanTable('users')
    await testUtils.cleanTable('sessions')

    // Create and login test user
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'sub@example.com',
        password: 'password123',
        name: 'Sub User'
      })

    accessToken = response.body.data.accessToken
    userId = response.body.data.user.id
  })

  describe('POST /api/v1/subscriptions', () => {
    it('should create subscription successfully', async () => {
      const subscriptionData = {
        name: 'Netflix',
        amount: 15.99,
        paymentDate: 5,
        category: 'video',
        billingCycle: 'monthly',
        description: 'Streaming service',
        logo: 'netflix-logo.png',
        color: '#e50914'
      }

      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(subscriptionData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscription.name).toBe(subscriptionData.name)
      expect(response.body.data.subscription.amount).toBe(subscriptionData.amount)
      expect(response.body.data.subscription.userId).toBe(userId)
      expect(response.body.data.subscription.nextPayment).toBeDefined()
      expect(response.body.data.subscription.isActive).toBe(true)
    })

    it('should create subscription with minimal data', async () => {
      const subscriptionData = {
        name: 'Basic Sub',
        amount: 9.99,
        paymentDate: 15,
        category: 'other'
      }

      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(subscriptionData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscription.billingCycle).toBe('monthly') // Default
      expect(response.body.data.subscription.currency).toBe('USD') // Default
      expect(response.body.data.subscription.color).toBe('#000000') // Default
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .send({
          name: 'Test Sub',
          amount: 10,
          paymentDate: 15,
          category: 'other'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
          amount: -5,
          paymentDate: 35,
          category: 'invalid'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('validation')
    })

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Incomplete Sub'
          // Missing amount, paymentDate, category
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/subscriptions', () => {
    beforeEach(async () => {
      // Create test subscriptions
      await testUtils.createTestSubscription(userId, {
        name: 'Netflix',
        category: 'video',
        amount: 15.99,
        isActive: true
      })
      await testUtils.createTestSubscription(userId, {
        name: 'Spotify',
        category: 'music',
        amount: 9.99,
        isActive: true
      })
      await testUtils.createTestSubscription(userId, {
        name: 'Inactive Sub',
        category: 'other',
        amount: 5.99,
        isActive: false
      })

      // Create subscription for different user
      const otherUser = await testUtils.createTestUser({ email: 'other@example.com' })
      await testUtils.createTestSubscription(otherUser.id, {
        name: 'Other User Sub'
      })
    })

    it('should get all user subscriptions', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscriptions).toHaveLength(3)
      
      const names = response.body.data.subscriptions.map((s: any) => s.name)
      expect(names).toContain('Netflix')
      expect(names).toContain('Spotify')
      expect(names).toContain('Inactive Sub')
      expect(names).not.toContain('Other User Sub')
    })

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions?category=video')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscriptions).toHaveLength(1)
      expect(response.body.data.subscriptions[0].name).toBe('Netflix')
    })

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions?isActive=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscriptions).toHaveLength(2)
      
      const activeNames = response.body.data.subscriptions.map((s: any) => s.name)
      expect(activeNames).toContain('Netflix')
      expect(activeNames).toContain('Spotify')
      expect(activeNames).not.toContain('Inactive Sub')
    })

    it('should sort subscriptions', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      const names = response.body.data.subscriptions.map((s: any) => s.name)
      expect(names[0]).toBe('Inactive Sub')
      expect(names[1]).toBe('Netflix')
      expect(names[2]).toBe('Spotify')
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/subscriptions/:id', () => {
    let subscriptionId: string

    beforeEach(async () => {
      const subscription = await testUtils.createTestSubscription(userId, {
        name: 'Test Subscription'
      })
      subscriptionId = subscription.id
    })

    it('should get subscription by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscription.id).toBe(subscriptionId)
      expect(response.body.data.subscription.name).toBe('Test Subscription')
    })

    it('should fail for non-existent subscription', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('not found')
    })

    it('should fail for subscription owned by different user', async () => {
      const otherUser = await testUtils.createTestUser({ email: 'other@example.com' })
      const otherSubscription = await testUtils.createTestSubscription(otherUser.id)

      const response = await request(app)
        .get(`/api/v1/subscriptions/${otherSubscription.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/subscriptions/${subscriptionId}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/v1/subscriptions/:id', () => {
    let subscriptionId: string

    beforeEach(async () => {
      const subscription = await testUtils.createTestSubscription(userId, {
        name: 'Original Name',
        amount: 10.00,
        paymentDate: 15
      })
      subscriptionId = subscription.id
    })

    it('should update subscription successfully', async () => {
      const updates = {
        name: 'Updated Name',
        amount: 19.99,
        category: 'productivity'
      }

      const response = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscription.name).toBe(updates.name)
      expect(response.body.data.subscription.amount).toBe(updates.amount)
      expect(response.body.data.subscription.category).toBe(updates.category)
    })

    it('should update payment date and recalculate next payment', async () => {
      const response = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ paymentDate: 25 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.subscription.paymentDate).toBe(25)
      
      const nextPayment = new Date(response.body.data.subscription.nextPayment)
      expect(nextPayment.getDate()).toBe(25)
    })

    it('should fail with invalid update data', async () => {
      const response = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: -10,
          paymentDate: 35
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should fail for non-existent subscription', async () => {
      const response = await request(app)
        .put('/api/v1/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/subscriptions/${subscriptionId}`)
        .send({ name: 'Updated' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/v1/subscriptions/:id', () => {
    let subscriptionId: string

    beforeEach(async () => {
      const subscription = await testUtils.createTestSubscription(userId)
      subscriptionId = subscription.id
    })

    it('should delete subscription successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('deleted successfully')

      // Verify subscription was deleted
      const deletedSub = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
      })
      expect(deletedSub).toBeNull()
    })

    it('should fail for non-existent subscription', async () => {
      const response = await request(app)
        .delete('/api/v1/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/subscriptions/${subscriptionId}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/subscriptions/stats', () => {
    beforeEach(async () => {
      await testUtils.createTestSubscription(userId, {
        name: 'Netflix',
        amount: 15.99,
        category: 'video',
        isActive: true
      })
      await testUtils.createTestSubscription(userId, {
        name: 'Spotify',
        amount: 9.99,
        category: 'music',
        isActive: true
      })
      await testUtils.createTestSubscription(userId, {
        name: 'Inactive Sub',
        amount: 5.99,
        category: 'other',
        isActive: false
      })
    })

    it('should get subscription statistics', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      
      const stats = response.body.data.statistics
      expect(stats.totalMonthlySpending).toBe(25.98) // Only active subs
      expect(stats.totalSubscriptions).toBe(3)
      expect(stats.activeSubscriptions).toBe(2)
      expect(stats.categoryBreakdown).toBeDefined()
      expect(stats.categoryBreakdown.video.total).toBe(15.99)
      expect(stats.categoryBreakdown.music.total).toBe(9.99)
    })

    it('should return zero stats for user with no subscriptions', async () => {
      // Clean subscriptions for this test
      await testUtils.cleanTable('subscriptions')

      const response = await request(app)
        .get('/api/v1/subscriptions/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      
      const stats = response.body.data.statistics
      expect(stats.totalMonthlySpending).toBe(0)
      expect(stats.totalSubscriptions).toBe(0)
      expect(stats.activeSubscriptions).toBe(0)
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/stats')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })
})