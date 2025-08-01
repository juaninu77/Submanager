import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { app } from '@/index'
import { prisma, testUtils } from '../setup'

describe('Auth API', () => {
  beforeEach(async () => {
    await testUtils.cleanTable('users')
    await testUtils.cleanTable('sessions')
  })

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.name).toBe(userData.name)
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.user.passwordHash).toBeUndefined()
    })

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password and name
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('validation')
    })

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'User'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'User'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'User'
      }

      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('already exists')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          name: 'Login User'
        })
    })

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('login@example.com')
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid credentials')
    })

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com'
          // Missing password
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string

    beforeEach(async () => {
      // Register and login to get refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'password123',
          name: 'Refresh User'
        })

      refreshToken = loginResponse.body.data.refreshToken
    })

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.accessToken).not.toBe(refreshToken)
    })

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/auth/profile', () => {
    let accessToken: string

    beforeEach(async () => {
      // Register and login to get access token
      const loginResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'password123',
          name: 'Profile User'
        })

      accessToken = loginResponse.body.data.accessToken
    })

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('profile@example.com')
      expect(response.body.data.user.name).toBe('Profile User')
      expect(response.body.data.user.passwordHash).toBeUndefined()
    })

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('token required')
    })

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string
    let refreshToken: string

    beforeEach(async () => {
      // Register and login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'password123',
          name: 'Logout User'
        })

      accessToken = loginResponse.body.data.accessToken
      refreshToken = loginResponse.body.data.refreshToken
    })

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logged out successfully')

      // Verify session was removed by trying to use refresh token
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401)

      expect(refreshResponse.body.success).toBe(false)
    })

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should handle logout with invalid refresh token gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: 'invalid-token' })
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Rate limiting', () => {
    it('should rate limit login attempts', async () => {
      const userData = {
        email: 'ratelimit@example.com',
        password: 'wrongpassword'
      }

      // Create user first
      await testUtils.createTestUser({ email: userData.email })

      // Make multiple failed login attempts
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send(userData)
      )

      const responses = await Promise.all(requests)

      // First 5 should get 401 (invalid credentials)
      // 6th should get 429 (rate limited)
      const statusCodes = responses.map(r => r.status)
      expect(statusCodes.filter(s => s === 401)).toBeGreaterThan(0)
      expect(statusCodes.includes(429)).toBe(true)
    }, 10000)
  })
})