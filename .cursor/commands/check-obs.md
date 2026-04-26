# /check-obs

Verify that observability is correctly wired for a given service, controller, or endpoint.

## Usage

```
/check-obs [file or endpoint path]
```

**Example:** `/check-obs apps/backend/src/scenarios/scenarios.service.ts`

## What to check

### Metrics — `MetricsService` (`apps/backend/src/observability/metrics.service.ts`)

- [ ] `MetricsService` is injected in the service constructor
- [ ] `this.metrics.recordScenarioRun(type, status, duration)` is called on every success path
- [ ] `this.metrics.recordScenarioRun(type, 'error', duration)` is called on every error path
- [ ] Metric names are `snake_case` and end with `_total` (counters) or `_seconds` (histograms)
- [ ] No raw `prometheus-client` usage outside `MetricsService`

### Logging — `AppLoggerService` (`apps/backend/src/observability/app-logger.service.ts`)

- [ ] `AppLoggerService` is injected in the service constructor
- [ ] Success paths call `this.logger.info(...)`
- [ ] Slow / degraded paths call `this.logger.warn(...)`
- [ ] Error paths call `this.logger.error(...)`
- [ ] Every log call includes: `scenarioId` (or domain entity id), `scenarioType` (or domain type), `duration`
- [ ] No `console.log` / `console.error` used instead of the logger

### Sentry — `SentryService` (`apps/backend/src/observability/sentry.service.ts`)

- [ ] `SentryService` is injected in the service constructor
- [ ] `this.sentry.captureException(error, { tags, extra })` is called on all 5xx / unhandled paths
- [ ] `this.sentry.addBreadcrumb(...)` is called on notable non-fatal events (e.g. `validation_error`)
- [ ] `SENTRY_DSN` is read from `process.env.SENTRY_DSN` — not hardcoded anywhere

### Global exception filter

- [ ] No custom `try/catch` that swallows errors without re-throwing or logging — rely on `GlobalExceptionFilter`

## Verification steps

```bash
# 1. Start the stack
docker compose up -d

# 2. Trigger the endpoint
curl -s -X POST http://localhost:3001/api/scenarios/run \
  -H 'Content-Type: application/json' \
  -d '{"type":"success"}'

# 3. Check Prometheus metrics
curl -s http://localhost:3001/metrics | grep scenario_runs_total

# 4. Check Loki logs in Grafana
#    Grafana → Explore → Loki → query: {app="signal-lab"}

# 5. For error scenarios: check Sentry dashboard for captured exceptions
```

Report any missing items with file path and line number.
