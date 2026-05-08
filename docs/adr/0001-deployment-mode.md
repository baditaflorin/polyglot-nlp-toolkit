# 0001 - Deployment Mode

## Status

Accepted

## Context

The project accepts user-provided corpora at runtime and runs spaCy, Stanza,
NLTK, sentence-transformers, and Java LangDetect. These libraries require model
loading, Python and Java runtimes, CPU-bound execution, and corpus uploads.

## Decision

Use Mode C: GitHub Pages frontend plus Docker backend.

The frontend is a static Vite app published from `docs/` to:

https://baditaflorin.github.io/polyglot-nlp-toolkit/

The runtime API is a Dockerized Go server that orchestrates a Python NLP worker
and a Java LangDetect CLI.

## Consequences

- The public UI stays static and cheap to host.
- The backend can run heavyweight NLP dependencies and models.
- Users can point the Pages UI at their own backend instance.
- Runtime deployment is more complex than Mode A/B and requires Docker.

## Alternatives Considered

- Mode A: rejected because spaCy, Stanza, sentence-transformers, and Java
  LangDetect are not practical as browser-only runtime dependencies.
- Mode B: rejected because users bring new corpora at runtime; prebuilt static
  artifacts cannot satisfy the primary workflow.
