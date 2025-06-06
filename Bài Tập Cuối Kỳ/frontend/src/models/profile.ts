import { useState, useRef } from 'react';
import { Form, message } from 'antd';
import {  updateAvatar, changePassword, extendRental, toggleExtensionPermission } from '@/services/user';
import { UserProfile, Account, PasswordForm, ExtendForm } from '@/services/types/user';

// Model hook quản lý state, handler, UI logic cho trang profile/account
export function useProfileModel() {
  // State
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'rental' | 'management'>('profile');
  const [passwordFormAnt] = Form.useForm();
  const [extendFormAnt] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  // Handler: Đổi avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await updateAvatar(formData);
        setUserData((prev) => (prev ? { ...prev, avatar: response.avatar } : prev));
        setAvatarPreview(null);
        setAvatarKey((k) => k + 1); // Tăng key để Avatar re-render
        message.success('Cập nhật ảnh đại diện thành công');
        // Reset input file để có thể chọn lại cùng một file nếu muốn
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      } catch (error) {
        message.error('Lỗi khi cập nhật ảnh đại diện');
      }
    }
  };

  // Handler: Đổi mật khẩu
  const handlePasswordChange = async (values: PasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await changePassword(values); // Gọi API đổi mật khẩu
      message.success('Đổi mật khẩu thành công');
      passwordFormAnt.resetFields(); // Reset form sau khi đổi mật khẩu
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu');
    }
  };

  // Handler: Gia hạn thời gian ở trọ
  const handleExtendRental = async (values: ExtendForm) => {
    if (!userData?.extensionEnabled) {
      message.error('Tài khoản chưa được cấp quyền gia hạn');
      return;
    }

    try {
      const response = await extendRental(values);
      setUserData((prev) =>
        prev && prev.rentalInfo
          ? {
              ...prev,
              rentalInfo: {
                ...prev.rentalInfo,
                durationMonths: response.newDuration,
                remainingDays: prev.rentalInfo.remainingDays + values.months * 30,
                endDate: new Date(
                  new Date(prev.rentalInfo.startDate).setMonth(
                    new Date(prev.rentalInfo.startDate).getMonth() + response.newDuration
                  )
                )
                  .toISOString()
                  .split('T')[0],
              },
            }
          : prev
      );
      message.success(`Gia hạn thành công ${values.months} tháng`);
      extendFormAnt.resetFields();
      extendFormAnt.setFieldsValue({ months: 1 }); // Reset về giá trị mặc định
    } catch (error) {
      message.error('Lỗi khi gia hạn thời gian ở trọ');
    }
  };

  // Handler: Bật/Tắt quyền gia hạn của user (admin)
  const handleToggleExtensionPermission = async (userId: number, enabled: boolean) => {
    try {
      await toggleExtensionPermission({ userId, enabled });
      setAllAccounts((prev) =>
        prev.map((account) => (account.id === userId ? { ...account, extensionEnabled: enabled } : account))
      );
      message.success(`${enabled ? 'Bật' : 'Tắt'} quyền gia hạn thành công`);
    } catch (error) {
      message.error('Lỗi khi cập nhật quyền gia hạn');
    }
  };

  return {
    // State
    userData, setUserData,
    allAccounts, setAllAccounts,
    loading, setLoading,
    activeTab, setActiveTab,
    passwordFormAnt,
    extendFormAnt,
    avatarPreview, setAvatarPreview,
    avatarInputRef,
    avatarKey, setAvatarKey,
    userRole, setUserRole,
    // Handler
    handleAvatarChange,
    handlePasswordChange,
    handleExtendRental,
    handleToggleExtensionPermission,
  };
}