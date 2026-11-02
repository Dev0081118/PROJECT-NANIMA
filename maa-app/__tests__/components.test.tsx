import React from 'react';
import { render } from '@testing-library/react-native';
import { ConversationBubble } from '../components/conversation/ConversationBubble';
import { StatusIndicator } from '../components/conversation/StatusIndicator';

describe('ConversationBubble', () => {
  it('renders user message', () => {
    const turn = { id: '1', role: 'USER' as const, text: 'Hello' };
    const { getByText } = render(<ConversationBubble turn={turn} />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders assistant message', () => {
    const turn = {
      id: '2',
      role: 'ASSISTANT' as const,
      text: 'Kem cho dikra?',
      memoriesUsed: 3,
      confidenceLevel: 'HIGH',
    };
    const { getByText } = render(<ConversationBubble turn={turn} />);
    expect(getByText('Kem cho dikra?')).toBeTruthy();
  });

  it('shows memory count for assistant messages', () => {
    const turn = {
      id: '3',
      role: 'ASSISTANT' as const,
      text: 'Response text',
      memoriesUsed: 2,
      confidenceLevel: 'MEDIUM',
    };
    const { getByText } = render(<ConversationBubble turn={turn} />);
    expect(getByText(/2 memories recalled/)).toBeTruthy();
  });
});

describe('StatusIndicator', () => {
  it.each([
    ['idle'],
    ['listening'],
    ['speaking'],
    ['processing'],
    ['error'],
  ] as const)('renders %s status without crash', (status) => {
    const { UNSAFE_root } = render(<StatusIndicator status={status as any} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
