import { create } from "zustand";

type Role = "traveler" | "local";

interface AuthRoleState {
  role: Role | null;
  setRole: (r: Role | null) => void;
}

export const useAuthRole = create<AuthRoleState>((set) => ({
  role: null,
  setRole: (r) => set({ role: r }),
}));