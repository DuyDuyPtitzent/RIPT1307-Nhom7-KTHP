import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Row, Col, Modal, Tag } from 'antd';
import { useHistory } from 'umi';
import { getMaterials, deleteMaterial } from '../../services/materials';
import { getCurrentUser } from '../../services/auth';
import TableActions from '../../components/TableActions';
import EditMaterialForm from '@/components/materials/EditMaterialForm';
import AddMaterialForm from '@/components/materials/AddMaterialForm';
import MaterialDetailsModal from '@/components/materials/MaterialDetailsModal'; // ✅ Đã thêm

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [manager, setManager] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalEditVisible, setModalEditVisible] = useState(false);

  const [modalAddVisible, setModalAddVisible] = useState(false);

  const [viewingId, setViewingId] = useState<number | null>(null);
  const [modalViewVisible, setModalViewVisible] = useState(false);

  const history = useHistory();

  useEffect(() => {
    fetchUserAndMaterials();
  }, [search, manager]);

  const fetchUserAndMaterials = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (user.role !== 'admin') {
        message.error('Bạn không có quyền truy cập');
        history.push('/dashboard/residents');
        return;
      }
      setIsAdmin(true);
      const materialsData = await getMaterials({ search, manager });
      setMaterials(materialsData || []);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách vật tư');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id);
      message.success('Xóa vật tư thành công');
      setMaterials(materials.filter((m: any) => m.id !== id));
    } catch (error: any) {
      message.error(error.message || 'Xóa vật tư thất bại');
    }
  };

  const openEditModal = (id: number) => {
    setEditingId(id);
    setModalEditVisible(true);
  };

  const openViewModal = (id: number) => {
    setViewingId(id);
    setModalViewVisible(true);
  };

  const handleUpdateSuccess = () => {
    setModalEditVisible(false);
    setEditingId(null);
    fetchUserAndMaterials();
  };

  const handleAddSuccess = () => {
    setModalAddVisible(false);
    fetchUserAndMaterials();
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
