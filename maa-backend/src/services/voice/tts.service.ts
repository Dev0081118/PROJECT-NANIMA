/**
 * Text-to-Speech (TTS) Provider Abstraction for Gujarati
 *
 * Primary: Sarvam AI (bulbul:v1) — Indian regional language synthesis.
 * Dev Fallback: Returns structured payload indicating mock state.
 */

export interface TTSResult {
  audioBase64: string;
  mimeType: string;
  provider: 'sarvam' | 'google' | 'dev_mock';
  characterCount: number;
}

export interface TTSProvider {
  synthesize(text: string, speaker?: string): Promise<TTSResult>;
}

export class SarvamTTSProvider implements TTSProvider {
  private apiKey: string;
  private defaultSpeaker: string;

  constructor(apiKey: string, speaker = 'meera') {
    this.apiKey = apiKey;
    this.defaultSpeaker = speaker;
  }

  async synthesize(text: string, speaker?: string): Promise<TTSResult> {
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': this.apiKey,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: 'gu-IN',
        speaker: speaker || this.defaultSpeaker,
        pitch: 0,
        pace: 0.95, // Slightly gentler, maternal speaking pace
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v1',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sarvam TTS failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { audios: string[] };
    if (!data.audios || data.audios.length === 0) {
      throw new Error('Sarvam TTS returned empty audio payload');
    }

    return {
      audioBase64: data.audios[0],
      mimeType: 'audio/wav',
      provider: 'sarvam',
      characterCount: text.length,
    };
  }
}

export class DevMockTTSProvider implements TTSProvider {
  async synthesize(text: string): Promise<TTSResult> {
    // Generate minimal standard 44-byte WAV header for silence so mobile decoders don't crash
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // file size - 8
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6d, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // chunk size 16
      0x01, 0x00,             // PCM format
      0x01, 0x00,             // Mono
      0x44, 0xac, 0x00, 0x00, // 44100 Hz
      0x88, 0x58, 0x01, 0x00, // byte rate
      0x02, 0x00,             // block align
      0x10, 0x00,             // 16 bits
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // data size 0
    ]);

    return {
      audioBase64: wavHeader.toString('base64'),
      mimeType: 'audio/wav',
      provider: 'dev_mock',
      characterCount: text.length,
    };
  }
}

export function getTTSProvider(): TTSProvider {
  if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'REPLACE_WITH_SARVAM_KEY') {
    return new SarvamTTSProvider(
      process.env.SARVAM_API_KEY,
      process.env.SARVAM_TTS_VOICE || 'meera'
    );
  }

  return new DevMockTTSProvider();
}
