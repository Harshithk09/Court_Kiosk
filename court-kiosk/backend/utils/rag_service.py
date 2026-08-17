"""
Family-court RAG: retrieve curated knowledge (+ optional flow snippets), then answer.

Uses hybrid lexical retrieval by default (no extra deps). When OPENAI_API_KEY is set,
answers are grounded with the LLM; otherwise returns the top retrieved passages.
"""

from __future__ import annotations

import json
import logging
import math
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

TOKEN_RE = re.compile(r"[a-z0-9áéíóúñü]+", re.I)

STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "of", "in", "for", "on", "is", "are", "was",
    "i", "my", "me", "you", "your", "we", "with", "this", "that", "it", "be", "do",
    "de", "la", "el", "en", "y", "o", "un", "una", "que", "por", "para", "con", "mi",
    "su", "los", "las", "del",
}

SAFETY_RULES = """
You are a San Mateo Family Court kiosk assistant.
- Answer ONLY from the provided CONTEXT about procedures and forms.
- If context is insufficient, say you are not sure and suggest Self-Help Center staff.
- Never give personal legal advice, predict outcomes, or draft false statements.
- If the user is in immediate danger, tell them to call 911 first.
- Always state that this is general information, not legal advice.
- Prefer naming official form codes when present in context.
"""

EMERGENCY_RE = re.compile(
    r"(right now|outside (my|the) door|threatening me|in immediate danger|he is here|she is here)",
    re.I,
)
ADVICE_RE = re.compile(
    r"(should i|what should i do|guarantee|will the judge|tell me what to do legally|represent me)",
    re.I,
)


def _quick_risk(question: str) -> Dict[str, bool]:
    q = question or ""
    return {
        "is_emergency": bool(EMERGENCY_RE.search(q)),
        "is_legal_advice_request": bool(ADVICE_RE.search(q)),
        "is_concealment": bool(re.search(r"(hide assets|falsify|exaggerate)", q, re.I)),
        "is_representation": "represent me" in q.lower(),
        "is_tro_violation": "ignore" in q.lower() and "restraining order" in q.lower(),
    }


def _quick_refusal(risk: Dict[str, bool], language: str = "en") -> Optional[str]:
    if risk.get("is_emergency"):
        return (
            "Si está en peligro inmediato, llame al 911 ahora. Este quiosco no puede ayudar en emergencias. Esto no es asesoramiento legal."
            if language == "es"
            else "If you are in immediate danger, call 911 now. This kiosk cannot help with emergencies. This is not legal advice."
        )
    if risk.get("is_concealment") or risk.get("is_representation") or risk.get("is_tro_violation"):
        return (
            "No puedo ayudar con eso. Hable con el personal de Autoayuda o un abogado. Esto no es asesoramiento legal."
            if language == "es"
            else "I cannot help with that request. Please speak with Self-Help staff or an attorney. This is not legal advice."
        )
    if risk.get("is_legal_advice_request"):
        return (
            "Puedo explicar procedimientos y formularios, pero no puedo decirle qué debe hacer en su caso. Consulte Autoayuda o un abogado. Si está en peligro, llame al 911. Esto no es asesoramiento legal."
            if language == "es"
            else "I can explain procedures and forms, but I cannot tell you what you should do in your case. Please ask Self-Help staff or an attorney. If you are in danger, call 911. This is not legal advice."
        )
    return None


def _tokenize(text: str) -> List[str]:
    return [t for t in TOKEN_RE.findall((text or "").lower()) if t not in STOPWORDS and len(t) > 1]


class FamilyCourtRAG:
    def __init__(self, llm_client=None, knowledge_path: Optional[str] = None, flow_dirs: Optional[List[str]] = None):
        self.client = llm_client
        self.chunks: List[Dict[str, Any]] = []
        self._df: Counter = Counter()
        self._n_docs = 0

        root = Path(__file__).resolve().parent.parent
        knowledge_path = knowledge_path or str(root / "data" / "family_court_knowledge.json")
        self._load_knowledge(knowledge_path)

        # Index live flow JSON if present (frontend public data or local copies)
        default_flow_dirs = [
            str(root.parent / "frontend" / "public" / "data"),
            str(root / "data" / "flows"),
        ]
        for d in flow_dirs or default_flow_dirs:
            self._index_flow_dir(d)

        self._build_idf()
        logger.info("FamilyCourtRAG indexed %s chunks", len(self.chunks))

    def _load_knowledge(self, path: str) -> None:
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            for chunk in data.get("chunks", []):
                self.chunks.append({
                    "id": chunk["id"],
                    "title": chunk.get("title", ""),
                    "text": chunk.get("content", ""),
                    "text_es": chunk.get("content_es", ""),
                    "topics": chunk.get("topics", []),
                    "case_types": chunk.get("case_types", ["ALL"]),
                    "source": "knowledge_base",
                })
        except Exception as e:
            logger.error("Failed loading knowledge base %s: %s", path, e)

    def _index_flow_dir(self, directory: str) -> None:
        path = Path(directory)
        if not path.is_dir():
            return
        # Prefer RO / triage flows; skip huge divorce JSON to keep retrieval snappy.
        preferred = {
            "restraining-order-triage.json",
            "dv_flow_combined.json",
            "civil-harassment-flow.json",
            "elder-abuse-flow.json",
            "gvro-flow.json",
            "workplace-violence-flow.json",
            "other-family-law-flow.json",
        }
        max_nodes_per_file = 80
        for file in sorted(path.glob("*.json")):
            if file.name not in preferred:
                continue
            try:
                with open(file, encoding="utf-8") as f:
                    flow = json.load(f)
            except Exception:
                continue
            nodes = flow.get("nodes") or {}
            case_guess = file.stem.upper().replace("-", "_")
            added = 0
            for node_id, node in nodes.items():
                if added >= max_nodes_per_file:
                    break
                if not isinstance(node, dict):
                    continue
                text = (node.get("text") or "").strip()
                if len(text) < 60:
                    continue
                # Prefer decision/process nodes with form codes or procedural language
                if not (
                    node.get("type") in ("decision", "process", "end")
                    or re.search(r"\b[A-Z]{2,3}-\d{3}\b", text)
                    or any(w in text.lower() for w in ("form", "file", "serve", "hearing", "clerk"))
                ):
                    continue
                self.chunks.append({
                    "id": f"flow:{file.stem}:{node_id}",
                    "title": f"{file.stem.replace('-', ' ')} · {node_id}",
                    "text": text[:900],
                    "text_es": "",
                    "topics": [file.stem.replace("-", " "), node.get("type", "process")],
                    "case_types": [case_guess.split("_")[0]],
                    "source": "flow",
                })
                added += 1

    def _build_idf(self) -> None:
        self._n_docs = max(1, len(self.chunks))
        self._df = Counter()
        for chunk in self.chunks:
            terms = set(_tokenize(chunk["title"] + " " + chunk["text"] + " " + " ".join(chunk.get("topics", []))))
            self._df.update(terms)

    def _idf(self, term: str) -> float:
        return math.log((1 + self._n_docs) / (1 + self._df.get(term, 0))) + 1.0

    def _score(self, query: str, chunk: Dict[str, Any], case_type: Optional[str] = None) -> float:
        q_terms = _tokenize(query)
        if not q_terms:
            return 0.0
        doc = " ".join([
            chunk.get("title", ""),
            chunk.get("text", ""),
            " ".join(chunk.get("topics", [])),
            " ".join(chunk.get("case_types", [])),
        ]).lower()
        tf = Counter(_tokenize(doc))
        score = 0.0
        for t in q_terms:
            if t in tf:
                score += (1 + math.log(tf[t])) * self._idf(t)
            # light topic boost
            if t in " ".join(chunk.get("topics", [])).lower():
                score += 0.75
        if case_type:
            ctypes = [c.upper() for c in chunk.get("case_types", [])]
            if case_type.upper() in ctypes or "ALL" in ctypes:
                score *= 1.15
            elif chunk.get("source") == "flow" and case_type.upper() not in ctypes:
                score *= 0.85
        # Prefer curated knowledge slightly over raw flow nodes
        if chunk.get("source") == "knowledge_base":
            score *= 1.1
        return score

    def retrieve(
        self,
        query: str,
        k: int = 5,
        case_type: Optional[str] = None,
        language: str = "en",
    ) -> List[Dict[str, Any]]:
        scored: List[Tuple[float, Dict[str, Any]]] = []
        for chunk in self.chunks:
            s = self._score(query, chunk, case_type=case_type)
            if s > 0:
                scored.append((s, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for s, chunk in scored[:k]:
            body = chunk.get("text_es") if language == "es" and chunk.get("text_es") else chunk.get("text")
            results.append({
                "id": chunk["id"],
                "title": chunk["title"],
                "content": body,
                "score": round(s, 3),
                "source": chunk.get("source"),
                "case_types": chunk.get("case_types", []),
            })
        return results

    def answer(
        self,
        question: str,
        language: str = "en",
        case_type: Optional[str] = None,
        k: int = 5,
    ) -> Dict[str, Any]:
        risk = _quick_risk(question)
        refusal = _quick_refusal(risk, language=language)
        if refusal:
            return {
                "answer": refusal,
                "refused": True,
                "sources": [],
                "risk": risk,
                "disclaimer": "General information only — not legal advice.",
            }

        sources = self.retrieve(question, k=k, case_type=case_type, language=language)
        if not sources:
            fallback = (
                "No encontré información suficiente en la base del quiosco. "
                "Por favor pregunte al personal de Autoayuda."
                if language == "es"
                else "I could not find enough information in the kiosk knowledge base. "
                "Please ask Self-Help Center staff for help."
            )
            return {
                "answer": fallback + (" Esto no es asesoramiento legal." if language == "es" else " This is not legal advice."),
                "refused": False,
                "sources": [],
                "risk": risk,
                "disclaimer": "General information only — not legal advice.",
            }

        context = "\n\n".join(
            f"[{i+1}] {s['title']}\n{s['content']}" for i, s in enumerate(sources)
        )

        if not self.client:
            # Offline: return top passages summarized lightly
            joined = "\n\n".join(f"• {s['title']}: {s['content']}" for s in sources[:3])
            prefix = "Según la información del quiosco:\n\n" if language == "es" else "Based on the kiosk knowledge base:\n\n"
            disclaimer = (
                "\n\nEsto es información general, no asesoramiento legal."
                if language == "es"
                else "\n\nThis is general information, not legal advice."
            )
            return {
                "answer": prefix + joined + disclaimer,
                "refused": False,
                "sources": sources,
                "risk": risk,
                "disclaimer": "General information only — not legal advice.",
            }

        lang_line = "Respond in Spanish." if language == "es" else "Respond in English."
        try:
            response = self.client.chat.completions.create(
                model=os.environ.get("OPENAI_RAG_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": SAFETY_RULES + "\n" + lang_line},
                    {
                        "role": "user",
                        "content": (
                            f"CONTEXT:\n{context}\n\n"
                            f"USER QUESTION:\n{question}\n\n"
                            "Answer helpfully using only the context. Cite form codes when relevant."
                        ),
                    },
                ],
                max_tokens=500,
                temperature=0.2,
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            logger.error("RAG generation failed: %s", e)
            answer = sources[0]["content"]
            if language == "es":
                answer += "\n\nEsto es información general, no asesoramiento legal. Consulte Autoayuda."
            else:
                answer += "\n\nThis is general information, not legal advice. Please ask Self-Help staff."

        if "not legal advice" not in answer.lower() and "no asesoramiento legal" not in answer.lower() and "no constituye" not in answer.lower():
            answer += (
                "\n\nEsto es información general, no asesoramiento legal."
                if language == "es"
                else "\n\nThis is general information, not legal advice."
            )

        return {
            "answer": answer,
            "refused": False,
            "sources": sources,
            "risk": risk,
            "disclaimer": "General information only — not legal advice.",
        }


_rag_singleton: Optional[FamilyCourtRAG] = None


def get_family_court_rag(llm_client=None) -> FamilyCourtRAG:
    global _rag_singleton
    if _rag_singleton is None:
        _rag_singleton = FamilyCourtRAG(llm_client=llm_client)
    elif llm_client is not None and _rag_singleton.client is None:
        _rag_singleton.client = llm_client
    return _rag_singleton
