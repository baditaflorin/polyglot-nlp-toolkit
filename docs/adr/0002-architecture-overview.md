# 0002 - Architecture Overview

## Status

Accepted

## Context

The toolkit should replace several NLP microservices while preserving a static
public frontend.

## Decision

Use four boundaries:

- `frontend/`: React + TypeScript + Vite app built into `docs/`.
- `cmd/server` and `internal/`: Go HTTP API, validation, metrics, logging, and
  process orchestration.
- `scripts/nlp_worker.py`: Python NLP execution with optional graceful fallbacks.
- `tools/langdetect-java/`: Java CLI wrapping the LangDetect library.

## Consequences

- Go owns the stable API surface and deployment behavior.
- Python owns NLP library integration.
- Java remains isolated to language detection.
- Each runtime can be tested and replaced independently.

## Alternatives Considered

- Python-only API: simpler but conflicts with the requested Go backend layout.
- Separate microservices: rejected because v1 explicitly replaces that sprawl.
