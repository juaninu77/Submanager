import { Request, Response } from 'express'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { asyncHandler, ValidationError } from '@/middleware/errorHandler'
import { AuthenticatedRequest } from '@/middleware/auth'

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
})

class AuthController {
  // Register new user
  register = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body)
    
    const result = await authService.register(validatedData)
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      }
    })
  })

  // Login user
  login = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body)
    
    const result = await authService.login(validatedData)
    
    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      }
    })
  })

  // Refresh access token
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required')
    }

    const tokens = await authService.refreshToken(refreshToken)
    
    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    })
  })

  // Logout user
  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if (refreshToken) {
      await authService.logout(refreshToken)
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Logout successful'
    })
  })

  // Logout from all devices
  logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await authService.logoutAll(req.user.id)
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: 'Logged out from all devices'
    })
  })

  // Get current user profile
  profile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.findById(req.user.id)
    
    if (!user) {
      throw new ValidationError('User not found')
    }

    // Get user stats
    const stats = await userService.getUserStats(req.user.id)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          language: user.language,
          timezone: user.timezone,
          currency: user.currency,
          settings: user.settings,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt
        },
        stats
      }
    })
  })

  // Change password
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = changePasswordSchema.parse(req.body)
    
    await authService.changePassword(
      req.user.id,
      validatedData.currentPassword,
      validatedData.newPassword
    )

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  })

  // Get user sessions
  getSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const sessions = await authService.getUserSessions(req.user.id)

    res.json({
      success: true,
      data: sessions
    })
  })

  // Revoke specific session
  revokeSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId } = req.params
    
    await authService.revokeUserSession(req.user.id, sessionId)

    res.json({
      success: true,
      message: 'Session revoked successfully'
    })
  })

  // Verify token (for client-side validation)
  verifyToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        valid: true,
        user: req.user
      }
    })
  })
}

export const authController = new AuthController()