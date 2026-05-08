# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

The frontend must never contain secrets and the backend should be deployable by
environment variables.

## Decision

Use environment variables loaded through Viper and envconfig. Commit
`.env.example` with placeholders. Do not commit real `.env` files.

## Consequences

- Docker Compose can supply runtime settings.
- Pages can configure only public values at build time.
- Gitleaks scans run in local hooks when installed.

## Alternatives Considered

- Checked-in config files: rejected because they invite secret drift.
- Runtime secrets in frontend: forbidden.
