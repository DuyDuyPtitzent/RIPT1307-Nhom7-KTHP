// pages/finance/Finance.tsx
import React, { useEffect } from 'react';
import { Table, Button, Input, Row, Col, Select, DatePicker, Card, Statistic } from 'antd';
import { useHistory, useLocation } from 'umi';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import InvoiceDetailsModal from '../../components/invoice/InvoiceDetailsModal';
import EditInvoiceModal from '../../components/invoice/EditInvoiceModal';
import ExportExcelSection from '@/components/invoice/ExportExcelSection';
import { useFinanceModel } from '@/models/finance';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Finance: React.FC = () => {
  const {
    invoices,
    stats,
    loading,
    search,
    setSearch,
    period,
    setPeriod,
    status,
    setStatus,
    residentId,
    statsPeriod,
    setStatsPeriod,
    dateRange,
    setDateRange,
    isAdmin,
    selectedInvoice,
    editingInvoiceId,
    COLORS,
    fetchData,
    handleDelete,
    handleConfirmPayment,
    handleViewInvoice,
    handleEditInvoice,
    handleCloseDetails,
    handleCloseEdit,
    handleEditSuccess,
  } = useFinanceModel();

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        if ((location.state as any)?.refresh) {
          await fetchData({ search, period, status, residentId, dateRange, statsPeriod });
          history.replace({ ...location, state: {} });
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          history.push('/auth/login');
        }
      }
    };
    loadData();
  }, [location]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData({ search, period, status, residentId, dateRange, statsPeriod });
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          history.push('/auth/login');
        }
      }
    };
    loadData();
  }, [search, period, status, residentId, dateRange, statsPeriod]);

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
      render: (_: any, record: any) => (
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

  const chartData = stats.paid.map((item, index) => ({
    period: item.period,
    paid: item.total_revenue,
    unpaid: stats.unpaid[index]?.total_revenue || 0,
    overdue: stats.overdue[index]?.total_revenue || 0,
  }));

  const pieData = [
    { name: 'Đã thanh toán', value: Number(totalPaid) || 0 },
    { name: 'Chưa thanh toán', value: Number(totalUnpaid) || 0 },
    { name: 'Quá hạn', value: Number(totalOverdue) || 0 },
  ];

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

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('vi-VN') + ' VND'} />
              <Legend />
              <Bar dataKey="paid" fill="#52c41a" name="Đã thanh toán" />
              <Bar dataKey="unpaid" fill="#fa8c16" name="Chưa thanh toán" />
              <Bar dataKey="overdue" fill="#f5222d" name="Quá hạn" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ height: 300, marginTop: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString('vi-VN') + ' VND'} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <ExportExcelSection />

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <InvoiceDetailsModal
        visible={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={handleCloseDetails}
      />
      <EditInvoiceModal
        invoiceId={editingInvoiceId}
        onClose={handleCloseEdit}
        onSuccess={() => handleEditSuccess({ search, period, status, residentId })}
      />
    </div>
  );
};

export default Finance;