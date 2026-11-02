import { useAuthStore } from '../stores/auth';
import { useConversationStore } from '../stores/conversation';
import { useMemoryStore } from '../stores/memory';

describe('useConversationStore', () => {
  beforeEach(() => {
    useConversationStore.getState().clearSession();
  });

  it('initializes with idle status and empty turns', () => {
    const state = useConversationStore.getState();
    expect(state.status).toBe('idle');
    expect(state.turns).toEqual([]);
    expect(state.isTranscriptVisible).toBe(false);
  });

  it('toggles transcript visibility', () => {
    expect(useConversationStore.getState().isTranscriptVisible).toBe(false);
    useConversationStore.getState().toggleTranscript();
    expect(useConversationStore.getState().isTranscriptVisible).toBe(true);
    useConversationStore.getState().toggleTranscript();
    expect(useConversationStore.getState().isTranscriptVisible).toBe(false);
  });

  it('adds turns correctly', () => {
    useConversationStore.getState().addTurn({
      id: 'turn-1',
      role: 'USER',
      text: 'જય શ્રી કૃષ્ણ બા',
    });
    expect(useConversationStore.getState().turns.length).toBe(1);
    expect(useConversationStore.getState().turns[0].text).toBe('જય શ્રી કૃષ્ણ બા');
  });

  it('updates status and error states', () => {
    useConversationStore.getState().setStatus('listening');
    expect(useConversationStore.getState().status).toBe('listening');

    useConversationStore.getState().setError('Mic permission required');
    expect(useConversationStore.getState().error).toBe('Mic permission required');
  });
});

describe('useMemoryStore', () => {
  it('filters selected category', () => {
    useMemoryStore.getState().setCategory('BIOGRAPHICAL');
    expect(useMemoryStore.getState().selectedCategory).toBe('BIOGRAPHICAL');

    useMemoryStore.getState().setCategory(null);
    expect(useMemoryStore.getState().selectedCategory).toBeNull();
  });
});

describe('useAuthStore', () => {
  it('toggles disclosure acceptance', () => {
    useAuthStore.getState().acceptDisclosure();
    expect(useAuthStore.getState().disclosureAccepted).toBe(true);
  });
});
