import { Router } from 'express'
import { authenticateToken } from '@/middleware/auth'

const router = Router()

// All user routes require authentication
router.use(authenticateToken)

// Placeholder for user management routes - will be implemented later
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint - use /auth/profile instead',
    data: null
  })
})

export default router