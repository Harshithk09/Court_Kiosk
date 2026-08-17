# LLM & pathway evals

Golden cases: `golden_cases.json`. Facilitator RAG questions: `rag_validation_questions.json`.

```bash
cd court-kiosk/backend
python evals/run_evals.py
python evals/validate_rag_questions.py
python evals/run_evals.py --live   # optional; needs OPENAI_API_KEY
```

Failure types: model / data / workflow / trust / delivery.
Add cases when production fails; do not delete failing cases—fix the product.
