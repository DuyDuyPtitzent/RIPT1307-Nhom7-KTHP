// components/invoice/ExportExcelSection.tsx
import React from 'react';
import { Row, Col, Select, Modal } from 'antd';
import { useFinanceModel } from '@/models/finance';
// Import hook mô hình tài chính để truy cập state và các hành động
const { Option } = Select;

const ExportExcelSection: React.FC = () => {
  const { selectedStatus, modalVisible, setModalVisible, handleSelectChange, handleConfirmExport, exportToExcel } = useFinanceModel();

  return (
    <>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col>
          <Select defaultValue="all" value={selectedStatus} onChange={handleSelectChange}>
            <Option value="all">Xuất tất cả</Option>
            <Option value="paid">Xuất đã thanh toán</Option>
            <Option value="unpaid">Xuất chưa thanh toán</Option>
            <Option value="overdue">Xuất quá hạn</Option>
          </Select>
        </Col>
      </Row>

      <Modal
        title="Xác nhận xuất Excel"
        open={modalVisible}
        onOk={() => handleConfirmExport(exportToExcel)}
        onCancel={() => setModalVisible(false)}
        okText="Xuất"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xuất danh sách hóa đơn?</p>
      </Modal>
    </>
  );
};

export default ExportExcelSection;