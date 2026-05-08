# 0006 - WASM Modules

## Status

Accepted

## Context

Mode A would require browser-side NLP through WASM. This project uses Mode C.

## Decision

Do not ship WASM modules in v1.

## Consequences

- The frontend bundle stays small.
- No COOP/COEP workaround is needed for GitHub Pages.
- Heavy NLP execution remains on the backend.

## Alternatives Considered

- ONNX/WASM embeddings in browser: rejected for v1 because it would not cover
  spaCy, Stanza, Java LangDetect, or large corpora well.
