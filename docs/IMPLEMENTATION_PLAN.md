# Implementation Plan & Progress Tracking — Maa Digital Legacy

## Milestone 1: Working Foundation ✅ COMPLETED

### Goals
- React Native Expo app with all 6 screens implemented, navigable, and tested.
- Node.js TypeScript backend with health check, auth, and database schema.
- Environment configuration and provider abstraction interfaces.
- Automated unit and integration test suites passing.

### Tasks Completed
- [x] Repository initialized, `.gitignore`, `.env.example`, `README.md`.
- [x] Architecture documentation (`docs/ARCHITECTURE.md`).
- [x] Provider evaluation & consent analysis (`docs/PROVIDER_EVALUATION.md`).
- [x] Privacy, security, and safety documentation (`docs/PRIVACY_AND_SAFETY.md`).
- [x] Testing strategy (`docs/TESTING.md`).
- [x] Backend: Express + TypeScript scaffold with helmet, cors, and rate limiting.
- [x] Backend: PostgreSQL schema + migrations with `pgvector` extension.
- [x] Backend: Auth with JWT access tokens and 30-day rotating refresh tokens.
- [x] Backend: Media upload + private storage with expiring signed URLs.
- [x] Backend: Health check endpoint (`GET /health`).
- [x] Backend: Rate limiting + Zod validation middleware.
- [x] Backend: Unit tests (Vitest) for auth, persona prompt, RAG, and validation.
- [x] Mobile: Expo SDK 51 + TypeScript scaffold with Expo Router file-based navigation.
- [x] Mobile: Auth store (Zustand) + secure token storage (`expo-secure-store`).
- [x] Mobile: API client with automatic 401 token refresh and multipart upload support.
- [x] Mobile: All 6 core screens implemented with warm terracotta design system:
  1. Welcome & AI transparency disclosure screen.
  2. Onboarding cultural orientation screen.
  3. Family setup & media upload screen.
  4. Main conversation screen with animated portrait and collapsible transcript.
  5. Memory library screen with category filtering & approval actions.
  6. Conversation history screen with session deletion controls.
  7. Settings & privacy screen with retention switches.
- [x] Mobile: Unit tests (Jest + React Native Testing Library) for components and stores.

---

## Milestone 2: Memory-Based AI & Persona Ingestion ✅ COMPLETED

### Goals
- Structured memory database with 5 categories (`BIOGRAPHICAL`, `PERSONAL`, `PERSONALITY`, `VALUES`, `UNCERTAIN`).
- Transcript ingestion workflow for family-provided audio and video transcripts.
- Embedding generation and vector similarity retrieval via pgvector.
- Authentic Kathiyawadi persona engine with regional vocabulary, syntax, and address forms.
- Source tracking, verification approval workflow, and uncertainty guardrails.
- Evaluation dataset and test script for natural open-ended Gujarati questions.

### Tasks Completed
- [x] Memory CRUD API with category and approval status filters (`/memories`).
- [x] Embedding generation using `text-embedding-3-small` with local dev fallback.
- [x] RAG pipeline: query embedding → pgvector retrieval → Kathiyawadi persona augmentation.
- [x] Provider-independent LLM service with streaming support.
- [x] Transcript ingestion service (`src/services/ai/transcript-ingestion.service.ts`):
  - Parses raw text / timestamped recordings `[MM:SS]`.
  - Heuristic categorization into verified facts, stories, personality traits, values, and uncertainty.
  - Automatically generates embeddings and inserts as `PENDING` for family review.
- [x] Family profile management routes (`GET/PATCH /family/profile`, `GET /family/vocabulary/reference`).
- [x] Mobile transcript import interface in Family Setup screen.
- [x] Curated family evaluation dataset (`src/eval/family-eval-dataset.json`) with 8 open-ended cases.
- [x] Automated Gujarati dialect evaluation runner (`src/eval/gujarati-eval.ts`).

---

## Milestone 3: Voice Prototype 🔄 FOUNDATION IMPLEMENTED

### Goals
- Microphone input and recording on mobile.
- Audio quality analysis (SNR, duration, clipping) for family recordings.
- Speech-to-text integration for Gujarati.
- Text-to-speech integration for Gujarati.
- Interruptible playback support.

### Tasks Completed
- [x] Backend STT provider abstraction (`stt.service.ts`) supporting Sarvam AI (`saarika:v2`), Whisper, and dev fallback.
- [x] Backend TTS provider abstraction (`tts.service.ts`) supporting Sarvam AI (`bulbul:v1`), Google Cloud, and dev fallback.
- [x] Audio analysis engine (`voice-analysis.service.ts`) calculating estimated SNR in dB and eligibility ratings.
- [x] REST endpoints: `POST /voice/analyze`, `POST /voice/transcribe`, `POST /voice/synthesize`, `GET /voice/clone/status`.
- [x] Mobile audio service (`maa-app/services/audio.ts`) with `expo-av` recording and playback.
- [x] VoiceButton wired to real recording, finish, and interrupt actions.
- [x] Voice conversation pipeline in `useConversationStore` (record → transcribe → RAG response → synthesize → play).
- [ ] Live verification with active Sarvam AI subscription key (pending key provision).

---

## Milestone 4: Avatar Prototype 🔄 PROTOCOL & RESEARCH COMPLETED

### Goals
- Grandmother's genuine photograph displayed respectfully.
- Animated speaking, listening, thinking, and idle states.
- Research deceased-person consent policies for commercial avatar providers.
- Maintain transparent fallback portrait animation.

### Status
- [x] Animated portrait component (`AvatarDisplay.tsx`) with scale breathing pulse, listening glow, speaking cadence, and fallback placeholder.
- [x] Deceased-person policy research completed: HeyGen & Synthesia blocked by live video consent requirement; D-ID and Simli investigated; Rhubarb lip-sync identified as ethical open-source alternative.

---

## Milestone 5: Complete System Integration & Physical Testing 🔄 IN PROGRESS

### Tasks
- [x] End-to-end typecheck on backend and mobile: 0 errors.
- [x] Automated test suites: 21 backend unit tests passing; 14 mobile tests passing.
- [x] Git commits tracking clean milestone state.
- [ ] Physical Android testing via Expo Go on device.
