# 10 · Retrieval (RAG)

## Pipeline
```
query → normalise → metadata filter (category, audience) → keyword (BM25) + phrase + vector
      → reciprocal-rank fusion → evidence/review weighting → confidence + ambiguity → context (one guide)
```

## Demo mode (in the browser, offline)
- **Keyword:** BM25 over title, situation label, keywords (double-weighted), problem and myth text.
- **Phrase:** exact multi-word or Devanagari keyword hits ("jal gaya", "गले में खराश").
- **Vector:** hashed character-trigram TF-IDF embeddings (1024-d). Not semantic like a neural model, but robust to Hinglish spelling variants (khansi / khaansi / khasi) and runs with no API.
- **Fusion:** RRF (k=20) plus small absolute-signal terms; household guides are down-weighted unless the text has household cues (so "burn" on skin never lands on "burnt kadhai").
- **Confidence:** high / medium / low / none. Low → "Which is closest?" with a "None of these" escape. Guards: generic-only words ("pain") and low query coverage (English) force low confidence; device-repair questions are out of scope.

## Live mode (Supabase + pgvector)
- `knowledge_items` and `knowledge_chunks` (summary, problem, keywords, myth) with `vector(1536)` and a `tsvector`.
- `match_knowledge()` SQL function does the same RRF fusion of vector and full-text ranks with category and audience filters.
- Seed: `npm run kb:export` → `supabase/seed.sql`; embeddings: `npm run kb:embed`.

## Grounding rule
Exactly one guide is selected; the result renders only that guide's fields. The model may only frame it. If the model tries to add content, the output validator or the fixed-ID constraint removes it.

## Why not chunk-level generation?
For health guidance, a paraphrase can drop a "not for babies" line. Rendering the structured guide keeps every warning, every time.
