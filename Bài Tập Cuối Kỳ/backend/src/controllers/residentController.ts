import { Request, Response } from 'express';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';

export const getResidents = async (req: Request, res: Response) => {
  try {
    const { search, apartment } = req.query;
    let query = 'SELECT id, full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_at FROM residents';
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
      'SELECT id, full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_at FROM residents WHERE id = ?',
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

export const createResident = async (req: Request, res: Response) => {
  const { fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address } = req.body;
  if (!fullName || !apartmentNumber) {
    return res.status(400).json({ message: 'Họ tên và số căn hộ là bắt buộc' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO residents (full_name, email, phone_number, date_of_birth, gender, apartment_number, address, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
      [fullName, email, phoneNumber, dateOfBirth, gender, apartmentNumber, address, (req as any).user.id]
    );
    const newResidentId = (result as any).insertId;

    if (email) {
      try {
        await sendEmail(
          email,
          'Chào mừng đến với khu dân cư',
          `Kính gửi ${fullName},\n\nThông tin cư dân của bạn đã được thêm vào hệ thống.\nSố căn hộ: ${apartmentNumber}\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
        );
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
      }
    }

    res.status(201).json({ message: 'Thêm dân cư thành công', id: newResidentId });
  } catch (error) {
    console.error('Lỗi trong hàm createResident:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm cư dân' });
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
      'UPDATE residents SET full_name = ?, email = ?, phone_number = ?, date_of_birth = ?, gender = ?, apartment_number = ?, address = ? WHERE id = ?',
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
    await pool.query('DELETE FROM residents WHERE id = ?', [id]);
    res.json({ message: 'Xóa dân cư thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm deleteResident:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa cư dân' });
  }
};