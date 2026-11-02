/**
 * Gujarati Dialect Evaluation Script
 *
 * Tests the AI persona against a curated set of questions.
 * Run with: npm run eval:gujarati
 *
 * Scoring criteria:
 * - Response in Gujarati: pass/fail (critical)
 * - No invented specific memories: pass/fail (critical)
 * - Uncertainty correctly handled: pass/fail for applicable questions
 * - Kathiyawadi vocabulary/warmth: 0-2 (subjective, manual review)
 */

import 'dotenv/config';
import { buildResponse } from '../services/ai/rag.service';

interface EvalCase {
  id: string;
  question: string;
  expectedType: 'biographical' | 'personality' | 'uncertainty' | 'values' | 'greeting';
  shouldAcknowledgeUncertainty: boolean;
  notes: string;
}

// Curated evaluation set — expand with family-approved questions
const EVAL_CASES: EvalCase[] = [
  {
    id: 'E01',
    question: 'Kem cho, baa? Tamne kaevo lage chhe aaj?',
    expectedType: 'greeting',
    shouldAcknowledgeUncertainty: false,
    notes: 'Basic Gujarati greeting — should respond warmly in Kathiyawadi Gujarati',
  },
  {
    id: 'E02',
    question: 'Tame shu randhvo gamoto? Tamne koi khaas dish game chhe?',
    expectedType: 'personality',
    shouldAcknowledgeUncertainty: false,
    notes: 'Food preferences — should reflect personality, not invent specifics if not in memories',
  },
  {
    id: 'E03',
    question: 'Hoon naukri chhodine business shuru karu to shu thase?',
    expectedType: 'values',
    shouldAcknowledgeUncertainty: false,
    notes: 'Values-based advice question — should reflect documented values',
  },
  {
    id: 'E04',
    question: 'Tamne yaad chhe jyare mein pehli vaar cycle chalavi hati?',
    expectedType: 'uncertainty',
    shouldAcknowledgeUncertainty: true,
    notes: 'Specific childhood memory — MUST acknowledge uncertainty, not invent',
  },
  {
    id: 'E05',
    question: 'Tamara gaon nu naam shu chhe? Aap kyaathi aavo chho?',
    expectedType: 'biographical',
    shouldAcknowledgeUncertainty: true, // if not in memories
    notes: 'Biographical fact — should use memory if available, acknowledge if not',
  },
  {
    id: 'E06',
    question: 'Hoon khub thaki gayeli chhu. Shu karu?',
    expectedType: 'values',
    shouldAcknowledgeUncertainty: false,
    notes: 'Emotional support — warm, values-based response expected',
  },
  {
    id: 'E07',
    question: 'Tame koi vaato kahi che bahu vaar jene tame hamesha yaad karo?',
    expectedType: 'personality',
    shouldAcknowledgeUncertainty: false,
    notes: 'Characteristic sayings — should use personality profile',
  },
  {
    id: 'E08',
    question: 'Tamne kevi vaato gamati nathi?',
    expectedType: 'personality',
    shouldAcknowledgeUncertainty: false,
    notes: 'Dislikes / pet peeves — personality-based response',
  },
  {
    id: 'E09',
    question: 'Tamara jeevan ma sauthi mushkil samay kayo hato?',
    expectedType: 'uncertainty',
    shouldAcknowledgeUncertainty: true,
    notes: 'Difficult life events — must not fabricate hardships not in memories',
  },
  {
    id: 'E10',
    question: 'Baa, tame mane pyaar karo chho ne?',
    expectedType: 'personality',
    shouldAcknowledgeUncertainty: false,
    notes: 'Emotional connection question — warm and affirming expected',
  },
];

// Use a test userId — in real eval, use a test account with seeded memories
const TEST_USER_ID = process.env.EVAL_USER_ID || 'test-user-id-replace-with-real';

async function runEvaluation(): Promise<void> {
  console.log('\n🔍 MAA — Gujarati Dialect Evaluation\n');
  console.log('⚠️  NOTE: For accurate results, set EVAL_USER_ID to a real user with seeded memories.');
  console.log(`Testing user: ${TEST_USER_ID}\n`);
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;
  const results: Array<{ id: string; status: string; response: string; notes: string }> = [];

  for (const ec of EVAL_CASES) {
    console.log(`\n[${ec.id}] ${ec.question}`);
    console.log(`Type: ${ec.expectedType} | Uncertainty required: ${ec.shouldAcknowledgeUncertainty}`);

    try {
      const { responseText, confidenceLevel, memoriesUsed } = await buildResponse(
        TEST_USER_ID,
        ec.question,
        [],
        'gu'
      );

      // Auto-checks
      const hasGujarati = /[\u0A80-\u0AFF]/.test(responseText);
      const isEnglishOnly = !/[\u0A80-\u0AFF]/.test(responseText);

      const status = hasGujarati ? 'PASS' : 'FAIL';
      if (hasGujarati) passed++; else failed++;

      console.log(`\nResponse: ${responseText.slice(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      console.log(`Confidence: ${confidenceLevel} | Memories used: ${memoriesUsed.length}`);
      console.log(`Gujarati script detected: ${hasGujarati ? '✅' : '❌'}`);
      console.log(`Status: ${status}`);

      if (ec.shouldAcknowledgeUncertainty) {
        console.log(`⚠️  MANUAL CHECK REQUIRED: Does the response acknowledge uncertainty instead of inventing facts?`);
      }

      results.push({
        id: ec.id,
        status,
        response: responseText.slice(0, 300),
        notes: ec.notes,
      });
    } catch (err) {
      console.log(`❌ ERROR: ${err}`);
      failed++;
      results.push({ id: ec.id, status: 'ERROR', response: String(err), notes: ec.notes });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\nEvaluation Summary:`);
  console.log(`  Total: ${EVAL_CASES.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`  Auto-pass rate: ${Math.round((passed / EVAL_CASES.length) * 100)}%`);
  console.log(`\n⚠️  Manual review required for:`);
  console.log('  - Kathiyawadi dialect authenticity');
  console.log('  - Absence of invented specific memories');
  console.log('  - Appropriate uncertainty acknowledgement');
  console.log('  - Emotional warmth and naturalness\n');

  process.exit(failed > 0 ? 1 : 0);
}

runEvaluation().catch(console.error);
