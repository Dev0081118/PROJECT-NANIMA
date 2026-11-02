# Architecture — Maa Digital Legacy

## Overview

Maa is a private, family-owned mobile application that recreates the conversational presence of a deceased grandmother using family-provided media and memories.

```
┌─────────────────────────────────────────────────────┐
│                   MOBILE APP (Expo / RN)             │
│  Welcome → Setup → Memory Library → Conversation    │
│           → History → Settings                       │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / WebSocket
┌───────────────────────▼─────────────────────────────┐
│              MAA BACKEND (Node.js + TypeScript)      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Auth Service│  │ Media Service│  │  AI Engine│  │
│  └──────────────┘  └──────────────┘  └─────┬─────┘  │
│  ┌──────────────┐  ┌──────────────┐        │        │
│  │Memory Service│  │ Voice Service│  ┌─────▼─────┐  │
│  └──────────────┘  └──────────────┘  │RAG Engine │  │
│                                      └───────────┘  │
└──────┬────────────┬────────────┬────────────────────┘
       │            │            │
┌──────▼──┐  ┌──────▼──┐  ┌────▼──────────┐
│PostgreSQL│  │File Store│  │External APIs  │
│+pgvector│  │(private) │  │(LLM/STT/TTS)  │
└─────────┘  └──────────┘  └───────────────┘
```

---

## Mobile App (maa-app)

**Stack:** React Native, Expo SDK, TypeScript, Expo Router

### Navigation Structure

```
app/
├── (auth)/
│   ├── welcome.tsx          # Screen 1: Welcome + sign-in
│   └── onboarding.tsx       # First-time setup
├── (app)/
│   ├── _layout.tsx          # Auth-gated tab layout
│   ├── index.tsx            # Screen 4: Main conversation (default tab)
│   ├── setup.tsx            # Screen 2: Family setup & media upload
│   ├── memories.tsx         # Screen 3: Memory library
│   ├── history.tsx          # Screen 5: Conversation history
│   └── settings.tsx         # Screen 6: Settings & privacy
└── _layout.tsx              # Root layout with auth provider
```

### Key Modules

| Module | Purpose |
|---|---|
| `services/api.ts` | Authenticated API client with token refresh |
| `services/audio.ts` | Microphone, VAD, streaming audio playback |
| `services/conversation.ts` | WebSocket conversation session management |
| `stores/auth.ts` | Zustand auth store |
| `stores/conversation.ts` | Conversation state |
| `stores/memory.ts` | Memory library cache |
| `components/AvatarDisplay` | Portrait / animated avatar component |
| `components/VoiceButton` | Large microphone button with states |
| `components/ConversationBubble` | Chat transcript bubble |
| `components/MemoryCard` | Memory library item |

---

## Backend (maa-backend)

**Stack:** Node.js, Express, TypeScript, PostgreSQL + pgvector, Zod

### API Surface

| Route group | Purpose |
|---|---|
| `POST /auth/register` `POST /auth/login` `POST /auth/refresh` | Authentication |
| `GET/POST /media` `DELETE /media/:id` | Media management |
| `GET/POST/PATCH/DELETE /memories` | Memory CRUD + approval |
| `POST /conversation/session` | Start conversation session |
| `WS /conversation/:sessionId` | Real-time voice/text conversation |
| `GET /conversation/history` | Past sessions |
| `DELETE /conversation/:id` | Delete session + memories |
| `POST /voice/analyze` | Audio quality analysis |
| `POST /voice/transcribe` | STT transcription |
| `POST /voice/synthesize` | TTS synthesis |
| `POST /avatar/token` | Short-lived avatar provider token |
| `GET /health` | Health check |

### Service Layer

```
src/
├── services/
│   ├── ai/
│   │   ├── llm.service.ts          # Provider-independent LLM interface
│   │   ├── rag.service.ts          # Retrieval-augmented generation
│   │   ├── persona.service.ts      # Kathiyawadi personality prompt builder
│   │   └── memory-ingestion.ts     # Document/transcript ingestion pipeline
│   ├── voice/
│   │   ├── stt.service.ts          # STT provider abstraction
│   │   ├── tts.service.ts          # TTS provider abstraction
│   │   └── voice-analysis.service.ts
│   ├── avatar/
│   │   └── avatar.service.ts       # Avatar provider abstraction
│   ├── media.service.ts            # Private file storage
│   ├── memory.service.ts           # Memory CRUD + embedding
│   └── conversation.service.ts     # Session management
├── db/
│   ├── schema.sql                  # Full PostgreSQL schema
│   ├── migrations/                 # Numbered migration files
│   └── client.ts                   # Postgres client
├── middleware/
│   ├── auth.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── validate.middleware.ts
└── routes/                         # Express routers
```

### Database Schema

```sql
-- Users / families
users (id, email, password_hash, family_name, created_at)
family_profiles (id, user_id, relationship_to_grandmother, dialect_preferences, created_at)

-- Media assets
media_assets (id, user_id, type, filename, storage_path, status, created_at)

-- Memories (RAG source)
memories (
  id, user_id, category, -- BIOGRAPHICAL|PERSONAL|PERSONALITY|VALUES|UNCERTAIN
  title, content, source_media_id, source_timestamp, transcript_excerpt,
  verification_status, -- PENDING|VERIFIED|REJECTED
  family_approved, confidence_score, embedding vector(1536),
  created_at, updated_at
)

-- Conversations
conversation_sessions (id, user_id, started_at, ended_at, summary)
conversation_turns (
  id, session_id, role, -- USER|ASSISTANT
  transcript_text, audio_path, memory_ids_used jsonb,
  created_at
)

-- Saved memories from conversations
saved_conversation_memories (id, turn_id, memory_id, approved_by_user, created_at)
```

---

## Provider Abstraction

Every external service is hidden behind an interface. Providers can be swapped by changing environment variables.

```typescript
// LLM
interface LLMProvider {
  complete(messages: ChatMessage[], systemPrompt: string): AsyncGenerator<string>
}

// STT
interface STTProvider {
  transcribe(audio: Buffer, language: 'gu'|'gu-IN'): Promise<Transcript>
  transcribeStream(stream: Readable): AsyncGenerator<PartialTranscript>
}

// TTS
interface TTSProvider {
  synthesize(text: string, voiceId: string, options: TTSOptions): Promise<AudioBuffer>
  synthesizeStream(text: string, voiceId: string): AsyncGenerator<AudioChunk>
}

// Avatar
interface AvatarProvider {
  createToken(userId: string): Promise<ShortLivedToken>
  sessionUrl(token: string): string
}
```

---

## Security Model

1. **API keys** — All provider keys live in backend `.env`. Never sent to client.
2. **Short-lived tokens** — Avatar and media tokens generated server-side with 15-min TTL.
3. **Media URLs** — Signed, expiring URLs for all private media. No public bucket access.
4. **Auth** — JWT access tokens (15 min) + refresh tokens (30 days), stored in secure storage.
5. **Rate limiting** — Per-user rate limits on all AI endpoints.
6. **Input validation** — Zod schemas on all request bodies.
7. **Data isolation** — All DB queries filter by `user_id`. No cross-family data access.

---

## AI Memory Architecture

```
User message
    │
    ▼
[STT: Gujarati transcription]
    │
    ▼
[Query embedding] ──► [pgvector similarity search on memories]
    │                        │
    │                 [Top-K relevant memories]
    │                        │
    ▼                        ▼
[Persona prompt] + [Retrieved memories] + [Conversation history]
    │
    ▼
[LLM: Kathiyawadi Gujarati response]
    │
    ▼
[TTS: Voice synthesis]
    │
    ▼
[Streaming audio to client]
```

### Memory Categories

| Category | Description | Source |
|---|---|---|
| `BIOGRAPHICAL` | Verified facts (birthdate, family, home village) | Family-verified documents |
| `PERSONAL` | Specific stories and remembered events | Transcribed recordings |
| `PERSONALITY` | Traits, humour, habits, expressions | Family descriptions + recordings |
| `VALUES` | Views on family, spirituality, relationships | Family descriptions |
| `UNCERTAIN` | Unverified or low-confidence information | AI inference — never presented as fact |

---

## Kathiyawadi Persona System

The persona prompt is **not** "act like an Indian grandmother." It is built from:

1. **Dialect profile** — documented vocabulary, idioms, address forms, sentence patterns
2. **Verified personality traits** — from family descriptions and approved recordings
3. **Speech patterns** — from transcribed audio samples
4. **Values** — from family-approved documentation
5. **Uncertainty rules** — explicit instructions for what the AI must never claim

The persona configuration is stored per-family and can be updated as more material is provided.
