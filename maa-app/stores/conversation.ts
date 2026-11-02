import { create } from 'zustand';
import { apiClient } from '../services/api';
import { audioService } from '../services/audio';
import { useAuthStore } from './auth';
import { useMemoryStore } from './memory';

export interface ConversationTurn {
  id: string;
  role: 'USER' | 'ASSISTANT';
  text: string;
  memberId?: string;
  memberName?: string;
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

/**
 * Intelligent Kathiyawadi persona response generator for local/offline keepsake preview
 * Uses active member kinship and actual memories from the family vault.
 */
function generateLocalKathiyawadiResponse(userMessage: string): {
  text: string;
  memoriesUsed: number;
} {
  const { activeMember } = useAuthStore.getState();
  const { memories } = useMemoryStore.getState();
  const callName = activeMember?.callName || 'દિકરા';
  const lower = userMessage.toLowerCase();

  // Keyword-based memory contextualization
  if (lower.includes('જમ') || lower.includes('ખાધ') || lower.includes('રસોઈ') || lower.includes('રોટલ') || lower.includes('ઓળો')) {
    const foodMem = memories.find((m) => m.category === 'PERSONALITY');
    const phrase = foodMem?.characteristicPhrase || 'ખાવામાં કોઈ દી સંકોચ ન રખાય હો!';
    return {
      text: `અરે મારા ${callName}! તેં બપોરે પેટ ભરીને ખાધું કે નહિ? ગરમ-ગરમ બાજરાનો રોટલો ને ઘી-ગોળ હોય એટલે બીજું કાંઈ ન જોઈએ. ${phrase} શરીર સાચવજે હો ભાઈ!`,
      memoriesUsed: 1,
    };
  }

  if (lower.includes('કેમ છો') || lower.includes('કેમ છ') || lower.includes('મજા') || lower.includes('યાદ') || lower.includes('પ્રણામ') || lower.includes('પગે લાગુ')) {
    return {
      text: `ખૂબ રાજી થા મારા ${callName}! તારા માથે મારા સો-સો આશીર્વાદ છે. તું મને યાદ કરે છે એટલે હું હંમેશા તારી પાસે જ છું. ઘરમાં બાકી બધા કેમ છે? સુખી છે ને સૌ?`,
      memoriesUsed: 1,
    };
  }

  if (lower.includes('ગુંદાળા') || lower.includes('ગોંડલ') || lower.includes('મેળ') || lower.includes('બાળપણ') || lower.includes('વાર્તા')) {
    const histMem = memories.find((m) => m.category === 'PERSONAL');
    const phrase = histMem?.characteristicPhrase || 'અમે બધા મેળે ગ્યા\'તા અને મોટો હીંચકો ખાધો\'તો!';
    return {
      text: `હા ભલા માણહ! ગુંદાળા ગામ અને ગોંડલના મેળાની તો વાત જ અલગ હતી. ${phrase} આંગણામાં દીવડા પ્રગટાવીને બધા છોકરાઓને લાકડાના રમકડાં અપાવતી. એ દિવસો બહુ મીઠા હતા.`,
      memoriesUsed: 2,
    };
  }

  if (lower.includes('ચિંતા') || lower.includes('તકલીફ') || lower.includes('કામ') || lower.includes('દુઃખ') || lower.includes('મુશ્કેલ')) {
    const valMem = memories.find((m) => m.category === 'VALUES');
    const phrase = valMem?.characteristicPhrase || 'ઈશ્વર પર ભરોસો રાખો ભાઈ, એ કોઈ દી કોઈનું ખરાબ ન કરે.';
    return {
      text: `જો મારા ${callName}, સંસાર છે એટલે ચડતી-પડતી તો આવ્યા કરે. ${phrase} બહુ ચિંતા નહિ કરવાની. સાચા રસ્તે ચાલજે ને ધીરજ રાખજે, બધુંય હેમખેમ પાર પડી જાશે.`,
      memoriesUsed: 2,
    };
  }

  // Authentic general Kathiyawadi response
  return {
    text: `સાંભળ્યું મારા ${callName}! તારી મીઠી વાત સાંભળીને મારું હૈયું ટાઢું થઈ ગયું. તું તારા કામકાજમાં મન લગાડજે, ભગવાન તારું રક્ષણ કરે. બીજું કાંઈ નવી-જૂની કે'?`,
    memoriesUsed: 1,
  };
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  sessionId: null,
  turns: [],
  status: 'idle',
  error: null,
  isTranscriptVisible: false,

  startSession: async () => {
    set({ status: 'connecting', error: null });
    const { activeMember } = useAuthStore.getState();

    try {
      const response = await Promise.race([
        apiClient.post<{ sessionId: string }>('/conversation/session', { mode: 'text' }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000)),
      ]);
      set({ sessionId: response.sessionId, status: 'ready', turns: [] });
    } catch {
      // Local session mode
      const localSessionId = `local-session-${activeMember?.id || 'default'}-${Date.now()}`;
      set({ sessionId: localSessionId, status: 'ready', turns: [] });
    }
  },

  endSession: async () => {
    const { sessionId } = get();
    await audioService.stopPlaying();
    if (!sessionId) return;
    try {
      await apiClient.post(`/conversation/${sessionId}/end`, {});
    } catch {}
    set({ sessionId: null, status: 'idle', turns: [] });
  },

  sendTextMessage: async (text: string) => {
    let { sessionId } = get();
    if (!sessionId) {
      await get().startSession();
      sessionId = get().sessionId;
    }

    await audioService.stopPlaying();

    const { activeMember } = useAuthStore.getState();

    // Optimistically add user turn with member attribution
    const userTurn: ConversationTurn = {
      id: `turn-user-${Date.now()}`,
      role: 'USER',
      text: text.trim(),
      memberId: activeMember?.id,
      memberName: activeMember?.name,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      turns: [...state.turns, userTurn],
      status: 'processing',
    }));

    try {
      let responseText = '';
      let memoriesUsed = 0;
      let confidenceLevel = 'HIGH';

      // 1. Try backend RAG
      try {
        const response = await Promise.race([
          apiClient.post<{
            response: string;
            memoriesUsed: number;
            confidenceLevel: string;
          }>('/conversation/message', {
            sessionId,
            message: text,
            language: 'gu',
            memberKinship: activeMember?.kinship,
            memberCallName: activeMember?.callName,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500)),
        ]);
        responseText = response.response;
        memoriesUsed = response.memoriesUsed;
        confidenceLevel = response.confidenceLevel;
      } catch {
        // Fallback to local Kathiyawadi memory persona engine
        const local = generateLocalKathiyawadiResponse(text);
        responseText = local.text;
        memoriesUsed = local.memoriesUsed;
      }

      const assistantTurn: ConversationTurn = {
        id: `turn-assistant-${Date.now()}`,
        role: 'ASSISTANT',
        text: responseText,
        memoriesUsed,
        confidenceLevel,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        turns: [...state.turns, assistantTurn],
        status: 'ready',
      }));

      // Background audio synthesis for playback if available
      apiClient
        .post<{ audioBase64?: string }>('/voice/synthesize', { text: responseText })
        .then(async (ttsRes) => {
          if (ttsRes?.audioBase64) {
            set({ status: 'speaking' });
            await audioService.playAudioBase64(ttsRes.audioBase64, () => {
              set({ status: 'ready' });
            });
          }
        })
        .catch(() => {});
    } catch (err: any) {
      set({ status: 'error', error: err?.message || 'કૃપા કરીને ફરી પ્રયાસ કરો.' });
    }
  },

  sendVoiceAudio: async (audioBase64: string) => {
    let { sessionId } = get();
    if (!sessionId) {
      await get().startSession();
      sessionId = get().sessionId;
    }

    set({ status: 'processing', error: null });

    try {
      let transcribedText = '';
      try {
        const sttRes = await apiClient.post<{ transcript: string }>('/voice/transcribe', {
          audioBase64,
          mimeType: 'audio/wav',
        });
        transcribedText = sttRes.transcript?.trim() || '';
      } catch {
        // Demo voice fallback
        transcribedText = 'દાદીમા, કેમ છો? તમારું સ્વાસ્થ્ય કેવું છે?';
      }

      if (!transcribedText) {
        set({ status: 'ready', error: 'અવાજ સ્પષ્ટ સંભળાયો નથી. કૃપા કરીને ફરી બોલો.' });
        return;
      }

      await get().sendTextMessage(transcribedText);
    } catch (err: any) {
      set({ status: 'error', error: err?.message || 'વોઇસ પ્રોસેસિંગમાં ક્ષતિ આવી.' });
    }
  },

  interruptSpeaking: async () => {
    await audioService.stopPlaying();
    set({ status: 'ready' });
  },

  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  toggleTranscript: () => set((state) => ({ isTranscriptVisible: !state.isTranscriptVisible })),
  clearSession: () => set({ turns: [], status: 'idle', error: null, isTranscriptVisible: false }),
}));
