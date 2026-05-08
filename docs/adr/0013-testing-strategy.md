# 0013 - Testing Strategy

## Status

Accepted

## Context

Checks must run locally through hooks and Makefile targets.

## Decision

Use:

- Go unit tests for API behavior.
- Vitest for frontend logic and schemas.
- Playwright for one happy-path Pages smoke test.
- `scripts/smoke.sh` to build, serve `docs/`, and run browser assertions.

## Consequences

- The static Pages artifact is tested before push.
- Heavy NLP model tests are kept out of fast hooks.
- Integration tests can be expanded under `test/integration/`.

## Alternatives Considered

- GitHub Actions: explicitly out of scope.
- Full model tests in pre-push: too slow and flaky for local hooks.
