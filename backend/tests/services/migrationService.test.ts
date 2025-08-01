import { describe, it, expect, beforeEach } from '@jest/globals'
import { migrationService, LocalStorageData } from '@/services/migrationService'
import { prisma, testUtils } from '../setup'

describe('MigrationService', () => {
  let testUser: any

  beforeEach(async () => {
    await testUtils.cleanTable('subscriptions')
    await testUtils.cleanTable('budgets')
    await testUtils.cleanTable('users')
    testUser = await testUtils.createTestUser()
  })

  describe('migrateUserData', () => {
    it('should migrate complete localStorage data successfully', async () => {
      const localData: LocalStorageData = {
        subscriptions: [
          {
            id: 'local-1',
            name: 'Netflix',
            amount: 15.99,
            paymentDate: 5,
            category: 'video',
            billingCycle: 'monthly',
            description: 'Streaming service',
            logo: 'netflix-logo.png',
            color: '#e50914',
            isActive: true,
            startDate: '2024-01-01'
          },
          {
            id: 'local-2',
            name: 'Spotify',
            amount: 9.99,
            paymentDate: 15,
            category: 'music',
            billingCycle: 'monthly',
            isActive: true
          }
        ],
        budget: 100,
        settings: {
          darkMode: true,
          appTheme: 'neon',
          language: 'es',
          currency: 'EUR',
          notifications: {
            email: true,
            push: false
          }
        },
        userXP: 500,
        userLevel: 3,
        achievementsUnlocked: 5
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(true)
      expect(result.details?.subscriptions.migrated).toBe(2)
      expect(result.details?.subscriptions.failed).toBe(0)
      expect(result.details?.budget.migrated).toBe(1)
      expect(result.details?.settings.migrated).toBe(1)

      // Verify subscriptions were migrated
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: testUser.id }
      })
      expect(subscriptions).toHaveLength(2)
      expect(subscriptions[0].name).toBe('Netflix')
      expect(subscriptions[0].nextPayment).toBeDefined()

      // Verify budget was migrated
      const budget = await prisma.budget.findFirst({
        where: { userId: testUser.id }
      })
      expect(budget).toBeTruthy()
      expect(budget?.amount).toBe(100)
      expect(budget?.name).toBe('Presupuesto Principal')

      // Verify settings were migrated
      const user = await prisma.user.findUnique({
        where: { id: testUser.id }
      })
      const settings = user?.settings as any
      expect(settings.darkMode).toBe(true)
      expect(settings.appTheme).toBe('neon')
      expect(settings.migrated).toBe(true)
      expect(user?.language).toBe('es')
      expect(user?.currency).toBe('EUR')
    })

    it('should handle partial migration when some subscriptions fail', async () => {
      const localData: LocalStorageData = {
        subscriptions: [
          {
            id: 'valid-1',
            name: 'Valid Subscription',
            amount: 10,
            paymentDate: 15,
            category: 'other',
            billingCycle: 'monthly'
          },
          {
            id: 'invalid-1',
            name: '', // Invalid: empty name
            amount: -5, // Invalid: negative amount
            paymentDate: 35, // Invalid: invalid day
            category: 'invalid',
            billingCycle: 'monthly'
          }
        ]
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(true)
      expect(result.details?.subscriptions.migrated).toBe(1)
      expect(result.details?.subscriptions.failed).toBe(1)
      expect(result.details?.subscriptions.errors).toHaveLength(1)

      // Verify only valid subscription was migrated
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: testUser.id }
      })
      expect(subscriptions).toHaveLength(1)
      expect(subscriptions[0].name).toBe('Valid Subscription')
    })

    it('should handle migration with minimal data', async () => {
      const localData: LocalStorageData = {
        subscriptions: [
          {
            id: 'minimal-1',
            name: 'Minimal Sub',
            amount: 5.99,
            paymentDate: 1,
            category: 'other'
            // Missing optional fields
          }
        ]
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(true)
      expect(result.details?.subscriptions.migrated).toBe(1)

      const subscription = await prisma.subscription.findFirst({
        where: { userId: testUser.id }
      })
      expect(subscription?.name).toBe('Minimal Sub')
      expect(subscription?.billingCycle).toBe('monthly') // Default value
      expect(subscription?.currency).toBe('USD') // Default value
      expect(subscription?.isActive).toBe(true) // Default value
    })

    it('should calculate next payment dates correctly for different billing cycles', async () => {
      const localData: LocalStorageData = {
        subscriptions: [
          {
            id: 'weekly-1',
            name: 'Weekly Sub',
            amount: 2.99,
            paymentDate: 1,
            category: 'other',
            billingCycle: 'weekly'
          },
          {
            id: 'yearly-1',
            name: 'Yearly Sub',
            amount: 99.99,
            paymentDate: 15,
            category: 'other',
            billingCycle: 'yearly'
          }
        ]
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(true)

      const subscriptions = await prisma.subscription.findMany({
        where: { userId: testUser.id },
        orderBy: { name: 'asc' }
      })

      expect(subscriptions).toHaveLength(2)
      
      // All should have future payment dates
      const today = new Date()
      expect(new Date(subscriptions[0].nextPayment) > today).toBe(true)
      expect(new Date(subscriptions[1].nextPayment) > today).toBe(true)
    })

    it('should handle empty migration data', async () => {
      const localData: LocalStorageData = {
        subscriptions: []
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(true)
      expect(result.details?.subscriptions.migrated).toBe(0)
      expect(result.details?.budget.migrated).toBe(0)
      expect(result.details?.settings.migrated).toBe(0)
    })

    it('should rollback all changes if migration fails', async () => {
      // Mock Prisma to simulate database error during transaction
      const originalCreate = prisma.subscription.create
      prisma.subscription.create = jest.fn().mockRejectedValue(new Error('Database error'))

      const localData: LocalStorageData = {
        subscriptions: [
          {
            id: 'test-1',
            name: 'Test Sub',
            amount: 10,
            paymentDate: 15,
            category: 'other',
            billingCycle: 'monthly'
          }
        ],
        budget: 50
      }

      const result = await migrationService.migrateUserData(testUser.id, localData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()

      // Verify no data was persisted due to rollback
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: testUser.id }
      })
      const budgets = await prisma.budget.findMany({
        where: { userId: testUser.id }
      })

      expect(subscriptions).toHaveLength(0)
      expect(budgets).toHaveLength(0)

      // Restore original method
      prisma.subscription.create = originalCreate
    })
  })

  describe('hasUserMigrated', () => {
    it('should return true for migrated user', async () => {
      // Mark user as migrated
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: {
            migrated: true,
            migratedAt: new Date().toISOString()
          }
        }
      })

      const result = await migrationService.hasUserMigrated(testUser.id)
      expect(result).toBe(true)
    })

    it('should return false for non-migrated user', async () => {
      const result = await migrationService.hasUserMigrated(testUser.id)
      expect(result).toBe(false)
    })

    it('should return false for non-existent user', async () => {
      const result = await migrationService.hasUserMigrated('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('getMigrationStatus', () => {
    it('should return complete migration status', async () => {
      // Create some data and mark as migrated
      await testUtils.createTestSubscription(testUser.id)
      await testUtils.createTestSubscription(testUser.id)
      await testUtils.createTestBudget(testUser.id)

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: {
            migrated: true,
            migratedAt: '2024-01-15T10:00:00Z'
          }
        }
      })

      const result = await migrationService.getMigrationStatus(testUser.id)

      expect(result.hasMigrated).toBe(true)
      expect(result.subscriptionCount).toBe(2)
      expect(result.budgetCount).toBe(1)
      expect(result.migratedAt).toBe('2024-01-15T10:00:00Z')
    })

    it('should return status for non-migrated user', async () => {
      const result = await migrationService.getMigrationStatus(testUser.id)

      expect(result.hasMigrated).toBe(false)
      expect(result.subscriptionCount).toBe(0)
      expect(result.budgetCount).toBe(0)
      expect(result.migratedAt).toBeUndefined()
    })
  })

  describe('clearMigrationFlag', () => {
    it('should clear migration flag successfully', async () => {
      // Set migration flag first
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          settings: {
            migrated: true,
            migratedAt: new Date().toISOString(),
            darkMode: true // Other settings should remain
          }
        }
      })

      await migrationService.clearMigrationFlag(testUser.id)

      const user = await prisma.user.findUnique({
        where: { id: testUser.id }
      })

      const settings = user?.settings as any
      expect(settings.migrated).toBeUndefined()
      expect(settings.migratedAt).toBeUndefined()
      expect(settings.darkMode).toBe(true) // Other settings preserved
    })

    it('should handle clearing flag for user with no settings', async () => {
      // Should not throw error
      await expect(migrationService.clearMigrationFlag(testUser.id))
        .resolves.not.toThrow()
    })
  })
})