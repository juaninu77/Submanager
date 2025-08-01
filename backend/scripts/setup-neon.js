#!/usr/bin/env node

/**
 * Setup script para configurar Neon PostgreSQL database
 * Este script ayuda a configurar la base de datos en Neon paso a paso
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🎯 Configuración de Neon PostgreSQL para Submanager\n')

function checkEnvFile() {
  const envPath = path.join(__dirname, '../../.env')
  const envExamplePath = path.join(__dirname, '../../.env.example')
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No se encontró archivo .env')
    if (fs.existsSync(envExamplePath)) {
      console.log('📋 Copiando .env.example a .env...')
      fs.copyFileSync(envExamplePath, envPath)
      console.log('✅ Archivo .env creado')
    } else {
      console.log('❌ No se encontró .env.example')
      process.exit(1)
    }
  }
}

function showInstructions() {
  console.log('📝 INSTRUCCIONES PARA CONFIGURAR NEON:\n')
  
  console.log('1. Ve a https://console.neon.tech/')
  console.log('2. Crear un nuevo proyecto o usa uno existente')
  console.log('3. Copia la cadena de conexión (Database URL)')
  console.log('4. Actualiza tu archivo .env con:')
  console.log('   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"')
  console.log('   DIRECT_URL="postgresql://user:password@host/database?sslmode=require"')
  console.log('')
  
  console.log('5. Para Vercel (producción), añade también:')
  console.log('   - En Variables de Entorno de Vercel:')
  console.log('   - DATABASE_URL (la URL de Neon)')
  console.log('   - DIRECT_URL (la misma URL de Neon)')
  console.log('   - NEXTAUTH_SECRET (genera uno con: openssl rand -base64 32)')
  console.log('   - NEXTAUTH_URL (tu dominio de Vercel)')
  console.log('')
}

function runCommand(command, description) {
  console.log(`🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log(`✅ ${description} completado\n`)
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message)
    return false
  }
  return true
}

function main() {
  console.log('🔍 Verificando configuración...\n')
  
  // Check if .env exists
  checkEnvFile()
  
  // Show instructions
  showInstructions()
  
  console.log('⚠️  IMPORTANTE: Asegúrate de haber configurado DATABASE_URL y DIRECT_URL en .env antes de continuar.\n')
  
  // Check if user wants to continue
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  rl.question('¿Has configurado las URLs de la base de datos? (y/N): ', (answer) => {
    rl.close()
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('👋 Configura las URLs y ejecuta el script de nuevo.')
      process.exit(0)
    }
    
    console.log('\n🚀 Iniciando configuración de la base de datos...\n')
    
    // Generate Prisma client
    if (!runCommand('npm run db:generate', 'Generando cliente de Prisma')) {
      process.exit(1)
    }
    
    // Push schema to database
    if (!runCommand('npm run db:push', 'Sincronizando schema con Neon')) {
      process.exit(1)
    }
    
    // Run seed
    if (!runCommand('npm run db:seed', 'Poblando base de datos con datos de ejemplo')) {
      process.exit(1)
    }
    
    console.log('🎉 ¡Configuración completada exitosamente!')
    console.log('📊 Puedes abrir Prisma Studio con: npm run db:studio')
    console.log('🧪 Ejecuta los tests con: npm test')
    console.log('🚀 Inicia el servidor con: npm run dev')
  })
}

main()