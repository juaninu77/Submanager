import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import 'express-async-errors'

import { config } from '@/config/env'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/middleware/errorHandler'
import { notFoundHandler } from '@/middleware/notFoundHandler'
import { requestLogger } from '@/middleware/requestLogger'

// Route imports
import authRoutes from '@/routes/auth'
import subscriptionRoutes from '@/routes/subscriptions'
import budgetRoutes from '@/routes/budgets'
import userRoutes from '@/routes/users'

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", config.corsOrigin],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api', limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser(config.cookieSecret))

// Request logging
app.use(requestLogger)

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  })
})

app.get('/ready', (req, res) => {
  // Add database connectivity check here
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  })
})

// API routes
const apiRouter = express.Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/subscriptions', subscriptionRoutes)
apiRouter.use('/budgets', budgetRoutes)
apiRouter.use('/users', userRoutes)

app.use(`/api/${config.apiVersion}`, apiRouter)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`)
  logger.info(`📖 API documentation: http://localhost:${config.port}/api/${config.apiVersion}`)
  logger.info(`🏥 Health check: http://localhost:${config.port}/health`)
  logger.info(`🌍 Environment: ${config.nodeEnv}`)
})

export { app, server }