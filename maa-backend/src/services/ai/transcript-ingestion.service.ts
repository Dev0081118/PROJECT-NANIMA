/**
 * Transcript & Document Ingestion Pipeline for Family Recordings
 *
 * Allows family members to import verified audio/video transcripts, letters,
 * or oral history notes. The pipeline parses, segments, tags source timestamps,
 * categorizes facts vs stories vs uncertainty, generates embeddings,
 * and saves them into the memories library for family review.
 */

import { query, queryOne } from '../../db/client';
import { generateEmbedding } from './llm.service';

export interface IngestItemInput {
  category: 'BIOGRAPHICAL' | 'PERSONAL' | 'PERSONALITY' | 'VALUES' | 'UNCERTAIN';
  title: string;
  content: string;
  sourceTimestamp?: number;
  transcriptExcerpt?: string;
  sourceDescription: string;
  sourceMediaId?: string;
  confidenceScore?: number;
}

export interface IngestionResult {
  insertedCount: number;
  memoryIds: string[];
  categories: Record<string, number>;
}

/**
 * Parses raw text or timestamped transcript (e.g. VTT / SRT / annotated notes)
 * into structured memory candidates.
 */
export function parseTranscriptText(
  rawText: string,
  sourceDescription: string,
  sourceMediaId?: string
): IngestItemInput[] {
  const items: IngestItemInput[] = [];

  // Check if transcript contains timestamped blocks [00:15] or 00:01:23 --> 00:01:30
  const timestampRegex = /(?:\[?(\d{1,2}:)?(\d{1,2}):(\d{2})\]?|(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3}))/g;

  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  if (paragraphs.length === 0 && rawText.trim().length > 0) {
    paragraphs.push(rawText.trim());
  }

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];

    // Try to extract timestamp if present
    let timestampSeconds: number | undefined;
    const match = para.match(/(?:\[?(\d{1,2}):(\d{2})\]?)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      timestampSeconds = minutes * 60 + seconds;
    }

    const cleanContent = para.replace(/\[\d{1,2}:\d{2}\]/g, '').trim();

    // Auto-detect category heuristics based on keywords (Gujarati and English)
    const category = categorizeContent(cleanContent);

    // Create a meaningful title from the first sentence or snippet
    const firstLine = cleanContent.split(/[.\n।?]/)[0].trim();
    const title = firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;

    items.push({
      category,
      title: title || `સંસ્મરણ #${i + 1} (${sourceDescription})`,
      content: cleanContent,
      sourceTimestamp: timestampSeconds,
      transcriptExcerpt: cleanContent.slice(0, 300),
      sourceDescription,
      sourceMediaId,
      confidenceScore: category === 'UNCERTAIN' ? 0.4 : 0.85,
    });
  }

  return items;
}

/**
 * Categorize transcript snippet into memory category
 */
function categorizeContent(text: string): 'BIOGRAPHICAL' | 'PERSONAL' | 'PERSONALITY' | 'VALUES' | 'UNCERTAIN' {
  const lower = text.toLowerCase();

  // Uncertainty indicators
  if (
    lower.includes('ખબર નથી') ||
    lower.includes('યાદ નથી') ||
    lower.includes('કદાચ') ||
    lower.includes('નક્કી નહીં') ||
    lower.includes('unsure') ||
    lower.includes('unverified') ||
    lower.includes('maybe')
  ) {
    return 'UNCERTAIN';
  }

  // Biographical facts (birth, village, marriage, family tree, years, schools)
  if (
    lower.includes('જન્મ') ||
    lower.includes('ગામ') ||
    lower.includes('વતન') ||
    lower.includes('લગ્ન') ||
    lower.includes('સાલ') ||
    lower.includes('પરિવાર') ||
    lower.includes('દીકરા') ||
    lower.includes('દીકરી') ||
    lower.includes('ગુંદાળા') ||
    lower.includes('રાજકોટ') ||
    lower.includes('ગોંડલ') ||
    lower.includes('born') ||
    lower.includes('village') ||
    lower.includes('marriage') ||
    lower.includes('family')
  ) {
    return 'BIOGRAPHICAL';
  }

  // Values and life advice
  if (
    lower.includes('ધર્મ') ||
    lower.includes('ભગવાન') ||
    lower.includes('મહેનત') ||
    lower.includes('નિયમ') ||
    lower.includes('સંસ્કાર') ||
    lower.includes('શીખામણ') ||
    lower.includes('સાચું બોલવું') ||
    lower.includes('પ્રાર્થના') ||
    lower.includes('value') ||
    lower.includes('faith') ||
    lower.includes('advice') ||
    lower.includes('prayer')
  ) {
    return 'VALUES';
  }

  // Personality, food, humor, habits
  if (
    lower.includes('સ્વભાવ') ||
    lower.includes('હસવું') ||
    lower.includes('ખીજાવું') ||
    lower.includes('રોટલો') ||
    lower.includes('શાક') ||
    lower.includes('રસોઈ') ||
    lower.includes('ચા') ||
    lower.includes('ટેવ') ||
    lower.includes('ગમતું') ||
    lower.includes('ના ગમતું') ||
    lower.includes('habit') ||
    lower.includes('humor') ||
    lower.includes('cooking') ||
    lower.includes('tea')
  ) {
    return 'PERSONALITY';
  }

  // Default: personal story / remembered episode
  return 'PERSONAL';
}

/**
 * Ingest items into database with vector embeddings.
 * Items start as PENDING with familyApproved=false so the family can review and approve them.
 */
export async function ingestTranscriptItems(
  userId: string,
  items: IngestItemInput[],
  autoApprove = false
): Promise<IngestionResult> {
  const memoryIds: string[] = [];
  const categories: Record<string, number> = {
    BIOGRAPHICAL: 0,
    PERSONAL: 0,
    PERSONALITY: 0,
    VALUES: 0,
    UNCERTAIN: 0,
  };

  for (const item of items) {
    const embedding = await generateEmbedding(item.content);
    const embeddingStr = `[${embedding.join(',')}]`;

    const [saved] = await query<{ id: string }>(
      `INSERT INTO memories (
        user_id, category, title, content,
        source_media_id, source_timestamp, transcript_excerpt, source_description,
        verification_status, family_approved, confidence_score, embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::vector)
      RETURNING id`,
      [
        userId,
        item.category,
        item.title,
        item.content,
        item.sourceMediaId || null,
        item.sourceTimestamp || null,
        item.transcriptExcerpt || null,
        item.sourceDescription,
        autoApprove ? 'VERIFIED' : 'PENDING',
        autoApprove,
        item.confidenceScore ?? 0.8,
        embeddingStr,
      ]
    );

    memoryIds.push(saved.id);
    categories[item.category] = (categories[item.category] || 0) + 1;
  }

  return {
    insertedCount: memoryIds.length,
    memoryIds,
    categories,
  };
}
