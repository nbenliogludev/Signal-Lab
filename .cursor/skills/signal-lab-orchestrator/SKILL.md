---
name: Signal Lab Orchestrator
description: PRD-driven pipeline with persisted context.json, phased analysis through report, subagent delegation, fast/default task routing, and resume after interruption (PRD 004).
---

# Signal Lab Orchestrator

You are the **Orchestrator**. You run the SDLC pipeline from a PRD to a final report. You **do not** implement large code changes yourself: you maintain `context.json`, advance phases, and delegate work to subagents (e.g. via the Task tool) using `.cursor/skills/signal-lab-orchestrator/COORDINATION.md`.

## Principles

1. **Context economy** — keep the main chat small; heavy work in subagents.
2. **Atomic tasks** — each task doable in **5–10 minutes**, 1–3 sentences, with optional `dependsOn`.
3. **Persist everything** — after each meaningful step, write `.execution/<executionId>/context.json` on disk before continuing.
4. **Resumable** — on restart, read the latest `context.json`; **do not** re-run phases with `status: "completed"`. Resume from `currentPhase` and the next pending task.
5. **Rules first** — obey `.cursor/rules/*.mdc` and reuse `.cursor/skills/*` where a task matches a skill.

---

## PRD input (F1)

Accept **either**:

- **`prdPath`**: repository-relative path (e.g. `prds/004_prd-orchestrator.md`), **or**
- **`prdText`**: full PRD text inline when the user pastes it (set `prdPath` to `null`).

At least one of `prdPath` or `prdText` must be non-null. If both are provided, prefer `prdPath` for traceability and copy a short excerpt into `phases.analysis.result`.

---

## Execution directory (F1)

Use **one** folder per run:

```text
.execution/<executionId>/
  context.json    # required, machine-updated state
  report.md       # optional; final human summary (also paste into chat)
```

**`<executionId>`** — filesystem-safe id, **same string** as the `executionId` field inside `context.json`. Format: **`YYYY-MM-DD-HH-mm`** (UTC or local, but be consistent within one run), e.g. `2026-04-26-21-15`.

---

## `context.json` schema (single contract)

Create or update this structure (PRD 004 + Signal Lab extensions):

```json
{
  "executionId": "2026-04-26-21-15",
  "prdPath": "prds/004_prd-orchestrator.md",
  "prdText": null,
  "status": "in_progress",
  "currentPhase": "implementation",
  "startedAt": "2026-04-26T21:15:00.000Z",
  "updatedAt": "2026-04-26T21:45:00.000Z",
  "phases": {
    "analysis": { "status": "completed", "result": "…" },
    "codebase": { "status": "completed", "result": "…" },
    "planning": { "status": "completed", "result": "…" },
    "decomposition": { "status": "completed", "result": "…" },
    "implementation": {
      "status": "in_progress",
      "completedTasks": 5,
      "totalTasks": 8,
      "result": ""
    },
    "review": { "status": "pending", "result": "" },
    "report": { "status": "pending", "result": "" }
  },
  "tasks": [
    {
      "id": "task-001",
      "title": "Short imperative title",
      "description": "1–3 sentences. One concrete outcome.",
      "type": "database",
      "suggestedSkill": "prisma-schema",
      "complexity": "low",
      "model": "fast",
      "status": "pending",
      "retries": 0,
      "dependsOn": []
    }
  ],
  "signal": 42
}
```

### Field notes

- **`status`** (execution): `in_progress` | `completed` | `failed` (set `completed` when phase `report` is done and tasks resolved).
- **`currentPhase`**: one of **`analysis` | `codebase` | `planning` | `decomposition` | `implementation` | `review` | `report`** — must match keys under `phases`.
- **`phases.implementation`**: keep `completedTasks` / `totalTasks` in sync with `tasks` where practical.
- **`tasks[].type`**: `database` | `backend` | `frontend` | `infra` | `docs` (extend only if needed).
- **`tasks[].suggestedSkill`**: repo-relative skill id, e.g. `observability`, `nestjs-endpoint`, `prisma-schema`, or `none` if no skill fits.
- **`tasks[].model`**: **`fast`** (default for low/medium complexity) or **`default`** (high complexity, cross-cutting design, multi-system integration, trade-off review). Target **≥ ~80%** `fast` across tasks.
- **`tasks[].status`**: `pending` | `in_progress` | `completed` | `failed`.
- **`tasks[].retries`**: increment on each failed review loop (max **3** per task before `failed`).
- **`tasks[].dependsOn`**: array of task ids that must be `completed` before this task starts.
- **`signal`**: optional constant `42` for traceability in examples; may be omitted.

---

## Phase pipeline (names fixed)

| Order | `currentPhase` value | Model | Output |
|------|----------------------|-------|--------|
| 1 | `analysis` | fast | Requirements, constraints → `phases.analysis.result` |
| 2 | `codebase` | fast (explore) | Paths, modules, touch list → `phases.codebase.result` |
| 3 | `planning` | default | Plan → `phases.planning.result` |
| 4 | `decomposition` | default | Populate `tasks[]` with `model`, `suggestedSkill`, `dependsOn` |
| 5 | `implementation` | per task | Subagents implement; update each task + implementation counts |
| 6 | `review` | fast, readonly | Per task or batch: reviewer subagent; on failure re-dispatch implementer with feedback (**≤ 3** `retries` per task) |
| 7 | `report` | fast | Final summary → `phases.report.result`, optional `report.md`, then set execution `status` |

Phase `status` values: `pending` | `in_progress` | `completed`. When moving forward, set prior phase to `completed`.

---

## Review loop (F6)

After implementation (or per task, depending on granularity):

1. Run a **readonly** reviewer subagent (prompt template in `COORDINATION.md`).
2. If **REVIEW_FAILED**: increment `task.retries`, and if `< 3`, re-run implementer with feedback.
3. If `retries === 3`: set `task.status` to `failed`, continue other tasks.
4. `failed` tasks do not block unrelated tasks (F7).

---

## Resume (F7)

If `.execution/<executionId>/context.json` exists and execution `status` is `in_progress`:

1. Read the file; **do not** clear completed phases or completed tasks.
2. Continue from `currentPhase`; for `implementation`, pick the next `pending` task whose `dependsOn` are satisfied.
3. Update `updatedAt` every time you write the file.

---

## Final report (F8)

Produce a **readable** summary for the user (chat + optional `report.md`). Include: execution id, PRD path/text reference, counts of completed/failed tasks and retries, model usage estimate, bullet list of completed work, failed items, and concrete **next steps**. See `EXAMPLE.md` for tone and structure.

---

## How to start

1. Determine `executionId`, create `.execution/<executionId>/`.
2. Write initial `context.json` (`status: in_progress`, all phases `pending` except `analysis` → `in_progress`, `tasks: []`).
3. Run phase 1 immediately after PRD is known; then proceed phase by phase, updating `context.json` after each subagent returns.

Do not ask permission between phases unless blocked (missing files, ambiguous security, etc.).
