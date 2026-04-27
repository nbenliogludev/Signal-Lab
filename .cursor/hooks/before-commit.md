# Playbook: Before Commit

> **Manual playbook** — run before `git commit`. Optional: `.cursor/hooks.json` runs `.cursor/hooks/scripts/final-check.sh` on agent `stop` (stderr reminders only); confirm in Cursor Hooks output if unsure. This file remains the full checklist.

## When to run this playbook
Before any `git commit` — especially when staging files that include `.env`, config files, or new service code.

## Problem this solves
Secrets committed to git are a critical security incident. Additionally, common mistakes like `console.log` left in production code, or TODO comments that block a feature, get quietly committed and forgotten. This playbook catches them before they hit the remote.

## What to check

### 1. No hardcoded secrets
Search staged files for patterns that look like secrets:

```bash
# Check for common secret patterns in staged files
git diff --cached --name-only | xargs grep -lE \
  "(password|secret|token|api_key|apikey|private_key)\s*=\s*['\"][^'\"]{6,}" \
  2>/dev/null
```

**Red flags:**
- Any string that looks like `password = "abc123"` or `SECRET_KEY = "xyz"`
- JWT tokens, AWS keys, Sentry DSNs hardcoded in source (not in `.env`)
- Database connection strings with credentials inline

If found: remove the secret, move to `.env`, add the key name to `.env.example`.

### 2. No `.env` files staged
```bash
git diff --cached --name-only | grep -E "^\.env$|^apps/.*\.env$"
```
If any real `.env` file (not `.env.example`) is staged — **unstage it immediately**:
```bash
git reset HEAD .env
```

### 3. No `console.log` in backend code
```bash
git diff --cached -- "*.ts" | grep "^\+" | grep "console\.log"
```
Replace with the NestJS logger: `this.logger.log(...)`.

### 4. No TODO/FIXME blocking a feature
```bash
git diff --cached -- "*.ts" "*.tsx" | grep "^\+" | grep -iE "TODO|FIXME|HACK|XXX"
```
If a TODO is blocking functionality (not just a note), resolve it before committing.

### 5. TypeScript compiles
```bash
cd apps/backend && npx tsc --noEmit 2>&1 | head -20
cd apps/frontend && npx tsc --noEmit 2>&1 | head -20
```

### 6. Commit message format
Use Conventional Commits:
```
feat(scope): short description
fix(scope): short description
chore(scope): short description
docs(scope): short description
refactor(scope): short description
```
Examples: `feat(scenarios): add teapot endpoint`, `fix(metrics): correct counter label`

## If any check fails
Do NOT commit. Fix the issue first, then re-stage and commit.

## References
- Stack rules: `.cursor/rules/stack-constraints.mdc`
- Observability: `.cursor/rules/observability-conventions.mdc`
