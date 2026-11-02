import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { queryOne } from '../db/client';
import {
  FamilyProfile,
  updateFamilyPersonaProfile,
  KATHIYAWADI_VOCABULARY_REFERENCE,
} from '../services/ai/persona.service';
import {
  parseTranscriptText,
  ingestTranscriptItems,
} from '../services/ai/transcript-ingestion.service';

export const familyRouter = Router();
familyRouter.use(requireAuth);

const updateProfileSchema = z.object({
  relationship: z.string().max(100).optional(),
  dialectConfig: z.object({
    region: z.string().max(100).optional(),
    greetingStyle: z.string().max(100).optional(),
    addressForms: z.record(z.string()).optional(),
    customVocabulary: z.record(z.string()).optional(),
    characteristicPhrases: z.array(z.string()).optional(),
    useRegionalPhonetics: z.boolean().optional(),
  }).optional(),
  personaConfig: z.object({
    traits: z.array(z.string()).optional(),
    habits: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    cookingSpecialties: z.array(z.string()).optional(),
    humourStyle: z.string().optional(),
    adviceStyle: z.string().optional(),
  }).optional(),
});

const ingestTranscriptSchema = z.object({
  rawText: z.string().min(10, 'Transcript text is too short'),
  sourceDescription: z.string().min(2, 'Source description required (e.g., "1998 Diwali Cassette Recording")'),
  sourceMediaId: z.string().uuid().optional(),
  autoApprove: z.boolean().default(false),
});

// GET /family/profile
familyRouter.get('/profile', async (req, res) => {
  const userId = req.userId!;
  const profile = await queryOne<FamilyProfile>(
    `SELECT relationship_to_grandmother, preferred_language, dialect, dialect_config, persona_config
     FROM family_profiles WHERE user_id = $1`,
    [userId]
  );

  if (!profile) {
    return res.json({
      relationship: 'grandson',
      dialectConfig: {},
      personaConfig: {},
    });
  }

  return res.json({
    relationship: profile.relationship_to_grandmother,
    preferredLanguage: profile.preferred_language,
    dialect: profile.dialect,
    dialectConfig: profile.dialect_config,
    personaConfig: profile.persona_config,
  });
});

// PATCH /family/profile
familyRouter.patch('/profile', validate(updateProfileSchema), async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof updateProfileSchema>;

  try {
    const updated = await updateFamilyPersonaProfile(userId, body);
    return res.json({
      message: 'Family profile and dialect configuration updated.',
      profile: updated,
    });
  } catch (err) {
    console.error('[family/profile]', err);
    return res.status(500).json({ error: 'Failed to update family profile.' });
  }
});

// GET /family/vocabulary/reference — authentic Kathiyawadi lexicon
familyRouter.get('/vocabulary/reference', (_req, res) => {
  return res.json({
    description: 'Authentic Kathiyawadi vocabulary reference for family guidance',
    vocabulary: KATHIYAWADI_VOCABULARY_REFERENCE,
  });
});

// POST /family/transcripts/ingest — import family audio/video transcript
familyRouter.post('/transcripts/ingest', validate(ingestTranscriptSchema), async (req, res) => {
  const userId = req.userId!;
  const { rawText, sourceDescription, sourceMediaId, autoApprove } = req.body as z.infer<typeof ingestTranscriptSchema>;

  try {
    // 1. Parse text into structured memory items
    const parsedItems = parseTranscriptText(rawText, sourceDescription, sourceMediaId);

    if (parsedItems.length === 0) {
      return res.status(400).json({ error: 'No meaningful memories could be extracted from text.' });
    }

    // 2. Ingest into database with embeddings
    const result = await ingestTranscriptItems(userId, parsedItems, autoApprove);

    return res.status(201).json({
      message: `Successfully ingested ${result.insertedCount} memory candidates from transcript.`,
      result,
      reviewRequired: !autoApprove,
    });
  } catch (err) {
    console.error('[family/transcripts/ingest]', err);
    return res.status(500).json({ error: 'Transcript ingestion failed.' });
  }
});
