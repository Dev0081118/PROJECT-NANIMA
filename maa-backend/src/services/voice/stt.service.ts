/**
 * Speech-to-Text (STT) Provider Abstraction for Gujarati & Kathiyawadi
 *
 * Primary: Sarvam AI (saarika:v2) — optimized for Indian regional languages.
 * Fallback: OpenAI Whisper API.
 * Dev Fallback: Mock provider when API keys are not yet configured.
 */

import fs from 'fs';
import path from 'path';

export interface TranscriptResult {
  text: string;
  language: string;
  confidence?: number;
  provider: 'sarvam' | 'whisper' | 'dev_mock';
  durationSeconds?: number;
}

export interface STTProvider {
  transcribe(audioBuffer: Buffer, mimeType?: string): Promise<TranscriptResult>;
}

export class SarvamSTTProvider implements STTProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'saarika:v2') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async transcribe(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<TranscriptResult> {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', this.model);
    formData.append('language_code', 'gu-IN');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': this.apiKey,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sarvam STT failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { transcript: string; language_code?: string };
    return {
      text: data.transcript || '',
      language: data.language_code || 'gu-IN',
      provider: 'sarvam',
    };
  }
}

export class WhisperSTTProvider implements STTProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<TranscriptResult> {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', 'gu');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Whisper STT failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { text: string };
    return {
      text: data.text || '',
      language: 'gu',
      provider: 'whisper',
    };
  }
}

export class DevMockSTTProvider implements STTProvider {
  async transcribe(_audioBuffer: Buffer): Promise<TranscriptResult> {
    return {
      text: 'જય શ્રી કૃષ્ણ બા, તમે કેમ છો?',
      language: 'gu-IN',
      confidence: 1.0,
      provider: 'dev_mock',
    };
  }
}

export function getSTTProvider(): STTProvider {
  if (process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'REPLACE_WITH_SARVAM_KEY') {
    return new SarvamSTTProvider(process.env.SARVAM_API_KEY, process.env.SARVAM_STT_MODEL || 'saarika:v2');
  }

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    return new WhisperSTTProvider(process.env.OPENAI_API_KEY);
  }

  return new DevMockSTTProvider();
}
