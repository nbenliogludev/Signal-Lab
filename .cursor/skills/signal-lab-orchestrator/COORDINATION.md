# Orchestrator subagent coordination

The orchestrator **does not** implement tasks in the main thread. For **implementation** and **review**, build prompts from these templates and dispatch a subagent (e.g. Task tool). After each subagent returns, update **`.execution/{executionId}/context.json`**.

- **Rules:** `.cursor/rules/*.mdc` (always).
- **Marketplace (optional):** `.cursor/marketplace-skills.md` — recommended skills; **not** proof of installation; **`.mdc` wins** on conflict.
- **Hook playbooks (manual):** `.cursor/hooks/*.md` — **not** auto-executed; **apply as checklists** during review and record **pass / fail / skipped** in **`phases.review.result`** and **`report.md`**.

---

## 1. Implementer subagent

Use for `database`, `backend`, `frontend`, `infra`, `docs` tasks.

**Model:** use **`task.model`** from `context.json` (`fast` or `default`).

After **backend route / Prisma / commit-related** work, the subagent should **remind** the user that **hook playbooks** exist (e.g. `after-new-endpoint.md`, `after-prisma-schema-change.md`) — **manual** follow-up, not automatic.

```text
# TASK: [task.title]
# TASK ID: [task.id]
# TYPE: [task.type]
# MODEL: [task.model]
# SKILL: [task.suggestedSkill] — if not `none`, read `.cursor/skills/<skill>/SKILL.md` first.

# CONTEXT
You are an execution subagent under the Signal Lab Orchestrator. Complete exactly ONE atomic task (5–10 min). Do not expand scope beyond [task.description].

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

**Model:** `fast` (readonly — **no** file edits).

Group by **domain** (`database`, `backend`, `frontend`) when helpful (PRD F6); **per-task** review is fine for small runs.

**Hook playbooks — apply as checklist (manual, not auto):**

| If this changed | Walk through (checklist only) |
|-----------------|-------------------------------|
| Nest routes / handlers / DTOs for new API surface | `.cursor/hooks/after-new-endpoint.md` |
| `prisma/schema.prisma` | `.cursor/hooks/after-prisma-schema-change.md` |
| Before declaring merge-ready (optional advisory) | `.cursor/hooks/before-commit.md` |

For **each** applicable playbook, output one line: **`PLAYBOOK: <filename> | PASS`** or **`FAIL`** (with reason) or **`SKIPPED`** (not applicable — why).

```text
# REVIEW: [task.title] ([task.id])  domain=[task.type]

# CONTEXT
Read-only QA subagent. Inspect the diff or files touched for this task. Do NOT edit files.

# CODE CHECKLIST
1. Stack constraints (`.cursor/rules/stack-constraints.mdc`)
2. Backend: MetricsService + AppLoggerService + SentryService where applicable (`.cursor/rules/observability-conventions.mdc`)
3. Frontend: TanStack Query + shadcn patterns (`.cursor/rules/frontend-patterns.mdc`)
4. Secrets / PII / obvious bugs

# HOOK PLAYBOOKS (manual checklists — report PASS/FAIL/SKIPPED per applicable file)
- after-new-endpoint.md
- after-prisma-schema-change.md
- before-commit.md

# RESPONSE FORMAT
First, one line per applicable playbook: PLAYBOOK: <name> | PASS|FAIL|SKIPPED — <note>
Then either:
REVIEW_PASSED.
or:
REVIEW_FAILED.
1. <reason>
2. <reason>
```

---

## 3. Retry loop (F6)

On **`REVIEW_FAILED`**:

1. Increment **`tasks[i].retries`** in `context.json`.
2. If **`retries < 3`**, re-dispatch **implementer** with reviewer feedback.
3. If **`retries >= 3`**, set **`tasks[i].status`** to **`failed`** and continue with the next eligible task (**`dependsOn`** satisfied). **Failed** tasks stay visible for **resume** and **report** (F7, F8).
