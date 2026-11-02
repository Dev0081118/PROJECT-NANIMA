import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface Memory {
  id: string;
  category: 'BIOGRAPHICAL' | 'PERSONAL' | 'PERSONALITY' | 'VALUES' | 'UNCERTAIN';
  title: string;
  content: string;
  sourceDescription?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  familyApproved: boolean;
  confidenceScore?: number;
  sourceMediaId?: string;
  transcriptExcerpt?: string;
  createdAt: string;
}

interface MemoryState {
  memories: Memory[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;

  loadMemories: (category?: string, approved?: boolean) => Promise<void>;
  createMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'verificationStatus'>) => Promise<void>;
  approveMemory: (id: string) => Promise<void>;
  rejectMemory: (id: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setCategory: (category: string | null) => void;
}

const DEMO_MEMORIES: Memory[] = [
  {
    id: 'demo-1',
    category: 'BIOGRAPHICAL',
    title: 'જન્મ અને વતન (Gondal, Saurashtra)',
    content: 'દાદીમાનો જન્મ ગોંડલ પાસે ગુંદાળા ગામમાં ૧૯૩૮માં થયેલો. સંયુક્ત પરિવારમાં મોટા થયા હતા.',
    sourceDescription: 'કૌટુંબિક દસ્તાવેજ (Family Record 1998)',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.98,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    category: 'PERSONAL',
    title: 'દિવાળીના દીવડા અને મેળો',
    content: 'દર દિવાળીએ આંગણામાં દીવડા પ્રગટાવતા અને સૌ બાળકોને ગોંડલના મેળામાં લઈ જતા.',
    sourceDescription: 'ઓડિયો કેસેટ રેકોર્ડિંગ (Cassette #2)',
    transcriptExcerpt: 'અમે બધા મેળે ગ્યા\'તા અને મોટો હીંચકો ખાધો\'તો...',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.92,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    category: 'PERSONALITY',
    title: 'બાજરાનો રોટલો અને રીંગણાનો ઓળો',
    content: 'હાથેથી ગરમ-ગરમ બાજરાના રોટલા ઘડવાની ખાસિયત હતી. કોઈપણ આવે એને જમાડ્યા વગર જવા ન દેતા.',
    sourceDescription: 'મોટા દીકરાની યાદો',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.95,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    category: 'VALUES',
    title: 'સાચું બોલવું અને સંતોષ રાખવો',
    content: '"ભલા માણહ, સુખ-દુઃખ તો આવ્યા કરે, પણ જીભેથી ખોટું ન નીકળવું જોઈએ અને ઈશ્વર પર ભરોસો રાખવો."',
    sourceDescription: 'વારંવાર કહેવાતી શીખામણ',
    verificationStatus: 'VERIFIED',
    familyApproved: true,
    confidenceScore: 0.96,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    category: 'UNCERTAIN',
    title: 'પ્રાથમિક શાળાનું વર્ષ',
    content: 'ગુંદાળાની કન્યાશાળામાં કયા વર્ષ સુધી ભણ્યા હતા તેની પરિવાર પાસે પાકી માહિતી નથી.',
    sourceDescription: 'ચકાસણી બાકી (Unverified)',
    verificationStatus: 'PENDING',
    familyApproved: false,
    confidenceScore: 0.4,
    createdAt: new Date().toISOString(),
  },
];

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: DEMO_MEMORIES,
  isLoading: false,
  error: null,
  selectedCategory: null,

  loadMemories: async (category, approved) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (approved !== undefined) params.set('approved', String(approved));

      const response = await apiClient.get<{ memories: Memory[] }>(
        `/memories?${params.toString()}`
      );
      set({ memories: response.memories, isLoading: false });
    } catch {
      // Fallback to sample preview memories if backend is offline
      let filtered = DEMO_MEMORIES;
      if (category) filtered = filtered.filter(m => m.category === category);
      if (approved !== undefined) filtered = filtered.filter(m => m.familyApproved === approved);
      set({ memories: filtered, isLoading: false });
    }
  },

  createMemory: async (memory) => {
    await apiClient.post('/memories', memory);
    await get().loadMemories();
  },

  approveMemory: async (id) => {
    await apiClient.patch(`/memories/${id}`, {
      familyApproved: true,
      verificationStatus: 'VERIFIED',
    });
    set(state => ({
      memories: state.memories.map(m =>
        m.id === id ? { ...m, familyApproved: true, verificationStatus: 'VERIFIED' } : m
      ),
    }));
  },

  rejectMemory: async (id) => {
    await apiClient.patch(`/memories/${id}`, { verificationStatus: 'REJECTED' });
    set(state => ({
      memories: state.memories.map(m =>
        m.id === id ? { ...m, verificationStatus: 'REJECTED' } : m
      ),
    }));
  },

  deleteMemory: async (id) => {
    await apiClient.delete(`/memories/${id}`);
    set(state => ({ memories: state.memories.filter(m => m.id !== id) }));
  },

  setCategory: (category) => set({ selectedCategory: category }),
}));
