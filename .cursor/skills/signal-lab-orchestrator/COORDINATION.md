# Orchestrator subagent coordination

The orchestrator **does not** implement tasks in the main thread. For phases **implementation** and **review**, build prompts from these templates and dispatch a subagent (e.g. Task tool). After each subagent returns, **update** `.execution/<executionId>/context.json` on disk.

Reference rules as **`.cursor/rules/*.mdc`** files (e.g. `stack-constraints.mdc`).

---

## 1. Implementer subagent

Use for `database`, `backend`, `frontend`, `infra` tasks.

**Model:** use `task.model` from `context.json` (`fast` or `default`). Subagent runners may map these to their own model slugs.

```text
# TASK: [task.title]
# TASK ID: [task.id]
# SUGGESTED SKILL: [task.suggestedSkill] — read `.cursor/skills/<skill>/SKILL.md` if not `none`.

# CONTEXT
You are an execution subagent under the Signal Lab Orchestrator. Complete exactly ONE atomic task (5–10 min). Do not expand scope.

# RULES (apply relevant .mdc files)
- Stack: `.cursor/rules/stack-constraints.mdc`
- Backend errors / HTTP: `.cursor/rules/error-handling.mdc`
- Prisma: `.cursor/rules/prisma-patterns.mdc`
- Observability: `.cursor/rules/observability-conventions.mdc` + `.cursor/skills/observability/SKILL.md`
- Frontend: `.cursor/rules/frontend-patterns.mdc`

# DIRECTIVE
[task.description]

# DONE
1. Changes match the directive and rules.
2. No unrelated refactors.
Reply: IMPLEMENTATION_COMPLETE. <one-line summary>
```

---

## 2. Reviewer subagent (readonly)

**Model:** `fast` (or map from task; must stay **readonly** — no code edits).

```text
# REVIEW: [task.title] ([task.id])

# CONTEXT
Read-only QA subagent. Inspect the diff or files touched for this task. Do NOT edit files.

# CHECKLIST
1. Stack constraints (`.cursor/rules/stack-constraints.mdc`)
2. Backend: MetricsService + AppLoggerService + SentryService usage where applicable (`.cursor/rules/observability-conventions.mdc`)
3. Frontend: TanStack Query + shadcn patterns (`.cursor/rules/frontend-patterns.mdc`)
4. Secrets / PII / obvious bugs

# RESPONSE FORMAT
Either:
REVIEW_PASSED.
or:
REVIEW_FAILED.
1. <reason>
2. <reason>
```

---

## 3. Retry loop

On `REVIEW_FAILED`:

1. Increment `tasks[i].retries` in `context.json`.
2. If `retries < 3`, re-dispatch **implementer** with reviewer reasons appended.
3. If `retries >= 3`, set `tasks[i].status` to `failed` and continue with the next eligible task.
