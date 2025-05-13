import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';
import { config } from '../config/env';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

  try {
    console.log('Bắt đầu đăng ký, email:', email);
    // Kiểm tra email đã tồn tại
    console.log('Kiểm tra email trong database');
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Kết quả kiểm tra email:', existingUsers);
    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    // Lưu mật khẩu thô (bỏ mã hóa)
    console.log('Thêm người dùng vào database');
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [fullName, email, password, 'user']
    );
    console.log('Kết quả thêm người dùng:', result);

    // Gửi email xác nhận
    try {
      console.log('Gửi email xác nhận');
      await sendEmail(
        email,
        'Đăng ký thành công',
        `Kính gửi ${fullName},\n\nTài khoản của bạn đã được đăng ký thành công.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
      );
      console.log('Email đã gửi');
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
    }

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm register:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: errorMessage });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra người dùng
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((users as any[]).length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = (users as any[])[0];

    // So sánh mật khẩu thô
    if (password !== user.password) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Lỗi trong hàm login:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: errorMessage });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    const user = (users as any[])[0] as User;

    // Tạo token đặt lại mật khẩu
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Lưu token vào cơ sở dữ liệu
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
      [resetToken, user.id]
    );

    // Gửi email với liên kết đặt lại
    const resetLink = `http://your-frontend-url/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Yêu cầu đặt lại mật khẩu',
      `Kính gửi ${user.full_name},\n\nVui lòng nhấp vào liên kết sau để đặt lại mật khẩu: ${resetLink}\nLiên kết có hiệu lực trong 15 phút.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
    );

    res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    // Xác minh token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Kiểm tra token trong cơ sở dữ liệu
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [decoded.id, token]
    );
    if ((users as any[]).length === 0) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu và xóa token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, decoded.id]
    );

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công' });
};