# 0012 - Metrics And Observability

## Status

Accepted

## Context

The backend needs operational visibility without adding hosted dependencies.

## Decision

Expose `/metrics` with Prometheus metrics:

- HTTP request count by method, path, and status.
- HTTP request duration by method and path.
- Analysis duration by success state.

Nginx blocks `/metrics` from public access in production.

## Consequences

- Operators can enable Prometheus through the compose profile.
- The app keeps running if Prometheus is absent.

## Alternatives Considered

- Hosted observability SDKs: rejected to avoid secrets and vendor setup in v1.
