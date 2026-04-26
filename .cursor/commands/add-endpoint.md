# /add-endpoint

Scaffold a new NestJS endpoint with full observability wiring.

## Usage

```
/add-endpoint <domain> <method> <path> <description>
```

**Example:** `/add-endpoint alerts GET /api/alerts/recent List the 20 most recent alert records`

## What to do

### 1. Read context first

- Read `.cursor/skills/nestjs-endpoint/SKILL.md` — full scaffold template and code snippets.
- Read `.cursor/rules/observability-conventions.md` — metric naming rules and log field requirements.
- Read `.cursor/rules/stack-constraints.md` — allowed libraries and forbidden alternatives.

### 2. Create files

Follow the exact structure of `apps/backend/src/scenarios/` as the canonical example.

| File | Action |
|------|--------|
| `apps/backend/src/<domain>/dto/create-<domain>.dto.ts` | Create with `class-validator` decorators + Swagger `@ApiProperty` |
| `apps/backend/src/<domain>/dto/<domain>-response.dto.ts` | Create with static `fromPrisma()` factory method |
| `apps/backend/src/<domain>/<domain>.service.ts` | Create or add method to existing |
| `apps/backend/src/<domain>/<domain>.controller.ts` | Create or add method to existing |
| `apps/backend/src/<domain>/<domain>.module.ts` | Create if new domain |

### 3. Register the module (new domain only)

Add to `apps/backend/src/app.module.ts`:

```typescript
imports: [ObservabilityModule, PrismaModule, ScenariosModule, <DomainModule>],
```

### 4. Add observability — mandatory for every endpoint

Inject these three services in the new service constructor (see `ScenariosService` for the pattern):

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly logger: AppLoggerService,
  private readonly metrics: MetricsService,
  private readonly sentry: SentryService,
) {}
```

**Metrics** — call after every meaningful operation:

```typescript
// success path
this.metrics.recordScenarioRun(type, 'completed', duration);

// error path
this.metrics.recordScenarioRun(type, 'error', duration);
```

**Logging** — structured JSON, mandatory fields: `scenarioId`, `scenarioType`, `duration`:

```typescript
this.logger.info('Operation completed', 'DomainService', { id, type, duration });
this.logger.warn('Slow operation', 'DomainService', { id, type, duration });
this.logger.error('Operation failed', 'DomainService', { id, type, duration, error });
```

**Sentry** — only for 5xx / unhandled paths:

```typescript
this.sentry.captureException(error, { tags: { domain: '<domain>' }, extra: { id, duration } });
```

### 5. Verify

```bash
docker compose up -d
curl -s -X <METHOD> http://localhost:3001/<path> -H 'Content-Type: application/json' -d '{...}'
curl -s http://localhost:3001/metrics | grep scenario_runs_total
```

`scenario_runs_total` counter must appear with the correct `type` label.
