# Contributing

Thanks for helping improve Polyglot NLP Toolkit.

## Local Setup

```sh
make install-hooks
npm --prefix frontend install
go mod download
make build
make test
```

The project intentionally does not use GitHub Actions. Local hooks run the
checks before commit and push.

## Commit Style

Use Conventional Commits:

```text
feat: add corpus clustering endpoint
fix: handle empty documents in analyzer
docs: explain Pages publishing
```

Allowed types are `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ops`,
and `data`.

## Security

Never commit credentials, private keys, tokens, `.env` files with real values,
or internal hostnames. Run `make hooks-pre-commit` before pushing.
