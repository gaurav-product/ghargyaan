# 16 · Learnings (building V1)

1. **Tuned tests lie a little.** The eval suite reached 100% while tuning. Two batches of new queries, written afterwards, scored 88% and 75% on first run, and exposed four safety misses. Held-out testing is now part of the process, and the Research page shows first-run numbers, not just the flattering ones.
2. **"Burn" is two different problems.** Skin burns and burnt vessels share words. Routing health vs household *before* retrieval fixed a whole class of errors.
3. **Hinglish needs different heuristics.** A coverage check that works for English ("phone screen cracked" shouldn't match eye strain) breaks Hinglish, which has many filler words. The guard is English-only.
4. **Fewer, merged questions.** The first burn flow asked six questions. Combining red-flag checks into one "Does any of this apply?" question kept the safety value and halved the effort.
5. **Honesty about sources is a feature.** 10 guides could not be matched to a verified source; they ship clearly labelled rather than with invented citations.
6. **Traditional practices need nuance, not verdicts.** Only 7 of 46 practices are "not recommended" and 1 is "evidence-supported"; the other 38 are "traditional" or "limited evidence". The tone of the notes matters as much as the label.
7. **The AI's job shrank, and the product got safer.** Keeping the model to framing, phrase-mapping and photo description means demo mode is almost the same experience as live mode.
8. **Keyword fixes are brittle.** During the publish check, "I burned my finger while cooking" was routed to motion sickness. Adding the missing word fixed it but silently broke a held-out case ("spilled hot chai on my wrist" went to sprains) because it shifted keyword weights. A structural fix (body words override household cues) solved both. This is why the whole eval runs on every change, and why semantic embeddings are on the roadmap.
