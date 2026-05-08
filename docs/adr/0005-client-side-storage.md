# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

The static frontend needs minimal client persistence for convenience.

## Decision

Use `localStorage` only for non-sensitive UI preferences, especially the API base
URL and last selected task set. Do not store corpora by default.

## Consequences

- No server-side user state is needed in v1.
- Users can refresh without losing endpoint configuration.
- Corpus text is not persisted unless a future explicit opt-in feature is added.

## Alternatives Considered

- IndexedDB/OPFS: unnecessary for v1 because corpora are submitted on demand.
- Server-side persistence: rejected because cross-device sync is not a v1 goal.
