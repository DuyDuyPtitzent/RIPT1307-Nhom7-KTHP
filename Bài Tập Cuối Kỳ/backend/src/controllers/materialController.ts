import { Request, Response } from 'express';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { search, manager } = req.query;
    let query = 'SELECT m.id, m.name, m.quantity, m.low_stock_threshold, u.full_name as managed_by, m.created_at, m.updated_at FROM materials m LEFT JOIN users u ON m.managed_by = u.id';
    const params: any[] = [];

    if (search || manager) {
      query += ' WHERE ';
      const conditions: string[] = [];
      if (search) {
        conditions.push('m.name LIKE ?');
        params.push(`%${search}%`);
      }
      if (manager) {
        conditions.push('u.full_name LIKE ?');
        params.push(`%${manager}%`);
      }
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY m.id';
    const [materials] = await pool.query(query, params);
    res.json(materials);
  } catch (error) {
    console.error('Lỗi trong hàm getMaterials:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách vật tư' });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [materials] = await pool.query(
      'SELECT m.id, m.name, m.quantity, m.low_stock_threshold, u.full_name as managed_by, m.created_at, m.updated_at FROM materials m LEFT JOIN users u ON m.managed_by = u.id WHERE m.id = ?',
      [id]
    );
    if ((materials as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vật tư' });
    }
    res.json((materials as any[])[0]);
  } catch (error) {
    console.error('Lỗi trong hàm getMaterialById:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin vật tư' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  const { name, quantity, lowStockThreshold } = req.body;
  if (!name || quantity < 0) {
    return res.status(400).json({ message: 'Tên vật tư và số lượng là bắt buộc' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO materials (name, quantity, low_stock_threshold, managed_by, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, quantity, lowStockThreshold || 10, (req as any).user.id]
    );
    const newMaterialId = (result as any).insertId;

    // Kiểm tra tồn kho thấp
    if (quantity <= (lowStockThreshold || 10)) {
      try {
        await sendEmail(
          (req as any).user.email,
          'Cảnh báo tồn kho thấp',
          `Vật tư "${name}" vừa được thêm với số lượng ${quantity}, thấp hơn ngưỡng ${lowStockThreshold || 10}.`
        );
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
      }
    }

    res.status(201).json({ message: 'Thêm vật tư thành công', id: newMaterialId });
  } catch (error) {
    console.error('Lỗi trong hàm createMaterial:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm vật tư' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, lowStockThreshold } = req.body;
  if (!name || quantity < 0) {
    return res.status(400).json({ message: 'Tên vật tư và số lượng là bắt buộc' });
  }
  try {
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if ((materials as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vật tư' });
    }
    await pool.query(
      'UPDATE materials SET name = ?, quantity = ?, low_stock_threshold = ?, managed_by = ?, updated_at = NOW() WHERE id = ?',
      [name, quantity, lowStockThreshold || 10, (req as any).user.id, id]
    );

    // Kiểm tra tồn kho thấp
    if (quantity <= (lowStockThreshold || 10)) {
      try {
        await sendEmail(
          (req as any).user.email,
          'Cảnh báo tồn kho thấp',
          `Vật tư "${name}" đã được cập nhật với số lượng ${quantity}, thấp hơn ngưỡng ${lowStockThreshold || 10}.`
        );
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
      }
    }

    res.json({ message: 'Cập nhật vật tư thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updateMaterial:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật vật tư' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if ((materials as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vật tư' });
    }
    await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    res.json({ message: 'Xóa vật tư thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm deleteMaterial:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa vật tư' });
  }
};