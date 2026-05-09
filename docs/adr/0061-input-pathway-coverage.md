# 0061 - Input Pathway Coverage Policy

## Status

Accepted

## Context

Users need to bring real corpora into the Pages app without reading code or
docs. v1 accepted only manual text entry.

## Decision

Support these input pathways through one shared parser:

- Plain text paste.
- HTML paste or file.
- CSV/TSV paste or file.
- JSON text arrays and saved state files.
- File picker, multi-file, drag-and-drop.
- Clipboard read where browser permission allows it.
- URL hash restore for small workspaces.

Arbitrary remote URL fetching and OCR stay out of scope because they require new
backend behavior or new engine features.

## Consequences

Input behavior becomes predictable and testable. Users can correct by replacing
the corpus text after parsing.

## Alternatives Considered

Adding a backend fetch proxy was rejected because it changes the architecture
surface and creates CORS/security work outside Phase 3.
