// models/finance.ts
import { useState } from 'react';
import { message } from 'antd';
import { getInvoices, deleteInvoice, getRevenueStats, confirmPayment, getInvoiceById, updateInvoice, getOverdueInvoices, createInvoice } from '@/services/finance'; // Thêm createInvoice
import { getCurrentUser } from '@/services/auth';
import { getResidents } from '@/services/residents';
import { Invoice, Resident, CreateInvoiceParams, InvoiceFormData } from '@/services/types/finance'; // Thêm Resident, CreateInvoiceParams, InvoiceFormData
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { useHistory } from 'umi'; // Thêm useHistory nếu bạn muốn chuyển hướng trong hook

// Định nghĩa kiểu dữ liệu cho thống kê doanh thu
interface RevenueStats {
  paid: { period: string; total_revenue: number }[];
  unpaid: { period: string; total_revenue: number }[];
  overdue: { period: string; total_revenue: number }[];
}

// KHÔNG THAY ĐỔI useFinanceModel 
export const useFinanceModel = () => {
  // State cho các dữ liệu tài chính 
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

  // State cho phần xuất Excel 
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // State cho EditInvoiceModal 
  const [residents, setResidents] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Mảng màu sắc cho biểu đồ trạng thái hóa đơn
  const COLORS = ['#52c41a', '#fa8c16', '#f5222d'];

  // Xử lý khi chọn trạng thái để xuất Excel
  const handleSelectChange = (value: string) => {
    setSelectedStatus(value);
    setModalVisible(true);
  };

  // Xác nhận xuất Excel
  const handleConfirmExport = (exportToExcel: (status: string, invoices: Invoice[]) => void) => {
    // Luôn lấy lại dữ liệu mới nhất theo trạng thái đang chọn
    getInvoices({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search,
      period,
      residentId,
    }).then((freshInvoices) => {
      exportToExcel(selectedStatus, freshInvoices || []);
      setModalVisible(false);
    }).catch(() => {
      // Nếu lỗi thì vẫn export dữ liệu hiện tại
      exportToExcel(selectedStatus, invoices);
      setModalVisible(false);
    });
  };

  // Hàm xuất dữ liệu hóa đơn ra file Excel
  const exportToExcel = (filterStatus: string, invoices: Invoice[]) => {
    let filteredInvoices = invoices;

    if (filterStatus === 'paid' || filterStatus === 'unpaid' || filterStatus === 'overdue') {
      filteredInvoices = invoices.filter(invoice => invoice.status === filterStatus);
    }

    const dataToExport = filteredInvoices.map(invoice => ({
      id: invoice.id,
      resident_name: invoice.resident_name,
      apartment_number: invoice.apartment_number,
      billing_period: invoice.billing_period,
      amount: invoice.amount,
      status: invoice.status,
      due_date: invoice.due_date,
      // Nếu muốn xuất thêm các trường chi tiết, thêm ở đây
      // invoice_number: invoice.invoice_number,
      // number_of_people: invoice.number_of_people,
      // ...
    }));

    // Nếu muốn xuất đúng header tiếng Việt, có thể chuyển đổi ở đây
    const headerMap = {
      id: 'ID',
      resident_name: 'Cư dân',
      apartment_number: 'Căn hộ',
      billing_period: 'Kỳ thu',
      amount: 'Số tiền',
      status: 'Trạng thái',
      due_date: 'Hạn thanh toán',
    };
    const dataWithHeader = [headerMap, ...dataToExport.map(row => ({
      ID: row.id,
      'Cư dân': row.resident_name,
      'Căn hộ': row.apartment_number,
      'Kỳ thu': row.billing_period,
      'Số tiền': `${Math.round(row.amount).toLocaleString('vi-VN')} VND`,
      'Trạng thái':
        row.status === 'paid'
          ? 'Đã thanh toán'
          : row.status === 'overdue'
          ? 'Quá hạn'
          : 'Chưa thanh toán',
      'Hạn thanh toán': new Date(row.due_date).toLocaleDateString('vi-VN'),
    }))];

    const worksheet = XLSX.utils.json_to_sheet(dataWithHeader, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hóa đơn');

    // Map tên file theo trạng thái
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

  // Hàm lấy dữ liệu hóa đơn để sửa
  const fetchEditInvoiceData = async (invoiceId: number | null, form: any) => {
    if (!invoiceId) return;
    setEditLoading(true);
    try {
      const invoice = await getInvoiceById(invoiceId);
      const residentsData = await getResidents();
      setResidents(residentsData || []);

      // Gán giá trị mặc định cho các trường null/undefined
      form.setFieldsValue({
        resident_id: invoice.resident_id,
        billing_period: invoice.billing_period ? moment(invoice.billing_period, 'YYYY-MM') : undefined,
        due_date: invoice.due_date ? moment(invoice.due_date, 'YYYY-MM-DD') : undefined,
        amount: invoice.amount ?? 0,
        status: invoice.status || 'unpaid',
        room_price: invoice.room_price ?? 0,
        number_of_people: invoice.number_of_people ?? 0,
        electricity_start: invoice.electricity_start ?? 0,
        electricity_end: invoice.electricity_end ?? 0,
        electricity_rate: invoice.electricity_rate ?? 0,
        water_start: invoice.water_start ?? 0,
        water_end: invoice.water_end ?? 0,
        water_rate: invoice.water_rate ?? 0,
        internet_fee: invoice.internet_fee ?? 0,
        service_fee_per_person: invoice.service_fee_per_person ?? 0,
        invoice_number: invoice.invoice_number || '',
        resident_name: invoice.resident_name || '',
        apartment_number: invoice.apartment_number || '',
        id: invoice.id,
      });
    } catch (error: any) {
      message.error(error.message || 'Không thể tải thông tin hóa đơn');
    } finally {
      setEditLoading(false);
    }
  };

  // Hàm xử lý khi cập nhật hóa đơn
  const onFinishEditInvoice = async (invoiceId: number | null, values: any, residents: any[], onSuccess: () => void, onClose: () => void) => {
    if (!invoiceId) return;
    setEditLoading(true);
    try {
      const selectedResident = residents.find((r) => r.id === values.resident_id);
      // Nếu thiếu resident_name hoặc apartment_number thì lấy lại từ residents
      const resident_name = values.resident_name || selectedResident?.full_name || selectedResident?.name || '';
      const apartment_number = values.apartment_number || selectedResident?.apartment_number || selectedResident?.apartment || '';
      await updateInvoice(invoiceId, {
        resident_id: values.resident_id,
        resident_name,
        apartment_number,
        billing_period: values.billing_period.format('YYYY-MM'),
        amount: values.amount, // Đảm bảo truyền tổng tiền
        status: values.status,
        due_date: values.due_date.format('YYYY-MM-DD'),
        room_price: values.room_price ?? 0,
        number_of_people: values.number_of_people ?? 0,
        electricity_start: values.electricity_start ?? 0,
        electricity_end: values.electricity_end ?? 0,
        electricity_rate: values.electricity_rate ?? 0,
        water_start: values.water_start ?? 0,
        water_end: values.water_end ?? 0,
        water_rate: values.water_rate ?? 0,
        internet_fee: values.internet_fee ?? 0,
        service_fee_per_person: values.service_fee_per_person ?? 0,
        invoice_number: values.invoice_number || ''
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

  // Hàm lấy dữ liệu tài chính 
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

  // Hàm xóa hóa đơn
  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice(id);
      message.success('Xóa hóa đơn thành công');
      setInvoices(invoices.filter((i) => i.id !== id));
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xóa hóa đơn thất bại');
    }
  };

  // Hàm xác nhận thanh toán hóa đơn
  const handleConfirmPayment = async (id: number) => {
    try {
      await confirmPayment(id);
      message.success('Xác nhận thanh toán thành công');

      const updatedInvoices = invoices.map((i) =>
        i.id === id ? { ...i, status: 'paid' as 'paid', updated_at: new Date().toISOString() } : i
      );
      setInvoices(updatedInvoices);

      await fetchData({ search, period, status, residentId, dateRange, statsPeriod });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xác nhận thanh toán thất bại');
    }
  };

  // Hàm xem chi tiết hóa đơn
  const handleViewInvoice = async (id: number) => {
    try {
      const data = await getInvoiceById(id);
      setSelectedInvoice(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tải thông tin hóa đơn');
    }
  };

  // Hàm mở modal sửa hóa đơn
  const handleEditInvoice = (id: number) => {
    setEditingInvoiceId(id);
  };

  // Hàm đóng modal chi tiết hóa đơn
  const handleCloseDetails = () => {
    setSelectedInvoice(null);
  };

  // Hàm đóng modal sửa hóa đơn
  const handleCloseEdit = () => {
    setEditingInvoiceId(null);
  };

  // Hàm xử lý sau khi sửa hóa đơn thành công
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
    invoices, setInvoices, stats, setStats, loading, setLoading, search, setSearch,
    period, setPeriod, status, setStatus, residentId, setResidentId, statsPeriod,
    setStatsPeriod, dateRange, setDateRange, isAdmin, setIsAdmin, selectedInvoice,
    setSelectedInvoice, editingInvoiceId, setEditingInvoiceId, selectedStatus, setSelectedStatus,
    modalVisible, setModalVisible, residents, setResidents, editLoading, setEditLoading, COLORS,
    handleSelectChange, handleConfirmExport, exportToExcel, fetchData, handleDelete,
    handleConfirmPayment, handleViewInvoice, handleEditInvoice, handleCloseDetails,
    handleCloseEdit, handleEditSuccess, fetchEditInvoiceData, onFinishEditInvoice,
  };
};

// --- Custom Hook cho logic form Thêm hóa đơn ---
export const useAddInvoiceFormLogic = () => {
  const [submitting, setSubmitting] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]); // State cư dân riêng cho AddInvoiceForm
  const [loading, setLoading] = useState(false); // State loading riêng cho AddInvoiceForm
  const history = useHistory();

  // Hàm tạo số hóa đơn ngẫu nhiên (tái sử dụng từ AddInvoice.tsx ban đầu)
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HD${year}${month}${random}`;
  };

  // Hàm ép kiểu về số, nếu không hợp lệ trả về 0 (tái sử dụng từ AddInvoice.tsx ban đầu)
  const safeNumber = (v: any) => { const n = Number(v); return isNaN(n) ? 0 : n; };

  // Hàm xử lý khi gửi form (tái sử dụng từ AddInvoice.tsx ban đầu)
  const handleAddInvoiceSubmit = async (values: InvoiceFormData, totalAmount: number, form: any) => {
    setSubmitting(true);
    try {
      console.log('Form values:', values);
      if (!values.residentId || !values.resident_name || !values.apartment_number) {
        message.error('Vui lòng chọn cư dân hợp lệ để lấy tên và số căn hộ');
        setSubmitting(false);
        return;
      }

      const invoiceParams: CreateInvoiceParams = {
        resident_id: values.residentId,
        resident_name: values.resident_name,
        apartment_number: values.apartment_number,
        billing_period: values.month,
        amount: totalAmount,
        due_date: values.dueDate,
        status: values.paymentStatus,

        invoice_number: values.invoiceNumber,
        number_of_people: values.numberOfPeople,
        room_price: values.roomPrice,
        electricity_start: values.electricityStart,
        electricity_end: values.electricityEnd,
        electricity_rate: values.electricityRate,
        water_start: values.waterStart,
        water_end: values.waterEnd,
        water_rate: values.waterRate,
        internet_fee: values.internetFee,
        service_fee_per_person: values.serviceFeePerPerson,
      };
      await createInvoice(invoiceParams);
      message.success('Thêm hóa đơn thành công!');

      form.resetFields();
      form.setFieldsValue({
        invoiceNumber: generateInvoiceNumber(),
        paymentStatus: 'unpaid',
      });

      history.push('/dashboard/invoices', { refresh: true });
    } catch (error: any) {
      console.error('Submission error:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Lỗi khi thêm hóa đơn');
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm xử lý khi đặt lại form (tái sử dụng từ AddInvoice.tsx ban đầu)
  const handleAddInvoiceReset = (form: any) => {
    form.resetFields();
    form.setFieldsValue({
      invoiceNumber: generateInvoiceNumber(),
      paymentStatus: 'unpaid',
    });
    message.info('Đã đặt lại form');
  };

  // Hàm xử lý khi chọn cư dân (tái sử dụng từ AddInvoice.tsx ban đầu)
  const handleAddInvoiceResidentChange = (residentId: number, form: any) => {
    const selectedResident = residents.find((r) => r.id === residentId);
    console.log('Cư dân được chọn:', selectedResident);
    if (selectedResident) {
      form.setFieldsValue({
        residentId,
        resident_name: selectedResident.name,
        apartment_number: selectedResident.apartment,
      });
    } else {
      form.resetFields(['residentId', 'resident_name', 'apartment_number']);
      message.warning('Không tìm thấy cư dân với ID này');
    }
  };

  return {
    submitting, setSubmitting, // Cho phép component cập nhật submitting state
    residents, setResidents,   // Cho phép component cập nhật residents state
    loading, setLoading,       // Cho phép component cập nhật loading state
    generateInvoiceNumber,
    safeNumber,
    handleAddInvoiceSubmit,
    handleAddInvoiceReset,
    handleAddInvoiceResidentChange,
  };
};