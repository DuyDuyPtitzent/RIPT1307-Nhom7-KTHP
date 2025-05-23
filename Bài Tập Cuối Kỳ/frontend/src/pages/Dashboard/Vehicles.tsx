import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Select, Modal } from 'antd';
import SearchBar from '../../components/SearchBar';
import TableActions from '../../components/TableActions';
import AddVehicleForm from '@/components/vehicle/AddVehicleForm';
import EditVehicleForm from '@/components/vehicle/EditVehicleForm';
import { getCurrentUser } from '../../services/auth';
import useVehicleModel from '../../models/vehicles';
import { getVehicleTypeName } from '@/utils/helpers';

const { Option } = Select;

const Vehicles: React.FC = () => {
  const {
    vehicles,
    loading,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    fetchVehicles,
    handleDelete,
    handleApprove,
    handleReject,
    viewVehicle,
    isViewModalVisible,
    openViewModal,
    closeViewModal,
  } = useVehicleModel();
  const [isAdmin, setIsAdmin] = useState(false);
  const [residentId, setResidentId] = useState<number | undefined>();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log('Current user:', user);
        setIsAdmin(user.role === 'admin');
        setResidentId(user.role !== 'admin' ? user.resident_id : undefined);
        fetchVehicles(user.role !== 'admin' ? user.resident_id : undefined);
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
      }
    };
    fetchUser();
  }, [fetchVehicles]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchVehicles(residentId);
  };

  const handleAction = (action: string, id: number) => {
    console.log('Handle action:', action, 'for vehicle ID:', id);
    if (action === 'view') {
      openViewModal(id);
    } else if (action === 'edit') {
      const vehicle = vehicles.find(v => v.id === id);
      if (isAdmin || vehicle?.resident_id === residentId) {
        console.log('Opening edit modal for ID:', id);
        setEditingVehicleId(id);
        setIsEditModalVisible(true);
      } else {
        console.error('Không có quyền chỉnh sửa phương tiện:', id);
      }
    } else if (action === 'delete' && isAdmin) {
      handleDelete(id);
    }
  };

  const showAddVehicleModal = () => {
    setIsAddModalVisible(true);
  };

  const handleModalClose = () => {
    setIsAddModalVisible(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingVehicleId(null);
    fetchVehicles(residentId); // Làm mới danh sách sau khi chỉnh sửa
  };

  const handleAddSuccess = () => {
    fetchVehicles(residentId);
    setIsAddModalVisible(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Loại phương tiện',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getVehicleTypeName(type),
    },
    { title: 'Biển số', dataIndex: 'license_plate', key: 'license_plate' },
    { title: 'Chủ sở hữu', dataIndex: 'owner_name', key: 'owner_name' },
    { title: 'Căn hộ', dataIndex: 'apartment_number', key: 'apartment_number' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red';
        return <Tag color={color}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <TableActions
            isAdmin={isAdmin}
            onView={() => handleAction('view', record.id)}
            onEdit={() => handleAction('edit', record.id)}
            onDelete={isAdmin ? () => handleAction('delete', record.id) : undefined}
          />
          {isAdmin && record.status === 'pending' && (
            <>
              <Button type="primary" onClick={() => handleApprove(record.id)}>
                Duyệt
              </Button>
              <Button danger onClick={() => handleReject(record.id)}>
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Tìm kiếm theo biển số hoặc chủ sở hữu"
        />
        <Select
          placeholder="Loại phương tiện"
          style={{ width: 150 }}
          allowClear
          onChange={(value) => {
            setTypeFilter(value);
            fetchVehicles(residentId);
          }}
        >
          <Option value="car">Ô tô</Option>
          <Option value="motorcycle">Xe máy</Option>
          <Option value="bicycle">Xe đạp</Option>
          <Option value="other">Khác</Option>
        </Select>
        {isAdmin && (
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setStatusFilter(value);
              fetchVehicles();
            }}
          >
            <Option value="pending">Chờ duyệt</Option>
            <Option value="approved">Đã duyệt</Option>
            <Option value="rejected">Bị từ chối</Option>
          </Select>
        )}
        {!isAdmin && (
          <Button type="primary" onClick={showAddVehicleModal}>
            Thêm phương tiện
          </Button>
        )}
      </Space>
      <Modal
        title="Thêm phương tiện"
        open={isAddModalVisible}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <AddVehicleForm onSuccess={handleAddSuccess} onCancel={handleModalClose} />
      </Modal>
      <EditVehicleForm
        visible={isEditModalVisible}
        onCancel={handleEditModalClose}
        vehicleId={editingVehicleId}
      />
      <Modal
        title="Chi tiết phương tiện"
        open={isViewModalVisible}
        onCancel={closeViewModal}
        footer={[
          <Button key="close" onClick={closeViewModal}>
            Đóng
          </Button>,
        ]}
      >
        {viewVehicle && (
          <div>
            <p><strong>ID:</strong> {viewVehicle.id}</p>
            <p><strong>Loại phương tiện:</strong> {getVehicleTypeName(viewVehicle.type)}</p>
            <p><strong>Biển số xe:</strong> {viewVehicle.license_plate}</p>
            <p><strong>Chủ sở hữu:</strong> {viewVehicle.owner_name}</p>
            <p><strong>Căn hộ:</strong> {viewVehicle.apartment_number}</p>
            <p><strong>Trạng thái:</strong> {viewVehicle.status.charAt(0).toUpperCase() + viewVehicle.status.slice(1)}</p>
            <p><strong>Ngày tạo:</strong> {new Date(viewVehicle.created_at).toLocaleString()}</p>
            <p><strong>Ngày cập nhật:</strong> {new Date(viewVehicle.updated_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
      <Table
        columns={columns}
        dataSource={vehicles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Vehicles;