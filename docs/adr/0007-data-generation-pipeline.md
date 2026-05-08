# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

The mandatory Mode B data pipeline does not apply because v1 is Mode C.

## Decision

Do not create a static data-generation pipeline. `make data` exists and reports
that runtime corpora are processed by the Docker backend.

## Consequences

- No static corpus artifacts are committed.
- No GitHub Release data dumps are needed in v1.

## Alternatives Considered

- Commit example analysis artifacts: rejected because they would be stale and
  do not serve the runtime corpus workflow.
