import { Request, Response } from 'express';
  import { pool } from '../config/database';

  export const getInventory = async (req: Request, res: Response) => {
    try {
      const [items] = await pool.query('SELECT * FROM inventory');
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const createInventory = async (req: Request, res: Response) => {
    const { name, quantity } = req.body;
    if (!name || !quantity) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    try {
      await pool.query(
        'INSERT INTO inventory (name, quantity, created_at, created_by) VALUES (?, ?, NOW(), ?)',
        [name, quantity, (req as any).user.id]
      );
      res.status(201).json({ message: 'Thêm vật tư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const updateInventory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, quantity } = req.body;
    try {
      const [items] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
      if ((items as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy vật tư' });
      }
      await pool.query(
        'UPDATE inventory SET name = ?, quantity = ? WHERE id = ?',
        [name, quantity, id]
      );
      res.json({ message: 'Cập nhật vật tư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const deleteInventory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [items] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
      if ((items as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy vật tư' });
      }
      await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
      res.json({ message: 'Xóa vật tư thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };