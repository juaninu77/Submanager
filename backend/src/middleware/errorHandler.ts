import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { logger, logError } from '@/utils/logger'
import { config } from '@/config/env'

export interface CustomError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

class AppError extends Error implements CustomError {
  public statusCode: number
  public code: string
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'INTERNAL_SERVER_ERROR'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error classes
class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

// Error handler middleware
const errorHandler = (
  error: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let code = 'INTERNAL_SERVER_ERROR'
  let message = 'An unexpected error occurred'
  let details: any = undefined

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode
    code = error.code
    message = error.message
  } else if (error instanceof ZodError) {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409
        code = 'UNIQUE_CONSTRAINT_VIOLATION'
        message = 'A record with this value already exists'
        details = { field: error.meta?.target }
        break
      case 'P2025':
        statusCode = 404
        code = 'RECORD_NOT_FOUND'
        message = 'Record not found'
        break
      case 'P2003':
        statusCode = 400
        code = 'FOREIGN_KEY_CONSTRAINT'
        message = 'Referenced record does not exist'
        break
      default:
        statusCode = 400
        code = 'DATABASE_ERROR'
        message = 'Database operation failed'
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    code = 'DATABASE_VALIDATION_ERROR'
    message = 'Invalid data provided'
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = 'Token has expired'
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401
    code = 'INVALID_TOKEN'
    message = 'Invalid token provided'
  }

  // Log error details
  const errorContext = {
    statusCode,
    code,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  }

  if (statusCode >= 500) {
    logError(error, errorContext)
  } else {
    logger.warn('Client error occurred', {
      message: error.message,
      ...errorContext
    })
  }

  // Send error response
  const errorResponse: any = {
    error: {
      code,
      message,
      ...(details && { details }),
      ...(config.isDevelopment && statusCode >= 500 && { stack: error.stack })
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  }

  res.status(statusCode).json(errorResponse)
}

// Async error wrapper
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError
}