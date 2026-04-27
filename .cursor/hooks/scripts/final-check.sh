#!/usr/bin/env bash
# Cursor stop hook — read-only checks, stderr only. Does not modify files or print secret values.
# stdin: JSON { status, loop_count } (optional). See https://cursor.com/docs/hooks
# Can be run manually from repo root: bash .cursor/hooks/scripts/final-check.sh </dev/null
set -euo pipefail
node -e '
let d = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => { d += c; });
process.stdin.on("end", () => { process.exit(0); });
' 2>/dev/null || true

echo '[signal-lab hook] stop: workspace reminders (read-only)' >&2

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "${ROOT}" ]]; then
  exit 0
fi
cd "${ROOT}"

any=0

while IFS= read -r f; do
  [[ -z "${f}" ]] && continue
  case "${f}" in
    .env|.env.local)
      echo '[signal-lab hook] WARNING: .env or .env.local is staged — unstage before commit.' >&2
      any=1
      ;;
  esac
done < <(git diff --cached --name-only 2>/dev/null || true)

while IFS= read -r f; do
  [[ -z "${f}" ]] && continue
  if git show ":${f}" 2>/dev/null | grep -q 'console\.log'; then
    echo "[signal-lab hook] NOTE: console.log in staged file: ${f}" >&2
    any=1
  fi
done < <(git diff --cached --name-only 2>/dev/null || true)

while IFS= read -r f; do
  [[ -z "${f}" ]] && continue
  [[ "${f}" == '.env.example' ]] && continue
  if git diff --cached -- "${f}" 2>/dev/null | grep -q '^\+.*ingest\.sentry\.io'; then
    echo "[signal-lab hook] NOTE: staged diff adds ingest.sentry.io reference in ${f} — confirm no real DSN in source." >&2
    any=1
  fi
done < <(git diff --cached --name-only 2>/dev/null || true)

if grep -rE '\.execution//' --include='*.md' README.md SUBMISSION_CHECKLIST.md .cursor 2>/dev/null | head -3 | grep -q .; then
  echo '[signal-lab hook] NOTE: broken path pattern .execution// found in markdown — fix double slash.' >&2
  any=1
fi

if [[ "${any}" -eq 0 ]]; then
  echo '[signal-lab hook] stop: no extra warnings (or no staged changes).' >&2
fi

exit 0
