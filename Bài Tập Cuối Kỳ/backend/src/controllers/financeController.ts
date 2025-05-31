// src/controllers/invoiceController.ts

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';
import { Invoice } from '../models/Invoice'; // Import interface Invoice từ file mới

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; resident_id?: number };
}

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, billing_period } = req.query;
    let resident_id = req.query.resident_id as string | undefined;

    // Nếu không phải admin, chỉ cho phép xem hóa đơn của chính cư dân
    if (req.user?.role !== 'admin' && req.user?.resident_id) {
      resident_id = req.user.resident_id.toString();
    }

    // Cập nhật SELECT query để lấy tất cả các trường mới
    let query = `
      SELECT 
        i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.status, i.due_date, i.created_at, i.updated_at,
        i.invoice_number, i.number_of_people, i.room_price, i.electricity_start, i.electricity_end, i.electricity_rate,
        i.water_start, i.water_end, i.water_rate, i.internet_fee, i.service_fee_per_person
      FROM invoices i
    `;
    const params: any[] = [];

    if (search || resident_id || status || billing_period) {
      query += ' WHERE ';
      const conditions: string[] = [];
      if (search) {
        conditions.push('(i.resident_name LIKE ? OR i.apartment_number LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      if (resident_id) {
        conditions.push('i.resident_id = ?');
        params.push(resident_id);
      }
      if (status) {
        conditions.push('i.status = ?');
        params.push(status);
      }
      if (billing_period) {
        conditions.push('i.billing_period LIKE ?');
        params.push(`%${billing_period}%`);
      }
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY i.id DESC'; // Thường sắp xếp theo ID giảm dần để xem hóa đơn mới nhất
    const [invoices] = await pool.query(query, params);
    res.json(invoices);
  } catch (error) {
    console.error('Lỗi trong hàm getInvoices:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách hóa đơn' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Cập nhật SELECT query để lấy tất cả các trường mới
    const [invoices] = await pool.query(
      `
      SELECT 
        i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.status, i.due_date, i.created_at, i.updated_at,
        i.invoice_number, i.number_of_people, i.room_price, i.electricity_start, i.electricity_end, i.electricity_rate,
        i.water_start, i.water_end, i.water_rate, i.internet_fee, i.service_fee_per_person
      FROM invoices i
      WHERE i.id = ?
      `,
      [id]
    );
    if ((invoices as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    res.json((invoices as any[])[0]);
  } catch (error) {
    console.error('Lỗi trong hàm getInvoiceById:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin hóa đơn' });
  }
};


export const createInvoice = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Thêm các trường chi tiết mới từ req.body
  const { 
    resident_id, resident_name, apartment_number, billing_period, amount, due_date,
    invoice_number, number_of_people, room_price, electricity_start, electricity_end, electricity_rate,
    water_start, water_end, water_rate, internet_fee, service_fee_per_person
  } = req.body;

  try {
    // Kiểm tra cư dân
    const [residents] = await pool.query('SELECT id, email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }

    const resident = (residents as any[])[0];
    // Kiểm tra resident_name và apartment_number (đã có)
    if (!resident_name || !apartment_number) {
      return res.status(400).json({ message: 'Tên cư dân và số căn hộ là bắt buộc' });
    }

    const dueDate = new Date(due_date);
    if (isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: 'Ngày đến hạn không hợp lệ' });
    }
    const status = dueDate < new Date() ? 'overdue' : 'unpaid';

    // Cập nhật INSERT query để thêm tất cả các trường mới
    const [result] = await pool.query(
      `INSERT INTO invoices (
        resident_id, resident_name, apartment_number, billing_period, amount, status, due_date, created_at,
        invoice_number, number_of_people, room_price, electricity_start, electricity_end, electricity_rate,
        water_start, water_end, water_rate, internet_fee, service_fee_per_person
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resident_id, resident_name, apartment_number, billing_period, amount, status, due_date,
        invoice_number, number_of_people, room_price, electricity_start, electricity_end, electricity_rate,
        water_start, water_end, water_rate, internet_fee, service_fee_per_person
      ]
    );

    const newInvoiceId = (result as any).insertId;

    // Lấy hóa đơn vừa tạo để trả về (bao gồm cả các trường chi tiết)
    const [newInvoice] = await pool.query(
      `SELECT 
        i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.status, i.due_date, i.created_at, i.updated_at,
        i.invoice_number, i.number_of_people, i.room_price, i.electricity_start, i.electricity_end, i.electricity_rate,
        i.water_start, i.water_end, i.water_rate, i.internet_fee, i.service_fee_per_person
      FROM invoices i WHERE id = ?`, 
      [newInvoiceId]
    );

    // Gửi email thông báo (giữ nguyên logic cũ, sử dụng amount tổng)
    try {
      const subject = status === 'overdue' ? 'Cảnh báo hóa đơn quá hạn' : 'Thông báo hóa đơn mới';
      const message = status === 'overdue'
        ? `Kính gửi ${resident_name},\n\nHóa đơn mới cho căn hộ ${apartment_number} đã quá hạn.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán ngay lập tức.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
        : `Kính gửi ${resident_name},\n\nHóa đơn mới đã được tạo cho căn hộ ${apartment_number}.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán đúng hạn.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`;

      await sendEmail(resident.email, subject, message);
    } catch (emailError) {
      console.error('Lỗi gửi email thông báo hóa đơn:', emailError);
    }

    res.status(201).json({ message: 'Thêm hóa đơn thành công', invoice: (newInvoice as any[])[0] });
  } catch (error) {
    console.error('Lỗi trong hàm createInvoice:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm hóa đơn' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  // Thêm các trường chi tiết mới từ req.body
  const { 
    resident_id, resident_name, apartment_number, billing_period, amount, status, due_date,
    invoice_number, number_of_people, room_price, electricity_start, electricity_end, electricity_rate,
    water_start, water_end, water_rate, internet_fee, service_fee_per_person
  } = req.body;

  try {
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if ((invoices as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    const [residents] = await pool.query('SELECT id FROM residents WHERE id = ?', [resident_id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }

    // Cập nhật UPDATE query để cập nhật tất cả các trường mới
    await pool.query(
      `UPDATE invoices SET 
        resident_id = ?, 
        resident_name = ?, 
        apartment_number = ?, 
        billing_period = ?, 
        amount = ?, 
        status = ?, 
        due_date = ?, 
        updated_at = NOW(),
        invoice_number = ?,
        number_of_people = ?,
        room_price = ?,
        electricity_start = ?,
        electricity_end = ?,
        electricity_rate = ?,
        water_start = ?,
        water_end = ?,
        water_rate = ?,
        internet_fee = ?,
        service_fee_per_person = ?
      WHERE id = ?`,
      [
        resident_id, resident_name, apartment_number, billing_period, amount, status, due_date,
        invoice_number, number_of_people, room_price, electricity_start, electricity_end, electricity_rate,
        water_start, water_end, water_rate, internet_fee, service_fee_per_person,
        id
      ]
    );

    res.json({ message: 'Cập nhật hóa đơn thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm updateInvoice:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hóa đơn' });
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
    console.error('Lỗi trong hàm deleteInvoice:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa hóa đơn' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Cập nhật SELECT query để lấy thông tin email và các trường cần thiết cho email
    const [invoices] = await pool.query(
      `
      SELECT 
        i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount,
        i.due_date, i.status -- Thêm due_date và status để kiểm tra lại
      FROM invoices i
      WHERE i.id = ?
      `,
      [id]
    );
    if ((invoices as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    const invoice = (invoices as any[])[0];

    // Lấy email cư dân từ bảng residents
    const [residents] = await pool.query('SELECT email FROM residents WHERE id = ?', [invoice.resident_id]);
    if ((residents as any[]).length === 0) {
      console.warn(`Không tìm thấy cư dân với resident_id ${invoice.resident_id}`);
    }

    await pool.query('UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?', ['paid', id]);

    const resident = (residents as any[])[0];
    if (resident?.email) {
      try {
        // Sử dụng due_date từ invoice để gửi email chính xác hơn
        const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('vi-VN') : 'N/A';
        await sendEmail(
          resident.email,
          'Xác nhận thanh toán',
          `Kính gửi ${invoice.resident_name},\n\nHóa đơn cho căn hộ ${invoice.apartment_number}, kỳ thu ${invoice.billing_period} với số tiền ${invoice.amount} VND (hạn thanh toán: ${dueDate}) đã được thanh toán thành công.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
        );
      } catch (emailError) {
        console.error('Lỗi gửi email xác nhận thanh toán:', emailError);
      }
    }

    res.json({ message: 'Xác nhận thanh toán thành công' });
  } catch (error) {
    console.error('Lỗi trong hàm confirmPayment:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xác nhận thanh toán' });
  }
};

export const checkOverdueInvoices = async (req: Request, res: Response) => {
  try {
    // Kiểm tra kết nối database
    await pool.query('SELECT 1');
    console.log('Bắt đầu kiểm tra hóa đơn quá hạn');

    // Cập nhật SELECT query để lấy các trường cần thiết cho email
    const [invoices] = await pool.query(
      `
      SELECT 
        i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.due_date
      FROM invoices i
      WHERE i.status = 'unpaid' AND i.due_date < NOW()
      `
    );
    console.log('Hóa đơn quá hạn:', invoices);

    for (const invoice of invoices as any[]) {
      // Kiểm tra due_date hợp lệ
      const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
      if (!dueDate || isNaN(dueDate.getTime())) {
        console.warn(`Hóa đơn ID ${invoice.id} có due_date không hợp lệ: ${invoice.due_date}`);
        continue;
      }

      console.log(`Cập nhật trạng thái hóa đơn ID ${invoice.id} thành overdue`);
      await pool.query('UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?', ['overdue', invoice.id]);

      // Lấy email cư dân từ bảng residents
      const [residents] = await pool.query('SELECT email FROM residents WHERE id = ?', [invoice.resident_id]);
      if ((residents as any[]).length === 0) {
        console.warn(`Không tìm thấy cư dân với resident_id ${invoice.resident_id}`);
        continue;
      }

      const resident = (residents as any[])[0];

      // Gửi thông báo cho cư dân
      if (resident.email) {
        try {
          console.log(`Gửi email cảnh báo tới ${resident.email}`);
          await sendEmail(
            resident.email,
            'Cảnh báo hóa đơn quá hạn',
            `Kính gửi ${invoice.resident_name},\n\nHóa đơn cho căn hộ ${invoice.apartment_number}, kỳ thu ${invoice.billing_period} với số tiền ${invoice.amount} VND đã quá hạn thanh toán (ngày ${dueDate.toLocaleDateString('vi-VN')}).\nVui lòng thanh toán sớm nhất có thể.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
          );
        } catch (emailError) {
          console.error(`Lỗi gửi email cảnh báo cho cư dân ${invoice.resident_name}:`, emailError);
        }
      } else {
        console.warn(`Hóa đơn ID ${invoice.id} không có email cư dân`);
      }

      // Gửi thông báo cho admin
      try {
        console.log('Truy vấn danh sách admin');
        const [admins] = await pool.query('SELECT email, username FROM users WHERE role = ?', ['admin']);
        console.log('Danh sách admin:', admins);
        for (const admin of admins as any[]) {
          try {
            console.log(`Gửi email thông báo tới admin ${admin.email}`);
            await sendEmail(
              admin.email,
              'Thông báo hóa đơn quá hạn',
              `Kính gửi ${admin.username || 'Quản trị viên'},\n\nHóa đơn ID ${invoice.id} của cư dân ${invoice.resident_name} (căn hộ ${invoice.apartment_number}, kỳ thu ${invoice.billing_period}) với số tiền ${invoice.amount} VND đã quá hạn thanh toán.\n\nTrân trọng,\nHệ thống Quản lý Dân cư`
            );
          } catch (emailError) {
            console.error(`Lỗi gửi email thông báo cho admin ${admin.email}:`, emailError);
          }
        }
      } catch (adminError) {
        console.error('Lỗi truy vấn hoặc gửi email cho admin:', adminError);
      }
    }

    res.json({ message: 'Kiểm tra và cập nhật hóa đơn quá hạn thành công', overdueCount: (invoices as any[]).length });
  } catch (error) {
    console.error('Lỗi chi tiết trong hàm checkOverdueInvoices:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra hóa đơn quá hạn', error: errorMessage });
  }
};


export const getRevenueStats = async (req: Request, res: Response) => {
  const { period, startDate, endDate } = req.query;
  try {
    let query = '';
    const params: any[] = [];

    // Truy vấn tổng số tiền theo trạng thái và khoảng thời gian
    query = `
      SELECT 
        status,
        DATE_FORMAT(created_at, ?) as period,
        SUM(amount) as total_revenue
      FROM invoices
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY status, DATE_FORMAT(created_at, ?)
      ORDER BY period DESC
    `;

    let dateFormat = '%Y';
    if (period === 'month') {
      dateFormat = '%Y-%m';
    } else if (period === 'quarter') {
      dateFormat = "CONCAT(YEAR(created_at), '-Q', QUARTER(created_at))";
    } else if (period !== 'year') {
      return res.status(400).json({ message: 'Khoảng thời gian không hợp lệ' });
    }

    // Xử lý khoảng thời gian
    const start = startDate ? new Date(startDate as string) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setDate(end.getDate() + 1); // Bao gồm cả ngày cuối

    params.push(dateFormat, start, end, dateFormat);

    const [stats] = await pool.query(query, params);

    // Nhóm kết quả theo trạng thái
    const result = {
      paid: [],
      unpaid: [],
      overdue: [],
    } as { paid: any[], unpaid: any[], overdue: any[] };

    (stats as any[]).forEach((row: any) => {
      if (row.status === 'paid') {
        result.paid.push({ period: row.period, total_revenue: row.total_revenue });
      } else if (row.status === 'unpaid') {
        result.unpaid.push({ period: row.period, total_revenue: row.total_revenue });
      } else if (row.status === 'overdue') {
        result.overdue.push({ period: row.period, total_revenue: row.total_revenue });
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Lỗi trong hàm getRevenueStats:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê doanh thu' });
  }
};