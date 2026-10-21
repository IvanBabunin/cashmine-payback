import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  /** Set when the API rejected the saved token, so the token screen can say why. */
  rejected: boolean;
  setToken: (token: string) => void;
  rejectToken: () => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      rejected: false,
      setToken: (token) => set({ token, rejected: false }),
      rejectToken: () => set({ token: null, rejected: true }),
      clearToken: () => set({ token: null, rejected: false }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token }),
    },
  ),
);
