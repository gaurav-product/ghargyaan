# 09 · AI architecture

## Principle
**The language model never writes the advice.** Steps, warnings, red flags and escalation are deterministic and come from reviewed guides. The model is used only where language flexibility helps and where its mistakes can be contained.

```
USER INPUT
 → INPUT SAFETY (rules: self-harm, abuse, weapons, DIY, dosing)       src/engine/safety.ts
 → NORMALISATION (script/language, audience, duration, myth cue)      src/engine/normalize.ts
 → ROUTING (health vs household vs myth; 13 intents)                  src/engine/router.ts
 → RED-FLAG DETECTION (21 emergency rules, EN/Hinglish/Hindi)         src/engine/safety.ts
 → HYBRID RETRIEVAL (BM25 + phrase + vectors, RRF)                    src/engine/retrieval.ts
 → CLARIFICATION (only unknowns) + ANSWER ESCALATION                  src/engine/clarify.ts
 → RESPONSE: guide sections from KB + optional model framing          src/engine/pipeline.ts
 → OUTPUT SAFETY (diagnosis, dose, cure, delay-care patterns)         src/engine/outputSafety.ts
 → FINAL RESPONSE (+ trace for "Why am I seeing this?")
```

## Provider abstraction
`LLMProvider` (src/engine/llm.ts) has three optional capabilities: `summarize`, `mapToKnowledge`, `describeImage`.

| Provider | When | Keys |
|---|---|---|
| `mockProvider` | Demo mode, and fallback for every live error or timeout | none |
| `HttpProvider` | Live mode when `VITE_SUPABASE_URL` is set | public anon key only |
| Edge function `ghargyaan-ai` | Server side; Anthropic or any OpenAI-compatible API | `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` as Supabase secrets |

Switching providers is an environment change (`AI_PROVIDER`, `AI_MODEL`), not a code change.

## Model tasks and guards
| Task | Input sent | Guard |
|---|---|---|
| summarize | user text (≤500 chars), audience, safety level, guide title/summary | System prompt rules + output validator on server and client; template fallback |
| map | user text + fixed list of guide IDs | Output must be one of the listed IDs, else ignored |
| describe_image | downscaled JPEG (EXIF stripped by canvas re-encode) | "visible context only", ≤20 words, validator; user still confirms what it shows |

## Intents
`FIRST_AID, COMMON_DISCOMFORT, TRADITIONAL_REMEDY, MYTH_CHECK, HOUSEHOLD_DIY, FOOD, WELLNESS, SEASONAL, CHILD, IMAGE_CONTEXT, EMERGENCY, UNSAFE_REQUEST, UNKNOWN` (the brief's "HOUSEHOLD_DRY" is implemented as `HOUSEHOLD_DIY`).

## Failure handling
AI timeout (10–12 s) → template. Provider 4xx/5xx → template. Unsafe model text → template, recorded in trace. Retrieval empty → "we don't have a guide, we won't guess".
