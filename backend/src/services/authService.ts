import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { config } from '@/config/env'
import { userService, CreateUserData } from '@/services/userService'
import { UnauthorizedError, ValidationError } from '@/middleware/errorHandler'
import { logAuthEvent } from '@/utils/logger'

const prisma = new PrismaClient()

export interface LoginData {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
  }
  tokens: AuthTokens
}

class AuthService {
  // Register new user
  async register(data: CreateUserData): Promise<AuthResponse> {
    // Create user
    const userResponse = await userService.createUser(data)
    
    // Generate tokens
    const tokens = await this.generateTokens(userResponse.id, userResponse.email)
    
    // Log auth event
    logAuthEvent('user_registered', userResponse.id, {
      email: userResponse.email,
      method: 'email_password'
    })

    return {
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        avatar: userResponse.avatar
      },
      tokens
    }
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data

    // Find user
    const user = await userService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new UnauthorizedError('Account has been deactivated')
    }

    // Verify password
    const isPasswordValid = await userService.verifyPassword(user, password)
    if (!isPasswordValid) {
      logAuthEvent('login_failed', user.id, {
        email,
        reason: 'invalid_password'
      })
      throw new UnauthorizedError('Invalid email or password')
    }

    // Update last login
    await userService.updateLastLogin(user.id)

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email)

    // Log successful login
    logAuthEvent('user_logged_in', user.id, {
      email,
      method: 'email_password'
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar: user.avatar || undefined
      },
      tokens
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any
      
      // Find session
      const session = await prisma.session.findUnique({
        where: { refreshToken }
      })

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token')
      }

      // Check if user still exists
      const user = await userService.findById(session.userId)
      if (!user || user.deletedAt) {
        // Clean up invalid session
        await this.revokeSession(refreshToken)
        throw new UnauthorizedError('User not found')
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(user.id, user.email)
      
      // Update session with new refresh token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })

      // Revoke old refresh token
      await this.revokeSession(refreshToken)

      logAuthEvent('token_refreshed', user.id)

      return newTokens
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token')
    }
  }

  // Logout user
  async logout(refreshToken: string): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { refreshToken }
      })

      if (session) {
        await this.revokeSession(refreshToken)
        logAuthEvent('user_logged_out', session.userId)
      }
    } catch (error) {
      // Ignore errors during logout
    }
  }

  // Logout from all devices
  async logoutAll(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId }
    })

    logAuthEvent('user_logged_out_all', userId)
  }

  // Change password
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    const user = await userService.findById(userId)
    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await userService.verifyPassword(user, currentPassword)
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    // Update password
    await userService.updatePassword(userId, newPassword)

    // Revoke all sessions (force re-login)
    await this.logoutAll(userId)

    logAuthEvent('password_changed', userId)
  }

  // Generate access and refresh tokens
  private async generateTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload = { userId, email }

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.JWT_EXPIRES_IN
    })

    // Generate refresh token
    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN
    })

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId,
        token: this.generateSessionToken(),
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: config.JWT_EXPIRES_IN
    }
  }

  // Generate random session token
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Revoke session
  private async revokeSession(refreshToken: string): Promise<void> {
    await prisma.session.delete({
      where: { refreshToken }
    }).catch(() => {
      // Ignore if session doesn't exist
    })
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
  }

  // Get user sessions
  async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Revoke specific session
  async revokeUserSession(userId: string, sessionId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId
      }
    })
  }
}

export const authService = new AuthService()