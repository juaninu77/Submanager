#!/usr/bin/env node

/**
 * Test Database Setup Script
 * 
 * This script sets up a test database for running tests.
 * It creates a separate test database to avoid interfering with development data.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Check if .env.test exists, create if not
const envTestPath = path.join(__dirname, '..', '.env.test')
if (!fs.existsSync(envTestPath)) {
  const envTestContent = `# Test Environment Variables
NODE_ENV=test
DATABASE_URL="file:./test.db"
JWT_SECRET=test-jwt-secret-key-for-testing-only-not-secure
JWT_REFRESH_SECRET=test-refresh-secret-key-for-testing-only-not-secure
BCRYPT_ROUNDS=4
CORS_ORIGIN=http://localhost:3000
PORT=3002
LOG_LEVEL=error
`
  
  fs.writeFileSync(envTestPath, envTestContent)
  console.log('✅ Created .env.test file')
}

// Function to run command and handle errors
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`)
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...\n')

  // Set environment to test
  process.env.NODE_ENV = 'test'
  
  // Load test environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') })

  try {
    // Generate Prisma client with test schema
    runCommand('npx prisma generate --schema=prisma/schema.test.prisma', 'Generating Prisma client')

    // Push schema to test database (creates database if needed)
    runCommand('npx prisma db push --force-reset --schema=prisma/schema.test.prisma', 'Setting up test database schema')

    console.log('\n✅ Test database setup completed successfully!')
    console.log('\n📝 You can now run tests with: npm test')
    console.log('🔍 To view the test database: npm run db:studio:test')

  } catch (error) {
    console.error('\n❌ Test database setup failed:', error.message)
    console.log('\n💡 Make sure PostgreSQL is running and the test database user has proper permissions.')
    console.log('💡 You may need to create the test database and user manually:')
    console.log('   createdb submanager_test')
    console.log('   createuser test --pwprompt')
    process.exit(1)
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestDatabase()
}

module.exports = { setupTestDatabase }