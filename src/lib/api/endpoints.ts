export const endpoints = {
  health: "/api/health",
  auth: {
    login: "/api/auth/login",
    join: "/api/auth/join",
    me: "/api/auth/me",      // (선택) 로그인 사용자 조회
  },
} as const;
