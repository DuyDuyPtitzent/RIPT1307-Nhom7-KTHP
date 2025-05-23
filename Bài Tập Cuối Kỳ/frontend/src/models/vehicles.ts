import { useState, useCallback } from 'react';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  approveVehicle,
  rejectVehicle,
  getVehicleById,
} from '@/services/vehicles';
import { message } from 'antd';

// Hàm timeout để giới hạn thời gian chờ API
const withTimeout = (promise: Promise<any>, ms: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout khi tải dữ liệu')), ms)),
  ]);
};

export default function useVehicleModel() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [viewVehicle, setViewVehicle] = useState<any | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async (residentId?: number) => {
    setLoading(true);
    try {
      const data = await getVehicles({ search, type: typeFilter, status: statusFilter, residentId });
      console.log('Fetched vehicles:', data);
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Lỗi tải danh sách phương tiện:', error);
      message.error(error.message || 'Lỗi tải danh sách phương tiện, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  const handleCreate = async (params: any) => {
    setLoading(true);
    try {
      await createVehicle(params);
      await fetchVehicles(params.resident_id);
      message.success('Đăng ký phương tiện thành công, chờ duyệt');
    } catch (error: any) {
      console.error('Lỗi khi tạo phương tiện:', error);
      message.error(error.message || 'Lỗi khi đăng ký phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, params: any) => {
    setLoading(true);
    try {
      await updateVehicle(id, params);
      await fetchVehicles();
      message.success('Cập nhật phương tiện thành công');
      closeEditModal();
    } catch (error: any) {
      console.error('Lỗi khi cập nhật phương tiện:', error);
      message.error(error.message || 'Lỗi khi cập nhật phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteVehicle(id);
      setVehicles(vehicles.filter((v) => v.id !== id));
      message.success('Đã xóa phương tiện');
    } catch (error: any) {
      console.error('Lỗi khi xóa phương tiện:', error);
      message.error(error.message || 'Không xóa được phương tiện, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setLoading(true);
    try {
      await approveVehicle(id);
      await fetchVehicles();
      message.success('Duyệt phương tiện thành công');
    } catch (error: any) {
      console.error('Lỗi khi duyệt phương tiện:', error);
      message.error(error.message || 'Lỗi khi duyệt phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(true);
    try {
      await rejectVehicle(id);
      await fetchVehicles();
      message.success('Từ chối phương tiện thành công');
    } catch (error: any) {
      console.error('Lỗi khi từ chối phương tiện:', error);
      message.error(error.message || 'Lỗi khi từ chối phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (id: number) => {
    setLoading(true);
    setEditError(null);
    setEditingVehicleId(id);
    try {
      const vehicle = await withTimeout(getVehicleById(id), 5);
      console.log('Fetched vehicle for editing:', vehicle);
      if (!vehicle || typeof vehicle !== 'object' || !vehicle.id) {
        throw new Error('Dữ liệu phương tiện không hợp lệ');
      }
      // Đợi batching để đảm bảo đồng bộ
      await new Promise(resolve => setTimeout(resolve, 0));
      setEditingVehicle(vehicle);
      setIsEditModalVisible(true);
    } catch (error: any) {
      console.error('Lỗi khi tải phương tiện:', error);
      setEditError(error.message || 'Lỗi khi tải thông tin phương tiện');
      setEditingVehicle(null);
      setIsEditModalVisible(true); // Mở modal để hiển thị lỗi
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditingVehicleId(null);
    setEditingVehicle(null);
    setIsEditModalVisible(false);
    setEditError(null);
  };

  const openViewModal = async (id: number) => {
    setLoading(true);
    try {
      const vehicle = await withTimeout(getVehicleById(id), 5000);
      console.log('Fetched vehicle for viewing:', vehicle);
      if (!vehicle || typeof vehicle !== 'object' || !vehicle.id) {
        throw new Error('Dữ liệu phương tiện không hợp lệ');
      }
      setViewVehicle(vehicle);
      setIsViewModalVisible(true);
    } catch (error: any) {
      console.error('Lỗi khi tải phương tiện:', error);
      message.error(error.message || 'Lỗi khi tải thông tin phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewVehicle(null);
    setIsViewModalVisible(false);
  };

  return {
    vehicles,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    fetchVehicles,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleApprove,
    handleReject,
    setVehicles,
    editingVehicleId,
    editingVehicle,
    isEditModalVisible,
    editError,
    openEditModal,
    closeEditModal,
    viewVehicle,
    isViewModalVisible,
    openViewModal,
    closeViewModal,
  };
}