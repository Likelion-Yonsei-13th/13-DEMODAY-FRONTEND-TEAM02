// 사용자 로그인 상태 관리

import { create } from 'zustand';

// 1. 스토어의 state와 action들에 대한 타입을 정의합니다.
interface UserState {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

// 2. create 함수로 스토어를 생성합니다.
export const useUserStore = create<UserState>((set) => ({
  // 3. 초기 상태 (state)
  isLoggedIn: false,
  username: null,

  // 4. 상태를 변경하는 함수 (actions)
  login: (username) =>
    set((state) => ({
      ...state,
      isLoggedIn: true,
      username: username,
    })),

  logout: () =>
    set({
      isLoggedIn: false,
      username: null,
    }),
}));