#!/usr/bin/env bash
set -euo pipefail

message_file="${1:-.git/COMMIT_EDITMSG}"
first_line="$(head -n 1 "$message_file")"

if [[ "$first_line" =~ ^(feat|fix|docs|chore|refactor|test|ops|data)(\([a-z0-9._-]+\))?!?:\ .+ ]]; then
  exit 0
fi

echo "Commit message must use Conventional Commits: feat:, fix:, docs:, chore:, refactor:, test:, ops:, or data:" >&2
echo "Got: $first_line" >&2
exit 1
