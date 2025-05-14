import { extend } from 'umi-request';

const request = extend({
  prefix: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  errorHandler: (error) => {
    if (error.response) {
      return error.response.json().then((res: any) => {
        throw new Error(res.message || 'Lỗi từ server');
      });
    }
    throw new Error('Lỗi không thực hiện được');
  },
});

export default request;