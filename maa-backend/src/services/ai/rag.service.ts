/**
 * RAG (Retrieval-Augmented Generation) service.
 *
 * Pipeline:
 * 1. Embed the user's message
 * 2. Retrieve top-K relevant memories from pgvector
 * 3. Build the Kathiyawadi persona prompt
 * 4. Call LLM with context
 * 5. Return response with source attribution
 */

import { query } from '../../db/client';
import { generateEmbedding, llm, ChatMessage } from './llm.service';
import { buildPersonaPrompt } from './persona.service';

interface Memory {
  id: string;
  category: string;
  title: string;
  content: string;
  verification_status: string;
  family_approved: boolean;
  confidence_score: number | null;
}

interface RAGResult {
  responseText: string;
  memoriesUsed: string[];
  confidenceLevel: string;
}

const TOP_K = 6;

export async function retrieveRelevantMemories(
  userId: string,
  queryText: string,
  limit = TOP_K
): Promise<Memory[]> {
  // Only retrieve family-approved and verified memories for AI context
  // UNCERTAIN category memories are not included automatically
  const embedding = await generateEmbedding(queryText);
  const embeddingStr = `[${embedding.join(',')}]`;

  const memories = await query<Memory>(
    `SELECT id, category, title, content, verification_status, family_approved, confidence_score
     FROM memories
     WHERE user_id = $1
       AND family_approved = TRUE
       AND verification_status = 'VERIFIED'
       AND category != 'UNCERTAIN'
     ORDER BY embedding <=> $2::vector
     LIMIT $3`,
    [userId, embeddingStr, limit]
  );

  return memories;
}

export async function buildResponse(
  userId: string,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  language = 'gu'
): Promise<RAGResult> {
  // Retrieve relevant memories
  const memories = await retrieveRelevantMemories(userId, userMessage);
  const memoryIds = memories.map(m => m.id);

  // Build the system prompt
  const systemPrompt = await buildPersonaPrompt(userId, memories, language);

  // Build messages array
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8), // last 8 turns for context
    { role: 'user', content: userMessage },
  ];

  // Call LLM
  let responseText: string;
  try {
    responseText = await llm.complete(messages);
  } catch (err) {
    console.error('[RAG] LLM call failed:', err);
    throw new Error('AI response generation failed. Please try again.');
  }

  // Determine confidence level
  const confidenceLevel = determineConfidenceLevel(memories, responseText);

  return {
    responseText,
    memoriesUsed: memoryIds,
    confidenceLevel,
  };
}

function determineConfidenceLevel(memories: Memory[], _response: string): string {
  if (memories.length === 0) return 'LOW';
  const biographicalCount = memories.filter(m => m.category === 'BIOGRAPHICAL').length;
  if (biographicalCount >= 2) return 'HIGH';
  if (memories.length >= 3) return 'MEDIUM';
  return 'LOW';
}
