# Phase 3 Findings Synthesis

## Top 5 Usability Gaps

1. A stranger cannot load their own files; the app is paste-only.
2. A stranger cannot take results out as JSON, CSV, state, or clipboard data.
3. The app cannot resume a workspace after reload.
4. Current request settings are scattered rather than presented as a complete settings surface.
5. Long requests cannot be cancelled from the UI.

## Top 5 Half-Baked Features

| Feature | Decision | Rationale |
| --- | --- | --- |
| "Drop corpus" wording | Finish | It implies file/drop pathways users expect. |
| API/curl docs | Finish | Current request should be copyable as curl from the app. |
| Client-side persistence | Finish | Preferences persist, workspace does not. |
| Smoke testing | Finish | Current smoke only checks links; it should exercise real controls. |
| Docker image claim | Keep with limitation | Build path exists; local daemon unavailable in prior run. README should be honest. |

## Top 5 Codebase Pain Points

1. `Analyzer.tsx` is too broad.
2. Persisted JSON is unversioned and unchecked.
3. Input parsing is implicit and one-off.
4. No canonical export/state format.
5. Tests cover demo presence but not real user workflow.

## Top 5 Documentation/Reality Mismatches

1. "Drop in raw text" reads like file/drop support, but only textarea exists.
2. Docker image is listed as if already pushed; previous run could not push it.
3. ADR 0005 says corpora are not stored by default; Phase 3 requires autosave.
4. API/curl examples exist in docs but current UI cannot produce a matching command.
5. "multiple documents" is true only through manual blank-line formatting.

## Fully Usable Means

- A stranger can load plain text, HTML, CSV/TSV, JSON, multiple files, clipboard text, or a saved state without reading docs.
- A stranger can run or cancel analysis and see which settings were used.
- A stranger can export JSON, CSV, curl, share URL, print view, or a state file and later restore the state.
- A reload does not destroy work; "start fresh" clearly clears it.
- README claims match controls that are covered by tests.

## Phase 3 Success Metrics

- Non-gray input audit rows green: 13/13.
- Non-gray output audit rows green: 10/10.
- Controls audit rows green: 14/14.
- Core DRY violations reduced from 2 to 0.
- TODO/FIXME/XXX/HACK count remains 0.
- Unsafe TypeScript casts outside explicit boundary modules reduced from 1 to 0.
- Playwright smoke covers load sample, file-like input path, run button presence, and export controls.

## Out Of Scope

- No new NLP engine behavior.
- No OCR/image input.
- No arbitrary URL scraping/proxying.
- No auth, accounts, server-side persistence, or cross-device sync.
- No visual polish work beyond the minimum UI required to make controls usable.
