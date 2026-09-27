# 07 · PRD: GharGyaan V1

## Goal
A convincing, working V1 that lets someone describe an everyday situation in their own words and receive a safe, sourced, age-appropriate guide, or be sent to help when needed.

## Success criteria (V1 prototype)
- Core journey works end to end on mobile: text, voice (or graceful fallback), photo (context only).
- 100% of the safety regression suite passes (emergencies, self-harm, unsafe requests, answer escalations).
- ≥90% of the overall eval passes; held-out scores are reported honestly.
- Every guide shows evidence level, sources, last-reviewed date and review status.

## In scope
| # | Requirement | Status |
|---|---|---|
| R1 | "What happened?" input: text, voice, photo | Built |
| R2 | Input safety: self-harm, sexual content involving minors, weapons, harm to others, dangerous DIY, prescriptions, dosing | Built |
| R3 | Emergency red-flag rules (21 categories) with India helplines | Built |
| R4 | Intent router (13 intents) + hybrid retrieval | Built |
| R5 | Clarification: only unknowns (who, how long, item-specific safety checks) | Built |
| R6 | Deterministic escalation from answers | Built |
| R7 | Structured result: do now, avoid, traditional practice, evidence, watch for, get help, sources | Built |
| R8 | Evidence ladder + safety states, never colour-only | Built |
| R9 | "Why am I seeing this?" drawer with sources and pipeline trace | Built |
| R10 | Explore, Wisdom (myth checks, practice index), Saved, Profile | Built |
| R11 | Demo mode without keys; live mode via edge function | Built (live untested without keys) |
| R12 | Feedback (helpful + what was missing) | Built |
| R13 | Privacy-safe analytics (10 events) | Built |
| R14 | English + Hindi UI | Built |
| R15 | PWA: manifest, offline shell | Built |
| R16 | Landing page + SEO metadata | Built |

## Out of scope (V1)
Doctor marketplace, pharmacy, insurance, booking, social features, wearables, subscriptions, more languages, agentic workflows, accounts, diagnosis, dosing.

## Key requirements detail
**Clarification.** Ask "who is this for" only if not in the text ("my son", "8 mahine ka"). Ask duration only for non-injury guides. Item-specific checks are single questions with a safe first option; any other option escalates.

**Result safety state.** `self_care` → `consider_advice` (duration exceeded, not written for babies, dirty wound…) → `urgent` (red flag answered) which replaces the guide with the emergency screen.

**Photo.** Always says: "I can't reliably identify a medical condition from this image alone." User states what the photo shows; that text drives retrieval.

## Open questions
- Should myth checks ask "who is this for"? (Currently yes when the guide is written for mixed ages.)
- How to present Hindi guide text before clinical translation review?
