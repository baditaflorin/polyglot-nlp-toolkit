# Deployment

Frontend:

https://baditaflorin.github.io/polyglot-nlp-toolkit/

Backend image:

ghcr.io/baditaflorin/polyglot-nlp-toolkit:latest

## Prerequisites

- Docker Engine with Compose plugin.
- DNS pointing your API hostname to the server.
- TLS certificates from Let's Encrypt mounted at `/etc/letsencrypt`.
- GHCR access if the package is private. Public package pulls need no login.

## First Run

```sh
cd deploy
cp .env.example .env
docker compose pull
docker compose up -d
```

The public API is exposed through nginx on host port `25342`.

## TLS

Mount certificates at:

```text
/etc/letsencrypt/live/example.com/fullchain.pem
/etc/letsencrypt/live/example.com/privkey.pem
```

Update `deploy/nginx/nginx.conf` with the production hostname.

## Logs

```sh
docker compose logs -f app
docker compose logs -f nginx
```

## Rollback

Pin a previous image tag in `deploy/docker-compose.yml`, then run:

```sh
docker compose pull app
docker compose up -d app
```

## Prometheus

Start Prometheus with:

```sh
docker compose --profile metrics up -d prometheus
```
