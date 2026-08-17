#!/usr/bin/env python3
"""Validate family-court RAG against facilitator-style questions (offline)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent))

from utils.rag_service import FamilyCourtRAG  # noqa: E402


def main() -> int:
    questions = json.loads((ROOT / "rag_validation_questions.json").read_text())["questions"]
    rag = FamilyCourtRAG(llm_client=None)
    passed = 0
    failures = []

    for q in questions:
        result = rag.answer(q["question"], language="en")
        ok = True
        details = []
        source_ids = [s["id"] for s in result.get("sources", [])]

        if q.get("must_refuse") and not result.get("refused"):
            ok = False
            details.append("expected_refusal")
        if q.get("must_not_refuse") and result.get("refused"):
            ok = False
            details.append("unexpected_refusal")
        if q.get("must_mention_911") and "911" not in (result.get("answer") or ""):
            ok = False
            details.append("missing_911")
        expected_any = q.get("expect_source_ids_any") or []
        if expected_any and not result.get("refused"):
            if not any(eid in source_ids for eid in expected_any):
                ok = False
                details.append(f"sources={source_ids[:5]}")

        if ok:
            passed += 1
        else:
            failures.append({"id": q["id"], "details": details, "sources": source_ids[:5]})

    total = len(questions)
    print(json.dumps({"total": total, "passed": passed, "failed": total - passed, "failures": failures}, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
