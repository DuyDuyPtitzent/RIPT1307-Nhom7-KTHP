// models/finance.ts
import { useState } from 'react';
import { message } from 'antd';
import { getInvoices, deleteInvoice, getRevenueStats, confirmPayment, getInvoiceById, updateInvoice, getOverdueInvoices } from '@/services/finance';
import { getCurrentUser } from '@/services/auth';
import { getResidents } from '@/services/residents';
import { Invoice } from '@/services/types/finance';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';

interface RevenueStats {
  paid: { period: string; total_revenue: number }[];
  unpaid: { period: string; total_revenue: number }[];
  overdue: { period: string; total_revenue: number }[];
}

export const useFinanceModel = () => {
  // States for Finance
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<RevenueStats>({ paid: [], unpaid: [], overdue: [] });
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

  // States for ExportExcelSection
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // States for EditInvoiceModal
  const [residents, setResidents] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Constants
  const COLORS = ['#52c41a', '#fa8c16', '#f5222d'];

  // Handlers for ExportExcelSection
  const handleSelectChange = (value: string) => {
    setSelectedStatus(value);
    setModalVisible(true);
  };

  const handleConfirmExport = (exportToExcel: (status: string, invoices: Invoice[]) => void) => {
    exportToExcel(selectedStatus, invoices);
    setModalVisible(false);
  };

  const exportToExcel = (filterStatus: string, invoices: Invoice[]) => {
    let filteredInvoices = invoices;

    if (filterStatus === 'paid' || filterStatus === 'unpaid' || filterStatus === 'overdue') {
      filteredInvoices = invoices.filter(invoice => invoice.status === filterStatus);
    }

    const dataToExport = filteredInvoices.map(invoice => ({
      ID: invoice.id,
      'Cư dân': invoice.resident_name,
      'Căn hộ': invoice.apartment_number,
      'Kỳ thu': invoice.billing_period,
      'Số tiền': `${Math.round(invoice.amount).toLocaleString('vi-VN')} VND`,
      'Trạng thái':
        invoice.status === 'paid'
          ? 'Đã thanh toán'
          : invoice.status === 'overdue'
          ? 'Quá hạn'
          : 'Chưa thanh toán',
      'Hạn thanh toán': new Date(invoice.due_date).toLocaleDateString('vi-VN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hóa đơn');

    const fileNameMap: any = {
      paid: 'hoa_don_da_thanh_toan.xlsx',
      unpaid: 'hoa_don_chua_thanh_toan.xlsx',
      overdue: 'hoa_don_qua_han.xlsx',
      all: 'tat_ca_hoa_don.xlsx',
    };

    const fileName = fileNameMap[filterStatus] || 'hoa_don.xlsx';
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  // Handlers for EditInvoiceModal
  const fetchEditInvoiceData = async (invoiceId: number | null, form: any) => {
    if (!invoiceId) return;
    setEditLoading(true);
    try {
      const invoice = await getInvoiceById(invoiceId);
      const residentsData = await getResidents();
      setResidents(residentsData || []);

      form.setFieldsValue({
        resident_id: invoice.resident_id,
        billing_period: moment(invoice.billing_period, 'YYYY-MM'),
        due_date: moment(invoice.due_date, 'YYYY-MM-DD'),
        amount: invoice.amount,
        status: invoice.status || 'pending',
      });
    } catch (error: any) {
      message.error(error.message || 'Không thể tải thông tin hóa đơn');
    } finally {
      setEditLoading(false);
    }
  };

  const onFinishEditInvoice = async (invoiceId: number | null, values: any, residents: any[], onSuccess: () => void, onClose: () => void) => {
    if (!invoiceId) return;
    setEditLoading(true);
    try {
      const selectedResident = residents.find((r) => r.id === values.resident_id);
      await updateInvoice(invoiceId, {
        resident_id: values.resident_id,
        resident_name: selectedResident?.full_name || selectedResident?.fullName,
        apartment_number: selectedResident?.apartment_number || selectedResident?.apartmentNumber,
        billing_period: values.billing_period.format('YYYY-MM'),
        amount: values.amount,
        status: values.status,
        due_date: values.due_date.format('YYYY-MM-DD'),
      });
      message.success('Cập nhật hóa đơn thành công');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Cập nhật hóa đơn thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  // Handlers for Finance
  const fetchData = async (params: {
    search: string;
    period: string;
    status: string;
    residentId?: number;
    dateRange?: [string, string];
    statsPeriod: 'month' | 'quarter' | 'year';
  }) => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setIsAdmin(user.role === 'admin');
      if (user.role !== 'admin' && user.resident_id) {
        setResidentId(user.resident_id);
      }

      try {
        const invoicesData = await getInvoices(params);
        if (!invoicesData || invoicesData.length === 0) {
          message.info('Không tìm thấy hóa đơn nào khớp với bộ lọc');
        }
        setInvoices(invoicesData || []);
      } catch (invoiceError: any) {
        console.error('Lỗi khi gọi getInvoices:', invoiceError);
        message.error(invoiceError.response?.data?.message || 'Không thể tải danh sách hóa đơn');
        setInvoices([]);
      }

      if (user.role === 'admin') {
        try {
          const statsData = await getRevenueStats({
            startDate: params.dateRange?.[0],
            endDate: params.dateRange?.[1],
            period: params.statsPeriod,
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
        throw error;
      } else {
        message.error(error.response?.data?.message || 'Không thể tải dữ liệu tài chính');
      }
      setInvoices([]);
      setStats({ paid: [], unpaid: [], overdue: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice(id);
      message.success('Xóa hóa đơn thành công');
      setInvoices(invoices.filter((i) => i.id !== id));
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

  const handleEditSuccess = async (params: {
    search: string;
    period: string;
    status: string;
    residentId?: number;
  }) => {
    try {
      const invoicesData = await getInvoices(params);
      setInvoices(invoicesData || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu tài chính');
    }
  };

  return {
    invoices,
    setInvoices,
    stats,
    setStats,
    loading,
    setLoading,
    search,
    setSearch,
    period,
    setPeriod,
    status,
    setStatus,
    residentId,
    setResidentId,
    statsPeriod,
    setStatsPeriod,
    dateRange,
    setDateRange,
    isAdmin,
    setIsAdmin,
    selectedInvoice,
    setSelectedInvoice,
    editingInvoiceId,
    setEditingInvoiceId,
    selectedStatus,
    setSelectedStatus,
    modalVisible,
    setModalVisible,
    residents,
    setResidents,
    editLoading,
    setEditLoading,
    COLORS,
    handleSelectChange,
    handleConfirmExport,
    exportToExcel,
    fetchData,
    handleDelete,
    handleConfirmPayment,
    handleViewInvoice,
    handleEditInvoice,
    handleCloseDetails,
    handleCloseEdit,
    handleEditSuccess,
    fetchEditInvoiceData,
    onFinishEditInvoice,
  };
};