# 0062 - Output Pathway Coverage Policy

## Status

Accepted

## Context

The v1 app displayed results but did not let users take work out.

## Decision

Support these output pathways:

- Copy and download JSON analysis.
- Copy and download token CSV.
- Copy a curl command for the current request.
- Download a versioned state file.
- Share a small state through the URL hash.
- Trigger browser print.

Screenshot and embed exports are out of scope because they are not claimed and
do not improve the primary corpus workflow.

## Consequences

The app becomes useful in downstream workflows without adding backend storage.

## Alternatives Considered

Server-side saved projects were rejected because cross-device sync is not a
Phase 3 completeness requirement.
