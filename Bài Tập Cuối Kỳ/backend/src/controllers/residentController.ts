import { Request, Response } from 'express';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; resident_id?: number };
}

export const getResidents = async (req: Request, res: Response) => {
  try {
    const { search, apartment } = req.query;
    let query = 'SELECT id, full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_at, updated_at FROM residents';
    const params: any[] = [];

    if (search || apartment) {
      query += ' WHERE ';
      const conditions: string[] = [];
      if (search) {
        conditions.push('(full_name LIKE ? OR email LIKE ? OR phone_number LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (apartment) {
        conditions.push('apartment_number LIKE ?');
        params.push(`%${apartment}%`);
      }
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY id';
    const [residents] = await pool.query(query, params);
    res.json(residents);
  } catch (error) {
    console.error('Lỗi trong hàm getResidents:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách cư dân' });
  }
};

export const getResidentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [residents] = await pool.query(
      'SELECT id, full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_at, updated_at FROM residents WHERE id = ?',
      [id]
    );
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }
    res.json((residents as any[])[0]);
  } catch (error) {
    console.error('Lỗi trong hàm getResidentById:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin cư dân' });
  }
};

export const createResident = async (req: AuthRequest, res: Response) => {
  const { fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address } = req.body;
  if (!fullName || !apartmentNumber) {
    return res.status(400).json({ message: 'Họ tên và số căn hộ là bắt buộc' });
  }
  try {
    const createdBy = req.user?.id;
    console.log('Dữ liệu nhận được:', { fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address, createdBy });
    if (!createdBy) {
      return res.status(401).json({ message: 'Thiếu thông tin người tạo (createdBy). Bạn cần đăng nhập lại.' });
    }
    // Đảm bảo các trường không bắt buộc là null nếu không có
    const dob = dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.length > 0 ? dateOfBirth : null;
    const safeEmail = email && email.length > 0 ? email : null;
    const safePhone = phoneNumber && phoneNumber.length > 0 ? phoneNumber : null;
    const safeGender = gender && gender.length > 0 ? gender : null;
    const safeAddress = address && address.length > 0 ? address : null;
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [createdBy]);
    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người tạo' });
    }

    const [result] = await pool.query(
      'INSERT INTO residents (full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [fullName, safeEmail, safePhone, dob, safeGender, apartmentNumber, safeAddress, createdBy]
    );
    const newResidentId = (result as any).insertId;

    // Tự động cập nhật resident_id cho user có cùng email
    if (safeEmail) {
      try {
        await pool.query('UPDATE users SET resident_id = ? WHERE email = ?', [newResidentId, safeEmail]);
      } catch (updateUserErr) {
        console.error('Lỗi khi cập nhật resident_id cho user:', updateUserErr);
      }
    }

    // Cập nhật users.resident_id nếu cần (ví dụ: gán cư dân này cho user hiện tại)
    if (req.user?.role === 'user' && !req.user.resident_id) {
      await pool.query('UPDATE users SET resident_id = ? WHERE id = ?', [newResidentId, req.user.id]);
    }

    if (safeEmail) {
      const emailContent = `Kính gửi ${fullName},\n\nThông tin cư dân của bạn đã được thêm vào hệ thống.\nSố căn hộ: ${apartmentNumber}\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`;
      try {
        await pool.query(
          'INSERT INTO notifications (user_id, type, subject, content, status, created_at, updated_at) VALUES ((SELECT id FROM users WHERE resident_id = ?), ?, ?, ?, ?, NOW(), NOW())',
          [newResidentId, 'email', 'Chào mừng đến với khu dân cư', emailContent, 'pending']
        );
      } catch (notiErr) {
        console.error('Lỗi khi insert notification:', notiErr);
      }
      try {
        await sendEmail(safeEmail, 'Chào mừng đến với khu dân cư', emailContent);
        try {
          await pool.query('UPDATE notifications SET status = ? WHERE content = ?', ['sent', emailContent]);
        } catch (updateNotiErr) {
          console.error('Lỗi khi update notification:', updateNotiErr);
        }
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
        try {
          await pool.query('UPDATE notifications SET status = ? WHERE content = ?', ['failed', emailContent]);
        } catch (updateNotiErr) {
          console.error('Lỗi khi update notification (fail):', updateNotiErr);
        }
      }
    }

    // Luôn trả về thành công nếu insert cư dân thành công
    res.status(201).json({ message: 'Thêm dân cư thành công', id: newResidentId });
  } catch (error) {
    console.error('Lỗi trong hàm createResident:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm cư dân', error: typeof error === 'object' && error && 'message' in error ? (error as any).message : String(error) });
  }
};

export const updateResident = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address } = req.body;
  if (!fullName || !apartmentNumber) {
    return res.status(400).json({ message: 'Họ tên và số căn hộ là bắt buộc' });
  }
  try {
    const [residents] = await pool.query('SELECT * FROM residents WHERE id = ?', [id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }
    await pool.query(
      'UPDATE residents SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, gender = ?, apartment_number = ?, address = ?, updated_at = NOW() WHERE id = ?',
      [fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address, id]
    );
    res.json({ message: 'Cập nhật dân cư thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updateResident:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật cư dân' });
  }
};

export const deleteResident = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [residents] = await pool.query('SELECT * FROM residents WHERE id = ?', [id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }

    // Kiểm tra hóa đơn và phương tiện
    const [invoices] = await pool.query('SELECT COUNT(*) AS count FROM invoices WHERE resident_id = ?', [id]);
    const [vehicles] = await pool.query('SELECT COUNT(*) AS count FROM vehicles WHERE resident_id = ?', [id]);
    if ((invoices as any)[0].count > 0 || (vehicles as any)[0].count > 0) {
      return res.status(400).json({ message: 'Không thể xóa cư dân do có hóa đơn hoặc phương tiện liên quan' });
    }

    await pool.query('DELETE FROM residents WHERE id = ?', [id]);
    res.json({ message: 'Xóa dân cư thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm deleteResident:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa cư dân' });
  }
};