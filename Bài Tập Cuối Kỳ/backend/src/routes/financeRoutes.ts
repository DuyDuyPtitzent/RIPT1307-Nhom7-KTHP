import { Router } from 'express';
  import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from '../controllers/financeController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.get('/', authenticateToken, getInvoices);

  router.post(
    '/',
    validateRequestBody,
    [
      body('amount').isFloat({ min: 0 }).withMessage('Số tiền không hợp lệ'),
      body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
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
      body('amount').isFloat({ min: 0 }).withMessage('Số tiền không hợp lệ'),
      body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
      body('status').isIn(['pending', 'paid']).withMessage('Trạng thái không hợp lệ'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    updateInvoice
  );

  router.delete('/:id', authenticateToken, restrictToAdmin, deleteInvoice);

  export default router;