import React, { useState, useEffect } from 'react';
import { Table, message, Modal, Button } from 'antd';
import { useHistory } from 'umi';
import { getOverdueInvoices, deleteInvoice, getInvoiceById } from '../../services/finance';
import { getCurrentUser } from '../../services/auth';
import InvoiceDetailsModal from '../../components/invoice/InvoiceDetailsModal';
import EditInvoiceModal from '../../components/invoice/EditInvoiceModal';

const OverdueManagement: React.FC = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (user.role !== 'admin') {
          message.error('Bạn không có quyền truy cập');
          history.push('/dashboard/finance');
          return;
        }
        const invoicesData = await getOverdueInvoices();
        setInvoices(invoicesData || []);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải danh sách hóa đơn quá hạn');
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [history]);

  const handleViewInvoice = async (id: number) => {
    try {
      const data = await getInvoiceById(id);
      console.log('Invoice details:', data); // Debug
      setSelectedInvoice(data);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải thông tin hóa đơn');
    }
  };

  const handleEditInvoice = (id: number) => {
    setEditingInvoiceId(id);
  };

  const handleCloseDetails = () => {
    setSelectedInvoice(null);
  };

  const handleCloseEdit = () => {
    setEditingInvoiceId(null);
  };

  const handleEditSuccess = async () => {
    // Cập nhật lại danh sách hóa đơn quá hạn
    try {
      const invoicesData = await getOverdueInvoices();
      setInvoices(invoicesData || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách hóa đơn quá hạn');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: `Bạn có chắc muốn xóa hóa đơn #${id}?`,
      onOk: async () => {
        try {
          await deleteInvoice(id);
          message.success('Xóa hóa đơn thành công');
          setInvoices((prev) => prev.filter((item: any) => item.id !== id));
        } catch (error: any) {
          message.error(error.message || 'Xóa hóa đơn thất bại');
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Cư dân', dataIndex: 'resident_name', key: 'resident_name' },
    { title: 'Kỳ thu', dataIndex: 'billing_period', key: 'billing_period' },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${Math.round(amount).toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <span>
          <Button type="link" onClick={() => handleViewInvoice(record.id)}>
            Xem
          </Button>
          <Button type="link" onClick={() => handleEditInvoice(record.id)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="authContainer">
      <h2>Quản lý hóa đơn quá hạn</h2>
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        visible={!!selectedInvoice}
        onClose={handleCloseDetails}
      />
      <EditInvoiceModal
        invoiceId={editingInvoiceId}
        onClose={handleCloseEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default OverdueManagement;