import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { query, queryOne } from '../db/client';
import { generateEmbedding } from '../services/ai/llm.service';

export const memoriesRouter = Router();
memoriesRouter.use(requireAuth);

const MEMORY_CATEGORIES = ['BIOGRAPHICAL', 'PERSONAL', 'PERSONALITY', 'VALUES', 'UNCERTAIN'] as const;

const createMemorySchema = z.object({
  category: z.enum(MEMORY_CATEGORIES),
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  sourceMediaId: z.string().uuid().optional(),
  sourceTimestamp: z.number().optional(),
  transcriptExcerpt: z.string().max(2000).optional(),
  sourceDescription: z.string().max(500).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
});

const updateMemorySchema = createMemorySchema.partial().extend({
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  familyApproved: z.boolean().optional(),
});

// GET /memories — list with optional filters
memoriesRouter.get('/', async (req, res) => {
  const userId = req.userId!;
  const { category, approved, search } = req.query as {
    category?: string;
    approved?: string;
    search?: string;
  };

  let sql = `
    SELECT m.id, m.category, m.title, m.content, m.source_description,
           m.verification_status, m.family_approved, m.confidence_score,
           m.source_media_id, m.source_timestamp, m.transcript_excerpt,
           m.created_at, m.updated_at
    FROM memories m
    WHERE m.user_id = $1
  `;
  const params: unknown[] = [userId];
  let idx = 2;

  if (category && MEMORY_CATEGORIES.includes(category as typeof MEMORY_CATEGORIES[number])) {
    sql += ` AND m.category = $${idx++}`;
    params.push(category);
  }
  if (approved === 'true') {
    sql += ` AND m.family_approved = TRUE`;
  } else if (approved === 'false') {
    sql += ` AND m.family_approved = FALSE`;
  }
  if (search) {
    sql += ` AND (m.title ILIKE $${idx} OR m.content ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  sql += ' ORDER BY m.created_at DESC LIMIT 100';

  const memories = await query(sql, params);
  return res.json({ memories });
});

// POST /memories — create a new memory
memoriesRouter.post('/', validate(createMemorySchema), async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof createMemorySchema>;

  try {
    // Generate embedding for semantic search
    const embedding = await generateEmbedding(body.content);
    const embeddingStr = `[${embedding.join(',')}]`;

    const [memory] = await query<{ id: string }>(
      `INSERT INTO memories (
        user_id, category, title, content,
        source_media_id, source_timestamp, transcript_excerpt, source_description,
        confidence_score, embedding
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::vector) RETURNING id`,
      [
        userId,
        body.category,
        body.title,
        body.content,
        body.sourceMediaId ?? null,
        body.sourceTimestamp ?? null,
        body.transcriptExcerpt ?? null,
        body.sourceDescription ?? null,
        body.confidenceScore ?? null,
        embeddingStr,
      ]
    );

    return res.status(201).json({ id: memory.id, message: 'Memory created.' });
  } catch (err) {
    console.error('[memories/create]', err);
    return res.status(500).json({ error: 'Failed to create memory.' });
  }
});

// PATCH /memories/:id — update (approve, correct, change status)
memoriesRouter.patch('/:id', validate(updateMemorySchema), async (req, res) => {
  const userId = req.userId!;
  const body = req.body as z.infer<typeof updateMemorySchema>;

  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM memories WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );
  if (!existing) return res.status(404).json({ error: 'Memory not found.' });

  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (body.title !== undefined) { updates.push(`title = $${idx++}`); params.push(body.title); }
  if (body.content !== undefined) {
    updates.push(`content = $${idx++}`); params.push(body.content);
    const embedding = await generateEmbedding(body.content);
    updates.push(`embedding = $${idx++}::vector`);
    params.push(`[${embedding.join(',')}]`);
  }
  if (body.category !== undefined) { updates.push(`category = $${idx++}`); params.push(body.category); }
  if (body.familyApproved !== undefined) { updates.push(`family_approved = $${idx++}`); params.push(body.familyApproved); }
  if (body.verificationStatus !== undefined) { updates.push(`verification_status = $${idx++}`); params.push(body.verificationStatus); }
  if (body.confidenceScore !== undefined) { updates.push(`confidence_score = $${idx++}`); params.push(body.confidenceScore); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

  updates.push(`updated_at = NOW()`);
  params.push(req.params.id, userId);

  await query(
    `UPDATE memories SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx}`,
    params
  );

  return res.json({ message: 'Memory updated.' });
});

// DELETE /memories/:id
memoriesRouter.delete('/:id', async (req, res) => {
  const userId = req.userId!;
  const result = await query(
    'DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, userId]
  );

  if (!result.length) return res.status(404).json({ error: 'Memory not found.' });
  return res.json({ message: 'Memory deleted.' });
});
