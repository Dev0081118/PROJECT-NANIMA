-- Maa Digital Legacy — PostgreSQL Schema
-- Run via: npm run db:migrate
-- Requires: PostgreSQL 15+ with pgvector extension

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────
-- Users
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  family_name     VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- Family profiles
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_profiles (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_to_grandmother VARCHAR(100),    -- e.g. 'grandson', 'granddaughter', 'son'
  preferred_language        VARCHAR(20) DEFAULT 'gu',
  dialect                   VARCHAR(50) DEFAULT 'kathiyawadi',
  -- Serialised JSON: dialect vocabulary, address forms, personality notes
  dialect_config            JSONB DEFAULT '{}',
  persona_config            JSONB DEFAULT '{}',
  ai_disclosure_accepted    BOOLEAN NOT NULL DEFAULT FALSE,
  ai_disclosure_accepted_at TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ────────────────────────────────────────────────────────────────────
-- Refresh tokens
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- Media assets (photos, audio, video)
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE media_type AS ENUM ('photo', 'audio', 'video', 'document');
CREATE TYPE media_status AS ENUM ('pending', 'processing', 'ready', 'error');

CREATE TABLE IF NOT EXISTS media_assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            media_type NOT NULL,
  original_name   VARCHAR(500) NOT NULL,
  storage_path    VARCHAR(1000) NOT NULL,
  mime_type       VARCHAR(100),
  file_size_bytes BIGINT,
  duration_seconds FLOAT,                -- for audio/video
  status          media_status NOT NULL DEFAULT 'pending',
  processing_notes TEXT,
  -- Audio quality metrics
  audio_snr_db    FLOAT,
  audio_sample_rate INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- Memories (RAG source)
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE memory_category AS ENUM (
  'BIOGRAPHICAL',   -- Verified facts
  'PERSONAL',       -- Stories and events
  'PERSONALITY',    -- Traits, habits, expressions
  'VALUES',         -- Views, advice style
  'UNCERTAIN'       -- Unverified / low-confidence
);

CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

CREATE TABLE IF NOT EXISTS memories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category            memory_category NOT NULL,
  title               VARCHAR(500) NOT NULL,
  content             TEXT NOT NULL,
  -- Source attribution
  source_media_id     UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  source_timestamp    FLOAT,                 -- seconds into audio/video
  transcript_excerpt  TEXT,
  source_description  VARCHAR(500),          -- e.g. 'Family interview, March 2024'
  -- Verification
  verification_status verification_status NOT NULL DEFAULT 'PENDING',
  family_approved     BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score    FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  -- Semantic search
  embedding           vector(1536),
  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS memories_embedding_idx
  ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for user filtering
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories(user_id);
CREATE INDEX IF NOT EXISTS memories_category_idx ON memories(category);
CREATE INDEX IF NOT EXISTS memories_approved_idx ON memories(family_approved);

-- ────────────────────────────────────────────────────────────────────
-- Conversation sessions
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  summary     TEXT,                           -- AI-generated brief summary
  turn_count  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON conversation_sessions(user_id);

-- ────────────────────────────────────────────────────────────────────
-- Conversation turns
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE turn_role AS ENUM ('USER', 'ASSISTANT');

CREATE TABLE IF NOT EXISTS conversation_turns (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  role                turn_role NOT NULL,
  transcript_text     TEXT NOT NULL,
  -- Metadata for assistant turns
  memory_ids_used     UUID[],               -- which memories influenced this response
  confidence_level    VARCHAR(20),          -- HIGH | MEDIUM | LOW | UNCERTAIN
  -- Audio paths (never stored long-term — only for streaming buffer)
  audio_path          VARCHAR(1000),        -- temporary, cleared after session
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS turns_session_id_idx ON conversation_turns(session_id);

-- ────────────────────────────────────────────────────────────────────
-- User-saved memories from conversations
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_conversation_memories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turn_id             UUID NOT NULL REFERENCES conversation_turns(id) ON DELETE CASCADE,
  memory_id           UUID REFERENCES memories(id) ON DELETE SET NULL,
  approved_by_user    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────
-- Voice models
-- ────────────────────────────────────────────────────────────────────
CREATE TYPE voice_consent_status AS ENUM (
  'NOT_STARTED',
  'PENDING_PROVIDER',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE IF NOT EXISTS voice_models (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          VARCHAR(100),
  provider_voice_id VARCHAR(500),
  consent_status    voice_consent_status NOT NULL DEFAULT 'NOT_STARTED',
  consent_notes     TEXT,
  source_media_ids  UUID[],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
