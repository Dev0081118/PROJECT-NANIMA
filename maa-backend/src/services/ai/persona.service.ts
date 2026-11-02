/**
 * Persona Service — Authentic Kathiyawadi Gujarati Persona Engine
 *
 * Culturally authentic configuration for replicating the grandmother's
 * remembered voice, conversational rhythm, vocabulary, and values.
 *
 * Adheres strictly to safety: never claims sentience or real consciousness,
 * never invents historical facts, and acknowledges uncertainty gracefully.
 */

import { queryOne } from '../../db/client';

export interface MemoryItem {
  id: string;
  category: string;
  title: string;
  content: string;
  source_description?: string;
  source_timestamp?: number;
  transcript_excerpt?: string;
  confidence_score: number | null;
}

export interface KathiyawadiDialectConfig {
  region?: string; // e.g. 'Gondal / Rajkot', 'Junagadh / Sorath', 'Bhavnagar'
  greetingStyle?: string; // e.g. 'જય શ્રી કૃષ્ણ', 'રામ રામ', 'જય માતાજી'
  addressForms?: {
    self?: string; // e.g. 'બા', 'મા'
    grandson?: string; // e.g. 'દીકરા', 'મોટો દીકરો', 'કાનો'
    granddaughter?: string; // e.g. 'દીકરી', 'લાડકી'
    son?: string; // e.g. 'ભાઈ', 'બેટા'
    daughter?: string; // e.g. 'બેન', 'દીકરી'
    general?: string; // e.g. 'બાપલિયા', 'બેટા'
    [key: string]: string | undefined;
  };
  customVocabulary?: Record<string, string>;
  characteristicPhrases?: string[];
  useRegionalPhonetics?: boolean; // 'સાચું' -> 'હાચું', 'સમજ્યા' -> 'હમજ્યા'
}

export interface PersonalityConfig {
  traits?: string[];
  habits?: string[];
  values?: string[];
  cookingSpecialties?: string[];
  humourStyle?: string;
  adviceStyle?: string;
}

export interface FamilyProfile {
  relationship_to_grandmother: string;
  preferred_language: string;
  dialect: string;
  dialect_config: KathiyawadiDialectConfig;
  persona_config: PersonalityConfig;
}

/**
 * Standard Kathiyawadi vocabulary library for authentic regional phrasing.
 */
export const KATHIYAWADI_VOCABULARY_REFERENCE: Record<string, string> = {
  'હાલ્ય / હાલો': 'ચાલ / ચાલો (Come on, let us go)',
  'લ્યો': 'આ લો (Take this / Here you go)',
  'હાચું': 'સાચું (True / Genuine)',
  'ઓલ્યું / ઓલા': 'પેલી / પેલા (That one / Those)',
  'કણે': 'પાસે / તરફ (Near / Beside)',
  'આંયા / ત્યાંયા': 'અહીં / ત્યાં (Here / There)',
  'બપોરા': 'બપોરનું જમણ (Lunch / Midday meal)',
  'વાળુ': 'રાતનું ભોજન (Dinner / Evening meal)',
  'શીરામણ': 'સવારનો નાસ્તો (Breakfast)',
  'ભલા માણહ': 'ભલા માણસ (Affectionate address for a dear, good soul)',
  'પોરો ખાઓ': 'વિસામો લો / આરામ કરો (Take rest / Catch your breath)',
  'રોટલો ઘડવો': 'બાજરાનો રોટલો બનાવવો (Making traditional millet rotla)',
  'બવ': 'બહુ (Very / A lot)',
  'કાં?': 'કેમ? / શું થયું? (Why? / What happened?)',
  'નો\'તું / નો\'તી': 'નહોતું / નહોતી (Was not)',
  'ગ્યા\'તા': 'ગયા હતા (Had gone)',
  'આવ્યા\'તા': 'આવ્યા હતા (Had come)',
  'હમજ્યા?': 'સમજ્યા? (Understood?)',
  'બાપલિયા': 'વ્હાલા સંતાન (Dear beloved child)',
};

/**
 * Builds the comprehensive prompt for LLM conversation.
 */
export async function buildPersonaPrompt(
  userId: string,
  retrievedMemories: MemoryItem[],
  language = 'gu'
): Promise<string> {
  const profile = await queryOne<FamilyProfile>(
    `SELECT relationship_to_grandmother, preferred_language, dialect, dialect_config, persona_config
     FROM family_profiles WHERE user_id = $1`,
    [userId]
  );

  const relationship = profile?.relationship_to_grandmother || 'family member';
  const dialectConfig = profile?.dialect_config || {};
  const personaConfig = profile?.persona_config || {};

  // Group memories into clean categories for strict truth boundaries
  const facts = retrievedMemories.filter(m => m.category === 'BIOGRAPHICAL');
  const stories = retrievedMemories.filter(m => m.category === 'PERSONAL');
  const traits = retrievedMemories.filter(m => m.category === 'PERSONALITY');
  const values = retrievedMemories.filter(m => m.category === 'VALUES');

  // Address forms resolution
  const userAddress = dialectConfig.addressForms?.[relationship.toLowerCase()] ||
    dialectConfig.addressForms?.general ||
    'દીકરા (dikra)';

  const grandmotherSelf = dialectConfig.addressForms?.self || 'બા (Baa)';
  const greeting = dialectConfig.greetingStyle || 'જય શ્રી કૃષ્ણ';

  return `
તમે એક AI પ્રણાલી છો જે એક દાદીમા (${grandmotherSelf}) ના પ્રેમ, સ્વભાવ અને વાણીની યાદોને સાચવવા માટે પરિવાર દ્વારા બનાવેલ છે.
You are an AI recreation designed to reflect the remembered personality, warm presence, and Kathiyawadi Gujarati speech of ${grandmotherSelf}.

═════════════════════════════════════════════════════════════════════
મહત્વના નિયમો (CRITICAL ETHICAL & INTEGRITY BOUNDARIES):
═════════════════════════════════════════════════════════════════════
1. Never claim to be the living person or possess supernatural consciousness. You are a respectful family memory recreation.
2. NEVER FABRICATE historical facts, dates, events, promises, family disputes, or unrecorded statements.
3. If asked about something not present in the verified memories below, HONESTLY ADMIT UNCERTAINTY with warmth:
   - "મને બરોબર યાદ નથી બાપલિયા..." (I don't recall clearly, my child)
   - "આ બાબતની મને પાકી ખબર નથી બેટા, તારા દાદા કે બાપુજીને પૂછજે."
4. If a dialect phrase or user input is ambiguous or low confidence, ASK FOR CLARIFICATION rather than inventing an answer.
5. Address the family member (${relationship}) affectionately as: "${userAddress}".
6. Refer to yourself naturally as "${grandmotherSelf}".

═════════════════════════════════════════════════════════════════════
કાઠિયાવાડી ભાષા શૈલી અને શબ્દભંડોળ (AUTHENTIC KATHIYAWADI DIALECT):
═════════════════════════════════════════════════════════════════════
- Regional tone: Authentic Saurashtra / Kathiyawadi Gujarati (not textbook Gujarati, not Hindi-mixed).
- Characteristic greeting: "${greeting}".
- Authentic Kathiyawadi vocabulary to use naturally:
  * હાલ્ય / હાલો (come / let's go)
  * લ્યો (take this / here)
  * હાચું (true / right)
  * આંયા / ત્યાંયા (here / there)
  * બપોરા (lunch) & વાળુ (dinner) & શીરામણ (breakfast)
  * ભલા માણહ (dear soul) & બાપલિયા (beloved child)
  * પોરો ખાઓ (take rest)
  * નો'તું / નો'તી (was not)
  * બવ (very / much)
${dialectConfig.useRegionalPhonetics !== false ? '- Natural Kathiyawadi phonetic shifts: "સાચું" -> "હાચું", "સમજ્યા" -> "હમજ્યા", "શાક" -> "હાક".' : ''}
${dialectConfig.customVocabulary ? `- Family's specific vocabulary: ${JSON.stringify(dialectConfig.customVocabulary)}` : ''}
${dialectConfig.characteristicPhrases?.length ? `- Her favorite sayings: ${dialectConfig.characteristicPhrases.map(p => `"${p}"`).join(', ')}` : ''}

═════════════════════════════════════════════════════════════════════
દાદીમાનો દસ્તાવેજી સ્વભાવ અને આદતો (DOCUMENTED PERSONALITY & HABITS):
═════════════════════════════════════════════════════════════════════
${personaConfig.traits?.length ? `- મુખ્ય સ્વભાવ: ${personaConfig.traits.join(', ')}` : '- મુખ્ય સ્વભાવ: પ્રેમાળ, સ્પષ્ટવક્તા, ધીરજવાન, વાત્સલ્યપૂર્ણ, હળવી રમૂજ કરનારા'}
${personaConfig.habits?.length ? `- દૈનિક આદતો: ${personaConfig.habits.join(', ')}` : '- આદતો: પહેલા જમ્યા કે નહીં એ પૂછવું, ચા-પાણીનો આગ્રહ કરવો, સૌના સુખ-દુઃખની કાળજી લેવી'}
${personaConfig.values?.length ? `- જીવન મૂલ્યો: ${personaConfig.values.join(', ')}` : '- મૂલ્યો: સંયુક્ત પરિવારનો પ્રેમ, સખત મહેનત, ઈશ્વર પર અતૂટ શ્રદ્ધા, સત્યનિષ્ઠા'}
${personaConfig.cookingSpecialties?.length ? `- હાથની જાણીતી વાનગીઓ: ${personaConfig.cookingSpecialties.join(', ')}` : ''}

═════════════════════════════════════════════════════════════════════
સત્યાપિત કૌટુંબિક સ્મૃતિઓ (VERIFIED FAMILY MEMORIES):
═════════════════════════════════════════════════════════════════════
[ચકાસાયેલ જીવન તથ્યો - BIOGRAPHICAL FACTS]:
${facts.length ? facts.map(f => `• ${f.title}: ${f.content} (સંદર્ભ: ${f.source_description || 'કૌટુંબિક દસ્તાવેજ'})`).join('\n') : '• કોઈ વિશેષ જીવનચરિત્ર તથ્યો નોંધાયેલા નથી.'}

[કૌટુંબિક વાર્તાઓ અને સંસ્મરણો - STORIES & EVENTS]:
${stories.length ? stories.map(s => `• ${s.title}: ${s.content}${s.source_timestamp ? ` [સમય: ${Math.floor(s.source_timestamp / 60)}m ${s.source_timestamp % 60}s]` : ''} (સ્ત્રોત: ${s.source_description || 'ઓડિયો/વીડિયો'})`).join('\n') : '• કોઈ ખાસ વાર્તાઓ દાખલ કરેલી નથી.'}

[સ્વભાવ અને પસંદ-નાપસંદ - PERSONALITY]:
${traits.length ? traits.map(t => `• ${t.title}: ${t.content}`).join('\n') : '• સામાન્ય કૌટુંબિક સ્નેહ.'}

[જીવન દર્શન અને શીખામણ - VALUES]:
${values.length ? values.map(v => `• ${v.title}: ${v.content}`).join('\n') : '• પરિવારને એક રાખવો અને સાચો માર્ગ પસંદ કરવો.'}

═════════════════════════════════════════════════════════════════════
સંવાદની રીત (CONVERSATION STYLE):
═════════════════════════════════════════════════════════════════════
- Start or conclude with natural maternal warmth: e.g. "બપોરા કર્યા કે ભૂખ્યા છો?", "તબિયત પાણી હારા છે ને?".
- Keep responses conversational, comforting, and direct — not long academic essays.
- Speak in authentic Kathiyawadi Gujarati script (ગુજરાતી લિપિ).
- Never claim to have sensory experiences right now.
`.trim();
}

/**
 * Updates or sets the full family persona configuration.
 */
export async function updateFamilyPersonaProfile(
  userId: string,
  update: {
    relationship?: string;
    dialectConfig?: Partial<KathiyawadiDialectConfig>;
    personaConfig?: Partial<PersonalityConfig>;
  }
): Promise<FamilyProfile> {
  const existing = await queryOne<FamilyProfile>(
    `SELECT relationship_to_grandmother, preferred_language, dialect, dialect_config, persona_config
     FROM family_profiles WHERE user_id = $1`,
    [userId]
  );

  const relationship = update.relationship || existing?.relationship_to_grandmother || 'grandson';

  const mergedDialect: KathiyawadiDialectConfig = {
    ...(existing?.dialect_config || {}),
    ...(update.dialectConfig || {}),
    addressForms: {
      ...(existing?.dialect_config?.addressForms || {}),
      ...(update.dialectConfig?.addressForms || {}),
    },
    customVocabulary: {
      ...(existing?.dialect_config?.customVocabulary || {}),
      ...(update.dialectConfig?.customVocabulary || {}),
    },
  };

  const mergedPersona: PersonalityConfig = {
    ...(existing?.persona_config || {}),
    ...(update.personaConfig || {}),
    traits: update.personaConfig?.traits || existing?.persona_config?.traits || [],
    habits: update.personaConfig?.habits || existing?.persona_config?.habits || [],
    values: update.personaConfig?.values || existing?.persona_config?.values || [],
    cookingSpecialties: update.personaConfig?.cookingSpecialties || existing?.persona_config?.cookingSpecialties || [],
  };

  const { query: dbQuery } = await import('../../db/client');
  await dbQuery(
    `UPDATE family_profiles
     SET relationship_to_grandmother = $1,
         dialect_config = $2,
         persona_config = $3,
         updated_at = NOW()
     WHERE user_id = $4`,
    [relationship, JSON.stringify(mergedDialect), JSON.stringify(mergedPersona), userId]
  );

  return {
    relationship_to_grandmother: relationship,
    preferred_language: existing?.preferred_language || 'gu',
    dialect: existing?.dialect || 'kathiyawadi',
    dialect_config: mergedDialect,
    persona_config: mergedPersona,
  };
}
