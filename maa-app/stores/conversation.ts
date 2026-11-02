import { create } from 'zustand';
import { apiClient } from '../services/api';
import { audioService } from '../services/audio';

export interface ConversationTurn {
  id: string;
  role: 'USER' | 'ASSISTANT';
  text: string;
  confidenceLevel?: string;
  memoriesUsed?: number;
  createdAt?: string;
}

export type ConversationStatus =
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
  sendVoiceAudio: (audioBase64: string) => Promise<void>;
  interruptSpeaking: () => Promise<void>;
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
    await audioService.stopPlaying();
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

    await audioService.stopPlaying();

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

      // Background audio synthesis for playback if available
      apiClient.post<{ audioBase64?: string }>('/voice/synthesize', { text: response.response })
        .then(async (ttsRes) => {
          if (ttsRes.audioBase64) {
            set({ status: 'speaking' });
            await audioService.playAudioBase64(ttsRes.audioBase64, () => {
              set({ status: 'ready' });
            });
          }
        })
        .catch(() => {
          // Non-blocking if TTS is not configured
        });

    } catch (err) {
      set({ status: 'error', error: 'Failed to get a response. Please try again.' });
      throw err;
    }
  },

  sendVoiceAudio: async (audioBase64: string) => {
    const { sessionId } = get();
    if (!sessionId) throw new Error('No active session');

    set({ status: 'processing', error: null });

    try {
      // 1. Transcribe audio to Gujarati text
      const sttRes = await apiClient.post<{ transcript: string }>(
        '/voice/transcribe',
        { audioBase64, mimeType: 'audio/wav' }
      );

      const transcribedText = sttRes.transcript?.trim();
      if (!transcribedText) {
        set({ status: 'ready', error: 'અવાજ સ્પષ્ટ સંભળાયો નથી. કૃપા કરીને ફરી બોલો.' });
        return;
      }

      // 2. Add user turn
      const userTurn: ConversationTurn = {
        id: `user-voice-${Date.now()}`,
        role: 'USER',
        text: transcribedText,
      };
      set(state => ({ turns: [...state.turns, userTurn] }));

      // 3. Generate response via conversation pipeline
      const msgRes = await apiClient.post<{
        response: string;
        memoriesUsed: number;
        confidenceLevel: string;
      }>('/conversation/message', {
        sessionId,
        message: transcribedText,
        language: 'gu',
      });

      const assistantTurn: ConversationTurn = {
        id: `assistant-${Date.now()}`,
        role: 'ASSISTANT',
        text: msgRes.response,
        memoriesUsed: msgRes.memoriesUsed,
        confidenceLevel: msgRes.confidenceLevel,
      };

      set(state => ({
        turns: [...state.turns, assistantTurn],
        status: 'ready',
      }));

      // 4. Synthesize voice response & play
      try {
        const ttsRes = await apiClient.post<{ audioBase64?: string }>(
          '/voice/synthesize',
          { text: msgRes.response }
        );

        if (ttsRes.audioBase64) {
          set({ status: 'speaking' });
          await audioService.playAudioBase64(ttsRes.audioBase64, () => {
            set({ status: 'ready' });
          });
        }
      } catch {
        // If TTS unavailable, remain in ready state with text transcript
        set({ status: 'ready' });
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Voice conversation error.';
      set({ status: 'error', error: msg });
    }
  },

  interruptSpeaking: async () => {
    await audioService.stopPlaying();
    set({ status: 'ready' });
  },

  addTurn: (turn) => {
    set(state => ({ turns: [...state.turns, turn] }));
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  toggleTranscript: () => set(state => ({ isTranscriptVisible: !state.isTranscriptVisible })),
  clearSession: () => set({ sessionId: null, turns: [], status: 'idle', error: null }),
}));
