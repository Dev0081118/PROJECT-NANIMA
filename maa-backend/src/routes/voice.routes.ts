import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth.middleware';
import { queryOne, query } from '../db/client';
import { getSTTProvider } from '../services/voice/stt.service';
import { getTTSProvider } from '../services/voice/tts.service';
import { analyzeAudioBuffer } from '../services/voice/voice-analysis.service';

export const voiceRouter = Router();
voiceRouter.use(requireAuth);

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for audio
});

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

// POST /voice/analyze — analyze audio quality from uploaded buffer or stored media
voiceRouter.post('/analyze', upload.single('file'), async (req, res) => {
  const userId = req.userId!;
  const mediaId = req.body.mediaId;

  try {
    let buffer: Buffer | null = null;
    let mimeType = 'audio/wav';

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (mediaId) {
      const asset = await queryOne<{ storage_path: string; mime_type: string }>(
        'SELECT storage_path, mime_type FROM media_assets WHERE id = $1 AND user_id = $2',
        [mediaId, userId]
      );
      if (!asset) {
        return res.status(404).json({ error: 'Media asset not found.' });
      }
      const fullPath = path.join(UPLOAD_DIR, asset.storage_path);
      if (fs.existsSync(fullPath)) {
        buffer = fs.readFileSync(fullPath);
        mimeType = asset.mime_type;
      }
    }

    if (!buffer) {
      return res.status(400).json({ error: 'Please provide either an audio file or a valid mediaId.' });
    }

    const analysis = analyzeAudioBuffer(buffer, mimeType);

    // If mediaId was provided, update audio metrics in database
    if (mediaId) {
      await query(
        'UPDATE media_assets SET audio_snr_db = $1, duration_seconds = $2 WHERE id = $3',
        [analysis.estimatedSNRdB, analysis.durationEstimateSeconds, mediaId]
      );
    }

    return res.json({
      status: 'success',
      analysis,
    });
  } catch (err: unknown) {
    console.error('[voice/analyze]', err);
    return res.status(500).json({ error: 'Audio analysis failed.' });
  }
});

// POST /voice/transcribe — transcribe audio buffer or base64 to Gujarati text
voiceRouter.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    let buffer: Buffer | null = null;
    let mimeType = 'audio/wav';

    if (req.file) {
      buffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body.audioBase64) {
      buffer = Buffer.from(req.body.audioBase64, 'base64');
      if (req.body.mimeType) mimeType = req.body.mimeType;
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'No audio provided for transcription.' });
    }

    const stt = getSTTProvider();
    const result = await stt.transcribe(buffer, mimeType);

    return res.json({
      transcript: result.text,
      language: result.language,
      provider: result.provider,
    });
  } catch (err: unknown) {
    console.error('[voice/transcribe]', err);
    return res.status(500).json({
      error: 'Transcription failed.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// POST /voice/synthesize — synthesize Gujarati text to speech audio
voiceRouter.post('/synthesize', async (req, res) => {
  const { text, speaker } = req.body as { text?: string; speaker?: string };

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for synthesis.' });
  }

  try {
    const tts = getTTSProvider();
    const result = await tts.synthesize(text, speaker);

    return res.json({
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      provider: result.provider,
      characterCount: result.characterCount,
    });
  } catch (err: unknown) {
    console.error('[voice/synthesize]', err);
    return res.status(500).json({
      error: 'Speech synthesis failed.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// GET /voice/clone/status — comprehensive audit of voice recreation legality and options
voiceRouter.get('/clone/status', (_req, res) => {
  return res.json({
    status: 'investigation_active',
    summary: 'Voice cloning of a deceased person involves strict ethical and consent guardrails.',
    distinction: {
      standardSynthesis: {
        status: 'READY',
        provider: 'Sarvam AI (bulbul:v1)',
        description: 'Authentic Indian regional Gujarati text-to-speech with natural pacing and tone. Does not claim to be the grandmother\'s exact voice.',
      },
      voiceSimilarity: {
        status: 'READY',
        description: 'Configuring acoustic parameters (pitch, pace, older female profile) to feel familial and warm without deepfake fabrication.',
      },
      instantVoiceCloning: {
        status: 'BLOCKED_BY_POLICY',
        provider: 'ElevenLabs',
        blockerReason: 'ElevenLabs Terms Section 2 strictly requires explicit real-time voice verification from the living speaker (voice captcha reading a randomized phrase). Cannot be fulfilled for a deceased family member without fraud.',
      },
      estateAuthorizedPathway: {
        status: 'IN_REVIEW',
        providers: ['Resemble AI Enterprise', 'Replica Studios Custom'],
        notes: 'May consider formal estate legal documentation from direct heirs. Incurring commercial costs requires explicit family authorization.',
      },
      customModelTraining: {
        status: 'TECHNICALLY_FEASIBLE',
        openSourceOption: 'Coqui XTTS-v2 / Piper fine-tuned locally',
        requirements: 'Requires 30+ minutes of clean studio/cassette audio of the grandmother alone without background music or overlapping speech.',
      },
    },
  });
});
