# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The backend must follow the requested Go project layout while integrating Python
and Java NLP runtimes.

## Decision

Use:

- `cmd/server/` for the runtime API binary.
- `internal/api/` for HTTP handlers and API types.
- `internal/config/` for env configuration.
- `internal/metrics/` for Prometheus instrumentation.
- `internal/nlp/` for worker orchestration.
- `internal/utils/` for shared error handling conventions.
- `api/` for OpenAPI.
- `scripts/` for worker and smoke scripts.
- `test/` for integration and e2e tests.

## Consequences

- Go code remains small and focused.
- NLP library complexity stays out of handlers.
- The layout can grow without turning into a monolith.

## Alternatives Considered

- Put worker logic in Go: rejected because the requested NLP libraries are
  Python and Java libraries.
