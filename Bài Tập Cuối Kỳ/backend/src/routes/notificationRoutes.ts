import { Router } from 'express';
import { notifyInvoiceCreated, notifyInvoiceOverdue, notifyPaymentConfirmed } from '../controllers/notificationController';
import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/invoice-created', authenticateToken, restrictToAdmin, notifyInvoiceCreated);
router.post('/invoice-overdue', authenticateToken, restrictToAdmin, notifyInvoiceOverdue);
router.post('/payment-confirmed', authenticateToken, restrictToAdmin, notifyPaymentConfirmed);

export default router;