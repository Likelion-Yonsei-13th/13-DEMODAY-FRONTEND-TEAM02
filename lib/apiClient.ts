import axios from 'axios';

// .env.local 파일에서 API URL을 가져옵니다.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터 (Request Interceptor)
 * - 모든 요청에 인증 토큰을 자동으로 추가할 수 있습니다.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 예: Zustand나 LocalStorage에서 토큰을 가져옵니다.
    // const token = useAuthStore.getState().token; 
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터 (Response Interceptor)
 * - 응답 데이터를 한 번 감싸서 반환 (response.data)
 * - 401 (인증 실패) 등 공통 에러 처리를 할 수 있습니다.
 */
apiClient.interceptors.response.use(
  (response) => {
    // API 응답에서 data 객체만 깔끔하게 반환합니다.
    return response.data;
  },
  (error) => {
    // 401 Unauthorized 에러 등 공통 에러 처리
    if (error.response && error.response.status === 401) {
      // 예: 로그인 페이지로 강제 리디렉션
      console.error('인증 실패! 로그인 페이지로 이동합니다.');
      // window.location.href = '/login';
    }
    // 다른 에러들은 그대로 반환
    return Promise.reject(error);
  }
);

export default apiClient;