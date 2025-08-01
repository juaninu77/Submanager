import { describe, it, expect, beforeEach } from '@jest/globals'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { prisma, testUtils } from '../setup'
import { AuthError } from '@/middleware/errorHandler'

describe('AuthService', () => {
  beforeEach(async () => {
    await testUtils.cleanTable('users')
    await testUtils.cleanTable('sessions')
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      }

      const result = await authService.register(userData)

      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe(userData.email)
      expect(result.data.user.name).toBe(userData.name)
      expect(result.data.accessToken).toBeDefined()
      expect(result.data.refreshToken).toBeDefined()

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(user).toBeTruthy()
      expect(user?.passwordHash).not.toBe(userData.password) // Should be hashed
    })

    it('should fail to register user with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      }

      // Create user first
      await testUtils.createTestUser({ email: userData.email })

      // Try to register again
      await expect(authService.register(userData))
        .rejects.toThrow(AuthError)
    })

    it('should fail with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'User'
      }

      await expect(authService.register(userData))
        .rejects.toThrow()
    })

    it('should fail with weak password', async () => {
      const userData = {
        email: 'user@example.com',
        password: '123', // Too weak
        name: 'User'
      }

      await expect(authService.register(userData))
        .rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const password = 'password123'
      const user = await testUtils.createTestUser({
        email: 'login@example.com',
        passwordHash: await userService.hashPassword(password)
      })

      const result = await authService.login({
        email: user.email,
        password
      })

      expect(result.success).toBe(true)
      expect(result.data.user.id).toBe(user.id)
      expect(result.data.accessToken).toBeDefined()
      expect(result.data.refreshToken).toBeDefined()

      // Verify session was created
      const session = await prisma.session.findFirst({
        where: { userId: user.id }
      })
      expect(session).toBeTruthy()
    })

    it('should fail with incorrect password', async () => {
      const user = await testUtils.createTestUser({
        email: 'login@example.com',
        passwordHash: await userService.hashPassword('correctpassword')
      })

      await expect(authService.login({
        email: user.email,
        password: 'wrongpassword'
      })).rejects.toThrow(AuthError)
    })

    it('should fail with non-existent email', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })).rejects.toThrow(AuthError)
    })

    it('should fail with unverified user', async () => {
      const password = 'password123'
      const user = await testUtils.createTestUser({
        email: 'unverified@example.com',
        passwordHash: await userService.hashPassword(password),
        isVerified: false
      })

      await expect(authService.login({
        email: user.email,
        password
      })).rejects.toThrow(AuthError)
    })
  })

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const user = await testUtils.createTestUser()
      const loginResult = await authService.login({
        email: user.email,
        password: 'password123'
      })

      const refreshResult = await authService.refreshToken(
        loginResult.data.refreshToken
      )

      expect(refreshResult.success).toBe(true)
      expect(refreshResult.data.accessToken).toBeDefined()
      expect(refreshResult.data.refreshToken).toBeDefined()
      expect(refreshResult.data.accessToken).not.toBe(loginResult.data.accessToken)
    })

    it('should fail with invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token'))
        .rejects.toThrow(AuthError)
    })

    it('should fail with expired refresh token', async () => {
      // This would require mocking JWT to create an expired token
      // For now, test with malformed token
      await expect(authService.refreshToken('expired.token.here'))
        .rejects.toThrow(AuthError)
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const user = await testUtils.createTestUser()
      const loginResult = await authService.login({
        email: user.email,
        password: 'password123'
      })

      const result = await authService.logout(
        user.id,
        loginResult.data.refreshToken
      )

      expect(result.success).toBe(true)

      // Verify session was removed
      const session = await prisma.session.findFirst({
        where: { 
          userId: user.id,
          refreshToken: loginResult.data.refreshToken
        }
      })
      expect(session).toBeNull()
    })

    it('should handle logout with non-existent session', async () => {
      const user = await testUtils.createTestUser()

      const result = await authService.logout(user.id, 'non-existent-token')
      expect(result.success).toBe(true) // Should not fail
    })
  })

  describe('verifyToken', () => {
    it('should verify valid access token', async () => {
      const user = await testUtils.createTestUser()
      const loginResult = await authService.login({
        email: user.email,
        password: 'password123'
      })

      const result = await authService.verifyToken(
        loginResult.data.accessToken
      )

      expect(result.success).toBe(true)
      expect(result.data.userId).toBe(user.id)
    })

    it('should fail with invalid token', async () => {
      await expect(authService.verifyToken('invalid-token'))
        .rejects.toThrow(AuthError)
    })
  })

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const user = await testUtils.createTestUser({
        name: 'Profile User',
        email: 'profile@example.com'
      })

      const result = await authService.getUserProfile(user.id)

      expect(result.success).toBe(true)
      expect(result.data.user.id).toBe(user.id)
      expect(result.data.user.name).toBe('Profile User')
      expect(result.data.user.email).toBe('profile@example.com')
      expect(result.data.user.passwordHash).toBeUndefined() // Should not include password
    })

    it('should fail with non-existent user', async () => {
      await expect(authService.getUserProfile('non-existent-id'))
        .rejects.toThrow(AuthError)
    })
  })
})