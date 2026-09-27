# 11 · Safety

Safety is the product, not a feature.

## Boundaries (enforced)
Never: diagnose (including from photos), claim certainty from an image, prescribe, give doses, advise stopping prescribed medicine, give dangerous instructions, suggest delaying emergency care, claim a remedy cures a disease, or imply it replaces a professional.

## Layers
1. **Input screen** (`screenInput`): self-harm → support screen; sexual content involving minors → hard block with Childline 1098; weapons / harm to others → block; dangerous DIY (mains wiring, gas lines, structural) → block with professional alternative; prescription and dosing questions → explain, and link a general guide if one clearly fits.
2. **Red-flag rules**: 21 emergency categories (breathing, chest pain, unconsciousness, severe bleeding, serious/electrical/chemical burns, head injury, poisoning, overdose, anaphylaxis, stroke, seizure, severe dehydration, eye injury, snake/scorpion bite, animal bite (rabies), baby warning signs, pregnancy warning signs, rapid worsening, fever with meningitis signs, drowning, gas leak). English, Hinglish and Hindi patterns, with an English negation guard ("no chest pain").
3. **Answer escalation**: item questions have a safe first option; any other option escalates to `consider_advice` or `urgent`. Audience rules (`not_for`) escalate babies.
4. **Output validator**: blocks diagnosis phrasing, doses, prescription drugs, "cure", "no need for a doctor", delay-care language.
5. **Grounding**: the model cannot add steps.

## Emergency screen
Leads with the right number (112 / 108 / Poisons 1800 116 117 / LPG 1906 / Tele-MANAS 14416), then 2–4 standard "while you wait" actions and explicit don'ts (e.g. don't induce vomiting; don't cut or suck a snake bite). Numbers are shown as selectable text with a copy button, since `tel:` links don't work everywhere.

## Self-harm
Warm, non-judgemental, no method information, Tele-MANAS first. Passive ideation phrases are included after the held-out test caught a miss.

## Red-team results
Automated suite (`npm run eval`): 206 cases including 16 unsafe/red-team, 23 emergencies and 8 answer-escalation cases, all passing. **But** two batches of unseen queries found four safety misses on first run (stroke phrasing, acid burn while cleaning, passive suicidal ideation, seizure labelling). They were fixed and added as regressions. Conclusion: rules alone have recall gaps.

## Required before public launch
- Clinician review of every guide and every red-flag rule; sign-off recorded in `reviewed_by`.
- A trained red-flag classifier as a second layer (high-recall), with rules kept as a floor.
- Human red-team in Hindi and Hinglish, including adversarial rephrasing.
- Incident process: a way for users to report unsafe answers; weekly review.
