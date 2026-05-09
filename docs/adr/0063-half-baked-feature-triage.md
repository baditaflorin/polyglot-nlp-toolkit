# 0063 - Half-Baked Feature Triage Decisions

## Status

Accepted

## Context

Several v1 claims were true only on the happy path or only in docs.

## Decision

| Feature | Decision | Rationale |
| --- | --- | --- |
| "Drop corpus" | Finish | Add file/drop/paste/import pathways. |
| Current API/curl docs | Finish | Generate a matching curl command from current settings. |
| Client persistence | Finish | Persist and migrate workspace state; add clear-state. |
| Smoke testing | Finish | Exercise input/output controls, not just links. |
| Docker image claim | Keep with limitation | Build path exists; README must say image publishing depends on Docker/GHCR. |
| OCR and remote URL loading | Hide/delete | Not claimed, not Phase 3, would be new features. |

## Consequences

The production UI should contain no placeholder controls. Anything visible must
work end-to-end or state a limitation directly.

## Alternatives Considered

Leaving partial features visible was rejected because it increases first-user
confusion.
