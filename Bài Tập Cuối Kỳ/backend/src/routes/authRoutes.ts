import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, forgotPassword, resetPassword, logout } from '../controllers/authController';

const router = Router();

router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Họ tên là bắt buộc'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Mật khẩu xác nhận không khớp'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  ],
  login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email không hợp lệ')],
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  resetPassword
);

router.post('/logout', logout);

export default router;