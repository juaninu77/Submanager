import winston from 'winston'
import { config } from '@/config/env'

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level}: ${message}${metaStr}`
  })
)

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: fileFormat,
  defaultMeta: {
    service: 'submanager-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: config.isDevelopment ? consoleFormat : fileFormat,
      handleExceptions: true,
      handleRejections: true
    })
  ]
})

// Add file transports for production
if (config.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
}

// Create a stream for Morgan (HTTP request logging)
const stream = {
  write: (message: string) => {
    logger.info(message.trim())
  }
}

// Helper functions for structured logging
const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...context
  })
}

const logRequest = (req: any, res: any, responseTime?: number) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  })
}

const logAuthEvent = (event: string, userId?: string, details?: Record<string, any>) => {
  logger.info('Auth Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  })
}

const logBusinessEvent = (event: string, userId: string, details?: Record<string, any>) => {
  logger.info('Business Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  })
}

export {
  logger,
  stream,
  logError,
  logRequest,
  logAuthEvent,
  logBusinessEvent
}