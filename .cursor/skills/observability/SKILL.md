---
name: observability
description: Add Prometheus metrics, structured logging, and Sentry error capture to a NestJS endpoint or service. Use this skill whenever creating or modifying backend code that handles requests, runs scenarios, or calls external services.
---

# Observability Skill

## When to Use

- You just created a new NestJS controller method or service function.
- An existing endpoint is missing metrics or logs.
- You need to wire up Sentry for a new error scenario.
- You are reviewing a PR and checking observability coverage.

## What This Skill Produces

1. A Prometheus **counter** + **histogram** registered for the endpoint.
2. Structured **JSON log** lines at start, success, and failure.
3. **Sentry capture** on unhandled exceptions.

---

## Step 1 — Register Prometheus Metrics

Add metrics in the NestJS **module provider**, not inline in the service.

```typescript
// apps/backend/src/scenarios/scenarios.module.ts
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  providers: [
    makeCounterProvider({
      name: 'scenario_runs_total',
      help: 'Total number of scenario run attempts',
      labelNames: ['scenario_type', 'status'],
    }),
    makeHistogramProvider({
      name: 'scenario_duration_seconds',
      help: 'Duration of scenario runs in seconds',
      labelNames: ['scenario_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),
    ScenariosService,
  ],
})
export class ScenariosModule {}
```

### Naming Rules
| Pattern | Example |
|---------|---------|
| `signal_lab_<noun>_total` | `scenario_runs_total` |
| `signal_lab_<noun>_seconds` | `scenario_duration_seconds` |
| `signal_lab_<noun>_active` | `scenario_active_count` |

**Never** use user-supplied strings as label values — always use controlled enums.

---

## Step 2 — Inject and Use in Service

```typescript
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    @InjectMetric('scenario_runs_total') private readonly runsCounter: Counter<string>,
    @InjectMetric('scenario_duration_seconds') private readonly durationHistogram: Histogram<string>,
    private readonly prisma: PrismaService,
  ) {}

  async runScenario(dto: RunScenarioDto): Promise<ScenarioRun> {
    const timer = this.durationHistogram.startTimer({ scenario_type: dto.type });

    // ✅ Log at start
    this.logger.log('Scenario run started', { scenarioType: dto.type, name: dto.name });

    try {
      const result = await this.executeScenario(dto);

      // ✅ Increment counter on success
      this.runsCounter.inc({ scenario_type: dto.type, status: 'completed' });
      timer();  // records duration

      // ✅ Log on success
      this.logger.log('Scenario run completed', {
        scenarioType: dto.type,
        scenarioId: result.id,
        durationMs: Date.now() - startTime,
      });

      return result;
    } catch (err) {
      // ✅ Increment counter on failure
      this.runsCounter.inc({ scenario_type: dto.type, status: 'failed' });
      timer();

      // ✅ Log at error level with context
      this.logger.error('Scenario run failed', {
        scenarioType: dto.type,
        error: err.message,
      });

      // ✅ Send to Sentry for 5xx-class errors
      Sentry.withScope((scope) => {
        scope.setTag('scenario_type', dto.type);
        scope.captureException(err);
      });

      throw new InternalServerErrorException('Scenario execution failed');
    }
  }
}
```

---

## Step 3 — Structured Log Fields Reference

Always include these fields in log objects:

| Field | Type | When |
|-------|------|------|
| `scenarioType` | string | All scenario logs |
| `scenarioId` | string | After DB write (have the ID) |
| `durationMs` | number | On completion |
| `error` | string | On failure (`err.message`) |
| `context` | auto | Set by `new Logger(ClassName.name)` |

**Never** log:
- Full stack traces to Loki (use Sentry for that)
- Sensitive data (passwords, tokens, PII)
- Raw error objects — use `err.message`

---

## Step 4 — Sentry Rules

| Scenario type | Send to Sentry? |
|---------------|----------------|
| `success` | No |
| `error` | No (expected business error) |
| `teapot` | No (intentional 418) |
| `system_error` | **Yes** |
| Unhandled exception | **Yes** |

---

## Verification Checklist

After applying this skill, verify:

```bash
# 1. Metrics endpoint exposes the counter
curl -s http://localhost:3001/metrics | grep scenario_runs_total

# 2. Run a scenario
curl -s -X POST http://localhost:3001/api/scenarios/run \
  -H 'Content-Type: application/json' \
  -d '{"type":"success","name":"obs-skill-test"}'

# 3. Counter incremented
curl -s http://localhost:3001/metrics | grep scenario_runs_total

# 4. Check Loki (Grafana → Explore → {app="signal-lab"})
# Should see structured JSON log with scenarioType field
```

## References
- `.cursor/rules/observability-conventions.md` — naming rules and log format
- `.cursor/rules/error-handling.md` — when to throw vs log vs Sentry
- `.cursor/hooks/after-new-endpoint.md` — checklist after creating endpoint
