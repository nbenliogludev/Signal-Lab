# Orchestrator examples

Folder layout: **`.execution/{executionId}/`** (equivalently **`.execution/<timestamp>/`** per PRD F1) where **`executionId`** matches **`context.json`** → **`executionId`** (format `YYYY-MM-DD-HH-mm`).

Existing **`.execution/*/`** folders are **diagnostic examples only** — do not overfit the orchestrator to a single run; optional honest note: an earlier run may have shown **mega-task** or missing hook-playbook reporting; follow current **`SKILL.md`** instead.

## Decomposition (PRD F4) — pattern, not a fixed task count

For **feature-sized** work, **`tasks`** often split by **surface** (adjust to the PRD — **no** fixed number of tasks). **`review`** / **`report`** are **phases**, not a single implementation row.

| id | type | model | suggestedSkill | Note |
|----|------|-------|----------------|------|
| task-000 | backend | fast | nestjs-endpoint | Optional: narrow codebase touchpoint confirmation (or rely on **`codebase`** phase only) |
| task-001 | backend | fast | nestjs-endpoint | DTO / contract only |
| task-002 | backend | **default** | observability | Cross-cutting metrics/logs/Sentry semantics for new behavior |
| task-003 | backend | fast | nestjs-endpoint | Service/controller wiring |
| task-004 | frontend | fast | none | UI + types; justify `none` in `phases.decomposition.result` |
| task-005 | docs | fast | none | README / verification |

**Bad:** one row “Implement everything end-to-end”.

## Final report — hook playbooks section (PRD 003 R4 + PRD F8)

Include when any playbook was applicable:

```markdown
### Hook playbooks (manual)

| Playbook | Result | Note |
|----------|--------|------|
| after-new-endpoint.md | PASS | Metrics + logs checked for new route |
| after-prisma-schema-change.md | SKIPPED | No schema edit this run |
| before-commit.md | SKIPPED | Advisory before merge only |
```

## Resume (F7)

```text
Resume from .execution/2026-04-26-21-15/context.json
```

- Read **`context.json`** first; **do not** redo **`completed`** phases.
- **`failed`** tasks stay **`failed`** and appear in the report; continue **`pending`** work when safe.

## Report body (PRD F8 shape)

See PRD 004 for the summary pattern (tasks completed/failed, retries, model usage estimate, next steps). Add **`### Hook playbooks`** when relevant.
