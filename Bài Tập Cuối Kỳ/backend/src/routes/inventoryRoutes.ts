import { Router } from 'express';
  import { getInventory, createInventory, updateInventory, deleteInventory } from '../controllers/inventoryController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.get('/', authenticateToken, getInventory);

  router.post(
    '/',
    validateRequestBody,
    [
      body('name').notEmpty().withMessage('Tên vật tư là bắt buộc'),
      body('quantity').isInt({ min: 0 }).withMessage('Số lượng không hợp lệ'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    createInventory
  );

  router.put(
    '/:id',
    validateRequestBody,
    [
      body('name').notEmpty().withMessage('Tên vật tư là bắt buộc'),
      body('quantity').isInt({ min: 0 }).withMessage('Số lượng không hợp lệ'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    updateInventory
  );

  router.delete('/:id', authenticateToken, restrictToAdmin, deleteInventory);

  export default router;