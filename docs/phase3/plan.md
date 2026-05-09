# Phase 3 Implementation Plan

Ranked by real-user impact.

1. Add versioned workspace state schema.
2. Add checked localStorage persistence and migration.
3. Add input format detection for text, HTML, CSV/TSV, JSON, and state files.
4. Add file picker input.
5. Add drag-and-drop input.
6. Add multi-file append with per-file summaries.
7. Add clipboard read with fallback message.
8. Add explicit sample loader.
9. Add start-fresh clear-state action.
10. Add URL-hash state restore for small workspaces.
11. Add abortable API requests and cancel control.
12. Add stale request guard through mutation state.
13. Add canonical JSON result export.
14. Add token CSV export.
15. Add copy-to-clipboard for JSON and CSV.
16. Add downloadable versioned state file.
17. Add import/export round-trip tests.
18. Add share URL generation with size limit.
19. Add copyable curl command for current request.
20. Add print action and print CSS.
21. Split analyzer state, input, output, and rendering helpers into focused modules.
22. Replace unchecked persisted JSON casts with zod validation.
23. Make API errors actionable.
24. Add settings section with only working settings.
25. Update README feature claims and limitations.
26. Expand Playwright smoke to cover stranger workflow controls.
27. Run stranger test and fix top three issues.
28. Bump version to 0.2.0, rebuild Pages, tag, push.
