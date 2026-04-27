#!/usr/bin/env bash
# Cursor afterFileEdit hook — reminders only (stderr). Does not modify files.
# stdin: JSON with file_path (absolute). See https://cursor.com/docs/hooks
# Manual: printf '%s\n' '{"file_path":"/abs/path/prisma/schema.prisma"}' | bash .cursor/hooks/scripts/after-file-edit.sh
set -euo pipefail
node -e '
const chunks = [];
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", () => {
  const raw = chunks.join('').trim();
  if (!raw) process.exit(0);
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const fp = typeof payload.file_path === "string" ? payload.file_path : "";
  const note = (msg) => process.stderr.write(`[signal-lab hook] ${msg}\n`);
  if (fp.includes("prisma/schema.prisma")) {
    note(
      "Prisma schema changed: run migrate + prisma generate (see .cursor/hooks/after-prisma-schema-change.md).",
    );
  }
  if (fp.includes("/apps/backend/") && /(\.controller\.ts|\.service\.ts|\/dto\/)/.test(fp)) {
    note(
      "Backend controller/service/DTO touched: check metrics, structured logs, Sentry, validation, Swagger (see .cursor/hooks/after-new-endpoint.md).",
    );
  }
  if (fp.includes("/apps/frontend/") && /\/(components|lib)\/|api\.ts|\.tsx$/i.test(fp)) {
    note(
      "Frontend touched: check TanStack Query + React Hook Form (.cursor/rules/frontend-patterns.mdc).",
    );
  }
  process.exit(0);
});
' || true
exit 0
