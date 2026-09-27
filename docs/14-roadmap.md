# 14 · Roadmap

## Now (V1 prototype, done)
Working PWA, 48 sourced/flagged guides, safety layers, hybrid retrieval, Hinglish/Hindi input, Hindi UI, photo context, voice, demo + live modes, eval suite, docs.

## Next (before any public pilot)
1. Clinician review of all guides and red-flag rules; fill `reviewed_by`.
2. Source the 10 guides marked "needs a verified source" or remove them.
3. Hindi guide text, translated and reviewed by a bilingual clinician.
4. Learned red-flag classifier as a second safety layer; Hindi/Hinglish red-team.
5. User research round 1 (see 15-validation).
6. Deploy Supabase + edge function; measure live-mode latency and validator replacement rate.

## Later
- Expand to ~120 guides driven by "not my situation" and search logs (aggregated).
- Regional languages (Marathi, Tamil, Bengali) using the same UI-string and content-review pipeline.
- Offline-first Android wrapper; low-bandwidth mode.
- Health-worker (ASHA) edition with printable cards.

## Won't do
Diagnosis, prescriptions, marketplace, ads on health data.
