# 0068 - Persistence Schema And Migration Policy

## Status

Accepted

## Context

Persisted JSON must survive app updates without silent loss.

## Decision

Persist `WorkspaceState` with `schemaVersion: 1`. On load:

- Validate with Zod.
- Migrate known older shapes.
- If invalid, ignore autosave and surface a recoverable warning.

Exported state files use the same schema.

## Consequences

State round-trips are deterministic for stable fields. Future schema changes
must add a migration before release.

## Alternatives Considered

Generic `JSON.parse(...) as T` was rejected as unsafe.
