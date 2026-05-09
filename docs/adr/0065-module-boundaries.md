# 0065 - Module Boundaries And Dependency Direction

## Status

Accepted

## Context

The app is small but now needs durable boundaries.

## Decision

Frontend dependency direction:

`ui components -> feature application helpers -> schemas/types -> primitives`

Concretely:

- `Analyzer.tsx` may import feature helpers and schemas.
- `input.ts`, `exporters.ts`, and `storage.ts` may import schemas and primitives.
- Schema files must not import UI.
- Generic primitives under `src/lib` must not import feature UI.

## Consequences

The app stays easy to change without introducing lint-heavy architecture rules.

## Alternatives Considered

Adding strict import-boundary linting was deferred because the codebase is small
and TypeScript plus review is sufficient for this phase.
