import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, forgotPassword, resetPassword, logout, getCurrentUser, updatePassword, getAllUsers, updateUserPassword } from '../controllers/authController';
import { authenticateToken, validateRequest, restrictToAdmin } from '../middlewares/authMiddleware';
import { validateRequestBody } from '../middlewares/validateRequestBody';

const router = Router();

router.post(
  '/register',
  validateRequestBody,
  [
    body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Mật khẩu xác nhận không khớp'),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  validateRequestBody,
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  ],
  validateRequest,
  login
);

router.post(
  '/forgot-password',
  validateRequestBody,
  [body('email').isEmail().withMessage('Email không hợp lệ')],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  validateRequestBody,
  [
    body('token').notEmpty().withMessage('Token là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  validateRequest,
  resetPassword
);

router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.put(
  '/password',
  validateRequestBody,
  [
    body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  authenticateToken,
  validateRequest,
  updatePassword
);

router.get('/users', authenticateToken, restrictToAdmin, getAllUsers);
router.put(
  '/users/:id/password',
  validateRequestBody,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  authenticateToken,
  restrictToAdmin,
  validateRequest,
  updateUserPassword
);
// Thêm mới: Lấy danh sách tất cả người dùng
router.get('/users', authenticateToken, restrictToAdmin, getAllUsers);
export default router;