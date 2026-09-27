# 06 · Product strategy

## Positioning
GharGyaan is **not** "AI gives you home remedies".

> **GharGyaan is a structured everyday self-care knowledge system that helps people distinguish useful traditional knowledge from unsafe or unsupported advice.**

Promise to the user: *Tell us what's happening. We'll help you understand what you can safely do yourself, and when you shouldn't.*

## Strategic choices
| Choice | We chose | Instead of | Why |
|---|---|---|---|
| Source of truth | Small, structured, sourced knowledge base | Open-ended LLM answers | Safety, consistency, reviewability |
| Role of AI | Narrow: framing, phrase mapping, photo context | Writing the advice | LLM errors can't reach the steps or red flags |
| Safety | Deterministic rules run first, before retrieval and AI | Model-judged risk | Predictable, testable, auditable |
| Tradition | Respect + evidence ladder | Ignore or mock | Trust with Indian families; honest about evidence |
| Breadth | ~48 situations done well | Hundreds of thin pages | Quality bar; review cost |
| Accounts | None required | Sign-up wall | Privacy; zero-friction first use |
| Language | Hinglish/Hindi *input* + Hindi UI; English guide text | Machine-translated medical content | Medical translation must be reviewed |

## Moat (over time)
1. A reviewed, India-specific knowledge base of household situations and traditional practices with evidence labels.
2. Red-flag rules and eval sets in Hinglish/Hindi, hardened by red-teaming.
3. Trust brand: "the app that tells you when *not* to use it".

## Business model options (not built)
Keep the consumer app free. Options to explore later: licensed content for employers/insurers' wellness programmes, ASHA/health-worker edition, sponsorship by public-health bodies. **Never** health-data advertising.
