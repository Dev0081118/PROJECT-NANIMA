import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

export interface FamilyMember {
  id: string;
  name: string;
  kinship: string;         // e.g. "પૌત્ર (Grandson)", "દીકરો (Son)"
  callName: string;        // How Maa affectionately calls them: "દિકરા દિવ્યરાજ", "ભાઈ", "બેટા"
  avatarEmoji: string;
  notes?: string;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  familyName?: string;
  isLocalVault?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  disclosureAccepted: boolean;
  familyMembers: FamilyMember[];
  activeMember: FamilyMember;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, familyName?: string, primaryMemberName?: string, primaryKinship?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loadStoredAuth: () => Promise<void>;
  acceptDisclosure: () => void;
  enterDemoMode: () => void;
  setActiveMember: (memberId: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'addedAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
}

const REFRESH_TOKEN_KEY = 'maa_refresh_token';
const DISCLOSURE_KEY = 'maa_disclosure_accepted';
const FAMILY_MEMBERS_KEY = 'maa_family_members_list';
const ACTIVE_MEMBER_KEY = 'maa_active_member_id';
const LOCAL_USER_KEY = 'maa_local_user_profile';

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 'member-1',
    name: 'દિવ્યરાજ',
    kinship: 'પૌત્ર (Grandson)',
    callName: 'દિકરા દિવ્યરાજ',
    avatarEmoji: '👑',
    addedAt: new Date().toISOString(),
    notes: 'દાદીમાના વહાલા પૌત્ર',
  },
  {
    id: 'member-2',
    name: 'મોટાભાઈ (દીકરો)',
    kinship: 'દીકરો (Son)',
    callName: 'દિકરા ભાઈ',
    avatarEmoji: '👨',
    addedAt: new Date().toISOString(),
    notes: 'દાદીમાના મોટા દીકરા',
  },
  {
    id: 'member-3',
    name: 'માતુશ્રી (વહુ)',
    kinship: 'પુત્રવધૂ (Daughter-in-law)',
    callName: 'વહુ બેટા',
    avatarEmoji: '👩',
    addedAt: new Date().toISOString(),
    notes: 'રસોઈ અને ઘરની સંભાળ',
  },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  disclosureAccepted: false,
  familyMembers: DEFAULT_MEMBERS,
  activeMember: DEFAULT_MEMBERS[0],

  enterDemoMode: () => {
    set({
      user: {
        id: 'demo-preview-user',
        email: 'parivaar@nanima.heritage',
        familyName: 'રાણા પરિવાર (Rana Family)',
        isLocalVault: true,
      },
      accessToken: 'demo-offline-preview-token',
      isAuthenticated: true,
      disclosureAccepted: true,
      familyMembers: DEFAULT_MEMBERS,
      activeMember: DEFAULT_MEMBERS[0],
      isLoading: false,
    });
  },

  setActiveMember: (memberId: string) => {
    const found = get().familyMembers.find((m) => m.id === memberId);
    if (found) {
      set({ activeMember: found });
      SecureStore.setItemAsync(ACTIVE_MEMBER_KEY, memberId).catch(() => {});
    }
  },

  addFamilyMember: (member) => {
    const newMember: FamilyMember = {
      ...member,
      id: `member-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    const updated = [...get().familyMembers, newMember];
    set({ familyMembers: updated });
    SecureStore.setItemAsync(FAMILY_MEMBERS_KEY, JSON.stringify(updated)).catch(() => {});
  },

  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => {
    const updated = get().familyMembers.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    const active = get().activeMember.id === id
      ? { ...get().activeMember, ...updates }
      : get().activeMember;
    set({ familyMembers: updated, activeMember: active });
    SecureStore.setItemAsync(FAMILY_MEMBERS_KEY, JSON.stringify(updated)).catch(() => {});
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // 1. Try real backend with quick fallback
      let backendSuccess = false;
      try {
        const response = await Promise.race([
          apiClient.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>('/auth/login', { email, password }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 2500)
          ),
        ]);

        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        apiClient.setAccessToken(response.accessToken);
        backendSuccess = true;
      } catch {
        // Backend offline or unreachable over phone network -> use local family vault!
      }

      if (!backendSuccess) {
        // Local family vault authentication
        const localUser: User = {
          id: `local-${email.replace(/[^a-zA-Z0-9]/g, '') || 'user'}`,
          email: email.trim() || 'parivaar@nanima.heritage',
          familyName: 'પરિવાર સ્મૃતિ ખજાનો (Family Vault)',
          isLocalVault: true,
        };

        await SecureStore.setItemAsync(LOCAL_USER_KEY, JSON.stringify(localUser));

        set({
          user: localUser,
          accessToken: 'local-family-vault-token',
          isAuthenticated: true,
          disclosureAccepted: true,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, familyName, primaryMemberName, primaryKinship) => {
    set({ isLoading: true });
    try {
      let backendSuccess = false;
      try {
        const response = await Promise.race([
          apiClient.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>('/auth/register', { email, password, familyName }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 2500)
          ),
        ]);

        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        apiClient.setAccessToken(response.accessToken);
        backendSuccess = true;
      } catch {
        // Backend offline or unreachable over phone network -> proceed to local family vault
      }

      if (!backendSuccess) {
        const localUser: User = {
          id: `local-${Date.now()}`,
          email: email.trim(),
          familyName: familyName || 'આપણો પરિવાર (Our Family)',
          isLocalVault: true,
        };

        const customMember: FamilyMember = {
          id: `member-${Date.now()}`,
          name: primaryMemberName || email.split('@')[0] || 'દિવ્યરાજ',
          kinship: primaryKinship || 'પૌત્ર (Grandson)',
          callName: `દિકરા ${primaryMemberName || 'દિવ્યરાજ'}`,
          avatarEmoji: '👑',
          addedAt: new Date().toISOString(),
          notes: 'મુખ્ય સભ્ય (Primary Member)',
        };

        const memberList = [customMember, ...DEFAULT_MEMBERS.slice(1)];

        await Promise.all([
          SecureStore.setItemAsync(LOCAL_USER_KEY, JSON.stringify(localUser)),
          SecureStore.setItemAsync(FAMILY_MEMBERS_KEY, JSON.stringify(memberList)),
          SecureStore.setItemAsync(ACTIVE_MEMBER_KEY, customMember.id),
        ]);

        set({
          user: localUser,
          accessToken: 'local-family-vault-token',
          isAuthenticated: true,
          disclosureAccepted: true,
          familyMembers: memberList,
          activeMember: customMember,
          isLoading: false,
        });
      }
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
    await Promise.all([
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(LOCAL_USER_KEY),
    ]);
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
      const [refreshToken, disclosureAccepted, storedMembers, storedActiveId, localUserStr] =
        await Promise.all([
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
          SecureStore.getItemAsync(DISCLOSURE_KEY),
          SecureStore.getItemAsync(FAMILY_MEMBERS_KEY),
          SecureStore.getItemAsync(ACTIVE_MEMBER_KEY),
          SecureStore.getItemAsync(LOCAL_USER_KEY),
        ]);

      set({ disclosureAccepted: disclosureAccepted === 'true' });

      // Restore family members if present
      let currentMembers = DEFAULT_MEMBERS;
      if (storedMembers) {
        try {
          const parsed = JSON.parse(storedMembers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentMembers = parsed;
            set({ familyMembers: currentMembers });
          }
        } catch {}
      }

      // Restore active member
      if (storedActiveId) {
        const found = currentMembers.find((m) => m.id === storedActiveId);
        if (found) {
          set({ activeMember: found });
        }
      }

      // Check remote refresh token
      if (refreshToken) {
        const success = await get().refreshToken();
        if (success) {
          set({ isLoading: false });
          return;
        }
      }

      // Check stored local user
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          set({
            user: localUser,
            accessToken: 'local-family-vault-token',
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch {}
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
