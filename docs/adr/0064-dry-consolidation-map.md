# 0064 - DRY Consolidation Map

## Status

Accepted

## Context

The current frontend has small but growing duplication risks around request
assembly, JSON serialization, and persisted settings.

## Decision

Create single sources of truth:

- `workspace.ts` for workspace state and request assembly.
- `input.ts` for input detection/parsing.
- `exporters.ts` for JSON, CSV, curl, share, and download output.
- `storage.ts` for checked persistence and migrations.

## Consequences

Future input/output additions must use these modules rather than implementing
parallel parsing or serialization in UI components.

## Alternatives Considered

Leaving logic in `Analyzer.tsx` was rejected because Phase 3 adds enough
controls that the file would become a god module.
