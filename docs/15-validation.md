# 15 · Validation plan

> **Research required.** No validation has been run yet.

## Riskiest assumptions
1. People will describe situations in free text/voice rather than browse. (Desirability)
2. Evidence labels on family remedies build trust rather than offend. (Desirability)
3. Rules + small KB answer most real everyday questions ("coverage"). (Feasibility)
4. Escalation prompts are followed, not ignored. (Safety value)

## Experiment 1 (recommended next): moderated scenario test
- **Who:** 10 participants (4 parents of under-10s, 3 young adults, 3 adults 60+; mix of Hindi-first and English-first).
- **How:** 5 scripted scenarios on the prototype (child mosquito bite, kitchen burn, "Dadi says toothpaste", sore throat for 10 days, dog scratch).
- **Measure:** task success, time to answer, whether they notice the evidence label, whether they would follow the escalation, trust (1–7), and reaction to "Not recommended" on a family remedy.
- **Pass signals:** ≥8/10 complete without help; ≥7/10 correctly state when to see a doctor; no participant feels the tradition was mocked.

## Experiment 2: coverage study
Collect 200 real, anonymised everyday questions (diary study or survey) and run them through the engine. Measure: % matched correctly, % correctly "no match", % unsafe misses (target 0). Output: prioritised list of new guides.

## Experiment 3: clinician red-team
3 clinicians (general practice, paediatrics, emergency) try to break escalation in Hindi, Hinglish and English. Every miss becomes a regression test.
