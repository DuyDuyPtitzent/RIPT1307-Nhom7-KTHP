import { useState } from 'react';
import { message } from 'antd';
import { useHistory } from 'umi';
import { getMaterials, deleteMaterial } from '@/services/materials';
import { getCurrentUser } from '@/services/auth';

export const useMaterialsModel = () => {
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
      setMaterials((prev) => prev.filter((m: any) => m.id !== id));
    } catch (error: any) {
      message.error(error.message || 'Xóa vật tư thất bại');
    }
  };

  return {
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
    setMaterials,
  };
};
