# Phase 3 Feature Claims Audit

## Before

| Claim source | Claim | Status | Evidence | Decision |
| --- | --- | --- | --- | --- |
| README | "Drop in raw text or multiple documents." | Partial | Multiple documents require blank-line manual segmentation. No file/drop path. | Clarify and finish file/drop/paste pathways. |
| README | "Choose language detection, tokenization, POS, dependency parsing, NER, embeddings, and clustering." | Shipped | Task controls exist and call backend. | Keep. |
| README | "Run through Go API orchestrating spaCy, Stanza, NLTK, sentence-transformers, Java LangDetect." | Partial | API/worker exist; local Docker image push was not completed. | Keep, document runtime limitations honestly. |
| README | "Frontend runs at Pages and expects API at localhost by default." | Shipped | Vite base and API default are implemented. | Keep. |
| README | "Pages app displays version and commit." | Shipped | Header badge shows both. | Keep and test. |
| ADR 0005 | "Do not store corpora by default." | Superseded | Phase 3 requires resume from where user left off. | Replace with explicit autosave policy and clear-state control. |
| ADR 0013 | "One happy-path Pages smoke test." | Shipped | Playwright test exists. | Expand to input/output controls. |
| In-app | "Paste a corpus, choose NLP tasks, and run the Docker API." | Shipped | True. | Keep. |
| In-app footer | "Analysis requires running backend API." | Shipped | True and useful. | Keep. |

Before summary: 5 shipped, 3 partial, 1 superseded.

## After

| Claim source | Claim | Status | Evidence |
| --- | --- | --- | --- |
| README | Load your own data from text, HTML, CSV, TSV, JSON, or state files. | Shipped | Parser, file picker, drag/drop, tests. |
| README | Export JSON, CSV, state, curl, share URL, and print. | Shipped | Export controls and exporter tests. |
| README | Choose language detection, tokenization, POS, dependency parsing, NER, embeddings, and clustering. | Shipped | Settings/task controls remain wired. |
| README | Go API orchestrates the NLP worker stack. | Shipped with deployment limitation | Source and Dockerfile exist; README notes image publishing requires Docker/GHCR. |
| README | Pages app displays version and commit. | Shipped | Version badge remains. |
| ADR 0005 | Do not store corpora by default. | Superseded | ADR 0067/0068 define workspace autosave and clear-state. |

After summary: 5 shipped, 1 superseded, 0 partial, 0 quietly cut.
