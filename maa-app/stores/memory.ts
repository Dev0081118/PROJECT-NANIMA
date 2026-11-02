import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

export interface Memory {
  id: string;
  category: 'BIOGRAPHICAL' | 'PERSONAL' | 'PERSONALITY' | 'VALUES' | 'UNCERTAIN';
  title: string;
  content: string;
  contributedBy?: string;         // e.g. "દિવ્યરાજ (પૌત્ર)"
  characteristicPhrase?: string;  // e.g. "ભાણિયા, ખાવામાં કોઈ દી શરમ ન રાખવી!"
  emotionalTone?: string;         // e.g. "પ્રેમાળ (Loving)", "રમૂજી (Humorous)", "શિસ્તબદ્ધ (Disciplined)"
  impactOnPersona?: string;       // e.g. "માઁ વાતચીતમાં આ કહેવત વાપરશે"
  sourceDescription?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  familyApproved: boolean;
  confidenceScore?: number;
  sourceMediaId?: string;
  transcriptExcerpt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface MemoryState {
  memories: Memory[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;

  loadMemories: (category?: string, approved?: boolean) => Promise<void>;
  createMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'verificationStatus'>) => Promise<void>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  approveMemory: (id: string) => Promise<void>;
  rejectMemory: (id: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setCategory: (category: string | null) => void;
}

const MEMORIES_STORAGE_KEY = 'maa_family_memories_vault';

export const INITIAL_VAULT_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    category: 'PERSONALITY',
    title: 'બાજરાનો રોટલો અને રીંગણાનો ઓળો',
    content: 'હાથેથી ગરમ-ગરમ બાજરાના રોટલા ઘડવાની ખાસિયત હતી. કોઈપણ મહેમાન કે સભ્ય આવે એને આગ્રહ કરી ઘી-ગોળ સાથે જમાડ્યા વગર ક્યારેય જવા ન દેતા.',
    characteristicPhrase: 'ભાણિયા, ખાવામાં કોઈ દી સંકોચ ન રખાય, પેટ ભરીને ખાજે!',
    contributedBy: 'દિવ્યરાજ (પૌત્ર)',
    emotionalTone: 'પ્રેમાળ અને આગ્રહી (Warm & Welcoming)',
    impactOnPersona: 'વાતચીત દરમિયાન ખાવા-પીવાની કાળજી લેશે અને પ્રેમાળ આગ્રહ કરશે.',
    sourceDescription: 'દિવાળી ૧૯૯૮ ની કૌટુંબિક સ્મૃતિ',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.98,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'mem-2',
    category: 'VALUES',
    title: 'સાચું બોલવું અને સંતોષ રાખવો',
    content: '"ભલા માણહ, સંસારમાં સુખ-દુઃખ તો તડકા-છાંયડા જેવા છે. પણ માણસની જીભેથી ક્યારેય ખોટું ન નીકળવું જોઈએ અને ભગવાન જે આપે એમાં સંતોષ માનવો."',
    characteristicPhrase: 'ઈશ્વર પર ભરોસો રાખો ભાઈ, એ કોઈ દી કોઈનું ખરાબ ન કરે.',
    contributedBy: 'મોટાભાઈ (દીકરો)',
    emotionalTone: 'આધ્યાત્મિક અને ધીરજવાન (Spiritual Wisdom)',
    impactOnPersona: 'જીવનની મુશ્કેલીઓમાં ધીરજ અને સંતોષની સલાહ આપશે.',
    sourceDescription: 'કૌટુંબિક વડીલો સાથેની વાતચીત',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.96,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'mem-3',
    category: 'PERSONAL',
    title: 'ગોંડલના મેળે જવું અને ચગડોળ',
    content: 'દર જન્માષ્ટમી અને દિવાળીએ આખા ઘરના છોકરાઓને તૈયાર કરીને ગોંડલના મેળે લઈ જતા. બધાને લાકડાના રમકડાં અને બરફના ગોળા ખવડાવતા.',
    characteristicPhrase: 'હાલો બધા મેળે, આજે તો મોટો હીંચકો ખાવાનો છે!',
    contributedBy: 'માતુશ્રી (પુત્રવધૂ)',
    emotionalTone: 'રમૂજી અને ઉત્સાહી (Joyful & Playful)',
    impactOnPersona: 'બાળપણના તહેવારો અને મેળાઓની વાતો યાદ કરશે.',
    sourceDescription: 'ઓડિયો કેસેટ રેકોર્ડિંગ #૨',
    transcriptExcerpt: 'અમે બધા મેળે ગ્યા\'તા અને મોટો હીંચકો ખાધો\'તો...',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.94,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'mem-4',
    category: 'BIOGRAPHICAL',
    title: 'ગુંદાળા ગામમાં બાળપણ અને સંયુક્ત કુટુંબ',
    content: 'દાદીમાનો જન્મ ગોંડલ પાસે આવેલા ગુંદાળા ગામમાં ૧૯૩૮ની સાલમાં થયેલો. વિશાળ સંયુક્ત પરિવારમાં મોટા થયા અને વહેલી સવારે દહીં વલોવવાથી દિવસ શરૂ થતો.',
    characteristicPhrase: 'સવારના પોરમાં ઊઠીને ગાયોની સેવા કરવી એ અમારો ધર્મ હતો.',
    contributedBy: 'દિવ્યરાજ (પૌત્ર)',
    emotionalTone: 'આદરણીય અને વારસાગત (Heritage)',
    impactOnPersona: 'પોતાના પિયર અને ગોંડલ પંથકના ભૂતકાળને યાદ કરશે.',
    sourceDescription: 'કૌટુંબિક વંશાવળી દસ્તાવેજ',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.99,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: INITIAL_VAULT_MEMORIES,
  isLoading: false,
  error: null,
  selectedCategory: null,

  loadMemories: async (category, approved) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Try loading from local storage first (instant response)
      const stored = await SecureStore.getItemAsync(MEMORIES_STORAGE_KEY);
      let list = INITIAL_VAULT_MEMORIES;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
          }
        } catch {}
      }

      // 2. Try background sync with backend if available
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (approved !== undefined) params.set('approved', String(approved));

        const response = await Promise.race([
          apiClient.get<{ memories: Memory[] }>(`/memories?${params.toString()}`),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
        ]);
        if (response?.memories && Array.isArray(response.memories)) {
          list = response.memories;
          await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(list));
        }
      } catch {
        // Backend offline — proceed with local storage seamlessly
      }

      let filtered = list;
      if (category) filtered = filtered.filter((m) => m.category === category);
      if (approved !== undefined) filtered = filtered.filter((m) => m.familyApproved === approved);

      set({ memories: filtered, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error loading memories' });
    }
  },

  createMemory: async (memory) => {
    const newMemory: Memory = {
      ...memory,
      id: `mem-${Date.now()}`,
      verificationStatus: 'VERIFIED',
      familyApproved: true,
      createdAt: new Date().toISOString(),
    };

    const current = get().memories;
    const updated = [newMemory, ...current];
    set({ memories: updated });

    // Persist locally immediately
    await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    // Sync to backend if available
    try {
      await apiClient.post('/memories', newMemory);
    } catch {}
  },

  updateMemory: async (id: string, updates: Partial<Memory>) => {
    const updated = get().memories.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    set({ memories: updated });
    await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    try {
      await apiClient.patch(`/memories/${id}`, updates);
    } catch {}
  },

  approveMemory: async (id) => {
    const updated = get().memories.map((m) =>
      m.id === id ? { ...m, familyApproved: true, verificationStatus: 'VERIFIED' as const } : m
    );
    set({ memories: updated });
    await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    try {
      await apiClient.patch(`/memories/${id}`, {
        familyApproved: true,
        verificationStatus: 'VERIFIED',
      });
    } catch {}
  },

  rejectMemory: async (id) => {
    const updated = get().memories.map((m) =>
      m.id === id ? { ...m, verificationStatus: 'REJECTED' as const } : m
    );
    set({ memories: updated });
    await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    try {
      await apiClient.patch(`/memories/${id}`, { verificationStatus: 'REJECTED' });
    } catch {}
  },

  deleteMemory: async (id) => {
    const updated = get().memories.filter((m) => m.id !== id);
    set({ memories: updated });
    await SecureStore.setItemAsync(MEMORIES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    try {
      await apiClient.delete(`/memories/${id}`);
    } catch {}
  },

  setCategory: (category) => set({ selectedCategory: category }),
}));
