# Playbook: After New Endpoint

> **Not a Cursor-automated hook.** This file is a **manual playbook** for the agent or developer. Nothing here runs unless you (or the agent) follow it. Cursor `hooks.json` is **not** included in this repository.

## When to run this playbook
After any new NestJS controller method or route handler is created or modified.

## Problem this solves
Developers often add endpoints and forget to wire up metrics, structured logging, or Sentry capture. This playbook reminds the agent to verify all three observability signals are present before considering the work done.

## What to check

Run through this checklist for the newly created endpoint:

### 1. Prometheus metrics
- [ ] A counter is incremented on every request (e.g. `scenario_runs_total` or a new `http_requests_total` label)
- [ ] A histogram records the duration in seconds (e.g. `scenario_duration_seconds`)
- [ ] Metric names follow the convention: `signal_lab_<noun>_<unit>_total` / `_seconds`
- [ ] Labels use only static or controlled enum values (no user-supplied strings as label values)

If any metric is missing, add it now following `observability-conventions.mdc`.

### 2. Structured logging
- [ ] A `logger.log()` / `logger.verbose()` call exists at the **start** of the handler (`info` level)
- [ ] A `logger.log()` call exists on **success** (`info` level) with `durationMs`, `scenarioId` or relevant IDs
- [ ] A `logger.error()` call exists in the `catch` block with the full error context
- [ ] Log lines use JSON fields, not string interpolation: `this.logger.error('msg', { error: err.message, id })`

If logging is missing or uses `console.log`, fix it now following `observability-conventions.mdc`.

### 3. Sentry capture
- [ ] If the endpoint can produce a 5xx error, there is a `Sentry.captureException(err)` in the catch block (or the global filter handles it)
- [ ] If this is an intentional non-error (e.g. `teapot`), confirm Sentry capture is explicitly **skipped**

### 4. DTO validation
- [ ] Request body uses a DTO class decorated with `class-validator` decorators
- [ ] The DTO is referenced in the controller with the `ValidationPipe`

### 5. Rule cross-check
- [ ] Endpoint follows `stack-constraints.mdc` (no forbidden libraries introduced)
- [ ] Error handling follows `error-handling.mdc` (NestJS HTTP exceptions, not raw errors)

## Action
If any item above is unchecked, **fix it before moving on**. Do not mark the task complete until all five sections pass.
