import { create } from 'zustand';

type DemoState = {
  count: number;
  inc: () => void;
  reset: () => void;
};

export const useDemoStore = create<DemoState>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));
