import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_VERSION: z.string().default('v1'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  COOKIE_SECRET: z.string().min(32),
  
  // External APIs
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  UPLOAD_DIR: z.string().default('uploads')
})

type EnvConfig = z.infer<typeof envSchema>

let config: EnvConfig

try {
  config = envSchema.parse(process.env)
} catch (error) {
  console.error('❌ Invalid environment configuration:')
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  ${err.path.join('.')}: ${err.message}`)
    })
  }
  process.exit(1)
}

// Additional computed values
const computedConfig = {
  ...config,
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  
  // Convenience getters
  get port() { return this.PORT },
  get nodeEnv() { return this.NODE_ENV },
  get apiVersion() { return this.API_VERSION },
  get databaseUrl() { return this.DATABASE_URL },
  get jwtSecret() { return this.JWT_SECRET },
  get jwtRefreshSecret() { return this.JWT_REFRESH_SECRET },
  get corsOrigin() { return this.CORS_ORIGIN },
  get rateLimitWindowMs() { return this.RATE_LIMIT_WINDOW_MS },
  get rateLimitMax() { return this.RATE_LIMIT_MAX_REQUESTS },
  get logLevel() { return this.LOG_LEVEL },
  get bcryptRounds() { return this.BCRYPT_ROUNDS },
  get cookieSecret() { return this.COOKIE_SECRET },
  get maxFileSize() { return this.MAX_FILE_SIZE },
  get uploadDir() { return this.UPLOAD_DIR }
}

export { computedConfig as config }
export type { EnvConfig }