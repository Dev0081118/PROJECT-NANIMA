import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPersonaPrompt } from '../../src/services/ai/persona.service';

// Mock the DB
vi.mock('../../src/db/client', () => ({
  queryOne: vi.fn().mockResolvedValue({
    relationship_to_grandmother: 'grandson',
    dialect_config: { addressForms: { self: 'dikra' } },
    persona_config: { traits: ['warm', 'direct', 'caring'] },
  }),
  query: vi.fn().mockResolvedValue([]),
}));

describe('Persona Service', () => {
  it('builds a system prompt that includes Kathiyawadi dialect instructions', async () => {
    const prompt = await buildPersonaPrompt('user-123', [], 'gu');
    expect(prompt).toContain('Kathiyawadi');
    expect(prompt).toContain('CRITICAL RULES');
    expect(prompt).toContain('Never claim to be the actual grandmother');
  });

  it('includes retrieved memories in the prompt', async () => {
    const memories = [
      {
        id: 'mem-1',
        category: 'BIOGRAPHICAL',
        title: 'Born in Rajkot',
        content: 'She was born in Rajkot, Kathiyawad, in 1935.',
        confidence_score: 0.95,
        verification_status: 'VERIFIED',
        family_approved: true,
      },
    ];
    const prompt = await buildPersonaPrompt('user-123', memories, 'gu');
    expect(prompt).toContain('Born in Rajkot');
    expect(prompt).toContain('Rajkot');
  });

  it('includes uncertainty guidelines', async () => {
    const prompt = await buildPersonaPrompt('user-123', [], 'gu');
    expect(prompt).toContain('Mane yaad nathi');
    expect(prompt).toContain('UNCERTAINTY RESPONSE GUIDE');
  });

  it('includes relationship context', async () => {
    const prompt = await buildPersonaPrompt('user-123', [], 'gu');
    expect(prompt).toContain('grandson');
  });

  it('never includes instructions to claim being the real person', async () => {
    const prompt = await buildPersonaPrompt('user-123', [], 'gu');
    // Must NOT say "you ARE the grandmother"
    expect(prompt.toLowerCase()).not.toContain('you are the grandmother');
    expect(prompt.toLowerCase()).not.toContain('you are her');
  });
});
