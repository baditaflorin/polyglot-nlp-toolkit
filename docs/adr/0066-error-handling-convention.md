# 0066 - Error Handling Convention

## Status

Accepted

## Context

Frontend API errors currently expose raw response strings. Phase 3 requires
actionable errors.

## Decision

User-facing errors must include:

- What failed.
- Why it likely failed.
- What to do next.

Frontend helper functions return `ActionableError` messages. Go keeps JSON
`{"error": "..."}` responses and existing wrapped errors.

## Consequences

Raw technical details can remain available in debug/export state, but the main
UI should not leave users at "API returned 500".

## Alternatives Considered

Adding a global toast system was rejected as polish, not completeness.
