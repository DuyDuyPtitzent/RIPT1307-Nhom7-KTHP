import { Router } from 'express';
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/materialController';
import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
import { validateRequestBody } from '../middlewares/validateRequestBody';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/authMiddleware';

const router = Router();

// Chỉ admin được truy cập
router.get('/', authenticateToken, restrictToAdmin, getMaterials);
router.get('/:id', authenticateToken, restrictToAdmin, getMaterialById);
router.post(
  '/',
  validateRequestBody,
  [
    body('name').notEmpty().withMessage('Tên vật tư là bắt buộc'),
    body('quantity').isInt({ min: 0 }).withMessage('Số lượng phải là số không âm'),
    body('lowStockThreshold').optional().isInt({ min: 1 }).withMessage('Ngưỡng tồn kho phải là số dương'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  createMaterial
);
router.put(
  '/:id',
  validateRequestBody,
  [
    body('name').notEmpty().withMessage('Tên vật tư là bắt buộc'),
    body('quantity').isInt({ min: 0 }).withMessage('Số lượng phải là số không âm'),
    body('lowStockThreshold').optional().isInt({ min: 1 }).withMessage('Ngưỡng tồn kho phải là số dương'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  updateMaterial
);
router.delete('/:id', authenticateToken, restrictToAdmin, deleteMaterial);

export default router;