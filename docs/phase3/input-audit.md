# Phase 3 Input Pathway Audit

Status key: green = works end-to-end, yellow = partial, red = claimed or expected but broken, gray = deliberately out of scope.

## Before

| Entry point | Status | Evidence | Decision |
| --- | --- | --- | --- |
| Paste plain text | Green | Textarea accepts corpus text and sends it to `/api/v1/analyze`. | Keep and test. |
| Paste HTML | Yellow | HTML pasted into textarea is analyzed as literal markup. | Finish by detecting HTML and extracting visible text. |
| Paste CSV/TSV | Yellow | CSV is treated as prose. | Finish by detecting tabular text and converting rows to documents. |
| File upload | Red | No file picker exists. README says users can drop raw text, but not load files. | Finish for `.txt`, `.csv`, `.tsv`, `.html`, `.json`, and saved state. |
| Drag and drop | Red | No drop target exists. | Finish using the same parser as file upload. |
| Multi-file input | Red | No file input exists. | Finish with append semantics and per-file summaries. |
| Clipboard read button | Red | Only manual paste exists. | Finish with permission-aware button and fallback copy. |
| Mobile picker | Red | No file input, so iOS/Android Files cannot be used. | Finish through standard `<input type=file multiple>`. |
| URL input | Gray | Runtime Pages app cannot fetch arbitrary pages due to CORS; backend proxy would be a new feature. | Permanently out of scope for Phase 3; UI will tell users to paste rendered text or HTML. |
| Image/OCR input | Gray | OCR is not implemented or claimed. | Out of scope; do not add. |
| Sample/demo loader | Yellow | Demo text is hard-coded and always present, but there is no deliberate loader/reset path. | Finish as an explicit sample action. |
| Deep links | Red | URL hash state is not read. | Finish for small encoded state. |
| Imported state | Red | No state import exists. | Finish with versioned JSON state files. |
| Restored autosave | Yellow | Only API/settings/task preferences persist; corpus and result do not. | Finish with versioned workspace autosave. |

Before summary: 1 green, 5 yellow, 7 red, 2 gray.

## After

| Entry point | Status | Evidence |
| --- | --- | --- |
| Paste plain text | Green | Textarea remains the primary corpus input. |
| Paste HTML | Green | `onPaste` reads `text/html`, strips non-visible tags, and loads visible text. |
| Paste CSV/TSV | Green | Shared parser detects delimiters and converts rows to documents. |
| File upload | Green | File picker accepts text, CSV, TSV, HTML, JSON, and state files. |
| Drag and drop | Green | Dropped files use the same parser as the file picker. |
| Multi-file input | Green | Multiple files are parsed and appended with per-source summaries. |
| Clipboard read button | Green | Clipboard button reads text when permission allows and gives fallback guidance when blocked. |
| Mobile picker | Green | Standard multi-file input works with mobile file providers. |
| URL input | Gray | Out of scope by ADR 0061; users paste rendered text or HTML instead. |
| Image/OCR input | Gray | Out of scope by ADR 0061. |
| Sample/demo loader | Green | Explicit Sample button restores the built-in corpus. |
| Deep links | Green | Small workspaces restore from `#state=` links. |
| Imported state | Green | Exported state JSON files restore the workspace. |
| Restored autosave | Green | Versioned workspace state persists to localStorage. |

After summary: 13 green, 0 yellow, 0 red, 2 gray.
