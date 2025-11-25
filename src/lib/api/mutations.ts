import { useMutation } from "@tanstack/react-query";
import api from "./axios-instance";
import { endpoints } from "./endpoints";

type Role = "USER" | "LOCAL"; // 백엔드에서 사용하는 Role enum 값
type FrontendRole = "user" | "local"; // 프론트엔드에서 사용하는 Role

// --- 로그인
type LoginReq = { username: string; password: string };
type LoginRes = { 
  message: string;
  role: Role;
  next_step: string;
};

export function useLogin() {
  return useMutation<LoginRes, Error, LoginReq>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.auth.login, body);
      return data;
    },
    onSuccess: (data) => {
      // 쿠키 기반이므로 토큰은 자동으로 저장됨
      console.log('로그인 성공:', data);
    },
  });
}

// --- 회원가입
type SignupReq = { 
  username: string;
  email: string;
  password: string;
  password2: string;
  role: Role;
  display_name?: string;
  birth_year: number;
  is_over_14: boolean;
  agreed_service_terms: boolean;
  agreed_privacy: boolean;
  agreed_marketing?: boolean;
};
type SignupRes = { message: string };

export function useSignup() {
  return useMutation<SignupRes, Error, SignupReq>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.auth.signup, body);
      return data;
    },
  });
}

// --- 로그아웃
type LogoutRes = { message: string };

export function useLogout() {
  return useMutation<LogoutRes, Error, void>({
    mutationFn: async () => {
      const { data } = await api.post(endpoints.auth.logout);
      return data;
    },
  });
}

// --- Role 전환
type SwitchRoleReq = { role: Role };
type SwitchRoleRes = { role: Role; next_step: string };

export function useSwitchRole() {
  return useMutation<SwitchRoleRes, Error, SwitchRoleReq>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.profile.switchRole, body);
      return data;
    },
  });
}
