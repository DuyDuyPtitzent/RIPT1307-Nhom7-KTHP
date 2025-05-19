import { Request, Response } from 'express';
  import { pool } from '../config/database';

  export const getVehicles = async (req: Request, res: Response) => {
    try {
      const [vehicles] = await pool.query('SELECT * FROM vehicles');
      res.json(vehicles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const createVehicle = async (req: Request, res: Response) => {
    const { licensePlate, type } = req.body;
    if (!licensePlate || !type) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    try {
      await pool.query(
        'INSERT INTO vehicles (license_plate, type, owner_id, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [licensePlate, type, (req as any).user.id, 'pending']
      );
      res.status(201).json({ message: 'Đăng ký phương tiện thành công, chờ duyệt' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const updateVehicle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { licensePlate, type, status } = req.body;
    try {
      const [vehicles] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
      if ((vehicles as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
      }
      await pool.query(
        'UPDATE vehicles SET license_plate = ?, type = ?, status = ? WHERE id = ?',
        [licensePlate, type, status, id]
      );
      res.json({ message: 'Cập nhật phương tiện thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };

  export const deleteVehicle = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [vehicles] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
      if ((vehicles as any[]).length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
      }
      await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
      res.json({ message: 'Xóa phương tiện thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  };