import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
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

  // Bóc tách 'role' từ req.body
  const { fullName, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
  }

  // Xác thực 'role' để đảm bảo nó là 'admin' hoặc 'user'
  // Nếu client gửi 'admin' thì là 'admin', ngược lại là 'user' (mặc định)
  const finalRole = (role === 'admin') ? 'admin' : 'user';

  try {
    console.log('Bắt đầu đăng ký, email:', email, 'với vai trò:', finalRole);
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Kết quả kiểm tra email:', existingUsers);
    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    console.log('Thêm người dùng vào database');
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fullName, email, password, finalRole] // Sử dụng finalRole để lưu vai trò
    );
    console.log('Kết quả thêm người dùng:', result);

    try {
      console.log('Gửi email xác nhận');
      await sendEmail(
        email,
        'Đăng ký thành công',
        `Kính gửi ${fullName},\n\nTài khoản của bạn đã được đăng ký thành công với vai trò ${finalRole}.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
      );
      console.log('Email đã gửi');
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
    }

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm register:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký', error: errorMessage });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((users as any[]).length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = (users as any[])[0];

    if (password !== user.password) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user.id,
        email: user.email,
        role: user.role,
        resident_id: user.resident_id,
      },
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
        resident_id: user.resident_id,
      },
    });
  } catch (error) {
    console.error('Lỗi trong hàm login:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập', error: errorMessage });
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

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
      [resetToken, user.id]
    );

    try {
      const resetLink = `http://localhost:8000/auth/reset-password?token=${resetToken}`;
      await sendEmail(
        email,
        'Yêu cầu đặt lại mật khẩu',
        `Kính gửi ${user.full_name},\n\nVui lòng nhấp vào liên kết sau để đặt lại mật khẩu: ${resetLink}\nLiên kết có hiệu lực trong 15 phút.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
      );
    } catch (emailError) {
      console.error('Lỗi gửi email trong forgotPassword:', emailError);
      await pool.query(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [user.id]
      );
      return res.status(500).json({ message: 'Không thể gửi email đặt lại mật khẩu' });
    }

    res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
  } catch (error) {
    console.error('Lỗi trong hàm forgotPassword:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xử lý yêu cầu quên mật khẩu', error: errorMessage });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [decoded.id, token]
    );
    if ((users as any[]).length === 0) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [newPassword, decoded.id]
    );

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm resetPassword:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu', error: errorMessage });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công' });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, resident_id, created_at FROM users WHERE id = ?', [user.id]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const currentUser = (users as any[])[0];
    res.json({
      id: currentUser.id,
      fullName: currentUser.full_name,
      email: currentUser.email,
      role: currentUser.role,
      resident_id: currentUser.resident_id,
      createdAt: currentUser.created_at,
    });
  } catch (error) {
    console.error('Lỗi trong hàm getCurrentUser:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin người dùng' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const dbUser = (users as any[])[0];

    if (currentPassword !== dbUser.password) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id]);

    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updatePassword:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật mật khẩu', error: errorMessage });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY id');
    const userList = (users as any[]).map(user => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    }));
    res.json(userList);
  } catch (error) {
    console.error('Lỗi trong hàm getAllUsers:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách người dùng', error: errorMessage });
  }
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);

    const user = (users as any[])[0];
    try {
      await sendEmail(
        user.email,
        'Mật khẩu đã được thay đổi',
        `Kính gửi ${user.full_name},\n\nMật khẩu của bạn đã được quản trị viên cập nhật. Vui lòng sử dụng mật khẩu mới để đăng nhập.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
      );
    } catch (emailError) {
      console.error('Lỗi gửi email:', emailError);
    }

    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updateUserPassword:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: errorMessage });
  }
};