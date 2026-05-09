# Phase 3 Codebase Health Audit

## Before Measurements

| Area | Finding | Evidence | Priority |
| --- | --- | --- | --- |
| DRY | API request shape and UI state shape are not canonicalized. | `Analyzer.tsx`, `schema.ts`, `api.ts` each assemble related objects. | High |
| DRY | Export-like JSON serialization is absent, so future additions would duplicate ad hoc JSON code. | No exporter module. | High |
| SOLID | `Analyzer.tsx` owns input parsing, settings, API mutation, result rendering, and soon exports. | Single file is already ~330 lines. | High |
| SOLID | `usePersistentState` parses unchecked JSON and has no migration. | `frontend/src/lib/usePersistentState.ts`. | High |
| Dead code | None obvious in source; `frontend/test-results` exists locally and should stay ignored. | `find` and `rg` inspection. | Low |
| TODO/FIXME/XXX/HACK | 0 source TODO markers found outside dependencies. | `rg` scan. | Green |
| Type safety | `import.meta.env as unknown as ...` is a boundary cast. | `frontend/src/lib/env.ts`. | Acceptable if documented boundary. |
| Type safety | `JSON.parse(stored) as T` is unsafe. | `frontend/src/lib/usePersistentState.ts`. | High |
| Type safety | Go uses `any` at JSON response boundary. | `internal/api/router.go`. | Acceptable boundary if documented. |
| Error handling | Frontend API errors expose raw body strings. | `frontend/src/features/analyze/api.ts`. | Medium |
| State management | Some settings persist, corpus/result do not. | `Analyzer.tsx`. | High |
| Test coverage | No tests for file input, import/export, autosave, share links, cancel, or settings persistence. | `frontend/src/features/analyze/api.test.ts` only schema tests. | High |

Before metrics:

- DRY violations in core modules: 2.
- TODO/FIXME/XXX/HACK markers: 0.
- Unsafe TypeScript casts outside boundary modules: 1.
- Production UI stubs: 0, but several expected controls missing.
- Real-user path tests: 1 smoke test, no import/export tests.

## After Measurements

After implementation:

- DRY violations in core modules: 0. Request assembly, input parsing, exporting,
  and persistence each have one source of truth.
- TODO/FIXME/XXX/HACK markers: 0.
- Unsafe TypeScript casts outside explicit boundary modules: 0. The remaining
  env cast is documented by ADR 0069 as a boundary adapter.
- Production UI stubs: 0. Visible controls have handlers.
- Real-user path tests: input parser tests, exporter tests, schema tests, and
  expanded Playwright smoke coverage.
- SOLID/module shape: output controls and result rendering were split out of
  `Analyzer.tsx`; the remaining analyzer component owns orchestration of the
  single corpus workflow and is an accepted follow-up refactor candidate.
