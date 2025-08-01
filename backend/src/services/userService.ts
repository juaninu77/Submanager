import bcrypt from 'bcryptjs'
import { PrismaClient, User, ApiKey } from '@prisma/client'
import { config } from '@/config/env'
import { ConflictError, NotFoundError, ValidationError } from '@/middleware/errorHandler'

const prisma = new PrismaClient()

export interface CreateUserData {
  email: string
  password: string
  name?: string
}

export interface UpdateUserData {
  name?: string
  avatar?: string
  phone?: string
  language?: string
  timezone?: string
  currency?: string
  settings?: Record<string, any>
}

export interface UserResponse {
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
  createdAt: Date
  updatedAt: Date
}

class UserService {
  // Create new user
  async createUser(data: CreateUserData): Promise<UserResponse> {
    const { email, password, name } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        settings: {
          notifications: {
            email: true,
            push: false,
            sms: false
          },
          privacy: {
            profileVisible: false,
            dataSharing: false
          }
        }
      }
    })

    return this.toUserResponse(user)
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    })
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  // Update user
  async updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return this.toUserResponse(updatedUser)
  }

  // Verify password
  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) {
      return false // OAuth-only user
    }
    return await bcrypt.compare(password, user.passwordHash)
  }

  // Update password
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds)
    
    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    })
  }

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    })
  }

  // Soft delete user
  async deleteUser(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  // API Key management
  async createApiKey(userId: string, name: string): Promise<{ key: string; id: string }> {
    // Generate random API key
    const key = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        key
      }
    })

    return { key, id: apiKey.id }
  }

  async findApiKey(key: string): Promise<ApiKey | null> {
    return await prisma.apiKey.findUnique({
      where: { key }
    })
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id },
      data: { lastUsed: new Date() }
    })
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async revokeApiKey(id: string, userId: string): Promise<void> {
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId }
    })

    if (!apiKey) {
      throw new NotFoundError('API Key')
    }

    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false }
    })
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const [
      totalSubscriptions,
      activeSubscriptions,
      totalBudgets,
      monthlySpend
    ] = await Promise.all([
      prisma.subscription.count({
        where: { userId }
      }),
      prisma.subscription.count({
        where: { userId, isActive: true }
      }),
      prisma.budget.count({
        where: { userId }
      }),
      prisma.subscription.aggregate({
        where: { userId, isActive: true },
        _sum: { amount: true }
      })
    ])

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalBudgets,
      monthlySpend: monthlySpend._sum.amount || 0
    }
  }

  // Convert User model to response format (exclude sensitive fields)
  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      avatar: user.avatar || undefined,
      phone: user.phone || undefined,
      language: user.language,
      timezone: user.timezone,
      currency: user.currency,
      settings: user.settings as Record<string, any>,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}

export const userService = new UserService()