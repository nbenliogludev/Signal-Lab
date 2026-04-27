---
name: nestjs-endpoint
description: Scaffold a NestJS feature slice (module, controller, service, DTOs) using ObservabilityModule + Prisma, matching the existing Scenarios pattern in this repository.
---

# NestJS Endpoint Skill

## When to Use

- Adding a new REST area under `apps/backend/src/<feature>/`.
- Extending the API with new DTOs, routes, and Prisma persistence.
- You need a checklist aligned with **MetricsService**, **AppLoggerService**, and **SentryService** (not ad-hoc `prom-client` in each service).

## Canonical reference

Treat **`apps/backend/src/scenarios/`** as the reference: `scenarios.module.ts` imports **`ObservabilityModule`**, `scenarios.service.ts` injects the three observability services and calls **`this.metrics.recordScenarioRun`**, **`this.logger.info|warn|error`**, **`this.sentry.*`**, and persists via **`PrismaService`**.

---

## Step 1 — Layout

```text
apps/backend/src/<feature>/
├── dto/
│   └── …
├── <feature>.controller.ts
├── <feature>.service.ts
└── <feature>.module.ts
```

---

## Step 2 — Module

```typescript
import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../observability/observability.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [ObservabilityModule, PrismaModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

Register `FeatureModule` in `app.module.ts` `imports` when the slice is new.

---

## Step 3 — Service constructor pattern

```typescript
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../observability/app-logger.service';
import { MetricsService } from '../observability/metrics.service';
import { SentryService } from '../observability/sentry.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly metrics: MetricsService,
    private readonly sentry: SentryService,
  ) {}
}
```

Implement handlers with: Prisma writes → structured logs → `recordScenarioRun` (or new metrics methods if you extend `MetricsService`) → Sentry only where appropriate.

---

## Step 4 — Controller

- Use Nest route decorators and `ValidationPipe` with `whitelist: true` (and `forbidNonWhitelisted: true` when validating bodies).
- Return DTOs / mapped objects, not raw Prisma entities, if the API contract should stay stable.

---

## Step 5 — DTOs

- `class-validator` (+ `class-transformer` if needed) on inputs.
- Controlled enums for free-text-like fields that become metric labels or log facets.

---

## Endpoint checklist

- [ ] `ObservabilityModule` imported in the feature module
- [ ] `AppLoggerService` / `MetricsService` / `SentryService` injected where behavior runs
- [ ] Success and error paths call `recordScenarioRun` (or dedicated metrics API) with consistent `type` / `status` strings
- [ ] Logs use `logger.info|warn|error(message, 'ContextName', { …fields })`
- [ ] Sentry: `captureException` for unexpected failures; breadcrumbs optional for diagnostic trails
- [ ] Prisma access only through `PrismaService` (no raw SQL unless an approved exception exists in rules)
- [ ] Module registered in `AppModule`
- [ ] Apply **`.cursor/skills/observability/SKILL.md`** for any new metric names or Sentry policy questions

## References

- `.cursor/skills/observability/SKILL.md`
- `.cursor/rules/stack-constraints.mdc`
- `.cursor/rules/error-handling.mdc`
- `.cursor/rules/prisma-patterns.mdc`
- `.cursor/hooks/after-new-endpoint.md`
