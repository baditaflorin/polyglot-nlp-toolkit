# API

OpenAPI contract:

api/openapi.yaml

Local base URL:

http://localhost:8080

Health:

```sh
curl http://localhost:8080/healthz
```

Ready:

```sh
curl http://localhost:8080/readyz
```

Analyze:

```sh
curl -X POST http://localhost:8080/api/v1/analyze \
  -H 'Content-Type: application/json' \
  -d '{
    "documents": ["Bucuresti este capitala Romaniei.", "Open-source NLP helps teams."],
    "operations": ["detect", "tokenize", "pos", "ner", "embed", "cluster"],
    "clusterCount": 2
  }'
```

Metrics:

```sh
curl http://localhost:8080/metrics
```
