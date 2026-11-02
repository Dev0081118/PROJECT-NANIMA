import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  familyName?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  disclosureAccepted: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, familyName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
  acceptDisclosure: () => void;
}

const REFRESH_TOKEN_KEY = 'maa_refresh_token';
const DISCLOSURE_KEY = 'maa_disclosure_accepted';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  disclosureAccepted: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', { email, password });

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      apiClient.setAccessToken(response.accessToken);
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, familyName) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/register', { email, password, familyName });

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      apiClient.setAccessToken(response.accessToken);
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // Best-effort logout
      }
    }
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    apiClient.setAccessToken(null);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/refresh', { refreshToken });

      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
      apiClient.setAccessToken(response.accessToken);
      set({ accessToken: response.accessToken });
      return true;
    } catch {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      set({ user: null, accessToken: null, isAuthenticated: false });
      return false;
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const [refreshToken, disclosureAccepted] = await Promise.all([
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(DISCLOSURE_KEY),
      ]);

      set({ disclosureAccepted: disclosureAccepted === 'true' });

      if (refreshToken) {
        const success = await get().refreshToken();
        if (!success) {
          set({ isLoading: false });
          return;
        }
      }
    } catch {
      // Ignore
    }
    set({ isLoading: false });
  },

  acceptDisclosure: () => {
    SecureStore.setItemAsync(DISCLOSURE_KEY, 'true').catch(() => {});
    set({ disclosureAccepted: true });
  },
}));
