import { Request, Response } from 'express';
  import { pool } from '../config/database';
  import { sendEmail } from '../utils/email';

  export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fullName, email, role } = req.body;
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if ((users as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      await pool.query(
        'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?',
        [fullName, email, role, id]
      );
      res.json({ message: 'Cập nhật người dùng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if ((users as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };