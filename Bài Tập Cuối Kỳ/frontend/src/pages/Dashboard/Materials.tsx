import React, { useEffect } from 'react';
import { Table, Button, Input,  Row, Col, Modal, Tag } from 'antd';
import TableActions from '@/components/TableActions';
import EditMaterialForm from '@/components/materials/EditMaterialForm';
import AddMaterialForm from '@/components/materials/AddMaterialForm';
import MaterialDetailsModal from '@/components/materials/MaterialDetailsModal';
import { useMaterialsModel } from '@/models/Materials';

const Materials: React.FC = () => {
  const {
    materials,
    loading,
    search,
    manager,
    isAdmin,
    editingId,
    modalEditVisible,
    modalAddVisible,
    viewingId,
    modalViewVisible,
    setSearch,
    setManager,
    setEditingId,
    setModalEditVisible,
    setModalAddVisible,
    setViewingId,
    setModalViewVisible,
    fetchUserAndMaterials,
    handleDelete,
  } = useMaterialsModel();

  useEffect(() => {
    fetchUserAndMaterials();
  }, [search, manager]);

  const handleUpdateSuccess = () => {
    setModalEditVisible(false);
    setEditingId(null);
    fetchUserAndMaterials();
  };

  const handleAddSuccess = () => {
    setModalAddVisible(false);
    fetchUserAndMaterials();
  };

  const openEditModal = (id: number) => {
    setEditingId(id);
    setModalEditVisible(true);
  };

  const openViewModal = (id: number) => {
    setViewingId(id);
    setModalViewVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <span>
          {quantity}{' '}
          {quantity <= record.lowStockThreshold && (
            <Tag color="red">Tồn kho thấp</Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Người quản lý',
      dataIndex: 'managed_by',
      key: 'managed_by',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <TableActions
          onView={() => openViewModal(record.id)}
          onEdit={() => openEditModal(record.id)}
          onDelete={() => handleDelete(record.id)}
          isAdmin={isAdmin}
        />
      ),
    },
  ];

  return (
    <div className="authContainer">
      <h2>Quản lý vật tư</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên vật tư"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Input
            placeholder="Tìm theo người quản lý"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
          />
        </Col>
        {isAdmin && (
          <Col span={8}>
            <Button type="primary" onClick={() => setModalAddVisible(true)}>
              Thêm vật tư
            </Button>
          </Col>
        )}
      </Row>

      <Table
        columns={columns}
        dataSource={materials}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa vật tư"
        open={modalEditVisible}
        onCancel={() => {
          setModalEditVisible(false);
          setEditingId(null);
        }}
        footer={null}
        destroyOnClose
      >
        {editingId && (
          <EditMaterialForm materialId={editingId} onSuccess={handleUpdateSuccess} />
        )}
      </Modal>

      {/* Modal thêm */}
      <Modal
        title="Thêm vật tư mới"
        open={modalAddVisible}
        onCancel={() => setModalAddVisible(false)}
        footer={null}
        destroyOnClose
      >
        <AddMaterialForm onSuccess={handleAddSuccess} />
      </Modal>

      {/* Modal xem chi tiết */}
      <MaterialDetailsModal
        materialId={viewingId!}
        open={modalViewVisible}
        onClose={() => {
          setModalViewVisible(false);
          setViewingId(null);
        }}
      />
    </div>
  );
};

export default Materials;
