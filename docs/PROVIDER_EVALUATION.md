# Provider Evaluation — Maa Digital Legacy

> Last updated: November 2026
> Status: Research complete. No paid services subscribed. User approval required before any purchase.

---

## 1. LLM — Conversation Intelligence

### Requirements
- High-quality instruction following for persona-constrained roleplay
- Support for Gujarati input and output
- OpenAI-compatible API preferred for abstraction
- Low cost at family-scale usage

### Candidates

| Provider | Gujarati Support | Cost | Notes |
|---|---|---|---|
| **OpenAI GPT-4o-mini** | ✅ Good | Low | Best balance of quality/cost for prototype |
| OpenAI GPT-4o | ✅ Excellent | Medium | Use for production if quality insufficient |
| Google Gemini 1.5 Flash | ✅ Good | Low | Good Gujarati; available via Vertex or AI Studio |
| Anthropic Claude 3.5 Haiku | ✅ Good | Low | Strong instruction following |
| Local (Ollama + Llama 3.1) | ⚠️ Variable | Free | Gujarati quality inconsistent; good for dev/offline |

**Recommendation:** OpenAI GPT-4o-mini for prototype (OpenAI-compatible, low cost). System designed to swap to any provider.

---

## 2. Gujarati Speech Recognition (STT)

### Requirements
- Must support Gujarati (`gu` or `gu-IN`)
- Ideally supports Kathiyawadi regional variations
- React Native compatible (via backend proxy)
- Low latency for conversational use

### Candidates

| Provider | Gujarati | Kathiyawadi | Latency | Cost | Notes |
|---|---|---|---|---|---|
| **Sarvam AI** | ✅ Explicit | ⚠️ Unknown | Low | ₹0.25/min | India-based, native Indian language focus |
| OpenAI Whisper (API) | ✅ Good | ⚠️ Generic | Medium | \$0.006/min | Strong Gujarati but not dialect-tuned |
| Google Cloud STT | ✅ `gu-IN` | ⚠️ Unknown | Low | \$0.024/min | Enterprise-grade, good accuracy |
| Azure Cognitive Services | ✅ `gu-IN` | ⚠️ Unknown | Low | \$1/hr | Robust, needs Azure account |
| AssemblyAI | ⚠️ Limited | ❌ | Low | \$0.012/min | Weak Gujarati support |
| Local Whisper (large-v3) | ✅ Good | ⚠️ Generic | High | Free | GPU required; offline option |

**Recommendation:** Sarvam AI (primary) + OpenAI Whisper (fallback). Both abstracted behind STTProvider interface.

**Sarvam AI:** [sarvam.ai](https://www.sarvam.ai) — explicitly built for Indian languages including Gujarati. Must verify API terms before use.

---

## 3. Voice Generation / TTS

### Requirements
- Must support Gujarati language
- Kathiyawadi accent/dialect preferred
- Low latency (streaming preferred)
- If voice cloning: must permit deceased persons and provide consent pathway

### Standard TTS (no cloning)

| Provider | Gujarati TTS | Quality | Cost | Notes |
|---|---|---|---|---|
| **Sarvam AI** | ✅ Native | Good | ₹0.50/1K chars | Best Gujarati TTS currently available |
| Google Cloud TTS | ✅ `gu-IN` | Good | \$4/1M chars | Standard/WaveNet/Neural2 voices |
| Azure TTS | ✅ `gu-IN` | Good | \$15/1M chars | Several Gujarati neural voices |
| ElevenLabs | ⚠️ Limited | Excellent (non-Gujarati) | \$22+/mo | No native Gujarati voice as of 2025 |

### Voice Cloning (deceased person)

> ⚠️ **Critical:** Most voice cloning providers require a recorded consent statement from the **living person** whose voice is being cloned. This requirement **cannot be met for a deceased person.**

| Provider | Deceased Person Policy | Gujarati | Consent Requirement | Notes |
|---|---|---|---|---|
| ElevenLabs | ❌ Likely prohibited | ⚠️ Experimental | Living person consent required | Terms of Service Section 2 prohibits cloning without consent of the voice owner |
| Resemble AI | ⚠️ Estate consent pathway possible | ⚠️ Unknown | Case-by-case | Contact support required |
| PlayHT | ❌ Living consent required | ⚠️ Limited | Living person required | |
| Replica Studios | ⚠️ Estate estate consent possible | ⚠️ Unknown | Contact required | |
| Murf AI | ❌ Living consent required | ✅ Gujarati voices | Cannot clone deceased | Has native Gujarati voices for standard TTS |
| **Custom fine-tuning** | ✅ Family-controlled | ✅ Possible | Family-owned process | Most honest approach; requires data + GPU |

**Recommendation for voice recreation:**
1. **Standard Gujarati TTS (Sarvam AI)** — implement immediately. Grandmother's voice style described in persona prompt.
2. **Custom fine-tuning on family recordings** — most ethical, most authentic option. Requires sufficient clean audio (10+ hours preferred; 1–3 hours minimum). Tools: Coqui TTS (open source) or commercial fine-tuning.
3. **Provider consent pathway** — contact Resemble AI and Replica Studios directly regarding estate/family consent for deceased persons. Document any provider approval before proceeding.

**Status: Voice cloning blocked pending provider consent verification. Standard Gujarati TTS implemented as honest fallback.**

---

## 4. Real-Time Conversation

### Requirements
- Low-latency voice conversation (STT → LLM → TTS pipeline or native speech-to-speech)
- React Native compatible
- Backend-mediated (no API keys in mobile app)
- Gujarati support required

### Candidates

| Provider | Gujarati | Latency | RN Compatible | Cost | Notes |
|---|---|---|---|---|---|
| OpenAI Realtime API | ⚠️ Beta | Very Low | Via backend WebSocket | \$0.06/min audio | Does not natively support Gujarati as of late 2025 |
| Custom STT→LLM→TTS | ✅ Via Sarvam | Medium | ✅ Via WebSocket | Usage-based | Full control; higher latency (~2–4s) |
| Livekit + custom | ✅ Via adapters | Low | ✅ React Native SDK | Self-hosted free | Most flexible; more infrastructure work |

**Recommendation:** Custom pipeline (Sarvam STT → GPT-4o-mini → Sarvam TTS) over backend WebSocket. Higher latency than native speech-to-speech but supports Gujarati and keeps full control. Livekit can be added later for lower latency.

---

## 5. Realistic Talking Avatar

> ⚠️ **Critical finding:** Most avatar providers (HeyGen, Synthesia, D-ID) require a **live video recording of the person consenting to their digital likeness being created.** This requirement **cannot be met for a deceased person.**

| Provider | Deceased Likeness | Consent Requirement | Photo Input | API | Cost | Notes |
|---|---|---|---|---|---|---|
| HeyGen | ❌ Prohibited | Live video consent required | No | Yes | \$89+/mo | Explicitly prohibits deceased persons |
| Synthesia | ❌ Prohibited | Live video consent required | No | Yes | \$89+/mo | Same restriction |
| D-ID | ⚠️ Investigate | Photo-based possible | ✅ | Yes | \$5.90+/mo | Photo animation; terms require verification |
| Simli.ai | ⚠️ Investigate | Less restrictive claims | ✅ | Yes | Usage-based | Newer provider; verify terms carefully |
| Hedra | ⚠️ Investigate | Unknown | ✅ Photo | Limited | Free tier | Character generation from photo |
| **Rhubarb + sprite sheets** | ✅ Self-controlled | None | ✅ Photo | Open source | Free | Offline lip-sync using phoneme extraction |
| **Custom (photo + animation)** | ✅ Family-controlled | None | ✅ Photo | N/A | Free | Most ethical; animated portrait |

**Recommendation:**
1. **Immediate prototype:** Animated portrait using grandmother's photograph (subtle breathing, blinking, speaking opacity animation). No external provider required. Clear disclosure this is not photorealistic animation.
2. **Next step:** D-ID and Simli.ai — contact directly about family/estate consent pathway for deceased. Verify terms in writing before any API call.
3. **Audio-driven animation:** Rhubarb Lip Sync (open source) can provide phoneme-based mouth animation from a cropped photo, driven by TTS audio. No provider consent issues.

**Status: Photorealistic real-time avatar blocked pending provider consent verification. Animated portrait prototype implemented.**

---

## 6. Media Storage

| Option | Cost | Notes |
|---|---|---|
| **Cloudflare R2** | \$0.015/GB/mo, free egress | Recommended for production |
| AWS S3 | \$0.023/GB/mo + egress | Standard; slightly more expensive |
| Local filesystem | Free | Development only; not for production |
| Supabase Storage | 1GB free | Easy setup, Postgres integration |

**Recommendation:** Local filesystem for development prototype. Cloudflare R2 for production (lowest cost, no egress fees within Cloudflare network).

---

## 7. Backend Hosting

| Option | Cost | Notes |
|---|---|---|
| **Render** (free tier) | \$0 (sleeps after 15min) | Good for development |
| Railway | \$5/mo credit | Better uptime than Render free |
| Fly.io | \$0–\$5/mo | Good for containerized backends |
| Supabase Edge Functions | Free tier | Serverless; latency for long AI calls |
| Self-hosted VPS | \$5/mo | Full control |

**Recommendation:** Render free tier for development. Upgrade to paid (\$7/month) before family testing to avoid cold-start delays.

---

## Summary: What Can Be Built Without Provider Approval

| Feature | Status | Implementation |
|---|---|---|
| AI conversation (text) | ✅ Ready | OpenAI GPT-4o-mini + persona prompt |
| Memory retrieval (RAG) | ✅ Ready | pgvector + OpenAI embeddings |
| Gujarati STT | ✅ Ready | Sarvam AI + Whisper fallback |
| Gujarati TTS (generic voice) | ✅ Ready | Sarvam AI or Google Cloud |
| Animated portrait | ✅ Ready | Photo + React Native Animated API |
| Voice cloning | ❌ Blocked | Requires provider consent investigation |
| Photorealistic avatar | ❌ Blocked | Requires provider consent investigation |
| Real-time low-latency | ⚠️ Partial | Custom pipeline (~2–4s); not truly real-time |

---

## Required User Approvals Before Proceeding

1. **OpenAI API key** — for LLM and embeddings (\$5–20/month at prototype scale)
2. **Sarvam AI API key** — for Gujarati STT and TTS (₹varies, very low for family use)
3. **Voice cloning** — requires provider confirmation + family decision. Not purchased until confirmed.
4. **Avatar service** — requires provider confirmation + family decision. Not purchased until confirmed.
