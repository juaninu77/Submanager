#!/usr/bin/env node

/**
 * Script para probar la conexión con Neon PostgreSQL
 * Ejecuta: node scripts/test-neon-connection.js
 */

const { PrismaClient } = require('../prisma/generated/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('🔄 Probando conexión con Neon PostgreSQL...\n')

    // Test basic connection
    console.log('1. 🔗 Verificando conexión básica...')
    await prisma.$connect()
    console.log('   ✅ Conexión establecida correctamente\n')

    // Test query execution
    console.log('2. 🏃 Ejecutando query de prueba...')
    const result = await prisma.$queryRaw`SELECT version() as version, now() as current_time`
    console.log('   ✅ Query ejecutada correctamente')
    console.log(`   📊 PostgreSQL Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`)
    console.log(`   ⏰ Server Time: ${result[0].current_time}\n`)

    // Test table existence
    console.log('3. 📋 Verificando tablas existentes...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    if (tables.length === 0) {
      console.log('   ⚠️  No se encontraron tablas. Ejecuta las migraciones primero.')
      console.log('   📝 Comando: npm run db:push o npm run db:migrate')
    } else {
      console.log('   ✅ Tablas encontradas:')
      tables.forEach(table => {
        console.log(`      - ${table.table_name}`)
      })
    }
    console.log('')

    // Test specific tables if they exist
    const expectedTables = ['users', 'subscriptions', 'budgets', 'sessions', 'api_keys']
    const existingTables = tables.map(t => t.table_name)
    const missingTables = expectedTables.filter(t => !existingTables.includes(t))

    if (missingTables.length === 0) {
      console.log('4. 🎯 Verificando estructura de tablas...')
      
      try {
        // Test users table
        const userCount = await prisma.user.count()
        console.log(`   ✅ Tabla users: ${userCount} registros`)

        // Test subscriptions table
        const subscriptionCount = await prisma.subscription.count()
        console.log(`   ✅ Tabla subscriptions: ${subscriptionCount} registros`)

        // Test budgets table
        const budgetCount = await prisma.budget.count()
        console.log(`   ✅ Tabla budgets: ${budgetCount} registros`)

        console.log('')
      } catch (error) {
        console.log('   ⚠️  Error al verificar contenido de tablas:', error.message)
      }
    } else {
      console.log('4. ⚠️  Tablas faltantes:')
      missingTables.forEach(table => {
        console.log(`      - ${table}`)
      })
      console.log('   📝 Ejecuta: npm run db:push o npm run db:migrate\n')
    }

    // Test environment
    console.log('5. 🌍 Información del entorno:')
    console.log(`   📍 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`)
    console.log(`   🔗 DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`   🎯 DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Configurada' : '❌ No configurada'}`)
    console.log('')

    // Connection pool info
    console.log('6. 🏊 Información de conexiones:')
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        sum(case when state = 'active' then 1 else 0 end) as active_connections,
        sum(case when state = 'idle' then 1 else 0 end) as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `
    console.log(`   🔢 Total conexiones: ${connectionInfo[0].total_connections}`)
    console.log(`   🏃 Conexiones activas: ${connectionInfo[0].active_connections}`)
    console.log(`   😴 Conexiones idle: ${connectionInfo[0].idle_connections}`)
    console.log('')

    console.log('🎉 ¡Todas las verificaciones completadas exitosamente!')
    console.log('✨ Tu base de datos Neon está lista para usar.')

  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.error('\n🔧 Posibles soluciones:')
    console.error('   1. Verifica que DATABASE_URL esté correctamente configurada')
    console.error('   2. Asegúrate de que Neon esté activo y accesible')
    console.error('   3. Verifica que la URL incluya sslmode=require')
    console.error('   4. Revisa que las credenciales sean correctas')
    
    if (error.code === 'P1001') {
      console.error('   🌐 Error de conectividad - Revisa tu conexión a internet')
    } else if (error.code === 'P1008') {
      console.error('   ⏰ Timeout - La base de datos puede estar iniciando (Neon cold start)')
    } else if (error.code === 'P1011') {
      console.error('   🔐 Error de autenticación - Revisa username/password')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Execute if run directly
if (require.main === module) {
  testConnection()
}

module.exports = { testConnection }