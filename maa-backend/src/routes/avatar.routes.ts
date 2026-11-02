import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

export const avatarRouter = Router();
avatarRouter.use(requireAuth);

// GET /avatar/status — current avatar provider status
avatarRouter.get('/status', (_req, res) => {
  return res.json({
    status: 'blocked',
    reason: 'Photorealistic avatar for deceased persons requires provider consent verification.',
    currentImplementation: 'Animated portrait using family photograph (Milestone 4 stub).',
    details: 'See docs/PROVIDER_EVALUATION.md for current provider research.',
    providerOptions: [
      {
        name: 'D-ID',
        status: 'investigation_required',
        note: 'Photo-based animation; consent terms require verification for deceased persons',
        cost: 'from $5.90/month',
      },
      {
        name: 'Simli.ai',
        status: 'investigation_required',
        note: 'Newer provider; terms less restrictive in marketing but require verification',
        cost: 'usage-based',
      },
      {
        name: 'HeyGen',
        status: 'blocked',
        note: 'Explicitly requires live video consent — cannot be obtained for deceased',
      },
      {
        name: 'Synthesia',
        status: 'blocked',
        note: 'Explicitly requires live video consent — cannot be obtained for deceased',
      },
      {
        name: 'Rhubarb Lip Sync (open source)',
        status: 'available',
        note: 'Phoneme-based mouth animation from photo; no provider consent required; offline',
        cost: 'free',
      },
    ],
  });
});

// POST /avatar/token — generate short-lived avatar session token
// Will be implemented once provider selected and consent confirmed
avatarRouter.post('/token', (_req, res) => {
  return res.status(503).json({
    error: 'Avatar service not yet configured.',
    message: 'See GET /avatar/status for current status.',
  });
});
