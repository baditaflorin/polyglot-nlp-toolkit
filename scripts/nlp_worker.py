#!/usr/bin/env python3
"""JSON-in/JSON-out NLP worker used by the Go API."""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import shlex
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Any


TOKEN_RE = re.compile(r"\w+|[^\w\s]", re.UNICODE)


def import_status(module_name: str) -> tuple[Any | None, str]:
    try:
        module = __import__(module_name)
        return module, getattr(module, "__version__", "available")
    except Exception as exc:  # pragma: no cover - depends on optional runtime libs
        return None, f"unavailable: {exc.__class__.__name__}"


SPACY, SPACY_STATUS = import_status("spacy")
STANZA, STANZA_STATUS = import_status("stanza")
NLTK, NLTK_STATUS = import_status("nltk")
SENTENCE_TRANSFORMERS, SENTENCE_TRANSFORMERS_STATUS = import_status("sentence_transformers")


SPACY_MODELS = {
    "ca": "ca_core_news_sm",
    "de": "de_core_news_sm",
    "el": "el_core_news_sm",
    "en": "en_core_web_sm",
    "es": "es_core_news_sm",
    "fr": "fr_core_news_sm",
    "it": "it_core_news_sm",
    "lt": "lt_core_news_sm",
    "mk": "mk_core_news_sm",
    "nb": "nb_core_news_sm",
    "nl": "nl_core_news_sm",
    "pl": "pl_core_news_sm",
    "pt": "pt_core_news_sm",
    "ro": "ro_core_news_sm",
    "ru": "ru_core_news_sm",
    "zh": "zh_core_web_sm",
}


@dataclass
class RuntimeState:
    transformer: Any | None = None
    spacy_models: dict[str, Any] | None = None

    def __post_init__(self) -> None:
        self.spacy_models = {}


STATE = RuntimeState()


def main() -> int:
    started = time.perf_counter()
    try:
        request = json.load(sys.stdin)
        response = analyze(request, started)
        json.dump(response, sys.stdout, ensure_ascii=False)
        sys.stdout.write("\n")
        return 0
    except Exception as exc:
        json.dump({"error": str(exc)}, sys.stdout)
        sys.stdout.write("\n")
        print(f"worker error: {exc}", file=sys.stderr)
        return 1


def analyze(request: dict[str, Any], started: float) -> dict[str, Any]:
    documents = request.get("documents") or []
    operations = set(request.get("operations") or [])
    language_hint = request.get("language") or ""
    cluster_count = int(request.get("clusterCount") or 2)
    warnings: list[str] = []

    detected = detect_languages(documents, language_hint, warnings)
    embeddings: list[list[float]] = []
    results: list[dict[str, Any]] = []

    for index, text in enumerate(documents):
        lang = language_hint or detected[index]
        doc_warnings: list[str] = []
        spacy_doc = build_spacy_doc(text, lang, operations, doc_warnings)
        tokens = extract_tokens(text, spacy_doc, operations, doc_warnings)
        entities = extract_entities(spacy_doc, operations, doc_warnings)
        embedding = embed_text(text, operations, doc_warnings)
        if embedding is not None:
            embeddings.append(embedding)
        result = {
            "id": f"doc-{index + 1}",
            "language": lang or "und",
            "text": text,
            "tokens": tokens,
            "entities": entities,
            "warnings": doc_warnings,
        }
        if embedding is not None:
            result["embedding"] = embedding
        results.append(result)

    clusters = cluster_documents(results, embeddings, cluster_count) if "cluster" in operations else []
    return {
        "version": "",
        "commit": "",
        "engine": {
            "spacy": SPACY_STATUS,
            "stanza": STANZA_STATUS,
            "nltk": NLTK_STATUS,
            "sentenceTransformers": SENTENCE_TRANSFORMERS_STATUS,
            "langdetectJava": java_status(),
        },
        "documents": results,
        "clusters": clusters,
        "warnings": warnings,
        "durationMs": (time.perf_counter() - started) * 1000,
    }


def detect_languages(documents: list[str], language_hint: str, warnings: list[str]) -> list[str]:
    if language_hint:
        return [language_hint for _ in documents]

    java_cmd = os.environ.get("LANGDETECT_JAVA_CMD", "")
    if java_cmd:
        try:
            process = subprocess.run(
                shlex.split(java_cmd),
                input=json.dumps({"documents": documents}),
                text=True,
                capture_output=True,
                timeout=15,
                check=True,
            )
            payload = json.loads(process.stdout)
            languages = [item.get("language") or "und" for item in payload.get("results", [])]
            if len(languages) == len(documents):
                return languages
        except Exception as exc:  # pragma: no cover - Java unavailable in local tests
            warnings.append(f"Java LangDetect unavailable; heuristic detection used ({exc.__class__.__name__}).")

    return [heuristic_language(text) for text in documents]


def java_status() -> str:
    command = os.environ.get("LANGDETECT_JAVA_CMD", "")
    if not command:
        return "unconfigured"
    try:
        process = subprocess.run(
            [*shlex.split(command), "--version"],
            text=True,
            capture_output=True,
            timeout=5,
            check=True,
        )
        return process.stdout.strip() or "available"
    except Exception as exc:  # pragma: no cover - Java unavailable in local tests
        return f"unavailable: {exc.__class__.__name__}"


def heuristic_language(text: str) -> str:
    lowered = text.lower()
    ro_markers = [" este ", " si ", " sau ", " pentru ", " bucuresti", " romaniei", " romana"]
    if any(marker in f" {lowered} " for marker in ro_markers) or re.search(r"[ăâîșț]", lowered):
        return "ro"
    en_markers = [" the ", " and ", " with ", " open-source", " project"]
    if any(marker in f" {lowered} " for marker in en_markers):
        return "en"
    return "und"


def build_spacy_doc(text: str, language: str, operations: set[str], warnings: list[str]) -> Any | None:
    if not SPACY or operations.isdisjoint({"tokenize", "pos", "parse", "ner"}):
        return None

    model_key = language.split("-")[0] or "xx"
    model_name = SPACY_MODELS.get(model_key)
    try:
        assert STATE.spacy_models is not None
        if model_key not in STATE.spacy_models:
            try:
                STATE.spacy_models[model_key] = SPACY.load(model_name or model_key)
            except Exception:
                try:
                    nlp = SPACY.blank(model_key)
                except Exception:
                    nlp = SPACY.blank("xx")
                if "sentencizer" not in nlp.pipe_names:
                    nlp.add_pipe("sentencizer")
                STATE.spacy_models[model_key] = nlp
                warnings.append(f"spaCy model {model_name or model_key} unavailable; blank tokenizer used.")
        return STATE.spacy_models[model_key](text)
    except Exception as exc:
        warnings.append(f"spaCy failed; regex fallback used ({exc.__class__.__name__}).")
        return None


def extract_tokens(text: str, spacy_doc: Any | None, operations: set[str], warnings: list[str]) -> list[dict[str, Any]]:
    if operations.isdisjoint({"tokenize", "pos", "parse"}):
        return []

    if spacy_doc is not None:
        rows = []
        has_pos = any(token.pos_ for token in spacy_doc)
        has_dep = any(token.dep_ for token in spacy_doc)
        for token in spacy_doc:
            head = int(token.head.i) if token.head is not None else None
            row = {
                "text": token.text,
                "lemma": token.lemma_ if token.lemma_ else token.text.lower(),
                "pos": token.pos_ if "pos" in operations else "",
                "tag": token.tag_ if "pos" in operations else "",
                "dep": token.dep_ if "parse" in operations else "",
                "start": int(token.idx),
                "end": int(token.idx + len(token.text)),
            }
            if "parse" in operations:
                row["head"] = head
            rows.append(row)
        if "pos" in operations and not has_pos:
            warnings.append("POS tags unavailable for the loaded spaCy pipeline.")
        if "parse" in operations and not has_dep:
            warnings.append("Dependency parse unavailable for the loaded spaCy pipeline.")
        return rows

    matches = list(TOKEN_RE.finditer(text))
    token_texts = [match.group(0) for match in matches]
    tags = nltk_pos_tags(token_texts, warnings) if "pos" in operations else []
    return [
        {
            "text": match.group(0),
            "lemma": match.group(0).lower(),
            "pos": tags[index][1] if index < len(tags) else "",
            "tag": tags[index][1] if index < len(tags) else "",
            "dep": "",
            "start": match.start(),
            "end": match.end(),
        }
        for index, match in enumerate(matches)
    ]


def nltk_pos_tags(tokens: list[str], warnings: list[str]) -> list[tuple[str, str]]:
    if not NLTK:
        return []
    try:
        return NLTK.pos_tag(tokens)
    except Exception as exc:
        warnings.append(f"NLTK POS tagger unavailable ({exc.__class__.__name__}).")
        return []


def extract_entities(spacy_doc: Any | None, operations: set[str], warnings: list[str]) -> list[dict[str, Any]]:
    if "ner" not in operations:
        return []
    if spacy_doc is None:
        warnings.append("NER unavailable without spaCy pipeline.")
        return []
    entities = [
        {
            "text": entity.text,
            "label": entity.label_,
            "start": int(entity.start_char),
            "end": int(entity.end_char),
        }
        for entity in spacy_doc.ents
    ]
    if not entities:
        warnings.append("No named entities found or NER component unavailable.")
    return entities


def embed_text(text: str, operations: set[str], warnings: list[str]) -> list[float] | None:
    if "embed" not in operations and "cluster" not in operations:
        return None
    if SENTENCE_TRANSFORMERS:
        try:
            if STATE.transformer is None:
                model_name = os.environ.get(
                    "SENTENCE_TRANSFORMER_MODEL",
                    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                )
                STATE.transformer = SENTENCE_TRANSFORMERS.SentenceTransformer(
                    model_name,
                    cache_folder=os.environ.get("MODEL_CACHE_DIR"),
                )
            values = STATE.transformer.encode([text], normalize_embeddings=True)[0]
            return [float(value) for value in values[:64]]
        except Exception as exc:  # pragma: no cover - model availability varies
            warnings.append(f"sentence-transformers unavailable; hash embedding used ({exc.__class__.__name__}).")
    return hash_embedding(text)


def hash_embedding(text: str, dimensions: int = 32) -> list[float]:
    values = [0.0 for _ in range(dimensions)]
    for token in TOKEN_RE.findall(text.lower()):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        slot = digest[0] % dimensions
        sign = 1 if digest[1] % 2 == 0 else -1
        values[slot] += sign
    norm = math.sqrt(sum(value * value for value in values)) or 1.0
    return [round(value / norm, 6) for value in values]


def cluster_documents(
    documents: list[dict[str, Any]], embeddings: list[list[float]], cluster_count: int
) -> list[dict[str, Any]]:
    if not documents:
        return []
    if len(documents) == 1:
        return [{"id": 0, "documentIds": [documents[0]["id"]], "label": "cluster-0"}]
    cluster_total = max(1, min(cluster_count, len(documents)))
    try:
        from sklearn.cluster import KMeans

        model = KMeans(n_clusters=cluster_total, n_init="auto", random_state=42)
        labels = model.fit_predict(embeddings)
    except Exception:
        labels = [index % cluster_total for index in range(len(documents))]

    clusters: dict[int, list[str]] = {}
    for label, document in zip(labels, documents, strict=False):
        clusters.setdefault(int(label), []).append(document["id"])
    return [
        {"id": label, "documentIds": ids, "label": f"cluster-{label}"}
        for label, ids in sorted(clusters.items())
    ]


if __name__ == "__main__":
    raise SystemExit(main())
