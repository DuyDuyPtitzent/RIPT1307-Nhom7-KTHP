import { Router } from 'express';
  import { getResidents, createResident, updateResident, deleteResident } from '../controllers/residentController';
  import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
  import { validateRequestBody } from '../middlewares/validateRequestBody';
  import { body } from 'express-validator';
  import { validateRequest } from '../middlewares/authMiddleware';

  const router = Router();

  router.get('/', authenticateToken, getResidents);

  router.post(
    '/',
    validateRequestBody,
    [
      body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
      body('dateOfBirth').isDate().withMessage('Ngày sinh không hợp lệ'),
      body('address').notEmpty().withMessage('Địa chỉ là bắt buộc'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    createResident
  );

  router.put(
    '/:id',
    validateRequestBody,
    [
      body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
      body('dateOfBirth').isDate().withMessage('Ngày sinh không hợp lệ'),
      body('address').notEmpty().withMessage('Địa chỉ là bắt buộc'),
    ],
    authenticateToken,
    restrictToAdmin,
    validateRequest,
    updateResident
  );

  router.delete('/:id', authenticateToken, restrictToAdmin, deleteResident);

  export default router;