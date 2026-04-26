# Orchestrator Examples & Reporting

This document provides examples of how the Orchestrator interacts with the user in the main chat.

## Example 1: Resuming an Interrupted Execution

If the Orchestrator stops or crashes in the middle of a PRD, upon reactivation, it should read `context.json` and output:

```text
Found existing execution context: .execution/2026-04-08-14-30/context.json
Status: in_progress
Current Phase: Implementation

Resuming...
Task 4/8: "Create DTOs for Scenario Submission" (Status: pending).
Dispatching task to backend implementer (fast model)...
```

## Example 2: Final Report Generation (Phase 7)

Once all tasks are either `completed` or `failed`, the Orchestrator must generate a final markdown report for the user. Do not dump the raw JSON. Produce a clean analysis.

**Format:**
```markdown
# Signal Lab PRD Execution — Complete

**Execution ID:** 2026-04-08-14-30
**Target PRD:** prds/002_prd-observability-demo.md
**Duration:** ~25 min (Approximated)

### Execution Summary
- **Tasks:** 12 completed, 1 failed, 2 retries
- **Model Usage:** 10 fast, 3 default

### ✅ Completed Tasks
- ✓ Prisma schema + migration
- ✓ ScenarioService + Controller
- ✓ Prometheus metrics
- ✓ Structured logging
- ✓ Sentry integration
- ✓ Frontend scenario form
- ✓ Run history list
- ✓ Grafana dashboard

### ❌ Failed Tasks
- ✗ Loki log panel (Review repeatedly failed: "Unable to query Loki endpoint locally")

### ⏭️ Next Steps (Manual Intervention Required)
- Check the docker compose network configuration for Loki.
- Run the `@before-commit` hook to prepare the branch for merge.
```
