import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 30000, // 30초로 증가 (이미지 업로드용)
  withCredentials: true, // 쿠키 기반 인증 활성화 (HttpOnly 쿠키 사용)
});

// 리쿠스트 인터셉터: Authorization 헤더 추가
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Content-Type이 명시적으로 설정되지 않았으면 application/json 사용
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log("[API Request] URL:", config.url);
    console.log("[API Request] Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log("[API Response] Status:", response.status, "URL:", response.config.url);
    return response;
  },
  (error) => {
    console.error("[API Error] Status:", error.response?.status, "Message:", error.response?.data);
    if (error.response?.status === 401) {
      // 인증 실패 시 처리
      console.warn("[401 Unauthorized] 쿠키를 확인하세요.");
      if (typeof window !== "undefined") {
        // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
