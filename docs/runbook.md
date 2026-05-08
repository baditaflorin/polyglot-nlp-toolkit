# Runbook

## Expected Resources

Minimum for small corpora:

- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB plus model cache

Recommended for sentence-transformers and larger corpora:

- CPU: 4+ cores
- RAM: 8 GB+
- Disk: 20 GB+

## Start

```sh
docker compose -f deploy/docker-compose.yml up -d
```

## Logs

```sh
docker compose -f deploy/docker-compose.yml logs -f app
docker compose -f deploy/docker-compose.yml logs -f nginx
```

## Health

```sh
curl http://localhost:25342/healthz
curl http://localhost:25342/readyz
```

## Metrics

Metrics are exposed by the app at `/metrics` inside the internal Docker network.
Public nginx blocks `/metrics`.

## Common Failures

- `readyz` fails: check that `/app/scripts/nlp_worker.py` exists and Python
  dependencies installed.
- Java language detection warning: check `LANGDETECT_JAVA_CMD` and
  `LANGDETECT_PROFILES`.
- Slow first request: sentence-transformers may download or initialize a model.

## Rollback

```sh
docker compose -f deploy/docker-compose.yml pull app
docker compose -f deploy/docker-compose.yml up -d app
```

For Pages rollback, revert the commit that changed `docs/`.
