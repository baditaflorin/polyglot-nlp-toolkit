# 0069 - Type Safety Policy At Boundaries

## Status

Accepted

## Context

The app consumes browser APIs, localStorage, files, URL hashes, and API JSON.

## Decision

Use `unknown` at external boundaries, validate with Zod or explicit narrowing,
then convert to domain types. Avoid `any` and unsafe casts outside explicitly
marked boundary adapters.

Accepted boundaries:

- `env.ts` for Vite env.
- Go `writeJSON` for HTTP response serialization.

## Consequences

Most feature code can rely on concrete types.

## Alternatives Considered

Suppressing TypeScript errors or relying on tests alone was rejected.
