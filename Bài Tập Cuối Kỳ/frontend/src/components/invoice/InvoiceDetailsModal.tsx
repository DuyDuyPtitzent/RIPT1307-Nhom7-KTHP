import React from 'react';
import { Descriptions, Modal, Divider } from 'antd'; // Import Divider

interface InvoiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: any; 
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ visible, onClose, invoice }) => {
  if (!invoice) return null;

  // Hàm trợ giúp để lấy giá trị số một cách an toàn
  const safeNumber = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  // Map lại dữ liệu hóa đơn để hỗ trợ cả snake_case và camelCase
  const invoiceData = {
    numberOfPeople: invoice.numberOfPeople ?? invoice.number_of_people,
    roomPrice: invoice.roomPrice ?? invoice.room_price,
    electricityStart: invoice.electricityStart ?? invoice.electricity_start,
    electricityEnd: invoice.electricityEnd ?? invoice.electricity_end,
    electricityRate: invoice.electricityRate ?? invoice.electricity_rate,
    waterStart: invoice.waterStart ?? invoice.water_start,
    waterEnd: invoice.waterEnd ?? invoice.water_end,
    waterRate: invoice.waterRate ?? invoice.water_rate,
    internetFee: invoice.internetFee ?? invoice.internet_fee,
    serviceFeePerPerson: invoice.serviceFeePerPerson ?? invoice.service_fee_per_person,
    amount: invoice.amount,
  };

  // Tính toán lại các khoản tiền dựa trên dữ liệu hóa đơn nếu chúng được lưu trữ dưới dạng các trường riêng lẻ
  const electricityConsumption = Math.max(0, safeNumber(invoiceData.electricityEnd) - safeNumber(invoiceData.electricityStart));
  const electricityAmount = electricityConsumption * safeNumber(invoiceData.electricityRate);
  const waterConsumption = Math.max(0, safeNumber(invoiceData.waterEnd) - safeNumber(invoiceData.waterStart));
  const waterAmount = waterConsumption * safeNumber(invoiceData.waterRate);
  const serviceAmount = safeNumber(invoiceData.numberOfPeople) * safeNumber(invoiceData.serviceFeePerPerson);

  return (
    <Modal
      title="Chi tiết hóa đơn"
      open={visible}
      onCancel={onClose}
      onOk={onClose}
      width={800}
      footer={null} // Xóa các nút OK/Cancel mặc định nếu không cần
    >
      <Descriptions bordered column={1} className="mb-4">
        <Descriptions.Item label="ID">{invoice.id}</Descriptions.Item>
        <Descriptions.Item label="Số hóa đơn">{invoice.invoice_number || 'N/A'} </Descriptions.Item>
        <Descriptions.Item label="Cư dân">{invoice.resident_name}</Descriptions.Item>
        <Descriptions.Item label="Căn hộ">{invoice.apartment_number}</Descriptions.Item>
        <Descriptions.Item label="Kỳ thu">{invoice.billing_period}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{invoice.status}</Descriptions.Item>
        <Descriptions.Item label="Hạn thanh toán">{new Date(invoice.due_date).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{new Date(invoice.created_at).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">{invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Thông tin chi tiết</Divider>

      <Descriptions bordered column={1} className="mb-4">
        <Descriptions.Item label="Số người">{invoiceData.numberOfPeople ?? 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Giá phòng">
          {invoiceData.roomPrice !== undefined && invoiceData.roomPrice !== null
            ? safeNumber(invoiceData.roomPrice).toLocaleString('vi-VN') + ' VNĐ'
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={1} className="mb-4" title="Thông tin điện">
        <Descriptions.Item label="Số điện đầu">{invoiceData.electricityStart ?? 'N/A'} kWh</Descriptions.Item>
        <Descriptions.Item label="Số điện cuối">{invoiceData.electricityEnd ?? 'N/A'} kWh</Descriptions.Item>
        <Descriptions.Item label="Giá điện">{invoiceData.electricityRate !== undefined && invoiceData.electricityRate !== null ? safeNumber(invoiceData.electricityRate).toLocaleString('vi-VN') + ' VNĐ/kWh' : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Số điện tiêu thụ">
          {invoiceData.electricityStart !== undefined && invoiceData.electricityEnd !== undefined && invoiceData.electricityStart !== null && invoiceData.electricityEnd !== null
            ? electricityConsumption.toLocaleString('vi-VN') + ' kWh'
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền điện">{invoiceData.electricityStart !== undefined && invoiceData.electricityEnd !== undefined && invoiceData.electricityStart !== null && invoiceData.electricityEnd !== null
          ? electricityAmount.toLocaleString('vi-VN') + ' VNĐ'
          : 'N/A'}</Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={1} className="mb-4" title="Thông tin nước">
        <Descriptions.Item label="Số nước đầu">{invoiceData.waterStart ?? 'N/A'} m³</Descriptions.Item>
        <Descriptions.Item label="Số nước cuối">{invoiceData.waterEnd ?? 'N/A'} m³</Descriptions.Item>
        <Descriptions.Item label="Giá nước">{invoiceData.waterRate !== undefined && invoiceData.waterRate !== null ? safeNumber(invoiceData.waterRate).toLocaleString('vi-VN') + ' VNĐ/m³' : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Số nước tiêu thụ">
          {invoiceData.waterStart !== undefined && invoiceData.waterEnd !== undefined && invoiceData.waterStart !== null && invoiceData.waterEnd !== null
            ? waterConsumption.toLocaleString('vi-VN') + ' m³'
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền nước">{invoiceData.waterStart !== undefined && invoiceData.waterEnd !== undefined && invoiceData.waterStart !== null && invoiceData.waterEnd !== null
          ? waterAmount.toLocaleString('vi-VN') + ' VNĐ'
          : 'N/A'}</Descriptions.Item>
      </Descriptions>

      <Descriptions bordered column={1} className="mb-4">
        <Descriptions.Item label="Phí internet">
          {invoiceData.internetFee !== undefined && invoiceData.internetFee !== null ? safeNumber(invoiceData.internetFee).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Phí dịch vụ mỗi người">
          {invoiceData.serviceFeePerPerson !== undefined && invoiceData.serviceFeePerPerson !== null ? safeNumber(invoiceData.serviceFeePerPerson).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng phí dịch vụ">
          {invoiceData.numberOfPeople !== undefined && invoiceData.serviceFeePerPerson !== undefined && invoiceData.numberOfPeople !== null && invoiceData.serviceFeePerPerson !== null
            ? serviceAmount.toLocaleString('vi-VN') + ' VNĐ'
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions title="Tổng hợp chi phí" bordered column={1} className="mb-4">
        <Descriptions.Item label="Tiền phòng">
          {invoiceData.roomPrice !== undefined && invoiceData.roomPrice !== null ? safeNumber(invoiceData.roomPrice).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền điện">{invoiceData.electricityStart !== undefined && invoiceData.electricityEnd !== undefined && invoiceData.electricityStart !== null && invoiceData.electricityEnd !== null
          ? electricityAmount.toLocaleString('vi-VN') + ' VNĐ'
          : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Tiền nước">{invoiceData.waterStart !== undefined && invoiceData.waterEnd !== undefined && invoiceData.waterStart !== null && invoiceData.waterEnd !== null
          ? waterAmount.toLocaleString('vi-VN') + ' VNĐ'
          : 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Phí internet">
          {invoiceData.internetFee !== undefined && invoiceData.internetFee !== null ? safeNumber(invoiceData.internetFee).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Phí dịch vụ">
          {invoiceData.numberOfPeople !== undefined && invoiceData.serviceFeePerPerson !== undefined && invoiceData.numberOfPeople !== null && invoiceData.serviceFeePerPerson !== null
            ? serviceAmount.toLocaleString('vi-VN') + ' VNĐ'
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="TỔNG TIỀN">
          <strong style={{ fontSize: '1.2em', color: '#1890ff' }}>
            {invoiceData.amount !== undefined && invoiceData.amount !== null ? safeNumber(invoiceData.amount).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}
          </strong>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default InvoiceDetailModal;