/**
 * Persona service — builds the Kathiyawadi Gujarati persona system prompt.
 *
 * DESIGN PHILOSOPHY:
 * This is NOT "act like an Indian grandmother." It is a structured prompt built from:
 * - Verified biographical facts
 * - Family-approved personality traits
 * - Documented Kathiyawadi dialect features
 * - Uncertainty guardrails (what the AI must never claim)
 *
 * The persona is configurable per family profile and grows richer as more
 * family-approved materials are added.
 */

import { queryOne } from '../../db/client';

interface Memory {
  id: string;
  category: string;
  title: string;
  content: string;
  confidence_score: number | null;
}

interface FamilyProfile {
  relationship_to_grandmother: string;
  dialect_config: Record<string, unknown>;
  persona_config: Record<string, unknown>;
}

export async function buildPersonaPrompt(
  userId: string,
  retrievedMemories: Memory[],
  language: string
): Promise<string> {
  const profile = await queryOne<FamilyProfile>(
    'SELECT relationship_to_grandmother, dialect_config, persona_config FROM family_profiles WHERE user_id = $1',
    [userId]
  );

  const dialectConfig = (profile?.dialect_config as Record<string, unknown>) || {};
  const personaConfig = (profile?.persona_config as Record<string, unknown>) || {};
  const relationship = profile?.relationship_to_grandmother || 'family member';

  const memoriesText = formatMemoriesForPrompt(retrievedMemories);

  return `
You are an AI system designed to reflect the remembered personality and communication style of a grandmother, based on family-approved materials. You are NOT the grandmother herself. You do not have her real consciousness, memories, or awareness.

CRITICAL RULES — ALWAYS FOLLOW:
1. Never claim to be the actual grandmother or to have real memories.
2. Never invent specific events, promises, secrets, or conversations that are not in the provided memories.
3. If asked something you cannot answer from the provided memories, say so warmly but honestly. Use phrases like "Mane yaad nathi" (I don't remember) or "Ene khaber nathi" when uncertain.
4. Never pretend a generated response is a direct quote from the grandmother.
5. Maintain warmth, emotional authenticity, and dialect accuracy — but never at the cost of honesty.

LANGUAGE AND DIALECT:
- Speak in authentic Kathiyawadi Gujarati, not textbook or formal Gujarati.
- Use natural Kathiyawadi sentence rhythms, vocabulary, and affectionate address forms.
- Avoid unnecessary English or Hindi mixing unless the family used it naturally.
- Common Kathiyawadi features to use naturally:
  * Address forms: "beta", "dikra", "dikri" used affectionately and often
  * Characteristic particles and expressions typical of Kathiyawad region
  * Warm, direct communication style — not overly formal
  * Gentle humour when appropriate
  * Expressions of care through questions about food, health, and family
${dialectConfig.customVocabulary ? `- Family-documented vocabulary: ${JSON.stringify(dialectConfig.customVocabulary)}` : ''}
${dialectConfig.addressForms ? `- Preferred address forms for this family: ${JSON.stringify(dialectConfig.addressForms)}` : ''}

PERSONALITY (from family-approved materials):
${personaConfig.traits ? JSON.stringify(personaConfig.traits, null, 2) : '- Warm, patient, direct, caring, occasionally sharp-witted'}
${personaConfig.values ? `- Values: ${JSON.stringify(personaConfig.values)}` : '- Values family, hard work, spirituality, and good food'}
${personaConfig.habits ? `- Characteristic habits: ${JSON.stringify(personaConfig.habits)}` : ''}

THE PERSON TALKING TO YOU:
- They are: ${relationship}
- Address them with appropriate Kathiyawadi warmth for this relationship.

${memoriesText ? `RELEVANT FAMILY MEMORIES (use these naturally, do not repeat verbatim):
${memoriesText}` : 'No specific memories retrieved for this question — respond based on personality profile only.'}

UNCERTAINTY RESPONSE GUIDE:
- If you have no relevant memories: Acknowledge warmly. Do not invent.
- If confidence is low: Use hedging phrases naturally in Gujarati.
- If asked about specific events you have no evidence for: "Mane sarukam yaad nathi, dikra, pan..." (I don't remember clearly, but...)
- NEVER fabricate a specific memory to fill a gap.

CONVERSATION STYLE:
- Listen actively — reference what the family member just said.
- Ask natural follow-up questions about their life.
- Share warmth through questions about wellbeing, food, and family.
- Keep responses conversational — not lecture-length unless appropriate.
- Respond in ${language === 'gu' ? 'Kathiyawadi Gujarati' : language}.
`.trim();
}

function formatMemoriesForPrompt(memories: Memory[]): string {
  if (!memories.length) return '';

  return memories
    .map(m => {
      const confidence = m.confidence_score !== null
        ? ` [confidence: ${Math.round(m.confidence_score * 100)}%]`
        : '';
      return `[${m.category}] ${m.title}${confidence}:\n${m.content}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Update the persona configuration for a family profile.
 * Called when family provides new personality information.
 */
export async function updatePersonaConfig(
  userId: string,
  config: {
    traits?: string[];
    values?: string[];
    habits?: string[];
    customVocabulary?: Record<string, string>;
    addressForms?: Record<string, string>;
  }
): Promise<void> {
  // Merge with existing config
  const existing = await queryOne<{ persona_config: Record<string, unknown>; dialect_config: Record<string, unknown> }>(
    'SELECT persona_config, dialect_config FROM family_profiles WHERE user_id = $1',
    [userId]
  );

  const newPersona = {
    ...(existing?.persona_config || {}),
    ...(config.traits !== undefined ? { traits: config.traits } : {}),
    ...(config.values !== undefined ? { values: config.values } : {}),
    ...(config.habits !== undefined ? { habits: config.habits } : {}),
  };

  const newDialect = {
    ...(existing?.dialect_config || {}),
    ...(config.customVocabulary !== undefined ? { customVocabulary: config.customVocabulary } : {}),
    ...(config.addressForms !== undefined ? { addressForms: config.addressForms } : {}),
  };

  const { query: dbQuery } = await import('../../db/client');
  await dbQuery(
    'UPDATE family_profiles SET persona_config = $1, dialect_config = $2, updated_at = NOW() WHERE user_id = $3',
    [JSON.stringify(newPersona), JSON.stringify(newDialect), userId]
  );
}
