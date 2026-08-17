# Court Kiosk — Product Strategy

**Audience:** facilitators, self-help center staff, and public kiosk visitors at San Mateo Family Court  
**Last updated:** 2026-08  
**Product type:** Guided legal *procedure* navigation + staff handoff (not legal advice)

## Problem

People facing restraining orders, divorce, and related family-law matters lose hours reconstructing which forms and steps apply. Facilitators re-ask the same intake questions. AI that “advises” in this setting is high-risk; AI that structures *known court procedures* and hands a clean summary to staff is useful.

## Who we serve

1. **Kiosk visitors** (EN/ES): need the right pathway and forms packet without guessing.
2. **Self-help / facilitators**: need a short, accurate case brief and documents list before the conversation starts.
3. **Court / partners**: need something that complements existing forms, CLETS, and in-person help—not replaces them.

## What we build

- JSON-driven guided flows for RO types (DVRO, CHRO including respond/change/renew, GVRO, elder abuse, workplace violence) and divorce / served-with-papers.
- Queue + email/PDF handoff so staff see what the visitor already answered.
- Staff dashboards with **assistive** case analysis grounded in intake data and form catalogs (`/api/admin/case-analysis`).
- Family-court RAG for common issues (`/api/family-court-rag`) with safety refusals.
- Outcome instrumentation (flow start/node/complete, ask use, usefulness) via `/api/analytics/*`.
- Process UX so visitors always see path progress and how to continue.

## What we will not build (for now)

| Won’t build | Why / who should lead |
|-------------|------------------------|
| Full legal advice or outcome prediction | Practice of law; attorneys and self-help own this |
| Automated form filing / e-filing | Court CMS / Judicial Council partners |
| Custody deep-flow, voice agent, Chinese UI, video tutorials | Deferred until RO + divorce completion metrics justify scope |
| Vector “RAG over the whole code” as a product claim | Curated knowledge + selected flow snippets first |
| Mobile native app | Web kiosk + responsive UI first |
| Multi-courthouse CMS | Partner/court content ownership |

## Where partners should lead

- **Judicial Council / courts.ca.gov:** canonical form PDFs (local packets may be incomplete; UI falls back to official URLs).
- **Local self-help center:** hours, escalation, in-person review, content accuracy sign-off.
- **Legal aid / attorneys:** advice, representation, safety planning beyond scripted resources.
- **Model providers:** model capability; *we* own evals, refusal policy, and workflow fit.

## Near-term bets (status)

1. **Trustworthy RO + divorce core** — CHRO respond/change/renew branches shipped; keep polishing EA/GV/WV local packets via official URL fallback.
2. **Eval loop for LLM / RAG** — `evals/rag_validation_questions.json` + `validate_rag_questions.py`; golden cases in `evals/golden_cases.json`.
3. **Measured iteration** — product events for drop-off and usefulness; staff summary at `/api/analytics/summary`.

## Success metrics

- Flow completion rate by case type
- Drop-off node concentration
- Facilitator / visitor usefulness rating
- RAG validation pass rate (retrieval + safety refusals)
- Staff case-analysis usage (non-mock)

## Explicit tradeoffs

- Prefer **curated procedure graphs** over open-ended chat for pathway selection.
- Prefer **staff-in-the-loop** over fully automated recommendations.
- Ship narrow, correct RO guidance before broad family-law coverage.

## Interview / portfolio evidence map

| JD signal | Artifact in this repo |
|-----------|------------------------|
| Strategy / what not to build | This doc |
| Zero-to-one legal workflow | Deployed kiosk flows + queue/email |
| Model vs content vs trust | RAG + safety refusals + evals |
| Real-world iteration | Analytics events + usefulness |
| Staff collaboration surface | Attorney dashboard → real case analysis API |
