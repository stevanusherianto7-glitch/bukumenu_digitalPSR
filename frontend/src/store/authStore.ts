
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 
  | 'SUPER_ADMIN' | 'OWNER' | 'HR_MANAGER' 
  | 'RESTAURANT_MANAGER' | 'FINANCE_MANAGER' 
  | 'MARKETING_MANAGER' | 'STAFF_FOH' | 'STAFF_BOH';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoUrl?: string;
  restaurantId?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'restohris-auth-storage',
    }
  )
);
