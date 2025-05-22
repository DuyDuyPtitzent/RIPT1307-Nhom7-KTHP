import { pool } from '../config/database';
import { sendEmail } from './email';

export const checkOverdueInvoices = async () => {
  try {
    const [invoices] = await pool.query(
      'SELECT i.id, i.resident_id, i.resident_name, i.billing_period, i.amount, i.due_date, r.email ' +
      'FROM invoices i JOIN residents r ON i.resident_id = r.id ' +
      'WHERE i.status = ? AND i.due_date < NOW()',
      ['UNPAID']
    );

    const overdueInvoices = invoices as any[];
    for (const invoice of overdueInvoices) {
      await pool.query('UPDATE invoices SET status = ? WHERE id = ?', ['OVERDUE', invoice.id]);
      
      await sendEmail(
        invoice.email,
        'Cảnh báo hóa đơn quá hạn',
        `Hóa đơn kỳ ${invoice.billing_period} (số tiền: ${invoice.amount} VND) đã quá hạn vào ${new Date(invoice.due_date).toLocaleDateString()}. Vui lòng thanh toán sớm.`
      );

      const [admins] = await pool.query('SELECT email FROM users WHERE role = ?', ['admin']);
      for (const admin of admins as any[]) {
        await sendEmail(
          admin.email,
          'Thông báo cư dân quá hạn thanh toán',
          `Cư dân ${invoice.resident_name} (ID: ${invoice.resident_id}) có hóa đơn kỳ ${invoice.billing_period} (số tiền: ${invoice.amount} VND) đã quá hạn.`
        );
      }
    }

    return overdueInvoices;
  } catch (error) {
    console.error('Lỗi kiểm tra hóa đơn quá hạn:', error);
    return [];
  }
};