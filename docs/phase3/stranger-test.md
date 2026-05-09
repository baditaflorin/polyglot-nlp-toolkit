# Phase 3 Stranger Test

## Method

Private-browser style workflow simulation against the built Pages artifact using
the Playwright smoke server:

1. Open the app with no prior workspace state.
2. Load a real CSV-like corpus file: `people.csv`.
3. Confirm the app explains how many documents were loaded.
4. Locate settings without reading README.
5. Verify export paths visible before a backend run.
6. Confirm state/curl export works without needing NLP API availability.

## Findings

| Issue | Impact | Response |
| --- | --- | --- |
| File loading was not available in v1. | Stranger could not bring their own files. | Added file picker, drag/drop, clipboard, HTML/CSV/TSV/JSON/state parsers. |
| Export paths were absent in v1. | Stranger could not use results downstream. | Added copy/download JSON, CSV, state, share URL, curl, and print controls. |
| Smoke server depended on Python `http.server`, which hung locally. | Release verification could falsely block or hang. | Replaced smoke preview with `scripts/serve-pages.mjs`, a tiny Node server matching the Pages base path. |
| Test wording found ambiguous "2 documents" matching. | Automation was less precise than user-visible state. | Tightened smoke assertion to the exact document-count label. |
| Backend requirement remains easy to miss. | Stranger can load/export state but cannot analyze without an API. | README limitations and in-app footer keep this explicit; hosted backend remains out of scope. |

## Top 3 Fixed

1. Add own-data input paths.
2. Add own-work output paths.
3. Make smoke verification deterministic and representative.

## Result

The app is now usable cold for loading, preparing, saving, sharing, and exporting
corpus work. Full NLP analysis still requires a running backend URL.
