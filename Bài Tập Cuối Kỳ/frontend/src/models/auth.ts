
import { getCurrentUser } from '../services/auth';
import { AuthModelType } from '../services/types/auth'; // Import AuthModelType and AuthState

const AuthModel: AuthModelType = {
  namespace: 'auth',

  state: {
    user: null,
    isAuthenticated: false,
  },

  effects: {
    *fetchCurrentUser(_: any, { call, put }: any): Generator<any, void, any> {
      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('Không tìm thấy token, không thể lấy thông tin người dùng');
          yield put({ type: 'clearUser' });
          return;
        }

        console.log('Bắt đầu gọi API getCurrentUser');
        const response = yield call(getCurrentUser);
        console.log('Phản hồi từ getCurrentUser:', response);

        if (response && response.id) {
          yield put({
            type: 'setUser',
            payload: response,
          });
        } else {
          console.warn('Phản hồi từ API không hợp lệ:', response);
          yield put({ type: 'clearUser' });
        }
      } catch (error) {
        console.error('Lỗi khi gọi getCurrentUser:', error);
        yield put({ type: 'clearUser' });
      }
    },
  },

  reducers: {
    setUser(state, { payload }) {
      return {
        ...state,
        user: payload,
        isAuthenticated: true,
      };
    },
    clearUser(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    },
  },
};

export default AuthModel;