import { PrismaClient, Prisma } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@submanager.app' },
    update: {},
    create: {
      email: 'test@submanager.app',
      name: 'Test User',
      passwordHash,
      emailVerified: true,
      language: 'es',
      timezone: 'America/Mexico_City',
      currency: 'USD',
      settings: {
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        privacy: {
          profileVisible: false,
          dataSharing: false
        },
        theme: 'default',
        darkMode: true
      }
    }
  })

  console.log('✅ Test user created:', testUser.email)

  // Create sample subscriptions
  const subscriptions = [
    {
      name: 'Netflix',
      description: 'Streaming de películas y series',
      amount: new Prisma.Decimal('15.99'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 5,
      category: 'video',
      logo: '/netflix-logo.svg',
      color: '#E50914',
      isActive: true,
      startDate: new Date('2023-01-05'),
      metadata: {
        plan: 'Standard',
        screens: 2,
        quality: 'HD'
      }
    },
    {
      name: 'Spotify',
      description: 'Servicio de música en streaming',
      amount: new Prisma.Decimal('9.99'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 15,
      category: 'music',
      logo: '/spotify-logo.svg',
      color: '#1DB954',
      isActive: true,
      startDate: new Date('2023-02-15')
    },
    {
      name: 'Amazon Prime',
      description: 'Envíos gratis y Prime Video',
      amount: new Prisma.Decimal('14.99'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 22,
      category: 'entertainment',
      logo: '/amazon-logo.svg',
      color: '#FF9900',
      isActive: true,
      startDate: new Date('2023-03-22')
    },
    {
      name: 'Adobe Creative Cloud',
      description: 'Suite de diseño y creatividad',
      amount: new Prisma.Decimal('52.99'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 10,
      category: 'productivity',
      logo: '/adobe-logo.svg',
      color: '#FF0000',
      isActive: true,
      startDate: new Date('2023-01-10')
    },
    {
      name: 'GitHub Pro',
      description: 'Repositorios privados y funciones avanzadas',
      amount: new Prisma.Decimal('4.00'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 1,
      category: 'productivity',
      logo: '/github-logo.svg',
      color: '#24292e',
      isActive: true,
      startDate: new Date('2023-04-01')
    },
    {
      name: 'Notion Pro',
      description: 'Workspace colaborativo avanzado',
      amount: new Prisma.Decimal('8.00'),
      currency: 'USD',
      billingCycle: 'monthly',
      paymentDate: 12,
      category: 'productivity',
      logo: '/notion-logo.svg',
      color: '#000000',
      isActive: false,
      startDate: new Date('2023-02-12'),
      endDate: new Date('2023-12-12')
    }
  ]

  for (const subscription of subscriptions) {
    // Calculate next payment date
    const today = new Date()
    let nextPayment = new Date(today.getFullYear(), today.getMonth(), subscription.paymentDate)
    
    // If payment date has passed this month, move to next month
    if (nextPayment <= today) {
      nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, subscription.paymentDate)
    }

    await prisma.subscription.create({
      data: {
        ...subscription,
        userId: testUser.id,
        nextPayment: subscription.isActive ? nextPayment : null
      }
    })
  }

  console.log('✅ Sample subscriptions created')

  // Create sample budget
  await prisma.budget.create({
    data: {
      userId: testUser.id,
      name: 'Presupuesto Principal',
      description: 'Presupuesto mensual para suscripciones',
      amount: new Prisma.Decimal('200.00'),
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

  console.log('✅ Sample budget created')

  console.log('🎉 Database seeded successfully!')
  console.log('📧 Test user: test@submanager.app')
  console.log('🔑 Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })