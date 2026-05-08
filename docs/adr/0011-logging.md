# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode C needs production backend logs. The static frontend should avoid noisy
production console output.

## Decision

Use Go `slog` JSON logs to stdout. The frontend logs errors only in development
inside the error boundary.

## Consequences

- Docker and compose can collect backend logs directly.
- Production browser console stays quiet.

## Alternatives Considered

- Text logs: less machine-friendly for server operations.
- Client analytics logs: rejected for privacy in v1.
