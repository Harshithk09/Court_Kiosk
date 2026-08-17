# Family Court RAG

Grounded Q&A for common San Mateo family-court issues (restraining orders, divorce basics, filing, service, emergencies).

## Sources
- `backend/data/family_court_knowledge.json` — curated FAQ chunks (primary)
- Selected nodes from `frontend/public/data/*-flow.json` (RO / triage / other; divorce JSON excluded for speed)

## API
- `POST /api/family-court-rag` `{ question, language?, case_type? }`
- `POST /api/ask` — same retrieval path
- `POST /api/dvro_rag` — compatibility alias

## Safety
Deterministic refusals for emergencies (911), legal-advice asks, concealment, and representation requests before any model call.

## Validation
```bash
cd court-kiosk/backend
python evals/validate_rag_questions.py   # facilitator-style retrieval + refusal checks
python evals/run_evals.py                # broader golden harness
```

## Offline
Without `OPENAI_API_KEY`, returns top retrieved passages with a disclaimer.
