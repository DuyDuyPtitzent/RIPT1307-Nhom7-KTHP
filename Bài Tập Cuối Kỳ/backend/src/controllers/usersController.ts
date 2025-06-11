import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '../utils/email';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; resident_id?: number };
}

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ được upload file ảnh!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Xử lý lỗi upload
const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File ảnh vượt quá 5MB' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error.message.includes('Chỉ được upload file ảnh')) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
};

// Lấy thông tin tài khoản
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const [users] = await pool.query(
      `SELECT id, full_name, email, avatar_path, role, 
              rental_start_date, rental_duration_months, 
              extension_enabled, created_at
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const user = (users as any[])[0];

    // Tính thời gian ở trọ hiện tại
    let currentRentalInfo = null;
    if (user.rental_start_date && user.rental_duration_months) {
      const startDate = new Date(user.rental_start_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + user.rental_duration_months);

      const now = new Date();
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      currentRentalInfo = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        durationMonths: user.rental_duration_months,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        isExpired: remainingDays <= 0,
      };
    }

    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      avatar: user.avatar_path || null,
      role: user.role,
      extensionEnabled: !!user.extension_enabled,
      rentalInfo: currentRentalInfo,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    console.error('Lỗi lấy thông tin tài khoản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật ảnh đại diện
export const updateAvatar = [
  upload.single('avatar'),
  handleUploadError,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
      }

      const userId = req.user?.id;
      const avatarPath = req.file.path.replace(/\\/g, '/');

      // Lấy ảnh cũ để xóa
      const [oldUsers] = await pool.query('SELECT avatar_path FROM users WHERE id = ?', [userId]);
      const oldAvatar = (oldUsers as any[])[0]?.avatar_path;

      // Cập nhật ảnh mới
      await pool.query('UPDATE users SET avatar_path = ? WHERE id = ?', [avatarPath, userId]);

      // Xóa ảnh cũ nếu tồn tại
      if (oldAvatar && fs.existsSync(oldAvatar)) {
        fs.unlinkSync(oldAvatar);
      }

      res.json({
        message: 'Cập nhật ảnh đại diện thành công',
        avatar: avatarPath,
      });
    } catch (error: any) {
      console.error('Lỗi cập nhật ảnh đại diện:', error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
];

// Đổi mật khẩu (chỉ user)
export const changePassword = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userEmail = req.user?.email;
    const { currentPassword, newPassword } = req.body;

    // Chỉ user được đổi mật khẩu
    if (userRole !== 'user') {
      return res.status(403).json({ message: 'Chỉ khách hàng được đổi mật khẩu' });
    }

    // Lấy mật khẩu hiện tại
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const user = (users as any[])[0];

    // So sánh mật khẩu cũ (plaintext)
    if (currentPassword !== user.password) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Cập nhật mật khẩu mới
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

    // Gửi email thông báo
    await sendEmail(
      userEmail!,
      'Đổi mật khẩu thành công',
      `Xin chào,\n\nMật khẩu của bạn đã được đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.\nNếu bạn không thực hiện hành động này, vui lòng liên hệ quản trị viên.\n\nTrân trọng,\nHệ thống quản lý dân cư`
    );

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error: any) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Gia hạn thời gian ở trọ
export const extendRental = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userEmail = req.user?.email;
    const { months } = req.body;

    // Chỉ user được gia hạn
    if (userRole !== 'user') {
      return res.status(403).json({ message: 'Chỉ khách hàng được gia hạn' });
    }

    // Kiểm tra quyền gia hạn
    const [users] = await pool.query(
      `SELECT extension_enabled, rental_duration_months 
       FROM users WHERE id = ?`,
      [userId]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const user = (users as any[])[0];

    if (!user.extension_enabled) {
      return res.status(403).json({ message: 'Tài khoản chưa được cấp quyền gia hạn' });
    }

    // Cập nhật thời gian gia hạn
    const newDuration = (user.rental_duration_months || 0) + months;

    await pool.query(
      `UPDATE users 
       SET rental_duration_months = ?,
           rental_start_date = COALESCE(rental_start_date, NOW())
       WHERE id = ?`,
      [newDuration, userId]
    );

    // TRẢ RESPONSE NGAY CHO CLIENT
    res.json({
      message: `Gia hạn thành công ${months} tháng`,
      newDuration,
    });

    // Gửi email thông báo (không cần chờ)
    sendEmail(
      userEmail!,
      'Gia hạn thời gian ở trọ thành công',
      `Xin chào,\n\nBạn đã gia hạn thời gian ở trọ thêm ${months} tháng.\nThời gian ở mới: ${newDuration} tháng.\n\nTrân trọng,\nHệ thống quản lý dân cư`
    ).catch((err) => {
      console.error('Lỗi gửi email gia hạn:', err);
    });
  } catch (error: any) {
    console.error('Lỗi gia hạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Admin: Bật/tắt quyền gia hạn
export const toggleExtensionPermission = async (req: AuthRequest, res: Response) => {
    console.log('Body:', req.body);
  try {
    const { userId, enabled } = req.body;

    await pool.query('UPDATE users SET extension_enabled = ? WHERE id = ?', [enabled, userId]);

    res.json({
      message: `${enabled ? 'Bật' : 'Tắt'} quyền gia hạn thành công`,
      userId,
      enabled,
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật quyền gia hạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Admin: Lấy danh sách tất cả tài khoản
export const getAllAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const [users] = await pool.query(`
      SELECT id, full_name, email, avatar_path, role, 
             rental_start_date, rental_duration_months, 
             extension_enabled, created_at
      FROM users 
      ORDER BY created_at DESC
    `);

    const userList = (users as any[]).map((user) => {
      let rentalInfo = null;
      if (user.rental_start_date && user.rental_duration_months) {
        const startDate = new Date(user.rental_start_date);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + user.rental_duration_months);

        const now = new Date();
        const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        rentalInfo = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          durationMonths: user.rental_duration_months,
          remainingDays: remainingDays > 0 ? remainingDays : 0,
          isExpired: remainingDays <= 0,
        };
      }

      return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatar: user.avatar_path || null,
        role: user.role,
        extensionEnabled: !!user.extension_enabled,
        rentalInfo,
        createdAt: user.created_at,
      };
    });

    res.json(userList);
  } catch (error: any) {
    console.error('Lỗi lấy danh sách tài khoản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};