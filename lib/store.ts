import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (payload: { user: any | null; token?: string | null }) => void;
  logout: () => void;
}

const getInitialAuth = () => {
  if (typeof window !== 'undefined') {
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
  login: ({ user, token }) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
    }
    set({ isAuthenticated: true, user: user || null, token: token || null });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ isAuthenticated: false, user: null, token: null });
  },
}));