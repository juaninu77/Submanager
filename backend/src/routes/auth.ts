import { Router } from 'express'
import { authController } from '@/controllers/authController'
import { authenticateToken } from '@/middleware/auth'

const router = Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)

// Protected routes
router.use(authenticateToken)
router.get('/profile', authController.profile)
router.post('/logout-all', authController.logoutAll)
router.post('/change-password', authController.changePassword)
router.get('/sessions', authController.getSessions)
router.delete('/sessions/:sessionId', authController.revokeSession)
router.get('/verify', authController.verifyToken)

export default router