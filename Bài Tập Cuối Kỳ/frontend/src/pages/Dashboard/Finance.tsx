import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Row, Col, Select, DatePicker, Card, Statistic } from 'antd';
import { useHistory, useLocation } from 'umi';
import { getInvoices, deleteInvoice, getRevenueStats, confirmPayment, getInvoiceById, getOverdueInvoices } from '../../services/finance';
import { getCurrentUser } from '../../services/auth';
import OverdueWarning from '../../components/OverdueWarning';
import InvoiceDetailsModal from '../../components/invoice/InvoiceDetailsModal';
import EditInvoiceModal from '../../components/invoice/EditInvoiceModal';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Finance: React.FC = () => {
  type Invoice = {
    id: number;
    resident_name: string;
    apartment_number: string;
    billing_period: string;
    amount: number;
    status: string;
    due_date: string;
    created_at: string;
    updated_at?: string;
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<{
    paid: { period: string; total_revenue: number }[];
    unpaid: { period: string; total_revenue: number }[];
    overdue: { period: string; total_revenue: number }[];
  }>({ paid: [], unpaid: [], overdue: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState('');
  const [residentId, setResidentId] = useState<number | undefined>();
  const [statsPeriod, setStatsPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.refresh) {
      fetchData();
      history.replace({ ...location, state: {} });
    }
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      console.log('User data:', user);
      setIsAdmin(user.role === 'admin');
      if (user.role !== 'admin' && user.resident_id) {
        setResidentId(user.resident_id);
      }

      // Gọi getInvoices cho cả admin và cư dân
      try {
        const invoicesData = await getInvoices({ search, period, status, residentId });
        if (!invoicesData || invoicesData.length === 0) {
          message.info('Không tìm thấy hóa đơn nào khớp với bộ lọc');
        }
        setInvoices(invoicesData || []);
      } catch (invoiceError: any) {
        console.error('Lỗi khi gọi getInvoices:', invoiceError);
        message.error(invoiceError.response?.data?.message || 'Không thể tải danh sách hóa đơn');
        setInvoices([]);
      }

      // Chỉ gọi các API admin nếu là admin
      if (user.role === 'admin') {
        try {
          const statsData = await getRevenueStats({
            startDate: dateRange?.[0],
            endDate: dateRange?.[1],
            period: statsPeriod,
          });
          setStats(statsData || { paid: [], unpaid: [], overdue: [] });
        } catch (statsError: any) {
          console.error('Lỗi khi gọi getRevenueStats:', statsError);
          message.error(statsError.response?.data?.message || 'Không thể tải thống kê doanh thu');
        }

        try {
          await getOverdueInvoices();
        } catch (overdueError: any) {
          console.error('Lỗi khi gọi getOverdueInvoices:', overdueError);
          message.error(overdueError.response?.data?.message || 'Không thể kiểm tra hóa đơn quá hạn');
        }
      }
    } catch (error: any) {
      console.error('Lỗi tổng quát trong fetchData:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        history.push('/auth/login');
      } else {
        message.error(error.response?.data?.message || 'Không thể tải dữ liệu tài chính');
      }
      setInvoices([]);
      setStats({ paid: [], unpaid: [], overdue: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, period, status, residentId, dateRange, statsPeriod]);

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice(id);
      message.success('Xóa hóa đơn thành công');
      setInvoices(invoices.filter((i) => i.id !== id));
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa hóa đơn thất bại');
    }
  };

  const handleConfirmPayment = async (id: number) => {
    try {
      await confirmPayment(id);
      message.success('Xác nhận thanh toán thành công');
      const updatedInvoices = invoices.map((i) =>
        i.id === id ? { ...i, status: 'paid', updated_at: new Date().toISOString() } : i
      );
      setInvoices(updatedInvoices);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xác nhận thanh toán thất bại');
    }
  };

  const handleViewInvoice = async (id: number) => {
    try {
      const data = await getInvoiceById(id);
      setSelectedInvoice(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải thông tin hóa đơn');
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
    try {
      const invoicesData = await getInvoices({ search, period, status, residentId });
      setInvoices(invoicesData || []);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu tài chính');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Cư dân', dataIndex: 'resident_name', key: 'resident_name' },
    { title: 'Căn hộ', dataIndex: 'apartment_number', key: 'apartment_number' },
    { title: 'Kỳ thu', dataIndex: 'billing_period', key: 'billing_period' },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${Math.round(amount).toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'paid' ? 'green' : status === 'overdue' ? 'red' : 'orange';
        const label = status === 'paid' ? 'Đã thanh toán' : status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán';
        return <span style={{ color }}>{label}</span>;
      },
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Invoice) => (
        <span>
          <Button type="link" onClick={() => handleViewInvoice(record.id)}>Xem</Button>
          {isAdmin && (
            <>
              <Button type="link" onClick={() => handleEditInvoice(record.id)}>Sửa</Button>
              <Button type="link" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
              {record.status !== 'paid' && (
                <Button type="link" onClick={() => handleConfirmPayment(record.id)}>Xác nhận thanh toán</Button>
              )}
            </>
          )}
        </span>
      ),
    },
  ];

  const totalPaid = stats.paid.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const totalUnpaid = stats.unpaid.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const totalOverdue = stats.overdue.reduce((sum, s) => sum + (s.total_revenue || 0), 0);

  return (
    <div className="authContainer">
      <h2>Quản lý tài chính</h2>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="Tìm theo tên cư dân hoặc căn hộ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Kỳ thu (YYYY-MM)"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Trạng thái"
            value={status}
            onChange={setStatus}
            allowClear
          >
            <Option value="paid">Đã thanh toán</Option>
            <Option value="unpaid">Chưa thanh toán</Option>
            <Option value="overdue">Quá hạn</Option>
          </Select>
        </Col>
        {isAdmin && (
          <Col span={6}>
            <Button type="primary" onClick={() => history.push('/dashboard/invoices/add')}>
              Thêm hóa đơn
            </Button>
          </Col>
        )}
      </Row>

      {isAdmin && (
  <Card title="Thống kê doanh thu" style={{ marginBottom: 16 }}>
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={12}>
        <Select
          style={{ width: '100%' }}
          value={statsPeriod}
          onChange={(value) => setStatsPeriod(value)}
          allowClear
          placeholder="Chọn khoảng thời gian"
        >
          <Option value="month">Theo tháng</Option>
          <Option value="quarter">Theo quý</Option>
          <Option value="year">Theo năm</Option>
        </Select>
      </Col>
      <Col span={12}>
        <RangePicker
          format="YYYY-MM"
          picker="month"
          onChange={(dates) =>
            dates && dates[0] && dates[1]
              ? setDateRange([
                  moment(dates[0]).format('YYYY-MM'),
                  moment(dates[1]).format('YYYY-MM'),
                ])
              : setDateRange(undefined)
          }
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={8}>
        <Card>
          <Statistic
            title="Đã thanh toán"
            value={Number(totalPaid)}
            formatter={(value) =>
              isNaN(Number(value)) ? '0 VND' : `${Number(value).toLocaleString('vi-VN')} VND`
            }
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Chưa thanh toán"
            value={Number(totalUnpaid)}
            formatter={(value) =>
              isNaN(Number(value)) ? '0 VND' : `${Number(value).toLocaleString('vi-VN')} VND`
            }
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Quá hạn"
            value={Number(totalOverdue)}
            formatter={(value) =>
              isNaN(Number(value)) ? '0 VND' : `${Number(value).toLocaleString('vi-VN')} VND`
            }
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  </Card>
)}

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {isAdmin && (
        <Button type="link" onClick={() => history.push('/dashboard/overdue')} style={{ marginTop: 16 }}>
          Xem hóa đơn quá hạn
        </Button>
      )}

      <InvoiceDetailsModal
        visible={!!selectedInvoice}
        invoice={selectedInvoice}
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

export default Finance;