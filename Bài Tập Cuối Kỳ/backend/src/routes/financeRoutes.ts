import { Router } from 'express';
import { body } from 'express-validator';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  confirmPayment,
  checkOverdueInvoices,
  getRevenueStats,
} from '../controllers/financeController';
import { authenticateToken, restrictToAdmin, validateRequest } from '../middlewares/authMiddleware';
import { validateRequestBody } from '../middlewares/validateRequestBody';

const router = Router();

// Cả admin và user có thể xem hóa đơn (user chỉ xem hóa đơn của mình)
router.get('/', authenticateToken, getInvoices);
router.get('/:id', authenticateToken, getInvoiceById);
// Trong financeRoutes.ts, thêm vào router
router.get('/overdue', authenticateToken, restrictToAdmin, checkOverdueInvoices);
// Chỉ admin có quyền thêm, sửa, xóa hóa đơn
router.post(
  '/',
  validateRequestBody,
  [
    body('resident_id').isInt().withMessage('ID cư dân phải là số'),
    body('billing_period').notEmpty().withMessage('Kỳ thu là bắt buộc'),
    body('amount').isFloat({ min: 0 }).withMessage('Số tiền phải là số không âm'),
    body('due_date').isDate().withMessage('Ngày đến hạn không hợp lệ'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  createInvoice
);

router.put(
  '/:id',
  validateRequestBody,
  [
    body('resident_id').isInt().withMessage('ID cư dân phải là số'),
    body('billing_period').notEmpty().withMessage('Kỳ thu là bắt buộc'),
    body('amount').isFloat({ min: 0 }).withMessage('Số tiền phải là số không âm'),
    body('due_date').isDate().withMessage('Ngày đến hạn không hợp lệ'),
    body('status').isIn(['paid', 'unpaid', 'overdue']).withMessage('Trạng thái không hợp lệ'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  updateInvoice
);

router.delete('/:id', authenticateToken, restrictToAdmin, deleteInvoice);

// Chỉ admin có quyền xác nhận thanh toán
router.put('/:id/confirm-payment', authenticateToken, restrictToAdmin, confirmPayment);

// Kiểm tra hóa đơn quá hạn (chạy định kỳ hoặc theo yêu cầu admin)
router.post('/check-overdue', authenticateToken, restrictToAdmin, checkOverdueInvoices);

// Thống kê doanh thu
router.get('/stats/revenue', authenticateToken, restrictToAdmin, getRevenueStats);

export default router;