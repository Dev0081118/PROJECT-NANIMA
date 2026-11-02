import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';

export const voiceRouter = Router();
voiceRouter.use(requireAuth);

// These routes are stubs for Milestone 3 (Voice Prototype)
// See docs/PROVIDER_EVALUATION.md for provider selection rationale

// POST /voice/analyze — analyze uploaded audio for quality
voiceRouter.post('/analyze', async (req, res) => {
  const userId = req.userId!;
  const { mediaId } = req.body as { mediaId?: string };

  if (!mediaId) return res.status(400).json({ error: 'mediaId is required.' });

  // TODO (M3): Implement audio quality analysis
  // - Signal-to-noise ratio
  // - Sample rate verification
  // - Duration check
  // - Voice activity ratio
  return res.json({
    status: 'not_implemented',
    message: 'Voice analysis will be implemented in Milestone 3.',
    mediaId,
    userId,
  });
});

// POST /voice/transcribe — transcribe audio to text (Gujarati)
voiceRouter.post('/transcribe', async (req, res) => {
  // TODO (M3): Implement Sarvam AI STT or Whisper
  // - Requires SARVAM_API_KEY or OPENAI_API_KEY
  return res.json({
    status: 'not_implemented',
    message: 'Transcription will be implemented in Milestone 3.',
    providers: {
      primary: 'Sarvam AI (gu)',
      fallback: 'OpenAI Whisper',
    },
  });
});

// POST /voice/synthesize — text-to-speech (Gujarati)
voiceRouter.post('/synthesize', async (req, res) => {
  // TODO (M3): Implement Sarvam AI TTS or Google Cloud TTS
  return res.json({
    status: 'not_implemented',
    message: 'TTS will be implemented in Milestone 3.',
    providers: {
      primary: 'Sarvam AI (gu)',
      fallback: 'Google Cloud TTS (gu-IN)',
    },
  });
});

// GET /voice/clone/status — check voice clone eligibility
voiceRouter.get('/clone/status', (_req, res) => {
  return res.json({
    status: 'blocked',
    reason: 'Voice cloning for deceased persons requires provider consent verification.',
    details: 'See docs/PROVIDER_EVALUATION.md for the current status of each provider.',
    providerOptions: [
      {
        name: 'Resemble AI',
        status: 'investigation_required',
        note: 'Contact required for estate/family consent pathway',
      },
      {
        name: 'Replica Studios',
        status: 'investigation_required',
        note: 'Contact required for deceased person policy',
      },
      {
        name: 'ElevenLabs',
        status: 'likely_blocked',
        note: 'Terms require living person consent recording',
      },
      {
        name: 'Custom fine-tuning (Coqui TTS)',
        status: 'available',
        note: 'Open source, family-controlled, requires 1-10 hours clean audio',
      },
    ],
  });
});
