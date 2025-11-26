import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axios-instance";
import { endpoints } from "./endpoints";

type Role = "USER" | "LOCAL"; // 백엔드에서 사용하는 Role enum 값
type FrontendRole = "user" | "local"; // 프론트엔드에서 사용하는 Role

// ---- 프로필 타입 ----
type LocalProfileData = {
  display_name: string;
  photo_url: string;
  bio: string;
  languages: string[];
  interests: string[];
  regions: string[];
  strengths: string[];
  portfolio: any[];
};

type UserProfileData = {
  display_name: string;
  photo_url: string;
  bio: string;
  languages: string[];
  interests: string[];
  mbti: string;
  travel_style: string;
};

// --- 스토리 타입
type StoryData = {
  id: number;
  author: number;
  author_name: string;
  country: string;
  state: string;
  city: string;
  district: string;
  place?: any;
  title: string;
  preview?: string;
  content?: string;
  photo_url: string;
  liked_count: number;
  view_count: number;
  created_at: string;
};

type StoryCreateData = {
  country: string;
  state: string;
  city: string;
  district: string;
  place?: number;
  title: string;
  content: string;
  photo_url: string;
  is_public: boolean;
};

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
    onSuccess: (data: any) => {
      // 토큰을 localStorage에 저장 (Cross-Origin 환경)
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        // JWT 토큰에서 user_id 추출
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          console.log("[Login] JWT payload:", payload);
          if (payload.user_id) {
            localStorage.setItem("user_id", payload.user_id);
            console.log("[Login] user_id 저장됨:", payload.user_id);
          }
        } catch (e) {
          console.error("토큰 파싱 실패:", e);
        }
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
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
    onSuccess: () => {
      // localStorage에서 토큰 삭제
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
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

// ---- 프로필 조회 쿼리 ----
export function useGetLocalProfile() {
  return useQuery<LocalProfileData, Error>({
    queryKey: ["profile", "local"],
    queryFn: async () => {
      try {
        console.log("[useGetLocalProfile] 프로필 조회 시작");
        console.log("[useGetLocalProfile] 요청 URL:", endpoints.profile.local);
        const { data } = await api.get(endpoints.profile.local);
        console.log("[useGetLocalProfile] 응답:", data);
        return data;
      } catch (error: any) {
        console.error("[useGetLocalProfile] 에러:", error.response?.status, error.response?.data);
        throw error;
      }
    },
    retry: false,
  });
}

export function useGetUserProfile() {
  return useQuery<UserProfileData, Error>({
    queryKey: ["profile", "user"],
    queryFn: async () => {
      try {
        console.log("[useGetUserProfile] 프로필 조회 시작");
        console.log("[useGetUserProfile] 요청 URL:", endpoints.profile.user);
        const { data } = await api.get(endpoints.profile.user);
        console.log("[useGetUserProfile] 응답:", data);
        return data;
      } catch (error: any) {
        console.error("[useGetUserProfile] 에러:", error.response?.status, error.response?.data);
        throw error;
      }
    },
    retry: false,
  });
}

// ---- 프로필 수정 ----
export function useUpdateLocalProfile() {
  return useMutation<LocalProfileData, Error, Partial<LocalProfileData>>({
    mutationFn: async (body) => {
      const { data } = await api.put(endpoints.profile.local, body);
      return data;
    },
  });
}

export function useUpdateUserProfile() {
  return useMutation<UserProfileData, Error, Partial<UserProfileData>>({
    mutationFn: async (body) => {
      const { data } = await api.put(endpoints.profile.user, body);
      return data;
    },
  });
}

// ---- 스토리 ----
// 내가 작성한 스토리 목록 조회
export function useGetMyStories() {
  return useQuery<StoryData[], Error>({
    queryKey: ["stories", "mine"],
    queryFn: async () => {
      const userId = localStorage.getItem("user_id"); // 로그인 시 저장된 user_id
      const { data } = await api.get(endpoints.story.list, {
        params: { author: userId },
      });
      return data.results || data; // pagination 처리
    },
    retry: false,
  });
}

// 스토리 생성
export function useCreateStory() {
  return useMutation<StoryData, Error, StoryCreateData>({
    mutationFn: async (body) => {
      const { data } = await api.post(endpoints.story.list, body);
      return data;
    },
    onSuccess: () => {
      // 스토리 목록 캠시 무효화
      const queryClient = (window as any).__queryClient;
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["stories", "mine"] });
      }
    },
  });
}
