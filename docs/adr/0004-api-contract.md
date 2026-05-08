# 0004 - API Contract

## Status

Accepted

## Context

Mode C requires a runtime contract between the static frontend and Docker API.

## Decision

Use REST/JSON and document it in `api/openapi.yaml`.

Primary endpoints:

- `GET /healthz`
- `GET /readyz`
- `GET /metrics`
- `GET /api/v1/languages`
- `POST /api/v1/analyze`

## Consequences

- The frontend can be configured to call staging or production backends.
- The contract is stable enough for generated clients later.
- JSON keeps debugging easy for NLP payloads.

## Alternatives Considered

- GraphQL: unnecessary for one primary operation.
- gRPC: not browser-friendly without extra gateway infrastructure.
