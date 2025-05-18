import { Router } from 'express';
  import { updateUser, deleteUser } from '../controllers/userController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.put(
    '/:id',
    validateRequestBody,
    [
      body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
      body('email').isEmail().withMessage('Email không hợp lệ'),
      body('role').isIn(['admin', 'user']).withMessage('Vai trò không hợp lệ'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    updateUser
  );

  router.delete('/:id', authenticateToken, restrictToAdmin, deleteUser);

  export default router;