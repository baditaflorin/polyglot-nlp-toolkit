# syntax=docker/dockerfile:1.7

FROM maven:3.9-eclipse-temurin-21-alpine AS java-builder
WORKDIR /src/tools/langdetect-java
RUN apk add --no-cache git
COPY tools/langdetect-java/pom.xml .
COPY tools/langdetect-java/src ./src
RUN mvn -q package
RUN git clone --depth 1 https://github.com/shuyo/language-detection.git /tmp/language-detection

FROM golang:1.26-alpine AS go-builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
ARG VERSION=0.1.0
ARG COMMIT=dev
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w -X main.version=${VERSION} -X main.commit=${COMMIT}" -o /out/server ./cmd/server

FROM python:3.12-slim AS runtime
LABEL org.opencontainers.image.title="polyglot-nlp-toolkit" \
      org.opencontainers.image.description="Dockerized multilingual NLP API for the GitHub Pages frontend" \
      org.opencontainers.image.source="https://github.com/baditaflorin/polyglot-nlp-toolkit" \
      org.opencontainers.image.licenses="MIT"

ARG VERSION=0.1.0
ARG COMMIT=dev
ENV APP_ENV=production \
    APP_VERSION=${VERSION} \
    APP_COMMIT=${COMMIT} \
    HTTP_ADDR=:8080 \
    NLP_WORKER_PATH=/app/scripts/nlp_worker.py \
    LANGDETECT_JAVA_CMD="java -jar /opt/langdetect/langdetect-cli.jar" \
    LANGDETECT_PROFILES=/opt/langdetect/profiles \
    MODEL_CACHE_DIR=/models \
    STANZA_RESOURCES_DIR=/models/stanza \
    SENTENCE_TRANSFORMER_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 \
    PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-21-jre-headless curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app app

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m nltk.downloader -d /models/nltk punkt_tab averaged_perceptron_tagger_eng || true
COPY --from=go-builder /out/server /app/server
COPY --from=java-builder /src/tools/langdetect-java/target/langdetect-cli-0.1.0.jar /opt/langdetect/langdetect-cli.jar
COPY --from=java-builder /tmp/language-detection/profiles /opt/langdetect/profiles
COPY scripts/nlp_worker.py /app/scripts/nlp_worker.py

RUN chown -R app:app /app /models /opt/langdetect
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 CMD curl -fsS http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["/app/server"]
