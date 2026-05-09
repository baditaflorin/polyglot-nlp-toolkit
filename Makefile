SHELL := /bin/bash

PROJECT_NAME := polyglot-nlp-toolkit
OWNER := baditaflorin
VERSION ?= $(shell git describe --tags --abbrev=0 2>/dev/null || node -p "require('./frontend/package.json').version" 2>/dev/null || echo 0.1.0)
COMMIT ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
IMAGE ?= ghcr.io/$(OWNER)/$(PROJECT_NAME)
FRONTEND_DIR := frontend
PAGES_DIR := docs
GO_PACKAGES := $(shell go list ./... 2>/dev/null | grep -v '/frontend/' | tr '\n' ' ')

.PHONY: help install-hooks dev backend-dev frontend-dev build data test test-integration smoke lint fmt pages-preview docker-build docker-push release compose-up compose-down clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout

help:
	@awk 'BEGIN {FS = ":.*##"; printf "Targets:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## run frontend and backend locally
	@trap 'kill 0' EXIT; $(MAKE) backend-dev & $(MAKE) frontend-dev

backend-dev: ## run backend API
	APP_ENV=development APP_VERSION=$(VERSION) APP_COMMIT=$(COMMIT) go run ./cmd/server

frontend-dev: ## run Vite dev server
	cd $(FRONTEND_DIR) && VITE_APP_VERSION=$(VERSION) VITE_APP_COMMIT=$(COMMIT) VITE_API_BASE_URL=http://localhost:8080 npm run dev -- --host 0.0.0.0

build: ## build frontend into docs/ and compile backend
	cd $(FRONTEND_DIR) && VITE_APP_VERSION=$(VERSION) VITE_APP_COMMIT=$(COMMIT) npm run build
	CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT)" -o bin/server ./cmd/server

data: ## Mode C has no static data generation pipeline
	@echo "No Mode B data pipeline; runtime corpora are processed by the Docker backend."

test: ## run unit tests
	CGO_ENABLED=0 go test $(GO_PACKAGES)
	cd $(FRONTEND_DIR) && npm test -- --run

test-integration: ## run integration tests
	go test -tags=integration ./test/integration/...
	cd $(FRONTEND_DIR) && npm run test:e2e -- --project=chromium

smoke: ## build, serve Pages output, and run smoke tests
	bash ./scripts/smoke.sh

lint: ## run linters
	gofmt -w $$(find . -path ./frontend -prune -o -path ./.git -prune -o -name '*.go' -print)
	CGO_ENABLED=0 go vet $(GO_PACKAGES)
	if command -v golangci-lint >/dev/null 2>&1; then golangci-lint run; else echo "golangci-lint not installed; skipping"; fi
	cd $(FRONTEND_DIR) && npm run lint && npm run typecheck && npm run format:check
	if command -v gitleaks >/dev/null 2>&1; then gitleaks detect --source . --no-git --redact; else echo "gitleaks not installed; skipping"; fi

fmt: ## autoformat code
	gofmt -w $$(find . -path ./frontend -prune -o -path ./.git -prune -o -name '*.go' -print)
	cd $(FRONTEND_DIR) && npm run format

pages-preview: ## serve docs locally as GitHub Pages would
	node scripts/serve-pages.mjs 4173 $(PAGES_DIR)

docker-build: ## build amd64 backend image
	docker buildx build --platform linux/amd64 --build-arg VERSION=$(VERSION) --build-arg COMMIT=$(COMMIT) -t $(IMAGE):latest -t $(IMAGE):$(VERSION) -t $(IMAGE):$(COMMIT) .

docker-push: ## push amd64 backend image to GHCR
	docker buildx build --platform linux/amd64 --push --build-arg VERSION=$(VERSION) --build-arg COMMIT=$(COMMIT) -t $(IMAGE):latest -t $(IMAGE):$(VERSION) -t $(IMAGE):$(COMMIT) .

release: ## tag and publish release artifacts
	@if [[ "$(VERSION)" != v* ]]; then echo "Set VERSION=vX.Y.Z"; exit 1; fi
	git tag $(VERSION)
	git push origin $(VERSION)
	$(MAKE) docker-push VERSION=$(VERSION)
	gh release create $(VERSION) --repo $(OWNER)/$(PROJECT_NAME) --title "$(VERSION)" --notes "Release $(VERSION)"

compose-up: ## start local compose stack
	docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.dev.yml up -d --build

compose-down: ## stop local compose stack
	docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.dev.yml down

clean: ## remove local build outputs
	rm -rf bin frontend/dist docs/assets docs/index.html docs/404.html docs/manifest.webmanifest docs/sw.js docs/vite.svg

hooks-pre-commit:
	$(MAKE) fmt
	$(MAKE) lint

hooks-commit-msg:
	./scripts/validate-conventional-commit.sh "$${COMMIT_MSG_FILE:-.git/COMMIT_EDITMSG}"

hooks-pre-push:
	$(MAKE) test
	$(MAKE) build
	test -s docs/index.html
	$(MAKE) smoke

hooks-post-merge:
	@echo "No generated code to refresh after merge."

hooks-post-checkout:
	@echo "No generated code to refresh after checkout."
