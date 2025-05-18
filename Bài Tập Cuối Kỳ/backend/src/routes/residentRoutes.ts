import { Router } from 'express';
import { getResidents, getResidentById, createResident, updateResident, deleteResident } from '../controllers/residentController';
import { authenticateToken, restrictToAdmin } from '../middlewares/authMiddleware';
import { validateRequestBody } from '../middlewares/validateRequestBody';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/authMiddleware';

const router = Router();

// User và Admin đều có thể xem danh sách và chi tiết
router.get('/', authenticateToken, getResidents);
router.get('/:id', authenticateToken, getResidentById);

// Chỉ Admin có quyền thêm, sửa, xóa
router.post(
  '/',
  validateRequestBody,
  [
    body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
    body('email').optional().isEmail().withMessage('Email không hợp lệ'),
    body('phoneNumber').optional().isMobilePhone('any').withMessage('Số điện thoại không hợp lệ'),
    body('dateOfBirth').optional().isDate().withMessage('Ngày sinh không hợp lệ'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
    body('apartmentNumber').notEmpty().withMessage('Số căn hộ là bắt buộc'),
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
    body('email').optional().isEmail().withMessage('Email không hợp lệ'),
    body('phoneNumber').optional().isMobilePhone('any').withMessage('Số điện thoại không hợp lệ'),
    body('dateOfBirth').optional().isDate().withMessage('Ngày sinh không hợp lệ'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
    body('apartmentNumber').notEmpty().withMessage('Số căn hộ là bắt buộc'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  updateResident
);

router.delete('/:id', authenticateToken, restrictToAdmin, deleteResident);

export default router;