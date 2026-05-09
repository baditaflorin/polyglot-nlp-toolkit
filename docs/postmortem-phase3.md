# Phase 3 Postmortem

## Audit Grids

| Audit | Before | After |
| --- | --- | --- |
| Input pathways | 1 green, 5 yellow, 7 red, 2 gray | 13 green, 0 yellow, 0 red, 2 gray |
| Output pathways | 1 green, 1 yellow, 8 red, 1 gray | 10 green, 0 yellow, 0 red, 1 gray |
| Controls | 7 green, 1 yellow, 6 red | 15 green, 0 yellow, 0 red |
| Feature claims | 5 shipped, 3 partial, 1 superseded | 5 shipped, 1 superseded, 0 partial |

## Half-Baked Feature Triage

| Feature | Outcome | Rationale |
| --- | --- | --- |
| "Drop corpus" | Finished | File picker, drag/drop, clipboard, HTML/CSV/TSV/JSON/state import now exist. |
| API/curl docs | Finished | Current request can be copied as curl. |
| Client persistence | Finished | Versioned workspace autosave and start-fresh clear state exist. |
| Smoke testing | Finished | Smoke covers project links and file-input/export controls. |
| Docker image claim | Kept with limitation | Build/push path exists; README states Docker/GHCR requirement. |
| OCR and remote URL loading | Left out | New feature/architecture work, not completeness. |

## Codebase Health

| Metric | Before | After |
| --- | --- | --- |
| Core DRY violations | 2 | 0 |
| TODO/FIXME/XXX/HACK | 0 | 0 |
| Unsafe TS casts outside boundary adapters | 1 | 0 |
| Production UI stubs | 0 visible stubs, but missing controls | 0 |
| Real-user path tests | 1 link smoke, 2 schema tests | Parser/exporter/schema tests plus 2 Playwright smoke tests |

The main accepted debt is `Analyzer.tsx`, still an orchestration-heavy component
after output/result panels were split out. It is coherent enough for this phase
but should be split into input/settings panels if the workflow grows again.

## Stranger Test

Recorded in `docs/phase3/stranger-test.md`.

Top three addressed:

1. Own-data input paths added.
2. Own-work output paths added.
3. Local Pages smoke verification made deterministic.

## Documentation Mismatches Fixed

- README no longer implies a pushed GHCR image is guaranteed from this machine.
- README now lists actual input/output pathways.
- README explicitly documents no arbitrary URL fetch and no OCR.
- ADR 0067/0068 supersede the old "do not store corpora by default" policy with
  explicit autosave plus clear-state.

## Surprises

- The local Python static server hung in this environment, so the release smoke
  test itself was not trustworthy until replaced.
- Adding exports exposed the need for a canonical workspace schema immediately.
- The biggest "toy" feeling was not NLP quality; it was the inability to get
  user data in and work out.

## Still Open For Phase 4

1. Hosted demo backend URL so the public Pages app can analyze without local setup.
2. Chunk/progress UI for very large files.
3. Mobile device manual verification.
4. More aggressive split of the analyzer orchestration component.
5. Import/export compatibility tests across future schema versions.

## Honest Take

A stranger can now use the app for their own real corpus workflow if they have a
backend API: load data, configure tasks, run analysis, export results, save state,
restore later, and share small workspaces.

It is still not fully zero-help for a stranger who expects the public Pages URL
to include a hosted NLP backend. The app says that clearly, but the operational
setup remains the main usability gap.
