import { extend } from 'umi-request';
import { message } from 'antd';
import { config } from './constants';

// Tạo request instance
const request = extend({
  prefix: config.API_URL,
  timeout: 10000,
  errorHandler: (error: any) => {
    // Bắt lỗi có response (thường là lỗi từ backend)
    if (error.response) {
      const status = error.response.status;
      const responseData = error.data;
      message.error(responseData?.message || `Có lỗi xảy ra! (Status: ${status})`);
      throw error;
    } else {
      // Lỗi mạng hoặc lỗi không có phản hồi
      message.error(error.message || 'Lỗi kết nối mạng!');
      throw error;
    }
  },
});

// ✅ Interceptor thêm Authorization token nếu có
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');

  if (token) {
    return {
      url,
      options: {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      },
    };
  }

  return { url, options };
});

// ✅ KHÔNG xử lý clone() hay parse JSON ở đây
// umi-request sẽ tự parse JSON nếu response trả về Content-Type: application/json
request.interceptors.response.use((response) => response);

export default request;
