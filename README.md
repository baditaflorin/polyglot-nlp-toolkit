# Polyglot NLP Toolkit

Live site: https://baditaflorin.github.io/polyglot-nlp-toolkit/

Repository: https://github.com/baditaflorin/polyglot-nlp-toolkit

Docker image: ghcr.io/baditaflorin/polyglot-nlp-toolkit:latest

Polyglot NLP Toolkit replaces a pile of language-processing microservices with
one static GitHub Pages frontend and one Dockerized API that tokenizes, POS-tags,
parses, extracts entities, embeds, and clusters corpora across 70+ languages,
including Romanian.

## Quickstart

```sh
make install-hooks
npm --prefix frontend install
go mod download
make dev
make smoke
```

The frontend runs at http://localhost:5173/polyglot-nlp-toolkit/ and expects the
API at http://localhost:8080 by default.

## What It Does

- Drop in raw text or multiple documents.
- Choose language detection, tokenization, POS, dependency parsing, NER,
  embeddings, and clustering.
- Run the work through a Go API that orchestrates spaCy, Stanza, NLTK,
  sentence-transformers, and Java LangDetect.
- Publish the UI from GitHub Pages and deploy the backend as an amd64 GHCR image.

## Architecture

```mermaid
flowchart LR
  U["User browser"] --> P["GitHub Pages frontend"]
  P --> A["Docker backend API"]
  A --> G["Go HTTP server"]
  G --> W["Python NLP worker"]
  W --> J["Java LangDetect CLI"]
  W --> M["spaCy / Stanza / NLTK / sentence-transformers"]
```

More detail: docs/architecture.md

ADRs: docs/adr/

API contract: api/openapi.yaml

Deployment guide: deploy/README.md

## Versioning

The Pages app displays both version and commit. `make build` injects
`APP_VERSION` from `git describe --tags` where available and `APP_COMMIT` from
the current short SHA.

## Environment

Configuration is via environment variables. See `.env.example`.

## Checks

```sh
make fmt
make lint
make test
make build
make smoke
```

## Support

If the project helps you, star it:

https://github.com/baditaflorin/polyglot-nlp-toolkit

Support development:

https://www.paypal.com/paypalme/florinbadita
