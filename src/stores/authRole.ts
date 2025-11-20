import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "traveler" | "local";

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
