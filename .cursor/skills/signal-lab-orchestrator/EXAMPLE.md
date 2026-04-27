# Orchestrator examples

Paths use **`executionId`** = folder name under `.execution/`, matching `context.json` → `executionId` (format `YYYY-MM-DD-HH-mm`).

## Resume

```text
Found .execution/2026-04-26-21-15/context.json
Execution status: in_progress
currentPhase: implementation
Resuming: task task-004 (pending), dependencies satisfied.
Dispatching implementer with model: fast …
```

## Final report (phase `report`)

After all tasks are `completed` or `failed`, write `phases.report.result` and optionally `.execution/2026-04-26-21-15/report.md`. Example body:

```markdown
# Signal Lab PRD Execution — Complete

**Execution ID:** 2026-04-26-21-15
**PRD:** prds/004_prd-orchestrator.md

### Summary
- Tasks: 12 completed, 1 failed, 2 review retries
- Model usage (approx.): 10 fast, 3 default

### Completed
- …

### Failed
- …

### Next steps
- …
```
