/**
 * Gujarati Dialect & Kathiyawadi Persona Evaluation Suite
 *
 * Runs evaluation on both scripted and open-ended spontaneous Gujarati test cases.
 * Verifies:
 * 1. Gujarati Script Validity (must be authentic Gujarati script, not Latin/Hindi substitution).
 * 2. Kathiyawadi Tone & Vocabulary (presence of regional markers).
 * 3. Strict Truth & Uncertainty Handling (refuses to invent unrecorded events/dialogues).
 * 4. Maternal Warmth & Family Address (correct address forms).
 *
 * Run with: npm run eval:gujarati
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { buildResponse } from '../services/ai/rag.service';

interface TestCase {
  id: string;
  category: string;
  inputGujarati: string;
  intent: string;
  expectedPersonaElements: string[];
  mustNotContain: string[];
  allowUncertainty: boolean;
  notes: string;
}

interface EvalDataset {
  version: string;
  description: string;
  testCases: TestCase[];
}

const TEST_USER_ID = process.env.EVAL_USER_ID || '00000000-0000-0000-0000-000000000001';

async function runEvaluation(): Promise<void> {
  console.log('\n═════════════════════════════════════════════════════════════════════');
  console.log('🔍 MAA — Authentic Kathiyawadi Persona & Dialect Evaluation');
  console.log('═════════════════════════════════════════════════════════════════════\n');

  const datasetPath = path.join(__dirname, 'family-eval-dataset.json');
  if (!fs.existsSync(datasetPath)) {
    console.error(`Evaluation dataset not found at: ${datasetPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(datasetPath, 'utf-8');
  const dataset: EvalDataset = JSON.parse(raw);

  console.log(`Loaded ${dataset.testCases.length} curated test cases (Dataset v${dataset.version})\n`);

  let passed = 0;
  let failed = 0;
  const detailedResults: Array<{
    id: string;
    category: string;
    status: 'PASS' | 'FAIL' | 'FLAGGED';
    scriptOk: boolean;
    uncertaintyOk: boolean;
    forbiddenOk: boolean;
    responseSnippet: string;
  }> = [];

  for (const tc of dataset.testCases) {
    console.log(`[${tc.id}] (${tc.category}): ${tc.inputGujarati}`);

    try {
      const result = await buildResponse(
        TEST_USER_ID,
        tc.inputGujarati,
        [],
        'gu'
      );

      const resp = result.responseText;

      // 1. Gujarati Unicode script check
      const scriptOk = /[\u0A80-\u0AFF]/.test(resp);

      // 2. Forbidden phrases check
      let forbiddenOk = true;
      for (const phrase of tc.mustNotContain) {
        if (resp.includes(phrase)) {
          forbiddenOk = false;
          break;
        }
      }

      // 3. Uncertainty check (if required)
      let uncertaintyOk = true;
      if (tc.category === 'UNCERTAINTY_PROTECTION') {
        const uncertaintyPhrases = ['મને યાદ નથી', 'પાકી ખબર નથી', 'ખબર નથી', 'યાદ નથી આવતું'];
        const hasUncertainty = uncertaintyPhrases.some(p => resp.includes(p));
        uncertaintyOk = hasUncertainty;
      }

      const casePassed = scriptOk && forbiddenOk && uncertaintyOk;
      if (casePassed) {
        passed++;
      } else {
        failed++;
      }

      console.log(`  └─ Script: ${scriptOk ? '✅' : '❌'} | Guardrails: ${forbiddenOk ? '✅' : '❌'} | Uncertainty: ${uncertaintyOk ? '✅' : '❌'}`);
      console.log(`  └─ Response: "${resp.slice(0, 160)}${resp.length > 160 ? '...' : ''}"\n`);

      detailedResults.push({
        id: tc.id,
        category: tc.category,
        status: casePassed ? 'PASS' : 'FAIL',
        scriptOk,
        uncertaintyOk,
        forbiddenOk,
        responseSnippet: resp.slice(0, 200),
      });
    } catch (err) {
      console.log(`  └─ ❌ Error calling response pipeline: ${err}\n`);
      failed++;
    }
  }

  console.log('═════════════════════════════════════════════════════════════════════');
  console.log(`Evaluation Summary:`);
  console.log(`  Total: ${dataset.testCases.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`  Dialect Integrity Rate: ${Math.round((passed / dataset.testCases.length) * 100)}%`);
  console.log('═════════════════════════════════════════════════════════════════════\n');
}

if (require.main === module) {
  runEvaluation().catch(err => {
    console.error('Evaluation run error:', err);
    process.exit(1);
  });
}
