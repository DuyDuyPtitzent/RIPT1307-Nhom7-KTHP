// components/invoice/EditInvoiceModal.tsx
 import React, { useEffect } from 'react';
 import { Modal, Form, Input, Button, DatePicker, Select, Row, Col, Card, Descriptions, Divider } from 'antd';
 import { useFinanceModel } from '@/models/finance';
 import { Invoice } from '@/services/types/finance';

 interface EditInvoiceModalProps {
  invoiceId: number | null;
  onClose: () => void;
  onSuccess: () => void;
 }

 const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({ invoiceId, onClose, onSuccess }) => {
  const [form] = Form.useForm<Invoice>();
  const { residents, editLoading, fetchEditInvoiceData, onFinishEditInvoice } = useFinanceModel();

  useEffect(() => {
    if (invoiceId) {
      fetchEditInvoiceData(invoiceId, form).then(() => {
        // Lấy dữ liệu cũ từ form (sau khi fetch) và set lại đúng các trường snake_case
        const values = form.getFieldsValue();
        const moment = require('moment');
        form.setFieldsValue({
          resident_id: values.resident_id,
          billing_period: values.billing_period ? moment(values.billing_period, [moment.ISO_8601, 'YYYY-MM']) : undefined,
          room_price: values.room_price === null ? undefined : values.room_price,
          number_of_people: values.number_of_people === null ? undefined : values.number_of_people,
          electricity_start: values.electricity_start === null ? undefined : values.electricity_start,
          electricity_end: values.electricity_end === null ? undefined : values.electricity_end,
          electricity_rate: values.electricity_rate === null ? undefined : values.electricity_rate,
          water_start: values.water_start === null ? undefined : values.water_start,
          water_end: values.water_end === null ? undefined : values.water_end,
          water_rate: values.water_rate === null ? undefined : values.water_rate,
          internet_fee: values.internet_fee === null ? undefined : values.internet_fee,
          service_fee_per_person: values.service_fee_per_person === null ? undefined : values.service_fee_per_person,
          status: values.status,
          due_date: values.due_date ? moment(values.due_date, [moment.ISO_8601, 'YYYY-MM-DD']) : undefined,
          // Patch các trường phụ nếu có
          resident_name: values.resident_name,
          apartment_number: values.apartment_number,
          id: values.id,
        });
      });
    } else {
      form.resetFields();
    }

  }, [invoiceId]);

  // Patch resident_name/apartment_number nếu thiếu, chỉ khi residents hoặc resident_id đổi
  useEffect(() => {
    const values = form.getFieldsValue();
    if ((!values.resident_name || !values.apartment_number) && values.resident_id) {
      const selectedResident = residents.find((r) => r.id === values.resident_id);
      if (selectedResident) {
        form.setFieldsValue({
          resident_name: selectedResident.full_name || selectedResident.name || '',
          apartment_number: selectedResident.apartment_number || selectedResident.apartment || '',
        });
      }
    }
 
  }, [residents, invoiceId]);

  const handleFinish = (values: Invoice) => {
    // Gửi tổng tiền (amount) đúng với tính toán hiện tại
    onFinishEditInvoice(invoiceId, { ...values, amount: totalAmount }, residents, onSuccess, onClose);
  };

  // Watch form values for calculations
  const values = Form.useWatch([], form);
  const safeNumber = (value: any) => (typeof value === 'number' ? value : Number(value) || 0);

  // Tự động tính toán khi các trường liên quan thay đổi
  const electricityConsumption = values
    ? Math.max(0, safeNumber(values.electricity_end) - safeNumber(values.electricity_start))
    : 0;
  const electricityAmount = electricityConsumption * safeNumber(values?.electricity_rate);
  const waterConsumption = values ? Math.max(0, safeNumber(values.water_end) - safeNumber(values.water_start)) : 0;
  const waterAmount = waterConsumption * safeNumber(values?.water_rate);
  const serviceAmount = values ? safeNumber(values.number_of_people) * safeNumber(values.service_fee_per_person) : 0;
  const totalAmount =
    safeNumber(values?.room_price) +
    safeNumber(electricityAmount) +
    safeNumber(waterAmount) +
    safeNumber(values?.internet_fee) +
    safeNumber(serviceAmount);

  return (
    <Modal
      title="Chỉnh sửa hóa đơn"
      open={!!invoiceId}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Cư dân"
              name="resident_id"
              rules={[{ required: true, message: 'Vui lòng chọn cư dân' }]}
            >
              <Select
                placeholder="Chọn cư dân"
                loading={editLoading}
                disabled={!!invoiceId}
                showSearch
                optionFilterProp="children"
              >
                {residents.map((resident) => (
                  <Select.Option key={resident.id} value={resident.id}>
                    {resident.full_name} (Căn hộ: {resident.apartment_number})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Kỳ thu"
              name="billing_period"
              rules={[{ required: true, message: 'Vui lòng chọn kỳ thu' }]}
            >
              <DatePicker picker="month" format="YYYY-MM" disabled={editLoading} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số tiền phòng (VND)"
              name="room_price"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền phòng' }]}
            >
              <Input type="number" disabled={editLoading} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số người"
              name="number_of_people"
              rules={[{ required: true, message: 'Vui lòng nhập số người' }]}
            >
              <Input type="number" disabled={editLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Card title="Thông tin điện" className="mb-4 bg-yellow-50 border-yellow-200">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số điện đầu"
                name="electricity_start"
                rules={[{ required: true, message: 'Vui lòng nhập số điện đầu' }]}
              >
                <Input type="number" disabled={editLoading} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số điện cuối"
                name="electricity_end"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện cuối' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value !== undefined && value < (getFieldValue('electricity_start') || 0)) {
                        return Promise.reject('Số điện cuối phải lớn hơn hoặc bằng số điện đầu');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" disabled={editLoading} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giá điện (VNĐ/kWh)"
                name="electricity_rate"
                rules={[{ required: true, message: 'Vui lòng nhập giá điện' }]}
              >
                <Input type="number" disabled={editLoading} />
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

        <Card title="Thông tin nước" className="mb-4 bg-blue-50 border-blue-200">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số nước đầu"
                name="water_start"
                rules={[{ required: true, message: 'Vui lòng nhập số nước đầu' }]}
              >
                <Input type="number" disabled={editLoading} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số nước cuối"
                name="water_end"
                rules={[
                  { required: true, message: 'Vui lòng nhập số nước cuối' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value !== undefined && value < (getFieldValue('water_start') || 0)) {
                        return Promise.reject('Số nước cuối phải lớn hơn hoặc bằng số nước đầu');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" disabled={editLoading} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giá nước (VNĐ/m³)"
                name="water_rate"
                rules={[{ required: true, message: 'Vui lòng nhập giá nước' }]}
              >
                <Input type="number" disabled={editLoading} />
              </Form.Item>
            </Col>
          </Row>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Số nước tiêu thụ">
              {waterConsumption.toLocaleString('vi-VN')} m³
            </Descriptions.Item>
            <Descriptions.Item label="Tiền nước">{waterAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
          </Descriptions>
        </Card>

        <Form.Item
          label="Phí internet (VNĐ)"
          name="internet_fee"
          rules={[{ required: true, message: 'Vui lòng nhập phí internet' }]}
        >
          <Input type="number" disabled={editLoading} />
        </Form.Item>

        <Form.Item
          label="Phí dịch vụ mỗi người (VNĐ)"
          name="service_fee_per_person"
          rules={[{ required: true, message: 'Vui lòng nhập phí dịch vụ' }]}
        >
          <Input type="number" disabled={editLoading} />
        </Form.Item>

        <Form.Item
          label="Trạng thái thanh toán"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select disabled={editLoading}>
            <Select.Option value="unpaid">Chưa thanh toán</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            {/* Đã có Form.Item billing_period ở trên, không cần lặp lại */}
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày đến hạn"
              name="due_date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đến hạn' }]}
            >
              <DatePicker format="YYYY-MM-DD" disabled={editLoading} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Divider />

        <Descriptions title="Tổng hợp chi phí" bordered column={1} className="mb-4">
          <Descriptions.Item label="Tiền phòng">
            {(values?.room_price || 0).toLocaleString('vi-VN')} VNĐ
          </Descriptions.Item>
          <Descriptions.Item label="Tiền điện">{electricityAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
          <Descriptions.Item label="Tiền nước">{waterAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
          <Descriptions.Item label="Phí internet">
            {(values?.internet_fee || 0).toLocaleString('vi-VN')} VNĐ
          </Descriptions.Item>
          <Descriptions.Item label="Phí dịch vụ">{serviceAmount.toLocaleString('vi-VN')} VNĐ</Descriptions.Item>
          <Descriptions.Item label="TỔNG TIỀN">
            <strong>{totalAmount.toLocaleString('vi-VN')} VNĐ</strong>
          </Descriptions.Item>
        </Descriptions>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={editLoading}>
            Cập nhật hóa đơn
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditInvoiceModal;