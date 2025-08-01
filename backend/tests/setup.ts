import { PrismaClient } from '@prisma/test-client'
import { beforeAll, afterAll, beforeEach } from '@jest/globals'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') })

// Mock environment variables for testing
process.env.NODE_ENV = 'test'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Clean up database before running tests
  await cleanDatabase()
})

beforeEach(async () => {
  // Clean up database before each test
  await cleanDatabase()
})

afterAll(async () => {
  // Clean up and disconnect after all tests
  await cleanDatabase()
  await prisma.$disconnect()
})

async function cleanDatabase() {
  // For SQLite, we need to delete records in order
  const tables = ['sessions', 'api_keys', 'subscriptions', 'budgets', 'users']
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table}`)
    } catch (error) {
      console.log(`Could not clean ${table}, probably doesn't exist yet.`)
    }
  }
}

// Export prisma instance for tests
export { prisma }

// Test utilities
export const testUtils = {
  // Create test user
  createTestUser: async (overrides: any = {}) => {
    const defaultUser = {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: '$2b$04$rQZ9j6wGRQKNnR8R.7Qhb.K4P4P4P4P4P4P4P4P4P4P4P4P4P4P4P4P4', // 'password123'
      emailVerified: true,
      settings: JSON.stringify({
        darkMode: false,
        appTheme: 'default',
        language: 'es',
        currency: 'USD'
      })
    }

    return await prisma.user.create({
      data: { ...defaultUser, ...overrides }
    })
  },

  // Create test subscription
  createTestSubscription: async (userId: string, overrides: any = {}) => {
    const defaultSubscription = {
      name: 'Test Subscription',
      amount: 9.99,
      paymentDate: 15,
      category: 'video',
      billingCycle: 'monthly',
      currency: 'USD',
      isActive: true,
      nextPayment: new Date('2024-02-15')
    }

    return await prisma.subscription.create({
      data: {
        userId,
        ...defaultSubscription,
        ...overrides
      }
    })
  },

  // Create test budget
  createTestBudget: async (userId: string, overrides: any = {}) => {
    const defaultBudget = {
      name: 'Test Budget',
      amount: 100.00,
      currency: 'USD',
      period: 'monthly',
      isDefault: true,
      alerts: JSON.stringify([])
    }

    return await prisma.budget.create({
      data: {
        userId,
        ...defaultBudget,
        ...overrides
      }
    })
  },

  // Clean specific table
  cleanTable: async (tableName: string) => {
    await prisma.$executeRawUnsafe(`DELETE FROM ${tableName}`)
  }
}