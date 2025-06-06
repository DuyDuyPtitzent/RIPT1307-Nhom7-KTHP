import { Router } from 'express';
import {
  getProfile,
  updateAvatar,
  changePassword,
  extendRental,
  toggleExtensionPermission,
  getAllAccounts,
} from '../controllers/usersController';
import { authenticateToken, restrictToAdmin, validateRequest } from '../middlewares/authMiddleware';
import { body } from 'express-validator';

const router = Router();

// Lấy thông tin tài khoản cá nhân
router.get('/profile', authenticateToken, getProfile);

// Cập nhật ảnh đại diện (cả admin và user)
router.put('/avatar', authenticateToken, updateAvatar);

// Đổi mật khẩu (chỉ user)
router.put(
  '/change-password',
  [
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
    validateRequest,
  ],
  changePassword
);

// Gia hạn thời gian ở trọ (chỉ user)
router.post(
  '/extend-rental',
  [
    authenticateToken,
    body('months').isInt({ min: 1, max: 12 }).withMessage('Số tháng gia hạn phải từ 1-12'),
    validateRequest,
  ],
  extendRental
);

// Admin routes
// Bật/tắt quyền gia hạn cho user
router.put(
  '/toggle-extension',
  [
    authenticateToken,
    restrictToAdmin,
body('userId').toInt().isInt().withMessage('User ID không hợp lệ'),

body('enabled').toBoolean().isBoolean().withMessage('Trạng thái phải là true/false'),

    validateRequest,
  ],
  toggleExtensionPermission
);

// Lấy danh sách tất cả tài khoản (chỉ admin)
router.get('/all', [authenticateToken, restrictToAdmin], getAllAccounts);

export default router;