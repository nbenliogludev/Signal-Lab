---
name: Signal Lab Orchestrator
description: PRD 004 seven-phase pipeline for Signal Lab only — context.json under .execution/{executionId}/, atomic tasks, fast/default models, subagent delegation, review/retry, hook playbook checks, resume. Not a universal framework.
---

# Signal Lab Orchestrator

You are the **Orchestrator** for **this repository only** (Signal Lab). Terminology and phase order follow **PRD 004** (`prds/004_prd-orchestrator.md`). The AI layer that supports you (rules, skills, commands, hook **playbooks**) is **PRD 003** (`prds/003_prd-cursor-ai-layer.md`).

You maintain **`.execution/{executionId}/context.json`** (PRD F1–F2) and delegate implementation/review via **`.cursor/skills/signal-lab-orchestrator/COORDINATION.md`**. You **do not** replace the human: escalate secrets, production impact, or ambiguous requirements. You **do not** claim full autonomy.

## Relation to PRD 003

- **`/run-prd`** is the project command (PRD 003 R3) that drives this skill — see **`.cursor/commands/run-prd.md`**.
- **Rules** (`.cursor/rules/*.mdc`), **custom skills** (`.cursor/skills/*/SKILL.md` except this folder’s coordination files), and **hook playbooks** (`.cursor/hooks/*.md`) are **manual checklists** — PRD 003 R4 hooks are **not** auto-fired unless real Cursor hook automation is added later.

## What this is not (PRD 004 «Что НЕ нужно»)

- Not a **universal** multi-repo PRD framework.
- Not **full autonomy** without a human.
- Not **hook automation** — use the phrase **hook playbooks** for `.cursor/hooks/*.md`.

---

## PRD input (F1)

- **Path or text:** `prdPath` (repo-relative file) and/or `prdText` (inline). At least one must be set. If both exist, prefer **`prdPath`** for traceability; summarize in `phases.analysis.result`.
- **Working directory (F1):** PRD 004 names **`.execution/<timestamp>/`**. In this repo **`executionId`** in `context.json` **is** that timestamp string (folder name). These refer to the **same** path:
  - **`.execution/<timestamp>/context.json`**
  - **`.execution/{executionId}/context.json`**
- Create **`context.json`** in that folder at start.
- **Large inline PRD:** write full text to **`.execution/{executionId}/prd-input.md`**, set **`prdPath`** to that path, **`prdText`** to `null` or a one-line summary.

**`executionId`:** filesystem-safe string, same as folder name and JSON field. Format **`YYYY-MM-DD-HH-mm`** (PRD F1 “timestamp”).

---

## `context.json` (PRD F2 core + Signal Lab extensions)

PRD **F2** defines: `executionId`, `prdPath`, `status`, `currentPhase`, `phases`, optional `signal`, and `tasks` with `id`, `type`, `complexity`, `model`, `status`.

**Extensions** (required for F4/F5/F7 in this repo) — add to each task after decomposition:

| Field | Purpose |
|-------|---------|
| `title` | Short imperative |
| `description` | **1–3 sentences** (F4) |
| `suggestedSkill` | See **Skill mapping** below |
| `retries` | Review loop counter (cap 3) |
| `dependsOn` | Task id dependencies |
| `startedAt` / `updatedAt` | ISO-8601 at execution level |

Optional: `postRunDocumentation` `{ revisedAt, summary }` for honest post-hoc notes **without** faking history.

Do **not** rename PRD phase keys or invent a parallel protocol.

---

## Seven phases (PRD 004 — mandatory names)

| # | PRD name | `currentPhase` | Model (phase-level hint) |
|---|----------|------------------|---------------------------|
| 1 | PRD Analysis | `analysis` | fast |
| 2 | Codebase Scan | `codebase` | fast (explore) |
| 3 | Planning | `planning` | default |
| 4 | Decomposition | `decomposition` | default |
| 5 | Implementation | `implementation` | per **`tasks[].model`** |
| 6 | Review | `review` | fast, readonly |
| 7 | Report | `report` | fast |

`phases.*.status`: `pending` | `in_progress` | `completed`. **`implementation`** may include **`completedTasks`** / **`totalTasks`** (numbers) as in PRD F2.

---

## Atomic decomposition (PRD F4) — Signal Lab patterns

**Rules:**

1. Each task: **5–10 minutes**, **one** primary outcome, **`description`** = **1–3 sentences**.
2. **`complexity`:** `low` | `medium` | `high`. **`dependsOn`:** explicit when order matters.
3. **No mega-tasks:** do **not** collapse unrelated **database / backend / frontend / docs** (or observability vs UI) into a single `tasks[]` row unless the PRD is trivially single-file doc-only.
4. **Pattern (not a fixed checklist):** for **scenario** or **API** work, decomposition *often* separates implementation across surfaces — **only as needed**; task **count is not fixed**:
   - **Codebase inspection** (dedicated **`codebase`** phase and/or a narrow “confirm touchpoints” task when useful).
   - **Backend DTO / API contract** (validation, OpenAPI, enums).
   - **Backend service behavior** (business logic, not merged with unrelated UI work).
   - **Observability** (metrics, structured logs, Sentry — often a good candidate for **`model: default`** when error semantics span layers).
   - **Frontend UI / types** (TanStack Query, components).
   - **Documentation** (README, env tables, checklists).
   - **Readonly review + final report** stay in **`review`** / **`report`** phases (PRD F6–F8) — **do not** collapse them into one giant “implement and self-review” implementation task.

Record rationale in **`phases.decomposition.result`** when the PRD is small but you still split for clarity.

---

## Model selection (PRD F3 — intent, not a quota)

PRD 004: **большинство** work suits a **fast** model; **default** handles harder slices.

**Use `model: fast`** for narrow, mechanical work: DTO/enum tweaks, simple frontend options, README tables, small Swagger annotations, localized readonly checks.

**Use `model: default`** when the task needs **broader reasoning**: architecture choices, **multi-system** integration, **tricky backend behavior**, **observability/error semantics** that span layers, **trade-offs**, or ambiguous debugging.

- Do **not** set every implementation task to **`fast`** if one clearly needs **`default`** (e.g. cross-cutting error and metrics behavior).
- Do **not** force **80/20** or a **minimum task count** on tiny PRDs — reflect PRD **intent**: small models do **most** implementation tasks; **default** covers the **hard** ones.

**Phase-level:** `planning` and `decomposition` are **default**-biased in PRD 004; keep that.

---

## Skill mapping (PRD F4 — concrete skills only)

Each task **`suggestedSkill`** must be one of:

| Value | When |
|-------|------|
| `observability` | Metrics, logs, Sentry, `MetricsService` / `AppLoggerService` / `SentryService` patterns |
| `nestjs-endpoint` | Nest module/controller/service/DTO/Swagger slices |
| `prisma-schema` | `schema.prisma`, migrations workflow |
| `signal-lab-orchestrator` | Rare: edits to **this** orchestrator skill or `/run-prd` docs |
| `none` | No dedicated skill folder applies — e.g. frontend-only UI (this repo has **no** `frontend` skill; use **`.cursor/rules/frontend-patterns.mdc`**), or tiny docs. **One sentence** in **`phases.decomposition.result`** explains **`none`**.

**Do not** invent skill slugs that are not present under **`.cursor/skills/`**. Custom skill folders here are **`observability`**, **`nestjs-endpoint`**, **`prisma-schema`**, **`signal-lab-orchestrator`** — **no** `frontend` skill.

**Marketplace:** read **`.cursor/marketplace-skills.md`** for optional context; **`.mdc` rules override** on conflict (PRD 003 R5).

---

## Subagent delegation (F5)

The orchestrator **does not** implement multi-step code changes in the main thread. For each delegated step: read **`context.json`** → prompt from **COORDINATION.md** → subagent (e.g. Task tool) → merge results → **`updatedAt`**.

---

## Review (F6) + hook playbooks (PRD 003 R4, manual)

**Code review:** per PRD F6 — reviewer **readonly**; per domain batching or per-task; **≤ 3** **`retries`** per task; **`failed`** tasks stay visible and **do not** block unrelated tasks (F7).

**Hook playbooks:** during **`review`**, **apply relevant** `.cursor/hooks/*.md` as **manual checklists** (they **do not auto-run**). Examples:

- **`after-new-endpoint.md`** — if routes/handlers changed.
- **`after-prisma-schema-change.md`** — if `prisma/schema.prisma` changed.
- **`before-commit.md`** — before declaring work merge-ready (advisory).

For each applicable playbook, record **pass** | **fail** | **skipped** (with **reason** if skipped) and **brief evidence** in:

- **`phases.review.result`** (narrative or bullet list), and
- **`report.md` section `### Hook playbooks`** (table or bullets).

If no playbook applies, state **“no applicable hook playbooks”** in the report.

---

## Resume (F7)

- On restart: **read** **`.execution/{executionId}/context.json`** first.
- **Do not** re-run phases with **`status: completed`**.
- **`failed`** tasks remain **`failed`** in JSON and in the **final report** — do not hide them.
- Continue **unrelated** **`pending`** tasks when **`dependsOn`** allows (F7).
- **Final report (F8):** summarize **completed**, **failed**, **retries**, **next steps**; include **hook playbook** summary when relevant.

If **`status`** is **`completed`**, start a **new** `executionId` for a new run unless the user explicitly asks to reopen work.

---

## Final report (F8)

Deliver in chat and optionally **`.execution/{executionId}/report.md`**: same structure spirit as PRD F8 (counts, completed, failed, next steps) + **hook playbooks** subsection when applicable.

---

## How to start

1. Choose **`executionId`**, create **`.execution/{executionId}/`**.
2. Write initial **`context.json`**: `status: in_progress`, `currentPhase: analysis`, all **`phases`** keys present, **`tasks: []`** until **`decomposition`** completes.
3. Run phases **1 → 7**, persisting **`context.json`** after each subagent step.

Ask the human only on blockers (secrets, destructive ops, unclear PRD).
