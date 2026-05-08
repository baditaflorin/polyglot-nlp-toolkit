# Architecture

## Context

```mermaid
C4Context
  title Polyglot NLP Toolkit Context
  Person(user, "Corpus analyst", "Drops multilingual text and reviews NLP output.")
  System_Boundary(pages, "GitHub Pages") {
    System(frontend, "Static frontend", "React, TypeScript, Vite")
  }
  System_Boundary(server, "Docker host") {
    System(api, "NLP API", "Go HTTP server")
    System(worker, "NLP worker", "Python spaCy, Stanza, NLTK, sentence-transformers")
    System(java, "LangDetect CLI", "Java language detection")
  }
  Rel(user, frontend, "Uses", "HTTPS")
  Rel(frontend, api, "POST /api/v1/analyze", "HTTPS")
  Rel(api, worker, "JSON stdin/stdout", "subprocess")
  Rel(worker, java, "Detects language", "subprocess")
```

## Containers

```mermaid
flowchart LR
  subgraph "GitHub Pages"
    UI["docs/index.html<br/>React app"]
  end

  subgraph "Docker Compose host"
    N["nginx<br/>public port 25342"]
    API["Go API<br/>:8080"]
    PY["Python worker<br/>scripts/nlp_worker.py"]
    JAVA["Java LangDetect CLI"]
    PROM["Prometheus<br/>optional profile"]
  end

  UI --> N
  N --> API
  API --> PY
  PY --> JAVA
  PROM --> API
```

## Module Boundaries

- `frontend/` owns user interaction and Pages build output.
- `internal/api/` owns REST endpoints, validation, and JSON responses.
- `internal/nlp/` owns the subprocess contract to Python.
- `scripts/nlp_worker.py` owns NLP library integration and graceful fallbacks.
- `tools/langdetect-java/` owns Java language detection.
- `deploy/` owns production Docker Compose, nginx, and Prometheus samples.
