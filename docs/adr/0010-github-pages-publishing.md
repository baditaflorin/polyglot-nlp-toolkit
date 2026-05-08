# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL must work from day one and show a static frontend.

## Decision

Publish from the `main` branch `docs/` directory. Vite builds the app into
`docs/` with base path `/polyglot-nlp-toolkit/`. `404.html` is copied from
`index.html` for SPA fallback.

Live URL:

https://baditaflorin.github.io/polyglot-nlp-toolkit/

## Consequences

- Built assets are committed and served directly by Pages.
- Documentation and built assets share `docs/`; build cleanup must not delete
  ADRs or markdown docs.
- Hashed Vite assets provide cache busting.

## Alternatives Considered

- `gh-pages` branch: rejected to keep source and published output together.
- Root publishing: rejected because Vite output would mix too many build files
  into the repository root.
