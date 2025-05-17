import { Request, Response } from 'express';
  import { pool } from '../config/database';

  export const getResidents = async (req: Request, res: Response) => {
    try {
      const [residents] = await pool.query('SELECT * FROM residents');
      res.json(residents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const createResident = async (req: Request, res: Response) => {
    const { fullName, dateOfBirth, address } = req.body;
    if (!fullName || !dateOfBirth || !address) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    try {
      await pool.query(
        'INSERT INTO residents (full_name, date_of_birth, address, created_at, created_by) VALUES (?, ?, ?, NOW(), ?)',
        [fullName, dateOfBirth, address, (req as any).user.id]
      );
      res.status(201).json({ message: 'Thêm dân cư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const updateResident = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, dateOfBirth, address } = req.body;
    try {
      const [residents] = await pool.query('SELECT * FROM residents WHERE id = ?', [id]);
      if ((residents as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy dân cư' });
      }
      await pool.query(
        'UPDATE residents SET full_name = ?, date_of_birth = ?, address = ? WHERE id = ?',
        [fullName, dateOfBirth, address, id]
      );
      res.json({ message: 'Cập nhật dân cư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const deleteResident = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [residents] = await pool.query('SELECT * FROM residents WHERE id = ?', [id]);
      if ((residents as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy dân cư' });
      }
      await pool.query('DELETE FROM residents WHERE id = ?', [id]);
      res.json({ message: 'Xóa dân cư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };