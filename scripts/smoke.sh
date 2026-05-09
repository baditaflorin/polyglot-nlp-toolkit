#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root_dir"

make build

port="$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)"

node scripts/serve-pages.mjs "$port" docs >/tmp/polyglot-nlp-pages.log 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:$port/polyglot-nlp-toolkit/" >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

curl -fsS "http://127.0.0.1:$port/polyglot-nlp-toolkit/" | grep -q "Polyglot NLP Toolkit"
cd frontend
PLAYWRIGHT_BASE_URL="http://127.0.0.1:$port/polyglot-nlp-toolkit/" npm run test:e2e -- --project=chromium
