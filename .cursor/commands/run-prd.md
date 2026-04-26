# /run-prd

Execute a PRD through the Signal Lab orchestrator protocol.

## Usage

```
/run-prd <path-to-prd>
```

**Example:** `/run-prd prds/004_prd-orchestrator.md`

## What to do

### 0. Pre-flight

1. Read `.cursor/skills/signal-lab-orchestrator/SKILL.md` for the full orchestrator protocol and phase definitions.
2. Read `.cursor/rules/stack-constraints.md` to know what libraries are allowed.
3. Check the current branch: confirm you are **not** on `main` before making any changes.

### 1. Load and analyse the PRD

Read the PRD from the specified path. Extract:

- Goal and acceptance criteria
- List of functional requirements (F-numbers)
- Any explicit file/API contracts mentioned

### 2. Create execution directory

```
.execution/<YYYY-MM-DDTHH-MM-SS>/
```

Create `context.json` with:

```json
{
  "prd": "<path>",
  "startedAt": "<ISO timestamp>",
  "currentPhase": 1,
  "phases": {}
}
```

### 3. Run the 7 phases

| Phase | Name | Model hint | Output |
|-------|------|-----------|--------|
| 1 | PRD Analysis | fast | Requirements list, open questions |
| 2 | Codebase Scan | fast | Affected files and modules |
| 3 | Planning | default | Architecture decisions, file plan |
| 4 | Decomposition | default | Ordered task list with dependencies |
| 5 | Implementation | fast 80% / default 20% | Working code committed to branch |
| 6 | Review | fast, read-only | Checklist: observability, types, tests |
| 7 | Report | fast | Summary of what was built, what is left |

After each phase, update `context.json`:

```json
{
  "phases": {
    "1": { "completedAt": "...", "output": "..." }
  },
  "currentPhase": 2
}
```

### 4. Implementation constraints (Phase 5)

- Create a new branch `feature/prd-00N-<slug>` from `main`, never commit directly to `main`.
- Follow all rules in `.cursor/rules/`.
- Every new endpoint must pass `/check-obs` before the phase is marked done.
- Run `npm run typecheck` in both `apps/backend` and `apps/frontend` before finalising.

### 5. Output final report

After Phase 7 write `.execution/<timestamp>/report.md` containing:

- Acceptance criteria status (✅ / ❌ per item)
- Files created / modified
- Manual verification steps for the interviewer
- Any remaining gaps or known issues

## Resume

If `.execution/<timestamp>/context.json` already exists for this PRD and `currentPhase` > 1, resume from `currentPhase`. Completed phases (present in `phases` map) are skipped automatically.
