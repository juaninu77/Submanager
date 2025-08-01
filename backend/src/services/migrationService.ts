import { PrismaClient } from '@prisma/client'
import { logger, logBusinessEvent } from '@/utils/logger'
import { subscriptionService } from '@/services/subscriptionService'

const prisma = new PrismaClient()

export interface LocalStorageData {
  subscriptions: Array<{
    id: string
    name: string
    amount: number
    paymentDate: number
    logo?: string
    color?: string
    category: string
    billingCycle?: string
    description?: string
    startDate?: string
    isActive?: boolean
  }>
  budget?: number
  settings?: {
    darkMode?: boolean
    appTheme?: string
    language?: string
    currency?: string
    notifications?: Record<string, any>
  }
  userXP?: number
  userLevel?: number
  achievementsUnlocked?: number
}

export interface MigrationResult {
  success: boolean
  message: string
  details?: {
    subscriptions: { migrated: number; failed: number; errors: string[] }
    budget: { migrated: number; failed: number; errors: string[] }
    settings: { migrated: number; failed: number; errors: string[] }
  }
  error?: string
}

class MigrationService {
  // Main migration method
  async migrateUserData(userId: string, localData: LocalStorageData): Promise<MigrationResult> {
    logger.info('Starting data migration for user', { userId })

    const migrationResult: MigrationResult = {
      success: false,
      message: '',
      details: {
        subscriptions: { migrated: 0, failed: 0, errors: [] },
        budget: { migrated: 0, failed: 0, errors: [] },
        settings: { migrated: 0, failed: 0, errors: [] }
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Migrate subscriptions
        if (localData.subscriptions && localData.subscriptions.length > 0) {
          await this.migrateSubscriptions(userId, localData.subscriptions, migrationResult, tx)
        }

        // 2. Migrate budget
        if (localData.budget && localData.budget > 0) {
          await this.migrateBudget(userId, localData.budget, migrationResult, tx)
        }

        // 3. Migrate user settings
        if (localData.settings) {
          await this.migrateSettings(userId, localData.settings, migrationResult, tx)
        }
      })

      const totalMigrated = 
        migrationResult.details!.subscriptions.migrated + 
        migrationResult.details!.budget.migrated + 
        migrationResult.details!.settings.migrated

      migrationResult.success = true
      migrationResult.message = `Migration completed successfully. ${totalMigrated} items migrated.`

      logBusinessEvent('data_migration_completed', userId, {
        totalMigrated,
        subscriptionsMigrated: migrationResult.details!.subscriptions.migrated,
        budgetMigrated: migrationResult.details!.budget.migrated,
        settingsMigrated: migrationResult.details!.settings.migrated
      })

      logger.info('Data migration completed successfully', { 
        userId, 
        totalMigrated,
        details: migrationResult.details 
      })

    } catch (error) {
      migrationResult.success = false
      migrationResult.message = 'Migration failed'
      migrationResult.error = error instanceof Error ? error.message : 'Unknown error'

      logger.error('Data migration failed', { 
        userId, 
        error: error instanceof Error ? error.message : error,
        details: migrationResult.details 
      })
    }

    return migrationResult
  }

  // Migrate subscriptions
  private async migrateSubscriptions(
    userId: string, 
    subscriptions: LocalStorageData['subscriptions'], 
    result: MigrationResult,
    tx: any
  ): Promise<void> {
    for (const sub of subscriptions) {
      try {
        // Validate and clean data
        const cleanedSub = this.cleanSubscriptionData(sub)

        // Calculate next payment date
        const nextPayment = this.calculateNextPaymentDate(
          cleanedSub.paymentDate, 
          cleanedSub.billingCycle
        )

        // Create subscription
        await tx.subscription.create({
          data: {
            userId,
            name: cleanedSub.name,
            amount: cleanedSub.amount,
            paymentDate: cleanedSub.paymentDate,
            category: cleanedSub.category,
            billingCycle: cleanedSub.billingCycle,
            description: cleanedSub.description,
            logo: cleanedSub.logo,
            color: cleanedSub.color,
            isActive: cleanedSub.isActive,
            startDate: cleanedSub.startDate,
            nextPayment,
            currency: 'USD' // Default currency
          }
        })

        result.details!.subscriptions.migrated++
        
      } catch (error) {
        result.details!.subscriptions.failed++
        const errorMsg = `Failed to migrate subscription "${sub.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        result.details!.subscriptions.errors.push(errorMsg)
        logger.warn('Failed to migrate subscription', { 
          userId, 
          subscriptionName: sub.name, 
          error: errorMsg 
        })
      }
    }
  }

  // Migrate budget
  private async migrateBudget(
    userId: string, 
    budgetAmount: number, 
    result: MigrationResult,
    tx: any
  ): Promise<void> {
    try {
      await tx.budget.create({
        data: {
          userId,
          name: 'Presupuesto Principal',
          description: 'Presupuesto migrado desde localStorage',
          amount: budgetAmount,
          currency: 'USD',
          period: 'monthly',
          isDefault: true,
          alerts: [
            {
              threshold: 80,
              type: 'email',
              message: '80% del presupuesto utilizado',
              isActive: true
            },
            {
              threshold: 100,
              type: 'push',
              message: 'Presupuesto excedido',
              isActive: true
            }
          ]
        }
      })

      result.details!.budget.migrated++
      
    } catch (error) {
      result.details!.budget.failed++
      const errorMsg = `Failed to migrate budget: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.details!.budget.errors.push(errorMsg)
      logger.warn('Failed to migrate budget', { userId, error: errorMsg })
    }
  }

  // Migrate user settings
  private async migrateSettings(
    userId: string, 
    settings: LocalStorageData['settings'], 
    result: MigrationResult,
    tx: any
  ): Promise<void> {
    try {
      // Merge with existing settings
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        select: { settings: true }
      })

      const mergedSettings = {
        ...existingUser?.settings,
        ...settings,
        migrated: true,
        migratedAt: new Date().toISOString()
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          settings: mergedSettings,
          language: settings.language || 'es',
          currency: settings.currency || 'USD'
        }
      })

      result.details!.settings.migrated++
      
    } catch (error) {
      result.details!.settings.failed++
      const errorMsg = `Failed to migrate settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.details!.settings.errors.push(errorMsg)
      logger.warn('Failed to migrate settings', { userId, error: errorMsg })
    }
  }

  // Check if user has already migrated data
  async hasUserMigrated(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { settings: true }
      })

      const settings = user?.settings as any
      return settings?.migrated === true
      
    } catch (error) {
      logger.error('Error checking migration status', { userId, error })
      return false
    }
  }

  // Get migration status for user
  async getMigrationStatus(userId: string): Promise<{
    hasMigrated: boolean
    subscriptionCount: number
    budgetCount: number
    migratedAt?: string
  }> {
    try {
      const [user, subscriptionCount, budgetCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { settings: true }
        }),
        prisma.subscription.count({ where: { userId } }),
        prisma.budget.count({ where: { userId } })
      ])

      const settings = user?.settings as any
      
      return {
        hasMigrated: settings?.migrated === true,
        subscriptionCount,
        budgetCount,
        migratedAt: settings?.migratedAt
      }
      
    } catch (error) {
      logger.error('Error getting migration status', { userId, error })
      return {
        hasMigrated: false,
        subscriptionCount: 0,
        budgetCount: 0
      }
    }
  }

  // Helper method to clean subscription data
  private cleanSubscriptionData(sub: any) {
    return {
      name: String(sub.name || 'Unnamed Subscription').trim(),
      amount: parseFloat(sub.amount) || 0,
      paymentDate: parseInt(sub.paymentDate) || 1,
      category: String(sub.category || 'other').toLowerCase(),
      billingCycle: String(sub.billingCycle || 'monthly').toLowerCase(),
      description: sub.description ? String(sub.description).trim() : undefined,
      logo: sub.logo ? String(sub.logo) : undefined,
      color: sub.color ? String(sub.color) : '#000000',
      isActive: sub.isActive !== false, // Default to true
      startDate: sub.startDate ? new Date(sub.startDate) : new Date()
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
        default:
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

  // Clear migration flag (for testing)
  async clearMigrationFlag(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { settings: true }
      })

      if (user) {
        const settings = { ...user.settings } as any
        delete settings.migrated
        delete settings.migratedAt

        await prisma.user.update({
          where: { id: userId },
          data: { settings }
        })
      }
    } catch (error) {
      logger.error('Error clearing migration flag', { userId, error })
    }
  }
}

export const migrationService = new MigrationService()