# Testing Strategy — Maa Digital Legacy

## Testing Philosophy

Every claimed feature must be verified by an automated test or a documented manual test. No feature is marked complete until tested. Test failures block milestone completion.

---

## Test Layers

### 1. Unit Tests (Backend)
**Tool:** Vitest
**Coverage target:** 80% on services and middleware

| Module | Tests |
|---|---|
| Auth service | Register, login, token refresh, invalid credentials, expired tokens |
| Memory service | CRUD, category filtering, approval workflow, embedding generation |
| RAG service | Retrieval with mock embeddings, empty result handling, top-K selection |
| Persona builder | Prompt construction with full/partial profile, Kathiyawadi vocabulary injection |
| Uncertainty router | High confidence → response, low confidence → clarification |
| Media service | Upload validation, signed URL generation, deletion |
| Rate limiter | Per-user limits, cooldown, bypass detection |
| Validation middleware | Valid/invalid Zod schemas |

### 2. Integration Tests (Backend)
**Tool:** Vitest + supertest + test database

| Test | Description |
|---|---|
| Auth flow | Register → login → protected endpoint → refresh → logout |
| Memory ingestion | Upload transcript → chunk → embed → store → retrieve |
| Conversation round-trip | POST session → WebSocket turn → memory retrieval → AI response |
| Media upload | Upload → private URL → signed URL → delete |
| Data isolation | User A cannot access User B's memories or media |
| Deletion cascade | Delete session → verify transcripts and saved memories removed |

### 3. Unit Tests (Mobile)
**Tool:** Jest + React Native Testing Library

| Component/Hook | Tests |
|---|---|
| `useAuthStore` | Login, logout, token expiry, refresh |
| `useConversationStore` | Start session, add turns, clear |
| `APIClient` | Authenticated requests, 401 refresh, 500 error |
| `VoiceButton` | Idle/listening/speaking states, press handler |
| `MemoryCard` | Render with/without source, approve/reject actions |
| `ConversationBubble` | User vs assistant sides, citation display |
| `AvatarDisplay` | Portrait render, speaking animation trigger |

### 4. End-to-End Tests (Manual — M1 and M5)
**Tool:** Expo on Android emulator / physical device

| Scenario | Expected Result |
|---|---|
| Fresh install → welcome screen | Correct disclosure text visible |
| Sign in with valid credentials | Navigate to conversation screen |
| Sign in with invalid credentials | Error message shown |
| Navigate all 6 screens | No crashes, correct screen titles |
| Upload a photo | Media appears in setup screen |
| Create a memory | Memory appears in library |
| Send a text message | AI responds in Gujarati |
| Delete a conversation | Session no longer in history |
| Delete account | All data removed |

### 5. Gujarati and Dialect Evaluation
**Tool:** Custom evaluation script (`maa-backend/src/eval/gujarati-eval.ts`)

A curated test set of 20 input questions in Gujarati with expected outputs. Scored on:
- Response in Gujarati (pass/fail)
- No Hindi code-switching unless appropriate (scored 0–1)
- Kathiyawadi vocabulary used where applicable (scored 0–1)
- Correct personality/uncertainty handling (scored 0–1)
- No invented specific memories (pass/fail — critical)

**Test set categories:**
- Biographical questions (verified facts expected)
- Personality questions (characteristic expression expected)
- Questions with no available answer (uncertainty response expected)
- Emotional support questions (warm, values-based response expected)
- Kathiyawadi-specific vocabulary questions

### 6. Voice Pipeline Tests (M3)
**Tool:** Automated scripts + manual listening tests

| Test | Metric |
|---|---|
| STT: Gujarati word error rate | WER < 20% on family-recorded test set |
| STT: Kathiyawadi words recognized | Manual review of 10 dialect-specific phrases |
| TTS: Gujarati naturalness | Subjective 1–5 scale, target ≥ 3.5 |
| TTS: Latency (time to first audio) | < 2 seconds target |
| Round-trip latency | STT + LLM + TTS < 5 seconds for short responses |
| Voice interruption | New utterance stops playback within 200ms |

### 7. Security Tests
| Test | Expected Result |
|---|---|
| Unauthenticated API access | 401 on all protected routes |
| Cross-user memory access | 403 or empty result |
| Rate limit exceeded | 429 response |
| Oversized file upload | 413 response |
| SQL injection attempt | Parameterized query prevents injection |
| Expired access token | 401 with refresh prompt |
| Invalid JWT signature | 401 |

---

## Evaluation Dataset

### Gujarati Test Set (20 questions)

```
# Format: question | expected_response_type | expected_gujarati | notes
kem cho, baa? | greeting | yes | warm greeting response
tamara gaon nu naam shu chhe? | biographical | yes | village name if provided
tame shu randhvo gamoto? | personality | yes | cooking preference
tamne kevi vaat gamati nathi? | personality | yes | dislikes
tamara ghar ma kem kahe chhe tane? | personality | yes | family name/address
hoon shu karu? (difficult life question) | values | yes | values-based advice
tamne yaad chhe te din jyare... | personal_memory | yes | uncertainty if not known
...
```
*(Full dataset populated when family-approved recordings are provided)*

---

## Test Execution

### Backend
```bash
cd maa-backend
npm run test          # unit tests
npm run test:int      # integration tests (requires test DB)
npm run test:coverage # coverage report
```

### Mobile
```bash
cd maa-app
npm run test          # jest unit tests
```

### Gujarati Evaluation
```bash
cd maa-backend
npm run eval:gujarati
```

---

## Known Limitations (M1)

- Voice pipeline not yet tested (M3)
- Avatar not yet integrated (M4)
- Gujarati evaluation dataset pending family-approved recordings
- E2E tests not yet automated (manual for M1)
- Integration tests require test PostgreSQL instance with pgvector
