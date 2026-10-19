import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('intellmeet_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login({ email, password });
      api.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.signup(data);
      api.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    api.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    if (!localStorage.getItem('intellmeet_token')) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      api.clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const updatedUser = await api.updateProfile(data);
      set({ user: updatedUser });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
