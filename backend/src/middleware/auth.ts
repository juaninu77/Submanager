import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config/env'
import { UnauthorizedError } from '@/middleware/errorHandler'
import { userService } from '@/services/userService'

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    name?: string
  }
}

interface JWTPayload {
  userId: string
  email: string
  name?: string
  iat: number
  exp: number
}

// Middleware to authenticate JWT tokens
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token required')
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload
    
    // Verify user still exists and is active
    const user = await userService.findById(decoded.userId)
    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    if (user.deletedAt) {
      throw new UnauthorizedError('User account is deactivated')
    }

    // Add user to request object
    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'))
    } else {
      next(error)
    }
  }
}

// Optional authentication - doesn't throw if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload
      const user = await userService.findById(decoded.userId)
      
      if (user && !user.deletedAt) {
        ;(req as AuthenticatedRequest).user = {
          id: user.id,
          email: user.email,
          name: user.name || undefined
        }
      }
    }

    next()
  } catch (error) {
    // Ignore authentication errors for optional auth
    next()
  }
}

// Middleware to check if user owns resource
export const checkResourceOwnership = (resourceParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params[resourceParam]
      const userId = req.user.id

      // This is a simplified check - you'll need to implement specific checks
      // for each resource type (subscription, budget, etc.)
      // For now, we'll assume the resource belongs to the user
      // This should be implemented in the specific route handlers
      
      next()
    } catch (error) {
      next(error)
    }
  }
}

// API Key authentication for external integrations
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string

    if (!apiKey) {
      throw new UnauthorizedError('API key required')
    }

    // Verify API key exists and is active
    const keyRecord = await userService.findApiKey(apiKey)
    if (!keyRecord || !keyRecord.isActive) {
      throw new UnauthorizedError('Invalid or inactive API key')
    }

    // Update last used timestamp
    await userService.updateApiKeyLastUsed(keyRecord.id)

    // Get user associated with API key
    const user = await userService.findById(keyRecord.userId)
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Associated user not found or deactivated')
    }

    ;(req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined
    }

    next()
  } catch (error) {
    next(error)
  }
}