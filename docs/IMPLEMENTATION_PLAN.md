# Implementation Plan — Maa Digital Legacy

## Milestone 1: Working Foundation ✅ In Progress

### Goals
- React Native Expo app with all 6 screens stubbed and navigable
- Node.js TypeScript backend with health check, auth, and database schema
- Environment configuration and provider abstraction interfaces
- Basic tests and CI-ready structure

### Tasks

- [x] Repository init, .gitignore, README
- [x] Architecture documentation
- [x] Provider evaluation documentation
- [x] Privacy and safety documentation
- [x] Testing strategy
- [ ] Backend: Express + TypeScript scaffold
- [ ] Backend: PostgreSQL schema + migrations
- [ ] Backend: Auth (register / login / refresh)
- [ ] Backend: Media upload + private storage
- [ ] Backend: Health check endpoint
- [ ] Backend: Rate limiting + validation middleware
- [ ] Backend: Unit tests for auth and middleware
- [ ] Mobile: Expo + TypeScript scaffold
- [ ] Mobile: Expo Router layout with all 6 screens
- [ ] Mobile: Auth store (Zustand) + secure token storage
- [ ] Mobile: API client with token refresh
- [ ] Mobile: Welcome screen (design-complete)
- [ ] Mobile: Navigation between all screens
- [ ] Mobile: Basic component library (typography, buttons, colours)

### Estimated Duration: 3–5 days (solo developer)

---

## Milestone 2: Memory-Based AI

### Goals
- Structured memory database with all 5 categories
- Document and transcript ingestion pipeline
- Embedding generation and pgvector retrieval
- Kathiyawadi persona prompt system
- AI-powered conversation (text, no voice yet)
- Source attribution and uncertainty handling
- Gujarati input and response testing

### Tasks
- [ ] Memory CRUD API with category support
- [ ] Embedding generation (OpenAI text-embedding-3-small or equivalent)
- [ ] pgvector similarity search service
- [ ] RAG pipeline: query → retrieve → augment → respond
- [ ] LLM provider abstraction (OpenAI-compatible interface)
- [ ] Kathiyawadi persona prompt builder
- [ ] Transcript ingestion: upload → transcribe → chunk → embed → store
- [ ] Source attribution in API responses
- [ ] Uncertainty routing: low-confidence → clarification, not invention
- [ ] Memory approval workflow (pending → verified/rejected)
- [ ] Mobile: Memory Library screen (browse, search, approve)
- [ ] Mobile: Text conversation screen with memory citation
- [ ] Evaluation: 20-question Gujarati test set with expected answers
- [ ] Integration tests: RAG pipeline end-to-end

### Estimated Duration: 1–2 weeks

---

## Milestone 3: Voice Prototype

### Goals
- Microphone input with VAD (voice activity detection)
- Streaming STT (Gujarati / Kathiyawadi)
- Streaming TTS with voice recreation (if provider permits)
- Low-latency audio pipeline
- Interruptible playback
- Graceful fallback if exact voice replication is unavailable

### Tasks
- [ ] Backend: STT provider abstraction + adapter (Whisper / Google STT / Sarvam)
- [ ] Backend: TTS provider abstraction + adapter
- [ ] Backend: Voice analysis endpoint (quality, duration, SNR)
- [ ] Backend: Voice cloning eligibility check
- [ ] Mobile: Microphone permission handling + error states
- [ ] Mobile: Voice activity detection (WebRTC VAD or Silero)
- [ ] Mobile: Streaming audio playback (expo-av or react-native-track-player)
- [ ] Mobile: VoiceButton component (idle / listening / processing / speaking)
- [ ] Mobile: Interruptible playback
- [ ] Mobile: Fallback to text input on voice failure
- [ ] Test: Gujarati STT accuracy on sample recordings
- [ ] Test: TTS naturalness — subjective + latency metrics
- [ ] Test: End-to-end voice conversation round-trip latency

### Blocker: Voice provider Gujarati + deceased-person recreation consent
### Estimated Duration: 2–3 weeks (provider evaluation may add time)

---

## Milestone 4: Avatar Prototype

### Goals
- Grandmother's portrait displayed consistently
- Animated speaking / listening / idle states
- Lip-sync connected to TTS audio (if provider permits)
- Documented fallback if real-time photorealistic rendering unavailable

### Tasks
- [ ] Research: providers permitting deceased-person likeness recreation
- [ ] Evaluate: D-ID, HeyGen, Synthesia, Simli, and alternatives
- [ ] Confirm consent requirements for each provider
- [ ] Backend: Short-lived avatar session token generation
- [ ] Mobile: AvatarDisplay component (portrait mode, animated states)
- [ ] Mobile: Lip-sync integration (if provider API available for React Native)
- [ ] Mobile: Fallback animated portrait (opacity pulse, subtle zoom)
- [ ] Test: Avatar consistency across multiple sessions
- [ ] Test: Lip-sync alignment with TTS audio

### Blocker: Avatar provider consent requirements for deceased persons
### Estimated Duration: 2–4 weeks (dependent on provider selection)

---

## Milestone 5: Complete Application

### Goals
- All components integrated and working end-to-end
- Privacy controls implemented
- Automated test suite passing
- Tested on physical Android device
- Setup documentation complete

### Tasks
- [ ] Connect voice conversation to avatar display
- [ ] Implement conversation history with memory saving workflow
- [ ] Implement data export and deletion
- [ ] Implement authentication device management
- [ ] Run full automated test suite
- [ ] Fix all test failures
- [ ] Physical Android device testing
- [ ] Performance profiling
- [ ] Complete setup documentation for another developer
- [ ] Cost estimation document

### Estimated Duration: 1–2 weeks after Milestone 4

---

## Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Mobile framework | Expo (managed workflow → bare if needed) | Fastest iteration, good Gujarati font support, avoids native build complexity for M1 |
| Navigation | Expo Router (file-based) | Clean, supports deep links, well-maintained |
| State management | Zustand | Minimal boilerplate, works with Expo |
| Backend | Express + TypeScript | Flexible, well-understood, easy to host anywhere |
| Database | PostgreSQL + pgvector | Reliable, supports semantic search without separate vector DB |
| LLM | Provider-abstracted (OpenAI-compatible first) | Swap without rewriting app logic |
| Embeddings | text-embedding-3-small equivalent | Low cost, sufficient for family-scale memory set |
| STT | Sarvam AI (India, Gujarati) + Whisper fallback | Sarvam explicitly supports Gujarati; Whisper as backup |
| TTS | Sarvam AI TTS (Gujarati) + ElevenLabs (if permitted) | Gujarati native; ElevenLabs for voice clone if consent obtained |
| Avatar | Pending provider evaluation | Cannot confirm until consent requirements verified |
| Storage | Local filesystem for prototype; S3-compatible for production | Start simple, migrate easily |

---

## External Service Cost Estimates (Prototype Scale)

| Service | Provider | Estimated Cost |
|---|---|---|
| LLM (GPT-4o-mini) | OpenAI | ~\$0.15/1M tokens; ~\$5–20/month at low usage |
| Embeddings | OpenAI | ~\$0.02/1M tokens; effectively \$0 for family scale |
| STT (Gujarati) | Sarvam AI | ₹0.25/min; ~\$3–10/month at low usage |
| TTS | Sarvam AI | ₹0.50/1K chars; ~\$5–15/month at low usage |
| Voice Clone | ElevenLabs (if eligible) | \$22/month (Creator tier minimum) — **requires user approval** |
| Avatar | TBD | Cannot estimate until provider confirmed |
| Hosting (backend) | Render / Railway free tier | \$0–\$7/month |
| Database | Neon / Supabase free tier | \$0 |
| Storage | Cloudflare R2 / local | \$0–\$5/month |

**Nothing is subscribed or purchased without explicit user approval.**
