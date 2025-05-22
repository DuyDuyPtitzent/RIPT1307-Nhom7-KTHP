import { Request, Response } from 'express';
import { pool } from '../config/database';
import { sendEmail } from '../utils/email';

export const notifyInvoiceCreated = async (req: Request, res: Response) => {
  const { resident_id, billing_period, amount, due_date } = req.body;
  try {
    const [resident] = await pool.query('SELECT email FROM residents WHERE id = ?', [resident_id]);
    if ((resident as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }
    await sendEmail(
      (resident as any[])[0].email,
      'Thông báo hóa đơn mới',
      `Hóa đơn kỳ ${billing_period} (số tiền: ${amount} VND) đã được tạo. Hạn thanh toán: ${new Date(due_date).toLocaleDateString()}.`
    );
    res.json({ message: 'Gửi thông báo hóa đơn mới thành công' });
  } catch (error) {
    console.error('Lỗi gửi thông báo hóa đơn mới:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
  }
};

export const notifyInvoiceOverdue = async (req: Request, res: Response) => {
  const { invoice_id, resident_id, billing_period, amount, due_date } = req.body;
  try {
    const [resident] = await pool.query('SELECT email FROM residents WHERE id = ?', [resident_id]);
    if ((resident as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }
    await sendEmail(
      (resident as any[])[0].email,
      'Cảnh báo hóa đơn quá hạn',
      `Hóa đơn kỳ ${billing_period} (số tiền: ${amount} VND) đã quá hạn vào ${new Date(due_date).toLocaleDateString()}. Vui lòng thanh toán sớm.`
    );
    res.json({ message: 'Gửi thông báo hóa đơn quá hạn thành công' });
  } catch (error) {
    console.error('Lỗi gửi thông báo hóa đơn quá hạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
  }
};

export const notifyPaymentConfirmed = async (req: Request, res: Response) => {
  const { invoice_id, resident_id, billing_period, amount } = req.body;
  try {
    const [resident] = await pool.query('SELECT email FROM residents WHERE id = ?', [resident_id]);
    if ((resident as any[]).length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cư dân' });
    }
    await sendEmail(
      (resident as any[])[0].email,
      'Xác nhận thanh toán hóa đơn',
      `Hóa đơn kỳ ${billing_period} (số tiền: ${amount} VND) đã được thanh toán thành công.`
    );
    res.json({ message: 'Gửi thông báo xác nhận thanh toán thành công' });
  } catch (error) {
    console.error('Lỗi gửi thông báo xác nhận thanh toán:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi gửi thông báo' });
  }
};