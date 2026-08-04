# Privacy

The GitHub Pages frontend does not include analytics in v1.

The frontend sends corpus text only to the API base URL configured in the UI.
By default during development this is:

http://localhost:8080

Do not point the UI at a backend you do not trust with your corpus data.

The frontend autosaves the full workspace -- including your pasted/uploaded
corpus text and the last analysis result (tokens, entities, embeddings) -- to
`window.localStorage` on every change, so you can resume after a reload (see
`frontend/src/features/analyze/Analyzer.tsx` and `storage.ts`). This is
unencrypted and persists until you use "Start fresh" (which calls
`clearWorkspace()`) or clear your browser storage yourself. If your corpus
contains sensitive text, treat your browser profile as part of the trust
boundary, not just the configured API base URL.

The frontend does store non-sensitive UI preferences such as API base URL and
selected tasks, as part of that same autosaved workspace object.
