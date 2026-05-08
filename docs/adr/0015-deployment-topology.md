# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode C requires GitHub Pages for the frontend and Docker Compose for the backend.

## Decision

Deploy:

- Frontend: GitHub Pages from `main/docs`.
- Backend: GHCR image `ghcr.io/baditaflorin/polyglot-nlp-toolkit`.
- Server: Docker Compose with `app`, `nginx`, and optional `prometheus`.
- Public API host port: `25342` through nginx.

## Consequences

- Frontend and backend can be released independently.
- The backend image includes Python and Java runtimes, so it cannot use the pure
  static distroless pattern without losing required NLP functionality.

## Alternatives Considered

- Backend serving frontend: rejected because Pages is a first-class deliverable.
- Kubernetes: unnecessary operational overhead for v1.
