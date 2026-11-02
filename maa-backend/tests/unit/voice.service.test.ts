import { describe, it, expect } from 'vitest';
import { analyzeAudioBuffer } from '../../src/services/voice/voice-analysis.service';
import { DevMockSTTProvider } from '../../src/services/voice/stt.service';
import { DevMockTTSProvider } from '../../src/services/voice/tts.service';

describe('Voice Services', () => {
  it('analyzes audio buffer metrics and generates quality ratings', () => {
    // Generate simulated 100KB buffer
    const buf = Buffer.alloc(100000, 150);
    const result = analyzeAudioBuffer(buf);

    expect(result.fileSizeBytes).toBe(100000);
    expect(result.durationEstimateSeconds).toBeGreaterThan(0);
    expect(result.estimatedSNRdB).toBeGreaterThan(0);
    expect(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).toContain(result.qualityRating);
    expect(result.feedbackNotes.length).toBeGreaterThan(0);
  });

  it('transcribes via STT provider fallback', async () => {
    const stt = new DevMockSTTProvider();
    const result = await stt.transcribe(Buffer.from('dummy'));

    expect(result.provider).toBe('dev_mock');
    expect(result.text).toContain('જય શ્રી કૃષ્ણ');
    expect(result.language).toBe('gu-IN');
  });

  it('synthesizes via TTS provider fallback', async () => {
    const tts = new DevMockTTSProvider();
    const result = await tts.synthesize('હા દીકરા, હું મજામાં છું.');

    expect(result.provider).toBe('dev_mock');
    expect(result.audioBase64).toBeDefined();
    expect(result.mimeType).toBe('audio/wav');
    expect(result.characterCount).toBe('હા દીકરા, હું મજામાં છું.'.length);
  });
});
