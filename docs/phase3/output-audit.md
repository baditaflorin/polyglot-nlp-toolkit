# Phase 3 Output Pathway Audit

Status key: green = works end-to-end, yellow = partial, red = claimed or expected but broken, gray = deliberately out of scope.

## Before

| Exit path | Status | Evidence | Decision |
| --- | --- | --- | --- |
| On-screen analysis | Green | Results panel shows engine status, tokens, entities, clusters. | Keep and test. |
| Copy JSON | Red | No copy controls exist. | Finish. |
| Download JSON | Red | No export controls exist. | Finish. |
| Download CSV | Red | No CSV export exists for token/table workflows. | Finish token CSV export. |
| Copy CSV | Red | No copy controls exist. | Finish. |
| Download state file | Red | No canonical state export exists. | Finish versioned state export. |
| Import exported state | Red | No importer exists. | Finish through input parser. |
| Share URL | Red | No hash/deep-link encoding exists. | Finish for small states with documented limit. |
| Print-friendly output | Red | Browser print exists but no intentional print action or print CSS. | Finish minimal print action/CSS. |
| API/curl-ready output | Yellow | API docs include curl, but app does not generate a command for current request. | Finish copy curl for current request. |
| Screenshot/embed/code export | Gray | Not claimed and not needed for corpus analysis. | Out of scope. |

Before summary: 1 green, 1 yellow, 8 red, 1 gray.

## After

| Exit path | Status | Evidence |
| --- | --- | --- |
| On-screen analysis | Green | Results panel still shows engine status, tokens, entities, clusters. |
| Copy JSON | Green | Copy JSON uses canonical analysis export. |
| Download JSON | Green | JSON download writes `polyglot-analysis.json`. |
| Download CSV | Green | CSV download writes token-level rows. |
| Copy CSV | Green | Copy CSV uses the same token exporter. |
| Download state file | Green | State file uses versioned workspace schema. |
| Import exported state | Green | Shared input parser restores state files. |
| Share URL | Green | Small workspaces can be copied/restored through `#state=`. |
| Print-friendly output | Green | Print action and print CSS hide input chrome. |
| API/curl-ready output | Green | Copy curl command reflects current request/settings. |
| Screenshot/embed/code export | Gray | Out of scope by ADR 0062. |

After summary: 10 green, 0 yellow, 0 red, 1 gray.
