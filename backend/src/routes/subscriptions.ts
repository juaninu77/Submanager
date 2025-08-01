import { Router } from 'express'
import { subscriptionController } from '@/controllers/subscriptionController'
import { authenticateToken } from '@/middleware/auth'

const router = Router()

// All subscription routes require authentication
router.use(authenticateToken)

// CRUD operations
router.post('/', subscriptionController.create)
router.get('/', subscriptionController.getAll)
router.get('/stats', subscriptionController.getStats)
router.get('/by-category', subscriptionController.getByCategory)
router.get('/upcoming-renewals', subscriptionController.getUpcomingRenewals)
router.get('/search', subscriptionController.search)
router.get('/export', subscriptionController.export)
router.get('/:id', subscriptionController.getById)
router.put('/:id', subscriptionController.update)
router.delete('/:id', subscriptionController.delete)
router.patch('/:id/toggle-status', subscriptionController.toggleStatus)

// Bulk operations
router.post('/bulk-update', subscriptionController.bulkUpdate)
router.post('/bulk-delete', subscriptionController.bulkDelete)

export default router