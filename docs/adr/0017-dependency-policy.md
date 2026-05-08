# 0017 - Dependency Policy

## Status

Accepted

## Context

The toolkit integrates heavyweight NLP libraries and must stay maintainable.

## Decision

Use battle-tested dependencies:

- Go: chi, validator, viper, envconfig, Prometheus client.
- Frontend: React, Vite, TypeScript, Tailwind, TanStack Query, Zod.
- NLP: spaCy, Stanza, NLTK, sentence-transformers, scikit-learn.
- Java: com.cybozu.labs LangDetect wrapped by a small CLI.

## Consequences

- v1 avoids custom NLP primitives.
- Docker builds are heavier but more capable.
- Optional runtime fallbacks keep local development possible without all models.

## Alternatives Considered

- Custom tokenizers, clustering, or language detection: rejected because
  production-grade libraries already exist.
