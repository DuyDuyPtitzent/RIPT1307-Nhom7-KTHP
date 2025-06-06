// AddInvoice.tsx
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Card, Descriptions, Spin, message, Row, Col, Divider } from 'antd';
// Bỏ useHistory, createInvoice, getResidents vì đã được bao bọc trong hook mới
import { InvoiceFormData } from '@/services/types/finance'; // Chỉ cần type
import { useAddInvoiceFormLogic } from '@/models/finance'; // Import hook mới

const { Option } = Select;

const AddInvoiceForm: React.FC = () => {
  const [form] = Form.useForm<InvoiceFormData>();

  // Sử dụng custom hook mới để lấy các state, var, const và handlers
  const {
    submitting, 
    residents, setResidents,
    loading, setLoading,
    generateInvoiceNumber,
    handleAddInvoiceSubmit,
    handleAddInvoiceReset,
    handleAddInvoiceResidentChange,
  } = useAddInvoiceFormLogic(); // Gọi hook mới

  // Khởi tạo dữ liệu form và lấy danh sách cư dân (giữ nguyên useEffect)
  useEffect(() => {
    const fetchResidents = async () => {
      setLoading(true);
      try {
        const { getResidents } = await import('@/services/residents');
        const residentsData = await getResidents();
        console.log('Residents data:', residentsData);
        if (!residentsData || residentsData.length === 0) {
          message.warning('Không tìm thấy cư dân nào. Vui lòng thêm cư dân trước.');
        }
        const mappedResidents = (residentsData || []).map((r: any) => ({
          ...r,
          name: r.name || r.full_name || '',
          apartment: r.apartment || r.apartment_number || '',
        }));
        setResidents(mappedResidents);
      } catch (error: any) {
        console.error('Error fetching residents:', error);
        message.error(error.response?.data?.message || 'Lỗi khi tải danh sách cư dân');
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();

    form.setFieldsValue({
      invoiceNumber: generateInvoiceNumber(),
      paymentStatus: 'unpaid',
    });
  }, [form]); // Chỉ truyền form, không truyền các function hoặc state khác

  // Tính toán các chi phí (dùng camelCase cho values)
  const values = Form.useWatch([], form) as any;
  const electricityConsumption = values
    ? Math.max(0, Number(values.electricityEnd) - Number(values.electricityStart))
    : 0;
  const electricityAmount = electricityConsumption * Number(values?.electricityRate || 0);
  const waterConsumption = values
    ? Math.max(0, Number(values.waterEnd) - Number(values.waterStart))
    : 0;
  const waterAmount = waterConsumption * Number(values?.waterRate || 0);
  const serviceAmount = values ? Number(values.numberOfPeople || 0) * Number(values.serviceFeePerPerson || 0) : 0;
  const totalAmount =
    Number(values?.roomPrice || 0) +
    Number(electricityAmount) +
    Number(waterAmount) +
    Number(values?.internetFee || 0) +
    Number(serviceAmount);

  // Xử lý khi gửi form
  const handleSubmit = (formValues: InvoiceFormData) => {
    let billing_period = '';
    let due_date = '';
    if (formValues.month) {
      if (typeof formValues.month === 'string') {
        billing_period = formValues.month;
      } else if (
        typeof formValues.month === 'object' &&
        formValues.month !== null &&
        typeof (formValues.month as any).format === 'function'
      ) {
        billing_period = (formValues.month as any).format('YYYY-MM');
      }
    }
    if (formValues.dueDate) {
      if (typeof formValues.dueDate === 'string') {
        due_date = formValues.dueDate;
      } else if (
        typeof formValues.dueDate === 'object' &&
        formValues.dueDate !== null &&
        typeof (formValues.dueDate as any).format === 'function'
      ) {
        due_date = (formValues.dueDate as any).format('YYYY-MM-DD');
      }
    }
    const submitValues = {
      ...formValues,
      billing_period,
      due_date,
    };
    handleAddInvoiceSubmit(submitValues, totalAmount, form);
  };

  // Xử lý khi đặt lại form
  const handleReset = () => {
    handleAddInvoiceReset(form); // Truyền form instance vào handler từ hook
  };

  // Xử lý khi chọn cư dân
  const handleResidentChange = (residentId: number) => {
    handleAddInvoiceResidentChange(residentId, form); // Truyền form instance vào handler từ hook
  };

  // Các giá trị watch từ form để hiển thị
  const residentId = Form.useWatch('residentId', form);
  const residentName = Form.useWatch('resident_name', form);
  const apartmentNumber = Form.useWatch('apartment_number', form);

  if (loading) { // Sử dụng loading từ hook
    return <Spin tip="Đang tải dữ liệu..." />;
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Card title="Thêm hóa đơn mới" className="max-w-3xl mx-auto shadow-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            invoiceNumber: generateInvoiceNumber(),
            paymentStatus: 'unpaid',
          }}
        >
          {/* Số hóa đơn */}
          <Form.Item label="Số hóa đơn" name="invoiceNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="resident_name"
            noStyle
            rules={[{ required: true, message: 'Tên cư dân là bắt buộc' }]}
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="apartment_number"
            noStyle
            rules={[{ required: true, message: 'Số căn hộ là bắt buộc' }]}
          >
            <Input type="hidden" />
          </Form.Item>
          {/* Lựa chọn cư dân */}
          <Form.Item
            label="Cư dân"
            name="residentId"
            rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
          >
            <Select
              placeholder="Chọn cư dân"
              onChange={handleResidentChange}
              showSearch
              optionFilterProp="children"
            >
              {residents.map((resident) => ( // Sử dụng residents từ hook
                <Option key={resident.id} value={resident.id}>
                  {resident.id} - {resident.name} ({resident.apartment})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Thông tin cư dân */}
          {residentId && (
            <Descriptions bordered size="small" column={2} className="mb-4">
              <Descriptions.Item label="Tên cư dân">{residentName}</Descriptions.Item>
              <Descriptions.Item label="Căn hộ">{apartmentNumber}</Descriptions.Item>
            </Descriptions>
          )}

          {/* Số người và Giá phòng */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số người"
                name="numberOfPeople"
                rules={[{ required: true, message: 'Vui lòng nhập số người' }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá phòng (VNĐ)"
                name="roomPrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá phòng' }]}
              >
                <Input type="number" min={0} step={10000} />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin điện */}
          <Card title="Thông tin điện" className="mb-4 bg-yellow-50 border-yellow-200">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Số điện đầu"
                  name="electricityStart"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện đầu' }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Số điện cuối"
                  name="electricityEnd"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện cuối' },
                    {
                      validator: async (_, value) => {
                        if (value !== undefined && value < (values?.electricityStart || 0)) {
                          return Promise.reject('Số điện cuối phải lớn hơn hoặc bằng số điện đầu');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Giá điện (VNĐ/kWh)"
                  name="electricityRate"
                  rules={[{ required: true, message: 'Vui lòng nhập giá điện' }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Descriptions bordered size="small">
              <Descriptions.Item label="Số điện tiêu thụ">
                {electricityConsumption.toLocaleString('vi-VN')} kWh
              </Descriptions.Item>
              <Descriptions.Item label="Tiền điện">
                {electricityAmount.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin nước */}
          <Card title="Thông tin nước" className="mb-4 bg-blue-50 border-blue-200">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Số nước đầu"
                  name="waterStart"
                  rules={[{ required: true, message: 'Vui lòng nhập số nước đầu' }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Số nước cuối"
                  name="waterEnd"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số nước cuối' },
                    {
                      validator: async (_, value) => {
                        if (value !== undefined && value < (values?.waterStart || 0)) {
                          return Promise.reject('Số nước cuối phải lớn hơn hoặc bằng số nước đầu');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Giá nước (VNĐ/m³)"
                  name="waterRate"
                  rules={[{ required: true, message: 'Vui lòng nhập giá nước' }]}
                >
                  <Input type="number" min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Descriptions bordered size="small">
              <Descriptions.Item label="Số nước tiêu thụ">
                {waterConsumption.toLocaleString('vi-VN')} m³
              </Descriptions.Item>
              <Descriptions.Item label="Tiền nước">
                {waterAmount.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Phí internet */}
          <Form.Item
            label="Phí internet (VNĐ)"
            name="internetFee"
            rules={[{ required: true, message: 'Vui lòng nhập phí internet' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          {/* Phí dịch vụ */}
          <Form.Item
            label="Phí dịch vụ mỗi người (VNĐ)"
            name="serviceFeePerPerson"
            rules={[{ required: true, message: 'Vui lòng nhập phí dịch vụ' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          {/* Trạng thái thanh toán */}
          <Form.Item
            label="Trạng thái thanh toán"
            name="payment_status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="unpaid">Chưa thanh toán</Option>

            </Select>
          </Form.Item>

          {/* Tháng thanh toán và Ngày đến hạn */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tháng thanh toán"
                name="month"
                rules={[{ required: true, message: 'Vui lòng chọn tháng' }]}
              >
                <Input type="month" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày đến hạn"
                name="dueDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đến hạn' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Tổng hợp chi phí */}
          <Descriptions title="Tổng hợp chi phí" bordered column={1} className="mb-4">
            <Descriptions.Item label="Tiền phòng">
              {(values?.roomPrice || 0).toLocaleString('vi-VN')} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Tiền điện">{electricityAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Tiền nước">{waterAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Phí internet">
              {(values?.internetFee || 0).toLocaleString('vi-VN')} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Phí dịch vụ">
              {serviceAmount.toLocaleString('vi-VN')} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="TỔNG TIỀN">
              <strong>{totalAmount.toLocaleString('vi-VN')} VNĐ</strong>
            </Descriptions.Item>
          </Descriptions>

          {/* Nút bấm */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting} // Sử dụng submitting từ hook
              disabled={
                !(
                  residentId &&
                  residentName &&
                  apartmentNumber &&
                  values?.month &&
                  values?.dueDate
                )
              }
              className="mr-2"
            >
              Thêm hóa đơn
            </Button>
            <Button htmlType="button" onClick={handleReset}>
              Đặt lại
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddInvoiceForm;