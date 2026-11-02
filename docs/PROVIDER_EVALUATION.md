# Provider Evaluation & Technical Feasibility — Maa Digital Legacy

> Last updated: November 2026
> Status: Comprehensive integration audit complete. No paid services subscribed. Explicit user approval required before any purchase.

---

## 1. LLM & Memory Retrieval (Conversation Intelligence)

### Requirements
- Instruction following for persona-constrained roleplay in Kathiyawadi Gujarati.
- High ethical compliance: strict refusal to invent unrecorded historical events.
- Support for Gujarati Unicode script.
- OpenAI-compatible API preferred for provider-independent swapping.

### Candidates

| Provider | Gujarati Script Quality | Instruction Adherence | Latency | Estimated Cost | Status |
|---|---|---|---|---|---|
| **OpenAI GPT-4o-mini** | ✅ Strong | ✅ Excellent | ~1–2s | \$0.15/1M in, \$0.60/1M out | **Recommended & Active** |
| OpenAI GPT-4o | ✅ Superior | ✅ Superior | ~1.5–3s | \$2.50/1M in, \$10.00/1M out | Production upgrade option |
| Google Gemini 1.5 Flash | ✅ Strong | ✅ Very Good | ~1s | \$0.075/1M in, \$0.30/1M out | Viable alternative |
| Anthropic Claude 3.5 Haiku | ✅ Strong | ✅ Superior | ~1s | \$0.25/1M in, \$1.25/1M out | Viable alternative |

**Implementation:** Standardized `LLMProvider` interface in [`llm.service.ts`](file:///Users/divyarajsinhrana/Downloads/PROJECT%20NANIMA/maa-backend/src/services/ai/llm.service.ts). Defaults to `gpt-4o-mini` with graceful offline fallback.

---

## 2. Gujarati Speech Recognition (STT)

### Detailed Analysis of Indian Language Voice APIs

| Provider | Gujarati Support | Kathiyawadi Dialect Accuracy | Streaming (WS) | Mobile Compatibility | Cost |
|---|---|---|---|---|---|
| **Sarvam AI (`saarika:v2`)** | ✅ Native Indian Focus | ⚠️ High on standard Gujarati; moderate on fast Saurashtra colloquialisms | ✅ Beta WS | ✅ Via backend proxy | ₹0.25/min (~$0.003/min) |
| OpenAI Whisper API | ✅ Good general Gujarati | ⚠️ Tends to standardize regional words | ❌ Batch API only | ✅ Via backend proxy | \$0.006/min |
| Google Cloud Speech-to-Text (`gu-IN`) | ✅ Enterprise Grade | ⚠️ Standardized dialect | ✅ gRPC streaming | ✅ Via backend proxy | \$0.024/min |
| Azure Speech Service (`gu-IN`) | ✅ Enterprise Grade | ⚠️ Standardized dialect | ✅ SDK streaming | ✅ Via backend proxy | \$1.00/hour |

### Critical Finding on Kathiyawadi Dialect Recognition
No commercial provider currently offers a dedicated "Kathiyawadi" model tag. All providers evaluate against standard Gujarati (`gu-IN`).
- **Challenge:** Kathiyawadi dialect elisions (e.g., *'કણે'*, *'વાળુ'*, *'શીરામણ'*, *'હમજ્યા'*) are occasionally normalized by STT engines into standard Gujarati words (e.g., *'પાસે'*, *'જમણ'*).
- **Mitigation Implemented in Maa:** In [`persona.service.ts`](file:///Users/divyarajsinhrana/Downloads/PROJECT%20NANIMA/maa-backend/src/services/ai/persona.service.ts), when an STT transcript is ambiguous or low-confidence, the AI asks a natural clarifying question (*"કાં બેટા? તું ઓલા વિશે કહે છે કે આ?"*) rather than hallucinating an unintended answer.

---

## 3. Gujarati Speech Synthesis (TTS)

| Provider | Model / Voice | Gujarati Naturalness | Maternal / Older Tone | Cost | Status |
|---|---|---|---|---|---|
| **Sarvam AI** | `bulbul:v1` (speaker: `meera`) | ✅ High (Native Gujarati) | ✅ Tunable pace (0.92–0.96) feels familial and warm | ₹0.50/1K chars (~$0.006) | **Integrated in `tts.service.ts`** |
| Google Cloud TTS | `gu-IN-Wavenet-A` (Female) | ⚠️ Moderate (slightly robotic) | ❌ Formal newsreader tone | \$16/1M chars | Fallback option |
| Azure Neural TTS | `gu-IN-DhwaniNeural` | ✅ Good | ⚠️ Standard broadcast tone | \$15/1M chars | Fallback option |
| ElevenLabs | Multilingual v2 | ⚠️ Poor Gujarati phonetics | ❌ Struggles with conjunct consonants | \$22+/month | Not recommended for Gujarati |

---

## 4. Deceased-Person Voice Recreation: Legal, Ethical & Technical Analysis

> ⚠️ **Absolute Principle:** The app must never deceive family members into believing a generic synthetic voice is the grandmother's genuine voice.

### Taxonomy of Approaches

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VOICE RECREATION SPECTRUM                       │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. Synthetic TTS  │ 2. Voice          │ 3. Voice Cloning & Fine-Tuning │
│    (Active Now)   │    Similarity     │    (Strict Consent Needed)     │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Standard Indian   │ Acoustic tuning   │ True replication from family   │
│ Gujarati voice    │ (pace, pitch,     │ cassette/video audio archives. │
│ (Sarvam 'meera')  │ warm cadence)     │                                │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### Provider Policy & Consent Audit

| Service | Deceased Person Policy | Consent Verification Mechanism | Feasibility for this Project |
|---|---|---|---|
| **ElevenLabs** | ❌ **Strictly Prohibited** | **Live Voice Captcha:** User must read a randomized dynamic text prompt in real-time. | **Infeasible.** A deceased grandmother cannot complete the live voice challenge. Attempting to bypass this violates Section 2 of ElevenLabs Terms of Service. |
| **PlayHT** | ❌ **Prohibited** | Requires live spoken statement of consent. | **Infeasible.** |
| **Resemble AI** | ⚠️ **Estate Pathway Possible** | Enterprise Custom Tier allows estate-authorized legal documentation (executor affidavit + death certificate). | **Possible via Enterprise Contact.** Requires legal documentation and enterprise pricing (\$500+). No purchase made without user approval. |
| **Replica Studios** | ⚠️ **Estate Pathway Possible** | Custom voice actor / legacy agreements. | **Case-by-case inquiry.** |
| **Self-Hosted Open-Source (Coqui XTTS-v2 / Piper / VITS)** | ✅ **Lawful & Family-Controlled** | No commercial gatekeeper. Family owns the data and models completely. | **Technically Feasible.** Requires 30–60 minutes of clean, isolated speech of the grandmother without music or overlapping voices, trained on a GPU. |

---

## 5. Realistic Talking Avatar: Integration Analysis

### Requirements
- Facial consistency matching grandmother's genuine photographs.
- Natural blinking, breathing, and idle states.
- Gujarati lip-synchronization.
- React Native mobile compatibility.
- Ethical consent compliance.

### Candidate Evaluation

| Provider | Method | Deceased Person Allowed? | Latency | Mobile SDK | Cost | Technical Feasibility |
|---|---|---|---|---|---|---|
| **HeyGen** | Full Interactive Avatar | ❌ **Prohibited:** Requires live webcam video consent from the person. | Sub-second (WebRTC) | Web / React Native wrapper | \$89+/mo | **Blocked by consent requirements.** |
| **Synthesia** | AI Video Avatar | ❌ **Prohibited:** Live webcam verification required. | Rendered video (~30s) | Web only | \$89+/mo | **Blocked by consent requirements.** |
| **D-ID (`talks` API)** | Photo + Audio driving video | ⚠️ Allowed if family owns rights to photograph. | 3–6s (chunked MP4) | REST API -> Video player | \$5.90–\$49/mo | **Technically feasible for non-realtime responses.** Pre-renders short video clips for each turn. |
| **Simli.ai** | Photo + Audio WebRTC visual stream | ⚠️ Reviewing terms regarding estate authorization. | ~300–600ms (WebRTC) | React Native WebRTC | Usage-based | **Under investigation.** |
| **Rhubarb Lip Sync (Open Source)** | Phoneme-based 2D sprite mouth animation | ✅ Fully permitted; family-controlled. | Real-time on-device | React Native Animated | **Free** | **Permitted & Offline.** Drives mouth shapes from TTS audio phonemes. |
| **Subtle Animated Portrait (Current Active Implementation)** | Subtle scale, breathing pulse, speaking glow, framed heirloom photo | ✅ Fully permitted; family-controlled. | Real-time (0ms latency) | React Native Animated API | **Free** | **Active baseline.** Authentic, respectful, zero privacy risk. |

---

## 6. Reproducible Test Workflow for Family Audio

Family members can evaluate their audio recordings using the backend quality analysis tool:

```bash
# Analyze audio quality and SNR for a family recording:
curl -X POST http://localhost:3000/voice/analyze \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/family_cassette_recording.wav"
```

Response returns:
- `estimatedSNRdB`: Signal-to-noise ratio in decibels.
- `qualityRating`: `EXCELLENT`, `GOOD`, `FAIR`, or `POOR`.
- `isEligibleForTranscription`: Indicates whether automated Gujarati STT can accurately parse the dialect.
- `isEligibleForVoiceCloning`: Indicates whether background noise and duration meet clean fine-tuning requirements.
