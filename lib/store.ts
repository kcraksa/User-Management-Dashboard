import { create } from 'zustand';
import { getAuthPayload, saveAuthPayload, clearAuth } from '@/lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: Function;
  logout: () => void;
}

const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
    // prefer cookie-stored auth payload if present
    const cookie = getAuthPayload();
    if (cookie && cookie.token) {
      return {
        isAuthenticated: true,
        user: cookie.user ?? null,
        token: cookie.token ?? null,
      };
    }

    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    return {
      isAuthenticated: !!token,
      user: userJson ? JSON.parse(userJson) : null,
      token: token || null,
    };
  }
  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuth(),
  login: ({ user, token }: { user: any | null; token?: string | null }) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      // also persist to cookie for cross-tab access
      try {
        saveAuthPayload({ user, token: token || '' });
      } catch (e) {
        console.warn('saveAuthPayload failed', e);
      }
    }
    set({ isAuthenticated: true, user: user || null, token: token || null });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      // call server API to destroy token/session
      try {
        import('@/lib/auth').then((m) => m.apiLogout());
      } catch (e) {
        // ignore
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      try {
        clearAuth();
      } catch (e) {
        console.warn('clearAuth failed', e);
      }
    }
    set({ isAuthenticated: false, user: null, token: null });
  },
}));