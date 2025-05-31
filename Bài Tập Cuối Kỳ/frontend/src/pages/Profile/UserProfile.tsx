
import React, { useState, useEffect } from 'react';
import { User, Camera, Lock, Calendar, Settings, Users, CheckCircle, XCircle } from 'lucide-react';
import { message } from 'antd';
import { getProfile, updateAvatar, changePassword, extendRental, getAllAccounts, toggleExtensionPermission } from '@/services/user';
import { UserProfile, Account, PasswordForm, ExtendForm } from '@/services/types/user';
import { config } from '../../utils/constants';
import './UserProfile.less';

const AccountPage: React.FC = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'rental' | 'management'>('profile');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [extendForm, setExtendForm] = useState<ExtendForm>({ months: 1 });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Lấy role từ token (giả sử lưu trong localStorage sau khi đăng nhập)
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin user từ token
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUserRole(decoded.role);
        }

        // Lấy profile
        const profileResponse = await getProfile();
        setUserData(profileResponse);

        // Lấy danh sách tài khoản nếu là admin
        if (userRole === 'admin') {
          const accountsResponse = await getAllAccounts();
          setAllAccounts(accountsResponse);
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu tài khoản');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole]);

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
        setUserData((prev) => prev ? { ...prev, avatar: response.avatar } : prev);
        setAvatarPreview(null);
        message.success('Cập nhật ảnh đại diện thành công');
      } catch (error) {
        message.error('Lỗi khi cập nhật ảnh đại diện');
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await changePassword(passwordForm);
      message.success('Đổi mật khẩu thành công');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu');
    }
  };

  const handleExtendRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.extensionEnabled) {
      message.error('Tài khoản chưa được cấp quyền gia hạn');
      return;
    }

    try {
      const response = await extendRental(extendForm);
      setUserData((prev) => prev && prev.rentalInfo ? {
        ...prev,
        rentalInfo: {
          ...prev.rentalInfo,
          durationMonths: response.newDuration,
          remainingDays: prev.rentalInfo.remainingDays + (extendForm.months * 30),
          endDate: new Date(new Date(prev.rentalInfo.startDate).setMonth(
            new Date(prev.rentalInfo.startDate).getMonth() + response.newDuration
          )).toISOString().split('T')[0],
        },
      } : prev);
      message.success(`Gia hạn thành công ${extendForm.months} tháng`);
      setExtendForm({ months: 1 });
    } catch (error) {
      message.error('Lỗi khi gia hạn thời gian ở trọ');
    }
  };

  const handleToggleExtensionPermission = async (userId: number, enabled: boolean) => {
     console.log('Sending data to backend:', { userId, enabled }); // 👈 KIỂM TRA
    try {
      await toggleExtensionPermission({ userId, enabled });
      setAllAccounts((prev) =>
        prev.map((account) =>
          account.id === userId ? { ...account, extensionEnabled: enabled } : account
        )
      );
      message.success(`${enabled ? 'Bật' : 'Tắt'} quyền gia hạn thành công`);
    } catch (error) {
      message.error('Lỗi khi cập nhật quyền gia hạn');
    }
  };

  if (loading) {
    return (
      <div className="container-loading">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="loading-text">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="user-info">
              <div className="avatar-container">
                <div className="avatar">
                  {userData?.avatar ? (
                    <img src={`${config.API_URL}/${userData.avatar}`} alt="Avatar" className="avatar-img" />
                  ) : (
                    userData?.fullName?.substring(0, 1) || 'U'
                  )}
                </div>
                {avatarPreview && (
                  <div className="avatar-preview">
                    <div className="spinner-small"></div>
                  </div>
                )}
              </div>
              <div className="user-info-row">
                <h1 className="user-name">{userData?.fullName}</h1>
                <p className="user-email">{userData?.email}</p>
                <span className={`role-badge ${userData?.role === 'admin' ? 'admin' : 'user'}`}>
                  {userData?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>
            </div>
            <div className="join-date">
              <p>Tham gia từ: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-card">
          <div className="nav-border">
            <nav className="nav-tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User className="icon" />
                Thông tin cá nhân
              </button>
              {userData?.role === 'user' && (
                <button
                  onClick={() => setActiveTab('rental')}
                  className={`nav-tab ${activeTab === 'rental' ? 'active' : ''}`}
                >
                  <Calendar className="icon" />
                  Thời gian ở trọ
                </button>
              )}
              {userData?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('management')}
                  className={`nav-tab ${activeTab === 'management' ? 'active' : ''}`}
                >
                  <Users className="icon" />
                  Quản lý tài khoản
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid-profile">
              {/* Avatar Update */}
              <div className="card">
                <h3 className="card-title">
                  <Camera className="icon-title" />
                  Ảnh đại diện
                </h3>
                <div className="avatar-upload">
                  <div className="avatar-large">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="avatar-img" />
                    ) : userData?.avatar ? (
                      <img src={`${config.API_URL}/${userData.avatar}`} alt="Avatar" className="avatar-img" />
                    ) : (
                      userData?.fullName?.substring(0, 1) || 'U'
                    )}
                  </div>
                  <label className="upload-button">
                    <Camera className="icon-button" />
                    Chọn ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="upload-info">
                    Chấp nhận: JPG, PNG. Tối đa 5MB
                  </p>
                </div>
              </div>

              {/* Change Password - Only for Users */}
              {userData?.role === 'user' && (
                <div className="card">
                  <h3 className="card-title">
                    <Lock className="icon-title" />
                    Đổi mật khẩu
                  </h3>
                  <form onSubmit={handlePasswordChange} className="form">
                    <div className="form-group">
                      <label className="form-label">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="form-input"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <button type="submit" className="submit-button">
                      Đổi mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {/* Account Info */}
              <div className="card">
                <h3 className="card-title">
                  <Settings className="icon-title" />
                  Thông tin tài khoản
                </h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">ID tài khoản:</span>
                    <span className="info-value">#{userData?.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Họ tên:</span>
                    <span className="info-value">{userData?.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{userData?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Vai trò:</span>
                    <span className={`role-badge ${userData?.role === 'admin' ? 'admin' : 'user'}`}>
                      {userData?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>
                  {userData?.role === 'user' && (
                    <div className="info-item">
                      <span className="info-label">Quyền gia hạn:</span>
                      <span className={`permission-status ${userData?.extensionEnabled ? 'enabled' : 'disabled'}`}>
                        {userData?.extensionEnabled ? (
                          <>
                            <CheckCircle className="icon-status" />
                            Được phép
                          </>
                        ) : (
                          <>
                            <XCircle className="icon-status" />
                            Không được phép
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rental Management Tab - Only for Users */}
          {activeTab === 'rental' && userData?.role === 'user' && (
            <div className="grid-rental">
              {/* Current Rental Info */}
              <div className="card">
                <h3 className="card-title">
                  <Calendar className="icon-title" />
                  Thời gian ở trọ hiện tại
                </h3>
                {userData?.rentalInfo ? (
                  <div className="rental-info">
                    <div className="rental-dates">
                      <div className="date-card start">
                        <p className="date-label">Ngày bắt đầu</p>
                        <p className="date-value">
                          {new Date(userData.rentalInfo.startDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="date-card end">
                        <p className="date-label">Ngày kết thúc</p>
                        <p className="date-value">
                          {new Date(userData.rentalInfo.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="duration-card">
                      <p className="duration-label">Thời gian thuê</p>
                      <p className="duration-value">{userData.rentalInfo.durationMonths} tháng</p>
                    </div>
                    <div className={`status-card ${userData.rentalInfo.isExpired ? 'expired' : userData.rentalInfo.remainingDays <= 30 ? 'warning' : 'active'}`}>
                      <p className="status-label">{userData.rentalInfo.isExpired ? 'Đã hết hạn' : 'Còn lại'}</p>
                      <p className="status-value">
                        {userData.rentalInfo.isExpired 
                          ? `${Math.abs(userData.rentalInfo.remainingDays)} ngày`
                          : `${userData.rentalInfo.remainingDays} ngày`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="no-rental">
                    <Calendar className="no-rental-icon" />
                    <p>Chưa có thông tin thời gian ở trọ</p>
                  </div>
                )}
              </div>

              {/* Extend Rental */}
              <div className="card">
                <h3 className="card-title">
                  <Calendar className="icon-title" />
                  Gia hạn thời gian ở trọ
                </h3>
                {userData?.extensionEnabled ? (
                  <form onSubmit={handleExtendRental} className="form">
                    <div className="form-group">
                      <label className="form-label">Số tháng muốn gia hạn</label>
                      <select
                        value={extendForm.months}
                        onChange={(e) => setExtendForm({ months: parseInt(e.target.value) })}
                        className="form-select"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map((month) => (
                          <option key={month} value={month}>
                            {month} tháng
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="extension-info">
                      <h4 className="extension-title">Thông tin gia hạn:</h4>
                      <p className="extension-text">
                        • Thời gian hiện tại: {userData?.rentalInfo?.durationMonths || 0} tháng
                      </p>
                      <p className="extension-text">
                        • Sau khi gia hạn: {(userData?.rentalInfo?.durationMonths || 0) + extendForm.months} tháng
                      </p>
                    </div>
                    <button type="submit" className="extend-button">
                      Gia hạn {extendForm.months} tháng
                    </button>
                  </form>
                ) : (
                  <div className="no-permission">
                    <XCircle className="no-permission-icon" />
                    <p className="no-permission-title">Chưa được cấp quyền gia hạn</p>
                    <p className="no-permission-text">
                      Vui lòng liên hệ quản trị viên để được cấp quyền gia hạn thời gian ở trọ.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Management Tab - Only for Admin */}
          {activeTab === 'management' && userData?.role === 'admin' && (
            <div className="card management">
              <div className="management-header">
                <h3 className="card-title">
                  <Users className="icon-title" />
                  Quản lý tài khoản người dùng
                </h3>
              </div>
              <div className="table-container">
                <table className="management-table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-cell">Người dùng</th>
                      <th className="table-cell">Vai trò</th>
                      <th className="table-cell">Thời gian ở trọ</th>
                      <th className="table-cell">Quyền gia hạn</th>
                      <th className="table-cell">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {allAccounts.map((account) => (
                      <tr key={account.id} className="table-row">
                        <td className="table-cell">
                          <div className="user-cell">
                            <div className="user-avatar">
                              {account.fullName.substring(0, 1)}
                            </div>
                            <div className="user-info">
                              <div className="user-name">{account.fullName}</div>
                              <div className="user-email">{account.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`role-badge ${account.role === 'admin' ? 'admin' : 'user'}`}>
                            {account.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="table-cell">
                          {account.rentalInfo ? (
                            <div className="rental-status">
                              <span className={`status-text ${account.rentalInfo.isExpired ? 'expired' : 'active'}`}>
                                {account.rentalInfo.isExpired 
                                  ? `Hết hạn ${Math.abs(account.rentalInfo.remainingDays)} ngày`
                                  : `Còn ${account.rentalInfo.remainingDays} ngày`}
                              </span>
                            </div>
                          ) : (
                            <span className="no-rental-text">Chưa có</span>
                          )}
                        </td>
                        <td className="table-cell">
                          {account.role === 'user' && (
                            <span className={`permission-status ${account.extensionEnabled ? 'enabled' : 'disabled'}`}>
                              {account.extensionEnabled ? (
                                <>
                                  <CheckCircle className="icon-status" />
                                  Được phép
                                </>
                              ) : (
                                <>
                                  <XCircle className="icon-status" />
                                  Không được phép
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          {account.role === 'user' && (
                            <button
                              onClick={() => handleToggleExtensionPermission(account.id, !account.extensionEnabled)}
                              className={`toggle-button ${account.extensionEnabled ? 'disable' : 'enable'}`}
                            >
                              {account.extensionEnabled ? 'Tắt gia hạn' : 'Bật gia hạn'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
