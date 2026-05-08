# Postmortem

## What Was Built

v1 scaffolds a complete Mode C NLP toolkit:

- GitHub Pages frontend built from React, TypeScript, Vite, Tailwind, Zod, and
  TanStack Query.
- Go API with health, readiness, metrics, CORS, validation, and JSON errors.
- Python NLP worker integrating spaCy, Stanza, NLTK, sentence-transformers, and
  fallback behavior.
- Java LangDetect CLI wrapper.
- Docker, Compose, nginx, hooks, tests, ADRs, and documentation.

## Was Mode C Correct?

Yes. Mode A and Mode B would not support runtime user corpora plus Python and
Java NLP libraries. The static Pages frontend remains correct, but NLP execution
needs a runtime backend.

## What Worked

- Keeping the UI static made Pages publishing straightforward.
- The Go API isolates deployment, metrics, validation, and process supervision.
- Python fallbacks make local development possible without every heavy model.

## What Did Not Work

- A pure distroless static image is incompatible with the required Python and
  Java runtimes.
- The image size target is not realistic once sentence-transformers and model
  caches are included.

## Surprises

- The requested Go backend and requested Python/Java NLP stack needed an
  orchestrator/worker split instead of a single-language backend.

## Accepted Tech Debt

- The Python worker is process-per-request in v1.
- spaCy and Stanza model preloading is not optimized yet.
- OpenAPI client generation is documented but not wired into the frontend build.

## Next Improvements

1. Add a persistent Python worker pool to reduce cold-start time.
2. Add downloadable model profiles and a model-management CLI.
3. Add large-corpus chunking with resumable job IDs.

## Time Spent Vs Estimate

Estimated: 1 day for a production scaffold.

Actual: within one implementation session for v1 scaffold and local checks.
