import { create } from "zustand";
import { persist } from "zustand/middleware";

// 프론트엔드에서 사용하는 role (프론트엔드 표준)
type Role = "local" | "user";

interface AuthRoleState {
  role: Role | null;
  setRole: (r: Role | null) => void;
}

export const useAuthRole = create(
  persist<AuthRoleState>(
    (set) => ({
      role: null,
      setRole: (r) => set({ role: r }),
    }),
    {
      name: "userRole", // localStorage 키
    }
  )
);
