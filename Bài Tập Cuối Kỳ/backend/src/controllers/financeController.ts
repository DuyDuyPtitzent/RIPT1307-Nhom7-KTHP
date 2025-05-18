import { Request, Response } from 'express';
  import { pool } from '../config/database';

  export const getInvoices = async (req: Request, res: Response) => {
    try {
      const [invoices] = await pool.query('SELECT * FROM invoices');
      res.json(invoices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const createInvoice = async (req: Request, res: Response) => {
    const { amount, description } = req.body;
    if (!amount || !description) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    try {
      await pool.query(
        'INSERT INTO invoices (amount, description, status, created_at, created_by) VALUES (?, ?, ?, NOW(), ?)',
        [amount, description, 'pending', (req as any).user.id]
      );
      res.status(201).json({ message: 'Thêm hóa đơn thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const updateInvoice = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, description, status } = req.body;
    try {
      const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if ((invoices as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      }
      await pool.query(
        'UPDATE invoices SET amount = ?, description = ?, status = ? WHERE id = ?',
        [amount, description, status, id]
      );
      res.json({ message: 'Cập nhật hóa đơn thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const deleteInvoice = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
      if ((invoices as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      }
      await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
      res.json({ message: 'Xóa hóa đơn thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };