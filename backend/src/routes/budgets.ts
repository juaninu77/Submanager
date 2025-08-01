import { Router } from 'express'
import { authenticateToken } from '@/middleware/auth'

const router = Router()

// All budget routes require authentication
router.use(authenticateToken)

// Placeholder for budget routes - will be implemented later
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Budget endpoints coming soon',
    data: []
  })
})

export default router