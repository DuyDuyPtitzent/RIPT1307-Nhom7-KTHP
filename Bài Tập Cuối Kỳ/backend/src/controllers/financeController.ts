import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';
import { Invoice } from '../models/Invoice';

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

    let query = `
      SELECT i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.status, i.due_date, i.created_at, i.updated_at
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

    query += ' ORDER BY i.id';
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
    const [invoices] = await pool.query(
      `
      SELECT i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.status, i.due_date, i.created_at, i.updated_at
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

  const { resident_id, resident_name, apartment_number, billing_period, amount, due_date } = req.body;
  try {
    const [residents] = await pool.query('SELECT id, email, full_name, apartment_number FROM residents WHERE id = ?', [resident_id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }

    const resident = (residents as any[])[0];
    const dueDate = new Date(due_date);
    const status = dueDate < new Date() ? 'overdue' : 'unpaid';

    const [result] = await pool.query(
      'INSERT INTO invoices (resident_id, resident_name, apartment_number, billing_period, amount, status, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [resident_id, resident_name, apartment_number, billing_period, amount, status, due_date]
    );

    const newInvoiceId = (result as any).insertId;

    // Gửi email thông báo
    try {
      const subject = status === 'overdue' ? 'Cảnh báo hóa đơn quá hạn' : 'Thông báo hóa đơn mới';
      const message = status === 'overdue'
        ? `Kính gửi ${resident_name},\n\nHóa đơn mới cho căn hộ ${apartment_number} đã quá hạn.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán ngay lập tức.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
        : `Kính gửi ${resident_name},\n\nHóa đơn mới đã được tạo cho căn hộ ${apartment_number}.\nKỳ thu: ${billing_period}\nSố tiền: ${amount.toLocaleString('vi-VN')} VND\nHạn thanh toán: ${dueDate.toLocaleDateString('vi-VN')}\nVui lòng thanh toán đúng hạn.\nTrân trọng,\nĐội ngũ Quản lý Dân cư`;

      await sendEmail(resident.email, subject, message);
    } catch (emailError) {
      console.error('Lỗi gửi email thông báo hóa đơn:', emailError);
    }

    res.status(201).json({ message: 'Thêm hóa đơn thành công', id: newInvoiceId });
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
  const { resident_id, resident_name, apartment_number, billing_period, amount, status, due_date } = req.body;
  try {
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if ((invoices as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    const [residents] = await pool.query('SELECT id FROM residents WHERE id = ?', [resident_id]);
    if ((residents as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }

    await pool.query(
      'UPDATE invoices SET resident_id = ?, resident_name = ?, apartment_number = ?, billing_period = ?, amount = ?, status = ?, due_date = ?, updated_at = NOW() WHERE id = ?',
      [resident_id, resident_name, apartment_number, billing_period, amount, status, due_date, id]
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
    const [invoices] = await pool.query(
      `
      SELECT i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount
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
        await sendEmail(
          resident.email,
          'Xác nhận thanh toán',
          `Kính gửi ${invoice.resident_name},\n\nHóa đơn cho căn hộ ${invoice.apartment_number}, kỳ thu ${invoice.billing_period} với số tiền ${invoice.amount} VND đã được thanh toán thành công.\n\nTrân trọng,\nĐội ngũ Quản lý Dân cư`
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

    const [invoices] = await pool.query(
      `
      SELECT i.id, i.resident_id, i.resident_name, i.apartment_number, i.billing_period, i.amount, i.due_date
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