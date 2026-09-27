# 08 · User flows

## Core flow
```mermaid
flowchart TD
  A[Home: What happened?] --> B{Text / Voice / Photo}
  B --> C[Input safety]
  C -->|self-harm| SH[Support screen: Tele-MANAS 14416, 112]
  C -->|unsafe / dosing / DIY| BL[Explain + safer alternative]
  C -->|red flag in text| EM[Emergency screen: 112 / poison / clinic]
  C -->|ok| D[Normalise: language, audience, duration]
  D --> E[Route + hybrid retrieval]
  E -->|nothing relevant| NM[No match: we won't guess]
  E -->|unsure| DIS[Which is closest?]
  E -->|confident| F[Ask only unknowns]
  DIS --> F
  F --> G{Red flag in answers?}
  G -->|urgent| EM
  G -->|no / consider advice| R[Structured result + sources]
  R --> S[Save · Read aloud · Feedback · Why am I seeing this?]
```

## Photo flow
1. Tap **Show me** → pick or take a photo (validated: image type, ≤10 MB; downscaled on device).
2. App shows the photo disclaimer and asks **What does the photo show?** (burn, cut, bite, rash, bruise, blister, stain, mould).
3. The chosen label (plus any text) runs through the same pipeline. The result repeats the disclaimer.
4. Live mode only: a vision model may add a neutral description ("small red area on the back of a hand"), which is validated and never used as a diagnosis.

## Voice flow
Tap **Speak** → Web Speech API (en-IN or hi-IN by UI language) → transcript fills the box → user reviews and submits. If unsupported or blocked: a clear message and the text box keeps working. Results can be **read aloud** (speechSynthesis).

## Browse flows
- Explore → category → guide → "Check my situation" (runs the clarification flow for that guide).
- Wisdom → "Dadi says…" box → myth check; practice index filtered by evidence level.
