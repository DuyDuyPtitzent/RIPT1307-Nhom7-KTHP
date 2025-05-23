import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';
import { Vehicle } from '../models/Vehicle';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; resident_id?: number };
}

export const getVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const { search, type, status } = req.query;
    let resident_id = req.query.resident_id as string | undefined;

    if (req.user?.role !== 'admin' && req.user?.resident_id) {
      resident_id = req.user.resident_id.toString();
    }

    let query = `
      SELECT v.id, v.resident_id, v.type, v.license_plate, v.owner_name, v.status, v.created_at, v.updated_at, r.apartment_number
      FROM vehicles v
      JOIN residents r ON v.resident_id = r.id
    `;
    const params: any[] = [];

    if (search || resident_id || type || status) {
      query += ' WHERE ';
      const conditions: string[] = [];
      if (search) {
        conditions.push('(v.license_plate LIKE ? OR v.owner_name LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      if (resident_id) {
        conditions.push('v.resident_id = ?');
        params.push(resident_id);
      }
      if (type) {
        conditions.push('v.type = ?');
        params.push(type);
      }
      if (status) {
        conditions.push('v.status = ?');
        params.push(status);
      }
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY v.id';
    const [vehicles] = await pool.query(query, params);
    res.json(vehicles);
  } catch (error) {
    console.error('Lỗi trong hàm getVehicles:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách phương tiện' });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [vehicles] = await pool.query(
      `
      SELECT v.*, r.apartment_number
      FROM vehicles v
      JOIN residents r ON v.resident_id = r.id
      WHERE v.id = ?
      `,
      [id]
    );
    if ((vehicles as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }
    const vehicle = (vehicles as any[])[0];
    if (req.user?.role !== 'admin' && req.user?.resident_id !== vehicle.resident_id) {
      return res.status(403).json({ message: 'Không có quyền xem phương tiện này' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Lỗi trong hàm getVehicleById:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin phương tiện' });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('User từ token:', req.user);

    const { type, license_plate, owner_name, resident_id: provided_resident_id } = req.body;
    const resident_id = req.user?.role === 'admin' ? provided_resident_id : req.user?.resident_id;
    
    console.log('resident_id sử dụng:', resident_id);

    if (!resident_id) {
      return res.status(400).json({ message: 'Thiếu resident_id cho cư dân' });
    }

    const [residents] = await pool.query('SELECT id, email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: `Không tìm thấy cư dân với ID ${resident_id}` });
    }

    const resident = (residents as any[])[0];
    const [existing] = await pool.query('SELECT id FROM vehicles WHERE license_plate = ?', [license_plate]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: 'Biển số xe đã tồn tại' });
    }

    const [result] = await pool.query(
      'INSERT INTO vehicles (resident_id, type, license_plate, owner_name, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [resident_id, type, license_plate, owner_name, 'pending']
    );

    const newVehicleId = (result as any).insertId;

    // Gửi email thông báo cho cư dân
    await sendEmail(
      resident.email,
      'Xác nhận đăng ký phương tiện',
      `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện của bạn (loại: ${type}, biển số: ${license_plate}) cho căn hộ ${resident.apartment_number} đã được gửi. Vui lòng chờ quản lý duyệt.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
    );

    // Gửi email thông báo cho admin
    const [admins] = await pool.query('SELECT email, full_name FROM users WHERE role = ?', ['admin']);
    for (const admin of admins as any[]) {
      try {
        await sendEmail(
          admin.email,
          'Thông báo đăng ký phương tiện mới',
          `Kính gửi ${admin.full_name || 'Quản trị viên'},\n\nCư dân ${resident.full_name} (căn hộ ${resident.apartment_number}) đã đăng ký phương tiện mới (loại: ${type}, biển số: ${license_plate}). Vui lòng kiểm tra và duyệt.\n\nTrân trọng,\nHệ thống Quản lý Dân cư`
        );
      } catch (adminError) {
        console.error(`Lỗi gửi email cho admin ${admin.email}:`, adminError);
      }
    }


    res.status(201).json({ message: 'Đăng ký phương tiện thành công, chờ duyệt', id: newVehicleId });
  } catch (error) {
    console.error('Lỗi trong hàm createVehicle:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký phương tiện', error: error instanceof Error ? error.message : String(error) });
  }
};
export const updateVehicle = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { type, license_plate, owner_name, status } = req.body;
  try {
    const [vehicles] = await pool.query('SELECT resident_id FROM vehicles WHERE id = ?', [id]);
    if ((vehicles as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }

    const vehicle = (vehicles as any[])[0];
    if (req.user?.role !== 'admin' && req.user?.resident_id !== vehicle.resident_id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa phương tiện này' });
    }

    if (license_plate) {
      const [existing] = await pool.query('SELECT id FROM vehicles WHERE license_plate = ? AND id != ?', [license_plate, id]);
      if ((existing as any[]).length > 0) {
        return res.status(400).json({ message: 'Biển số xe đã tồn tại' });
      }
    }

    const updates: any[] = [];
    const params: any[] = [];
    if (type) {
      updates.push('type = ?');
      params.push(type);
    }
    if (license_plate) {
      updates.push('license_plate = ?');
      params.push(license_plate);
    }
    if (owner_name) {
      updates.push('owner_name = ?');
      params.push(owner_name);
    }
    if (status && req.user?.role === 'admin') {
      updates.push('status = ?');
      params.push(status);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin để cập nhật' });
    }

    params.push(id);
    await pool.query(`UPDATE vehicles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    // Gửi email thông báo khi trạng thái thay đổi
    if (status && req.user?.role === 'admin') {
      const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [vehicle.resident_id]);
      const resident = (residents as any[])[0];
      const statusText = status === 'approved' ? 'được duyệt' : 'bị từ chối';
      await sendEmail(
        resident.email,
        `Thông báo trạng thái phương tiện`,
        `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện (ID: ${id}) cho căn hộ ${resident.apartment_number} đã ${statusText}.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
      );
    }

    res.json({ message: 'Cập nhật phương tiện thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updateVehicle:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật phương tiện' });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const [vehicles] = await pool.query('SELECT resident_id FROM vehicles WHERE id = ?', [id]);
    if ((vehicles as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }

    const vehicle = (vehicles as any[])[0];
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin có quyền xóa phương tiện' });
    }

    await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    res.json({ message: 'Xóa phương tiện thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm deleteVehicle:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa phương tiện' });
  }
};

export const approveVehicle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin có quyền duyệt phương tiện' });
    }

    const [vehicles] = await pool.query('SELECT resident_id FROM vehicles WHERE id = ?', [id]);
    if ((vehicles as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }

    const vehicle = (vehicles as any[])[0];
    await pool.query('UPDATE vehicles SET status = ?, updated_at = NOW() WHERE id = ?', ['approved', id]);

    const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [vehicle.resident_id]);
    const resident = (residents as any[])[0];
    await sendEmail(
      resident.email,
      `Thông báo trạng thái phương tiện`,
      `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện (ID: ${id}) cho căn hộ ${resident.apartment_number} đã được duyệt.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
    );

    res.json({ message: 'Duyệt phương tiện thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm approveVehicle:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi duyệt phương tiện' });
  }
};

export const rejectVehicle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin có quyền từ chối phương tiện' });
    }

    const [vehicles] = await pool.query('SELECT resident_id FROM vehicles WHERE id = ?', [id]);
    if ((vehicles as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phương tiện' });
    }

    const vehicle = (vehicles as any[])[0];
    await pool.query('UPDATE vehicles SET status = ?, updated_at = NOW() WHERE id = ?', ['rejected', id]);

    const [residents] = await pool.query('SELECT email, full_name, apartment_number FROM residents WHERE id = ?', [vehicle.resident_id]);
    const resident = (residents as any[])[0];
    await sendEmail(
      resident.email,
      `Thông báo trạng thái phương tiện`,
      `Kính gửi ${resident.full_name},\n\nYêu cầu đăng ký phương tiện (ID: ${id}) cho căn hộ ${resident.apartment_number} đã bị từ chối.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
    );

    res.json({ message: 'Từ chối phương tiện thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm rejectVehicle:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi từ chối phương tiện' });
  }
};