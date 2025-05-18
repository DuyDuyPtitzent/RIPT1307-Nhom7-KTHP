import { extend } from 'umi-request';
import { message } from 'antd';
import { config } from './constants';

const request = extend({
  prefix: config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error: any) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.data;
      message.error(responseData?.message || `Có lỗi xảy ra! (Status: ${status})`);
      throw error;
    } else {
      message.error(error.message || 'Lỗi kết nối mạng!');
      throw error;
    }
  },
});

request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('token');
  console.log('Token gửi trong request:', token);
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

request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  console.log('Raw response data from umi-request:', data);
  return data; // Trả về dữ liệu JSON thay vì response
});

export default request;