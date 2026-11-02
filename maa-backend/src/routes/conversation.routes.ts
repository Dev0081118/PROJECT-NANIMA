import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { query, queryOne } from '../db/client';
import { aiRateLimiter } from '../middleware/rateLimit.middleware';
import { buildResponse } from '../services/ai/rag.service';

export const conversationRouter = Router();
conversationRouter.use(requireAuth);

const startSessionSchema = z.object({
  mode: z.enum(['text', 'voice']).default('text'),
});

const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  language: z.string().default('gu'),
});

// POST /conversation/session — start a new session
conversationRouter.post('/session', validate(startSessionSchema), async (req, res) => {
  const userId = req.userId!;
  const [session] = await query<{ id: string; started_at: string }>(
    'INSERT INTO conversation_sessions (user_id) VALUES ($1) RETURNING id, started_at',
    [userId]
  );
  return res.status(201).json({ sessionId: session.id, startedAt: session.started_at });
});

// POST /conversation/message — send a text message
conversationRouter.post('/message', aiRateLimiter, validate(sendMessageSchema), async (req, res) => {
  const userId = req.userId!;
  const { sessionId, message, language } = req.body as z.infer<typeof sendMessageSchema>;

  // Verify session belongs to user
  const session = await queryOne<{ id: string }>(
    'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2 AND ended_at IS NULL',
    [sessionId, userId]
  );
  if (!session) return res.status(404).json({ error: 'Session not found or already ended.' });

  try {
    // Save user turn
    await query(
      'INSERT INTO conversation_turns (session_id, role, transcript_text) VALUES ($1, $2, $3)',
      [sessionId, 'USER', message]
    );

    // Load conversation history (last 10 turns)
    const history = await query<{ role: string; transcript_text: string }>(
      `SELECT role, transcript_text FROM conversation_turns
       WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [sessionId]
    );

    const chatHistory = history.reverse().map(t => ({
      role: t.role === 'USER' ? 'user' as const : 'assistant' as const,
      content: t.transcript_text,
    }));

    // Build RAG response
    const { responseText, memoriesUsed, confidenceLevel } = await buildResponse(
      userId,
      message,
      chatHistory,
      language
    );

    // Save assistant turn
    await query(
      `INSERT INTO conversation_turns (session_id, role, transcript_text, memory_ids_used, confidence_level)
       VALUES ($1, 'ASSISTANT', $2, $3, $4)`,
      [sessionId, responseText, memoriesUsed, confidenceLevel]
    );

    // Update turn count
    await query(
      'UPDATE conversation_sessions SET turn_count = turn_count + 2 WHERE id = $1',
      [sessionId]
    );

    return res.json({
      response: responseText,
      memoriesUsed: memoriesUsed.length,
      confidenceLevel,
    });
  } catch (err) {
    console.error('[conversation/message]', err);
    return res.status(500).json({ error: 'Failed to generate response. Please try again.' });
  }
});

// GET /conversation/history — list past sessions
conversationRouter.get('/history', async (req, res) => {
  const userId = req.userId!;
  const sessions = await query(
    `SELECT id, started_at, ended_at, summary, turn_count
     FROM conversation_sessions
     WHERE user_id = $1 ORDER BY started_at DESC LIMIT 50`,
    [userId]
  );
  return res.json({ sessions });
});

// GET /conversation/:id/turns — get turns for a session
conversationRouter.get('/:id/turns', async (req, res) => {
  const userId = req.userId!;

  const session = await queryOne<{ id: string }>(
    'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  const turns = await query(
    `SELECT id, role, transcript_text, confidence_level, created_at
     FROM conversation_turns WHERE session_id = $1 ORDER BY created_at ASC`,
    [session.id]
  );
  return res.json({ turns });
});

// DELETE /conversation/:id — delete a session and all its turns
conversationRouter.delete('/:id', async (req, res) => {
  const userId = req.userId!;
  const result = await query(
    'DELETE FROM conversation_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
    [req.params.id, userId]
  );
  if (!result.length) return res.status(404).json({ error: 'Session not found.' });
  return res.json({ message: 'Conversation deleted.' });
});

// POST /conversation/:id/end — end a session
conversationRouter.post('/:id/end', async (req, res) => {
  const userId = req.userId!;
  const result = await query(
    `UPDATE conversation_sessions SET ended_at = NOW()
     WHERE id = $1 AND user_id = $2 AND ended_at IS NULL RETURNING id`,
    [req.params.id, userId]
  );
  if (!result.length) return res.status(404).json({ error: 'Session not found or already ended.' });
  return res.json({ message: 'Session ended.' });
});
