# 0067 - State Management Convention

## Status

Accepted

## Context

Some v1 preferences persisted, but the workspace did not.

## Decision

Use React component state for live UI and a versioned `WorkspaceState` persisted
to localStorage for recoverable user work. Derived values, such as documents and
requests, are recomputed from the workspace.

## Consequences

Reloads restore useful work. "Start fresh" clears both live state and autosave.

## Alternatives Considered

IndexedDB was rejected because Phase 3 state is small text and JSON.
