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

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
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
      set({ isLoading: false, error: 'Failed to load memories.' });
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
