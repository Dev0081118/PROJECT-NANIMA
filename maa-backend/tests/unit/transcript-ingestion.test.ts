import { describe, it, expect, vi } from 'vitest';
import { parseTranscriptText, ingestTranscriptItems } from '../../src/services/ai/transcript-ingestion.service';

vi.mock('../../src/db/client', () => ({
  query: vi.fn().mockResolvedValue([{ id: 'mem-ingested-1' }]),
}));

vi.mock('../../src/services/ai/llm.service', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.02)),
}));

describe('Transcript Ingestion Service', () => {
  it('parses raw text and detects biographical facts', () => {
    const raw = `
      [01:15] મારો જન્મ ગોંડલ પાસે ગુંદાળા ગામમાં ૧૯૩૮ માં થયેલો. અમારા ઘરમાં આઠ ભાઈ-બહેન હતા.

      [03:40] મને બાજરાનો રોટલો અને રીંગણાનું ઓળો બનાવવો બહુ ગમતો. સૌ પ્રેમથી ખાતા.

      [08:20] જીવનમાં ગમે તેવી તકલીફ આવે પણ સાચું બોલવું અને ઈશ્વર પર ભરોસો રાખવો.

      [12:10] આ બાબતની મને કદાચ બહુ ખબર નથી કે ત્યારે શું થયેલું.
    `;

    const items = parseTranscriptText(raw, '૧૯૯૮ દિવાળી ઓડિયો કેસેટ');

    expect(items.length).toBe(4);

    // Biographical
    expect(items[0].category).toBe('BIOGRAPHICAL');
    expect(items[0].sourceTimestamp).toBe(75); // 01:15 = 75 seconds
    expect(items[0].sourceDescription).toBe('૧૯૯૮ દિવાળી ઓડિયો કેસેટ');

    // Personality (food)
    expect(items[1].category).toBe('PERSONALITY');
    expect(items[1].sourceTimestamp).toBe(220); // 03:40 = 220s

    // Values
    expect(items[2].category).toBe('VALUES');

    // Uncertain
    expect(items[3].category).toBe('UNCERTAIN');
  });

  it('ingests items into database with vector embeddings and pending status', async () => {
    const items = [
      {
        category: 'BIOGRAPHICAL' as const,
        title: 'જન્મ અને વતન',
        content: 'ગુંદાળા ગામમાં જન્મ.',
        sourceDescription: 'Test interview',
      },
    ];

    const result = await ingestTranscriptItems('user-1', items, false);
    expect(result.insertedCount).toBe(1);
    expect(result.memoryIds[0]).toBe('mem-ingested-1');
    expect(result.categories['BIOGRAPHICAL']).toBe(1);
  });
});
