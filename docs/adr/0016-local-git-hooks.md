# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project must avoid GitHub Actions and run checks locally.

## Decision

Use `.githooks/` wired by `make install-hooks`.

Hooks:

- `pre-commit`: format, lint, and secret scan where tools are installed.
- `commit-msg`: Conventional Commits validator.
- `pre-push`: tests, build, Pages artifact check, smoke test.
- `post-merge` and `post-checkout`: placeholders for generated-code refresh.

## Consequences

- Contributors run the same checks locally.
- Optional tools such as gitleaks and golangci-lint are used when installed.

## Alternatives Considered

- Lefthook: rejected to avoid another required binary in v1.
