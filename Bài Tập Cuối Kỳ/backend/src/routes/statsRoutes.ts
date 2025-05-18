import { Router } from 'express';
  import { getStats, createStats } from '../controllers/statsController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.get('/', authenticateToken, restrictToAdmin, getStats);

  router.post(
    '/',
    validateRequestBody,
    [
      body('type').isIn(['residents', 'inventory', 'finance', 'vehicles']).withMessage('Loại thống kê không hợp lệ'),
      body('data').notEmpty().withMessage('Dữ liệu là bắt buộc'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    createStats
  );

  export default router;