---
name: observability
description: Add Prometheus metrics, structured JSON logs (Loki/Promtail), and Sentry capture using the shared NestJS observability services. Use when creating or changing backend request paths or domain services.
---

# Observability Skill

## When to Use

- You added or changed a NestJS service method that handles HTTP-driven or domain work.
- You need metrics and logs to match existing Prometheus / Loki dashboards.
- You must wire Sentry for real failures without spamming it on expected client errors.

## Canonical implementation (this repo)

The backend uses **one registry** inside `MetricsService`, **`AppLoggerService`** for JSON lines (file + console), and **`SentryService`** (wraps `@sentry/node`, respects `SENTRY_DSN`). Feature modules import **`ObservabilityModule`** and inject the three services — see `apps/backend/src/scenarios/scenarios.service.ts` and `apps/backend/src/observability/`.

Do **not** introduce a second Prometheus integration style (for example per-route `makeCounterProvider` in every module) unless you are deliberately refactoring the whole stack.

---

## Step 1 — Module wiring

In your feature `*.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule /* , PrismaModule, … */],
  // controllers / providers
})
export class YourFeatureModule {}
```

---

## Step 2 — Inject services in the service class

```typescript
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../observability/app-logger.service';
import { MetricsService } from '../observability/metrics.service';
import { SentryService } from '../observability/sentry.service';

@Injectable()
export class YourService {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly metrics: MetricsService,
    private readonly sentry: SentryService,
  ) {}
}
```

---

## Step 3 — Metrics (`MetricsService`)

Counters and histograms are **already registered** on `MetricsService` (`scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total`). For scenario-style flows, record after persistence / outcome is known:

```typescript
this.metrics.recordScenarioRun(dto.type, 'completed', durationMs);
// error-style outcomes use status values your convention allows, e.g.:
this.metrics.recordScenarioRun(dto.type, 'error', durationMs);
```

`recordScenarioRun` increments the counter with labels `{ type, status }` and observes duration with `{ type }`. Extend `MetricsService` **only** when you add new metric names that must appear in Prometheus; keep naming aligned with `.cursor/rules/observability-conventions.mdc`.

---

## Step 4 — Structured logs (`AppLoggerService`)

Signature: `info | warn | error(message, context, fields?)`.

- **`context`**: class or subsystem name (e.g. `'ScenariosService'`).
- **`fields`**: flat JSON-serializable object; include domain keys such as `scenarioId`, `scenarioType`, `duration`, `error` (string message, not raw `Error` objects).

```typescript
this.logger.info('Scenario completed', 'ScenariosService', {
  scenarioId: run.id,
  scenarioType: dto.type,
  duration,
});
```

Avoid `console.log` in services; Promtail tails the structured log file configured by `LOG_FILE_PATH`.

---

## Step 5 — Sentry (`SentryService`)

- **`captureException`**: unhandled / 5xx-class failures you want in Sentry. `SentryService` no-ops when DSN is missing or still the placeholder from `.env.example`.
- **`addBreadcrumb`**: notable non-fatal events (e.g. validation path) without capturing an exception.

```typescript
this.sentry.captureException(err, {
  tags: { scenarioType: dto.type },
  extra: { scenarioId: run.id, duration },
});
```

---

## Verification checklist

```bash
docker compose up -d
curl -s -X POST http://localhost:3001/api/scenarios/run \
  -H 'Content-Type: application/json' \
  -d '{"type":"success","name":"obs-skill-test"}'
curl -s http://localhost:3001/metrics | grep scenario_runs_total
```

In Grafana → Explore → Loki: `{app="signal-lab"}`.

---

## References

- `.cursor/rules/observability-conventions.mdc`
- `.cursor/rules/error-handling.mdc`
- `.cursor/hooks/after-new-endpoint.md` — playbook after adding routes
