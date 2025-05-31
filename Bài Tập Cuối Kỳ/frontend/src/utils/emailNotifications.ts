import request from './request';

export const sendInvoiceCreatedNotification = async (invoice: {
  resident_id: number;
  billing_period: string;
  amount: number;
  due_date: string;
}) => {
  try {
    await request('/api/notifications/invoice-created', {
      method: 'POST',
      data: {
        resident_id: invoice.resident_id,
        billing_period: invoice.billing_period,
        amount: invoice.amount,
        due_date: invoice.due_date,
      },
    });
    console.log('Gửi thông báo hóa đơn mới thành công');
  } catch (error) {
    console.error('Lỗi gửi thông báo hóa đơn mới:', error);
  }
};

export const sendOverdueNotification = async (invoice: {
  id: number;
  resident_id: number;
  billing_period: string;
  amount: number;
  due_date: string;
}) => {
  try {
    await request('/api/notifications/invoice-overdue', {
      method: 'POST',
      data: {
        invoice_id: invoice.id,
        resident_id: invoice.resident_id,
        billing_period: invoice.billing_period,
        amount: invoice.amount,
        due_date: invoice.due_date,
      },
    });
    console.log('Gửi thông báo hóa đơn quá hạn thành công');
  } catch (error) {
    console.error('Lỗi gửi thông báo hóa đơn quá hạn:', error);
  }
};

export const sendPaymentConfirmedNotification = async (invoice: {
  id: number;
  resident_id: number;
  billing_period: string;
  amount: number;
}) => {
  try {
    await request('/api/notifications/payment-confirmed', {
      method: 'POST',
      data: {
        invoice_id: invoice.id,
        resident_id: invoice.resident_id,
        billing_period: invoice.billing_period,
        amount: invoice.amount,
      },
    });
    console.log('Gửi thông báo xác nhận thanh toán thành công');
  } catch (error) {
    console.error('Lỗi gửi thông báo xác nhận thanh toán:', error);
  }
};