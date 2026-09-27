# 13 · Metrics

## North Star: Useful Self-Care Sessions
A session in which the person receives a relevant, safe, actionable guide:
`result_viewed` AND not followed by `feedback_given{helpful:false, missing_reason:not_my_situation}` AND no correction (start-over within 30 s).

We do **not** optimise time in app or sessions per user; a good outcome is often a short visit, or being sent to a doctor.

## Supporting metrics
| Metric | Definition | Event(s) |
|---|---|---|
| Query completion | sessions reaching result or emergency ÷ input_submitted | input_submitted, result_viewed, safety_escalation |
| Clarification completion | results ÷ sessions with ≥1 clarify step | clarification_answered |
| Helpfulness | helpful yes ÷ feedback | feedback_given |
| Source-open rate | source_opened ÷ result_viewed | source_opened |
| Saved-guide rate | recommendation_saved ÷ result_viewed | recommendation_saved |
| Repeat usage | users returning in 30 days (device-level, anonymous) | search_started |
| Safety escalation accuracy | clinician-labelled sample: correct escalations ÷ all that should escalate (recall first) | safety_escalation + review |
| Unsafe-response rate | unsafe answers found in review ÷ reviewed sample (target: 0) | manual review |
| Retrieval accuracy | eval suite + labelled production sample | offline eval |
| Latency | p95 time to first result | client timing (not yet instrumented) |

## Guardrail metrics
Emergency false-negative rate (must trend to zero), output-validator replacement rate (a spike means the model is drifting), "not my situation" rate by guide.

## Current prototype numbers
Offline eval: 206/206 (suites used during tuning, including the two held-out batches after their fixes); first-run held-out 37/42 and 21/28. No user metrics yet.
