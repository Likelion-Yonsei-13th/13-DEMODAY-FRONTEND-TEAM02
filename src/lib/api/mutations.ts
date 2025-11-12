import { useMutation } from "@tanstack/react-query";
import api from "./axios-instance";
import { endpoints } from "./endpoints";

type Role = "traveler" | "local";

// --- 로그인
type LoginReq = { email: string; password: string; role: Role };
type LoginRes = { token?: string; user?: any; message?: string };

export function useLogin() {
  return useMutation<LoginRes, Error, LoginReq>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.auth.login, body);
      return data;
    },
    onSuccess: (data) => {
      if (data?.token) localStorage.setItem("token", data.token);
    },
  });
}

// --- 회원가입
type JoinReq = { name: string; email: string; password: string; role: Role };
type JoinRes = { ok: boolean; message?: string };

export function useJoin() {
  return useMutation<JoinRes, Error, JoinReq>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.auth.join, body);
      return data;
    },
  });
}
