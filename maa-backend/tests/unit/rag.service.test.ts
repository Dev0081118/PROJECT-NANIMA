import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildResponse } from '../../src/services/ai/rag.service';

vi.mock('../../src/db/client', () => ({
  query: vi.fn().mockResolvedValue([
    {
      id: 'mem-1',
      category: 'BIOGRAPHICAL',
      title: 'Home Village',
      content: 'Born and raised in Gondal, Saurashtra.',
      verification_status: 'VERIFIED',
      family_approved: true,
      confidence_score: 0.95,
    },
    {
      id: 'mem-2',
      category: 'BIOGRAPHICAL',
      title: 'Family and Children',
      content: 'Mother of four, lived in a joint family.',
      verification_status: 'VERIFIED',
      family_approved: true,
      confidence_score: 0.9,
    },
  ]),
  queryOne: vi.fn().mockResolvedValue({
    relationship_to_grandmother: 'grandson',
    dialect_config: {},
    persona_config: {},
  }),
}));

vi.mock('../../src/services/ai/llm.service', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.01)),
  llm: {
    complete: vi.fn().mockResolvedValue('હા બેટા, ગોંડલ આપણું વતન છે. તું કેમ છે દીકરા?'),
  },
}));

describe('RAG Service', () => {
  it('retrieves memories and generates response with citations and high confidence', async () => {
    const result = await buildResponse('user-1', 'ગોંડલ વિશે કહો', []);

    expect(result.responseText).toContain('ગોંડલ');
    expect(result.memoriesUsed).toEqual(['mem-1', 'mem-2']);
    expect(result.confidenceLevel).toBe('HIGH');
  });

  it('determines confidence level appropriately based on biographical memory density', async () => {
    const result = await buildResponse('user-1', 'તમે ક્યાં રહેતા હતા?', []);
    expect(result.confidenceLevel).toBe('HIGH');
    expect(result.memoriesUsed.length).toBe(2);
  });
});
