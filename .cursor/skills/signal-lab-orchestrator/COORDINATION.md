# Orchestrator Subagent Coordination

When the Orchestrator (Phase 5 or Phase 6) needs to execute a task, it MUST NOT do the work itself. Instead, it must generate a targeted prompt based on these templates to dispatch a Subagent.

## 1. Implementer Subagent Prompt Template
Use this template to dispatch tasks categorized as `database`, `backend`, or `frontend`.

**Target Model:** 
- `Fast Model` if task complexity is `low` or `medium`.
- `Default Model` if task complexity is `high`.

```text
# TASK: [Task Title]
# CONTEXT
You are an execution subagent working under the Signal Lab Orchestrator. 
Your goal is to complete exactly ONE atomic task and return an execution summary. Do not over-engineer.

# REQUIRED RULES
You must strictly adhere to the following rules:
[List relevant rules from .cursor/rules/, e.g., @stack-constraints.mdc, @prisma-patterns.mdc]

# IMPLEMENTATION DIRECTIVE
[Specific task instructions, e.g., "Add the 'ScenarioRun' model to schema.prisma with cuid(), status, and createdAt. Do not generate the client yet."]

# DONE DEFINITION
Stop working when:
1. The requested code changes are made.
2. You have NOT broken any existing functionality.
Respond with: "IMPLEMENTATION_COMPLETE. [Brief summary of actions]"
```

## 2. Reviewer Subagent Prompt Template
Use this template for Phase 6. Reviewers MUST be read-only (do not edit actual code).

**Target Model:** `Fast Model`

```text
# TASK REVIEW: [Task Title]
# CONTEXT
You are a Quality Assurance reviewer subagent. 
Your goal is to review the code just implemented for the task above.
DO NOT write or execute any code fixes yourself.

# CHECKLIST
1. Does the code adhere to the stack constraints? (@stack-constraints.mdc)
2. If backend: are observability signals present? (@observability-conventions.mdc)
3. If frontend: is it using TanStack Query & shadcn correctly? (@frontend-patterns.mdc)
4. Are there any obvious bugs or exposed secrets?

# DONE DEFINITION
Respond in exactly ONE of the following formats:
If passed: 
"REVIEW_PASSED."

If failed:
"REVIEW_FAILED. 
1. [Reason 1]
2. [Reason 2]"
```

## 3. Retries and Feedback Loop
If the Reviewer Subagent responds with `REVIEW_FAILED`:
1. The Orchestrator increments the task's `retries` count in `context.json`.
2. If `retries < 3`: The Orchestrator re-dispatches the Implementer Subagent, appending the Reviewer's feedback to the prompt.
3. If `retries === 3`: The Orchestrator marks the task as `failed` in `context.json` and proceeds to the next pending task.
