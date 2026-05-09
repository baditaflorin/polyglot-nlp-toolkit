# Phase 3 Controls Audit

Status key: green = handler works end-to-end, yellow = partial, red = missing or misleading, gray = out of scope.

## Before

| Control | Status | Evidence | Decision |
| --- | --- | --- | --- |
| Corpus textarea | Green | Updates corpus state and document count. | Keep. |
| API base URL input | Green | Persists to localStorage and affects request URL. | Keep. |
| Language select | Green | Persists and is sent as language hint. | Keep. |
| Task toggle buttons | Green | Toggle operations and persist. | Keep. |
| Cluster count slider | Green | Persists and is sent to API. | Keep. |
| Run NLP pipeline | Yellow | Runs, but cannot be cancelled and does not guard stale double-runs beyond pending disable. | Finish cancel and stale-state behavior. |
| GitHub link | Green | Points at repository. | Keep. |
| PayPal link | Green | Points at PayPal. | Keep. |
| Sample loader | Red | Not present as a control. | Add. |
| Start fresh | Red | Not present. | Add and verify it clears autosave. |
| File picker | Red | Not present. | Add. |
| Paste from clipboard | Red | Not present. | Add. |
| Export controls | Red | Not present. | Add copy/download/share/print/curl controls. |
| Settings page/panel | Red | Settings exist as loose fields, not a coherent page/panel. | Finish with an explicit settings section where every setting works. |

Before summary: 7 green, 1 yellow, 6 red.

## After

To be updated during implementation. Phase 3 target: every row green.
