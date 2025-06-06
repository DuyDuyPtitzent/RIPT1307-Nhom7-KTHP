import React, { useEffect } from 'react';
import { Table, Button, Input, Row, Col, Modal } from 'antd';
import { useHistory } from 'umi';
import TableActions from '../../components/TableActions';
import Header from '@/components/Header';
import ResidentEditForm from '@/components/residents/ResidentEditForm';
import ResidentAddForm from '@/components/residents/ResidentAddForm';
import { useResidentsModel } from '@/models/Resident';

const Residents: React.FC = () => {
  const {
    residents,
    loading,
    search,
    apartment,
    isAdmin,
    editResidentId,
    addModalVisible,
    setSearch,
    setApartment,
    setEditResidentId,
    setAddModalVisible,
    fetchUserAndResidents,
    handleDelete,
  } = useResidentsModel();

  const history = useHistory();

  useEffect(() => {
    fetchUserAndResidents();
  }, [search, apartment]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Số căn hộ',
      dataIndex: 'apartment_number',
      key: 'apartment_number',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <TableActions
          onView={() => history.push(`/dashboard/residents/details/${record.id}`)}
          onEdit={() => setEditResidentId(record.id)}
          onDelete={() => handleDelete(record.id)}
          isAdmin={isAdmin}
        />
      ),
    },
  ];

  return (
    <>
      <Header />
      <div style={{ padding: '24px', minHeight: 'calc(100vh - 128px)' }}>
        <h2>Quản lý dân cư</h2>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm theo tên, email, số điện thoại"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Input
              placeholder="Tìm theo số căn hộ"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </Col>
          {isAdmin && (
            <Col span={8}>
              <Button type="primary" onClick={() => setAddModalVisible(true)}>
                Thêm cư dân
              </Button>
            </Col>
          )}
        </Row>

        <Table
          columns={columns}
          dataSource={residents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Chỉnh sửa cư dân"
          open={!!editResidentId}
          onCancel={() => setEditResidentId(null)}
          footer={null}
          destroyOnClose
        >
          {editResidentId && (
            <ResidentEditForm
              residentId={editResidentId}
              onSuccess={async () => {
                setEditResidentId(null);
                await fetchUserAndResidents();
              }}
              onCancel={() => setEditResidentId(null)}
            />
          )}
        </Modal>

        <Modal
          title="Thêm cư dân mới"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <ResidentAddForm
            onSuccess={async () => {
              setAddModalVisible(false);
              await fetchUserAndResidents();
            }}
            onCancel={() => setAddModalVisible(false)}
          />
        </Modal>
      </div>
    </>
  );
};

export default Residents;

