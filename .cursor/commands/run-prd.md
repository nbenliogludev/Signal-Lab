# /run-prd

**PRD 003 R3** command: run work through the **Signal Lab orchestrator** (**PRD 004**). The normative contract is **`.cursor/skills/signal-lab-orchestrator/SKILL.md`**; this file is the operator checklist.

## Usage

```text
/run-prd <path-to-prd-file>
```

or paste PRD / feature text in the same message (set **`prdText`** in **`context.json`**, **`prdPath`**: `null`), or spill large text to **`.execution/{executionId}/prd-input.md`** per the skill.

**Example:** `/run-prd prds/004_prd-orchestrator.md`

## Pre-flight

1. **`.cursor/skills/signal-lab-orchestrator/SKILL.md`** — phases, decomposition, models, hook playbooks, resume.
2. **`.cursor/skills/signal-lab-orchestrator/COORDINATION.md`** — subagent templates.
3. **`prds/004_prd-orchestrator.md`** — canonical PRD text.
4. **`prds/003_prd-cursor-ai-layer.md`** — AI layer context (rules, skills, hook playbooks).
5. **`.cursor/rules/stack-constraints.mdc`**.

## Execution directory (PRD F1)

PRD 004: **`.execution/<timestamp>/`**. Here **`executionId`** = that timestamp → **`.execution/{executionId}/`** is the same folder as **`.execution/<timestamp>/`**.

Create **`.execution/{executionId}/`** with:

- **`context.json`** (required)
- **`report.md`** (optional, at end)
- **`prd-input.md`** (optional, for large PRD text)

**`executionId`:** `YYYY-MM-DD-HH-mm`, same value inside JSON **`executionId`**.

Initial **`context.json`**: **`prdPath`** and/or **`prdText`**; all **seven** **`phases`** keys; **`tasks: []`** until **`decomposition`** finishes; each task eventually has **`title`**, **`description`** (1–3 sentences), **`type`**, **`suggestedSkill`**, **`complexity`**, **`model`**, **`status`**, **`retries`**, **`dependsOn`**.

## Phases (PRD 004 — exact `currentPhase` keys)

| `currentPhase` | PRD name |
|----------------|----------|
| `analysis` | PRD Analysis |
| `codebase` | Codebase Scan |
| `planning` | Planning |
| `decomposition` | Decomposition |
| `implementation` | Implementation |
| `review` | Review |
| `report` | Report |

After each subagent step: persist **`context.json`** (`updatedAt`, **`currentPhase`**, phase **`status`/`result`**, task **`status`**, **`implementation.completedTasks`/`totalTasks`** when useful).

## Decomposition (PRD F4)

- **No mega-tasks** across **database / backend / frontend / docs** (or observability vs UI) unless the PRD is trivially single-surface.
- Use **Signal Lab patterns** from **`SKILL.md`** as **guidance**, not a fixed task count.
- **`model`:** **`fast`** for mechanical work; **`default`** for architecture, multi-system, tricky observability/error semantics, trade-offs — **do not** mark everything **`fast`** when a task clearly needs **`default`**.

## Review phase

- **PRD F6:** readonly reviewer; **≤ 3** retries per task; **`failed`** tasks visible and non-blocking for unrelated work.
- **Hook playbooks:** apply **`.cursor/hooks/*.md`** as **manual** checklists; record **pass / fail / skipped** in **`phases.review.result`** and **`report.md`** (`### Hook playbooks`). **Do not** claim they auto-run.

## Git (safe, optional)

- **Never** instruct: `git reset --hard`, `git push --force`, branch deletion.
- **Branch / commit / push** only when the **user explicitly** asks.

## Implementation constraints

- **`.cursor/rules/*.mdc`**
- Backend routes: **`/check-obs`** expectations before marking implementation done.
- Code changes: **`npm run typecheck`** in **`apps/backend`** and **`apps/frontend`**.

## Final output (PRD F8)

1. **`phases.report.status`:** `completed`; fill **`phases.report.result`**.
2. **`report.md`:** mirror summary + **hook playbooks** + **failed** tasks + **next steps**.
3. Top-level **`status`:** `completed` or `failed`.

## Resume (PRD F7)

1. Open **`.execution/{executionId}/context.json`** (user gives **`executionId`** or path).
2. If **`status`** is **`in_progress`:** continue from **`currentPhase`** / next **`pending`** task with satisfied **`dependsOn`**; **skip** **`completed`** phases/tasks; **keep** **`failed`** visible.
3. Do not recreate the same folder for an in-progress run.
