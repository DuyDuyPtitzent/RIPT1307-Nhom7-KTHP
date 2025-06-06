import { useEffect } from 'react';
import { history } from 'umi';

// Component Logout dùng để xử lý đăng xuất
const Logout = () => {
  // useEffect sẽ chạy một lần khi component được render
  useEffect(() => {
    // Xóa token khỏi localStorage (đăng xuất người dùng)
    localStorage.removeItem('token');
    // Chuyển hướng về trang đăng nhập
    history.replace('/auth/login');
  }, []);

  // Hiển thị thông báo đang đăng xuất
  return <div>Đang đăng xuất...</div>;
};

export default Logout;