# /run-prd

Run a PRD through the **Signal Lab orchestrator** (PRD 004). The **only** execution contract is defined in `.cursor/skills/signal-lab-orchestrator/SKILL.md` — this command is a thin runner for the same agent behavior.

## Usage

```text
/run-prd <path-to-prd-file>
```

or paste PRD text in the same message and invoke `/run-prd` without a path (the agent must set `prdText` in `context.json` and `prdPath: null`).

**Example:** `/run-prd prds/004_prd-orchestrator.md`

## Pre-flight

1. Read `.cursor/skills/signal-lab-orchestrator/SKILL.md` (phases, `context.json`, resume).
2. Read `.cursor/skills/signal-lab-orchestrator/COORDINATION.md` (subagent templates).
3. Read `.cursor/rules/stack-constraints.mdc` for allowed libraries.

## Execution directory

Create:

```text
.execution/<executionId>/
  context.json
```

- **`<executionId>`**: `YYYY-MM-DD-HH-mm` (same value as JSON field `executionId`).
- Initial `context.json` must match the schema in the orchestrator skill (including `executionId`, `prdPath` and/or `prdText`, `phases`, `tasks`, per-task `model`, `suggestedSkill`, `retries`, `dependsOn`).

## Phases (names are fixed)

| Phase key (`currentPhase`) | PRD 004 name        | Model hint   |
|----------------------------|-------------------|--------------|
| `analysis`                 | PRD analysis      | fast         |
| `codebase`                 | Codebase scan     | fast         |
| `planning`                 | Planning          | default      |
| `decomposition`          | Decomposition     | default      |
| `implementation`         | Implementation    | per-task     |
| `review`                 | Review              | fast, readonly |
| `report`                 | Report              | fast         |

After each phase completes, persist updates to `context.json` (`updatedAt`, phase `status` / `result`, `currentPhase`).

## Implementation constraints

- Prefer a feature branch (e.g. `feature/prd-…`) instead of committing directly to `main` when the user expects git history.
- Follow all `.cursor/rules/*.mdc` files.
- For backend routes, use `/check-obs` expectations before marking implementation done.
- Run `npm run typecheck` (or project-equivalent) in `apps/backend` and `apps/frontend` before declaring the run complete when code changed.

## Final output

1. Set `phases.report.status` to `completed` and fill `phases.report.result`.
2. Optionally write `.execution/<executionId>/report.md` with the same content as the user-facing summary.
3. Set top-level `status` to `completed` (or `failed` if the PRD could not be finished).

## Resume

If `.execution/<executionId>/context.json` already exists for this run and `status` is `in_progress`, **read it** and continue from `currentPhase` and the next eligible task. **Skip** phases (and tasks) already marked `completed`. Do not recreate the directory for the same `executionId`.
