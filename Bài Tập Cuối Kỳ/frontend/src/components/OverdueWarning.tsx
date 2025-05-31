import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'antd';
import { useHistory } from 'umi';
import { getOverdueInvoices } from '../services/finance';

const OverdueWarning: React.FC = () => {
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const invoices = await getOverdueInvoices();
        setOverdueInvoices(invoices);
      } catch (error) {
        console.error('Lỗi lấy hóa đơn quá hạn:', error);
      }
    };
    fetchOverdue();
  }, []);

  if (overdueInvoices.length === 0) return null;

  return (
    <Alert
      message="Cảnh báo hóa đơn quá hạn"
      description={
        <div>
          Bạn có {overdueInvoices.length} hóa đơn quá hạn. Vui lòng thanh toán sớm:
          <ul>
            {overdueInvoices.map((invoice) => (
              <li key={invoice.id}>
                Kỳ {invoice.billing_period}: {invoice.amount} VND (Hạn: {new Date(invoice.due_date).toLocaleDateString()})
              </li>
            ))}
          </ul>
          <Button type="primary" onClick={() => history.push('/dashboard/finance')}>
            Xem chi tiết
          </Button>
        </div>
      }
      type="error"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default OverdueWarning;