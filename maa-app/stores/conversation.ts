import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface ConversationTurn {
  id: string;
  role: 'USER' | 'ASSISTANT';
  text: string;
  confidenceLevel?: string;
  memoriesUsed?: number;
  createdAt?: string;
}

type ConversationStatus =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

interface ConversationState {
  sessionId: string | null;
  turns: ConversationTurn[];
  status: ConversationStatus;
  error: string | null;
  isTranscriptVisible: boolean;

  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  sendTextMessage: (text: string) => Promise<void>;
  addTurn: (turn: ConversationTurn) => void;
  setStatus: (status: ConversationStatus) => void;
  setError: (error: string | null) => void;
  toggleTranscript: () => void;
  clearSession: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  sessionId: null,
  turns: [],
  status: 'idle',
  error: null,
  isTranscriptVisible: false,

  startSession: async () => {
    set({ status: 'connecting', error: null });
    try {
      const response = await apiClient.post<{ sessionId: string }>('/conversation/session', {
        mode: 'text',
      });
      set({ sessionId: response.sessionId, status: 'ready', turns: [] });
    } catch (err) {
      set({ status: 'error', error: 'Failed to start conversation session.' });
      throw err;
    }
  },

  endSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      await apiClient.post(`/conversation/${sessionId}/end`, {});
    } catch {
      // Best-effort
    }
    set({ sessionId: null, status: 'idle', turns: [] });
  },

  sendTextMessage: async (text: string) => {
    const { sessionId } = get();
    if (!sessionId) throw new Error('No active session');

    // Optimistically add user turn
    const userTurn: ConversationTurn = {
      id: `local-${Date.now()}`,
      role: 'USER',
      text,
    };
    set(state => ({
      turns: [...state.turns, userTurn],
      status: 'processing',
    }));

    try {
      const response = await apiClient.post<{
        response: string;
        memoriesUsed: number;
        confidenceLevel: string;
      }>('/conversation/message', {
        sessionId,
        message: text,
        language: 'gu',
      });

      const assistantTurn: ConversationTurn = {
        id: `assistant-${Date.now()}`,
        role: 'ASSISTANT',
        text: response.response,
        memoriesUsed: response.memoriesUsed,
        confidenceLevel: response.confidenceLevel,
      };

      set(state => ({
        turns: [...state.turns, assistantTurn],
        status: 'ready',
      }));
    } catch (err) {
      set({ status: 'error', error: 'Failed to get a response. Please try again.' });
      throw err;
    }
  },

  addTurn: (turn) => {
    set(state => ({ turns: [...state.turns, turn] }));
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  toggleTranscript: () => set(state => ({ isTranscriptVisible: !state.isTranscriptVisible })),
  clearSession: () => set({ sessionId: null, turns: [], status: 'idle', error: null }),
}));
