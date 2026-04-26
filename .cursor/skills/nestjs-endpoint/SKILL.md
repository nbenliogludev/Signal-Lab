---
name: nestjs-endpoint
description: Scaffold a complete, production-ready NestJS endpoint from scratch — controller, service method, DTO, Prisma persistence, and full observability wiring. Use this skill when adding any new API route to the backend.
---

# NestJS Endpoint Skill

## When to Use

- Adding a new REST endpoint to the NestJS backend.
- Need to scaffold a controller + service + DTO from scratch.
- Want a checklist to ensure nothing is missed (validation, metrics, logs, Sentry).

## What This Skill Produces

A complete feature slice:
```
apps/backend/src/<feature>/
├── <feature>.controller.ts   — route handler, validation pipe
├── <feature>.service.ts      — business logic, Prisma, metrics, logs
├── dto/
│   ├── create-<feature>.dto.ts
│   └── <feature>-response.dto.ts
└── <feature>.module.ts       — wires everything, registers metrics
```

---

## Step 1 — Create the DTO

```typescript
// dto/create-scenario.dto.ts
import { IsEnum, IsString, MinLength, MaxLength } from 'class-validator';

export enum ScenarioType {
  SUCCESS = 'success',
  ERROR = 'error',
  TEAPOT = 'teapot',
  SYSTEM_ERROR = 'system_error',
}

export class CreateScenarioDto {
  @IsEnum(ScenarioType)
  type: ScenarioType;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
```

**Rules:**
- Every field decorated with `class-validator`.
- Use `@IsEnum()` for controlled string sets — never `@IsString()` on an enum field.
- Export a `ResponseDto` separately — never expose Prisma models directly.

```typescript
// dto/scenario-response.dto.ts
export class ScenarioResponseDto {
  id: string;
  type: string;
  name: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
}
```

---

## Step 2 — Create the Controller

```typescript
// <feature>.controller.ts
import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ScenarioResponseDto } from './dto/scenario-response.dto';

@Controller('api/scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post('run')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async runScenario(@Body() dto: CreateScenarioDto): Promise<ScenarioResponseDto> {
    return this.scenariosService.runScenario(dto);
  }

  @Get()
  async getScenarios(): Promise<ScenarioResponseDto[]> {
    return this.scenariosService.getScenarios();
  }

  @Get(':id')
  async getScenario(@Param('id') id: string): Promise<ScenarioResponseDto> {
    return this.scenariosService.getScenario(id);
  }
}
```

**Rules:**
- Always use `ValidationPipe` with `whitelist: true`.
- Return DTOs, never raw Prisma objects.
- Use `@Param()`, `@Query()`, `@Body()` — never `@Req()` directly.

---

## Step 3 — Create the Service

Apply the **observability skill** as you write the service. Minimum template:

```typescript
// <feature>.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectMetric('scenario_runs_total') private readonly counter: Counter<string>,
    @InjectMetric('scenario_duration_seconds') private readonly histogram: Histogram<string>,
  ) {}

  async runScenario(dto: CreateScenarioDto): Promise<ScenarioResponseDto> {
    const timer = this.histogram.startTimer({ scenario_type: dto.type });
    this.logger.log('Scenario started', { scenarioType: dto.type });

    try {
      const run = await this.prisma.scenarioRun.create({ data: { ...dto, status: 'running' } });
      // ... business logic ...
      this.counter.inc({ scenario_type: dto.type, status: 'completed' });
      timer();
      return this.toDto(run);
    } catch (err) {
      this.counter.inc({ scenario_type: dto.type, status: 'failed' });
      timer();
      this.logger.error('Scenario failed', { error: err.message, scenarioType: dto.type });
      throw err;
    }
  }

  async getScenarios(): Promise<ScenarioResponseDto[]> {
    const runs = await this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return runs.map(this.toDto);
  }

  private toDto(run: ScenarioRun): ScenarioResponseDto {
    return {
      id: run.id,
      type: run.type,
      name: run.name,
      status: run.status,
      createdAt: run.createdAt,
      completedAt: run.completedAt,
    };
  }
}
```

---

## Step 4 — Wire the Module

```typescript
// <feature>.module.ts
import { Module } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScenariosController],
  providers: [
    ScenariosService,
    makeCounterProvider({
      name: 'scenario_runs_total',
      help: 'Total scenario run attempts',
      labelNames: ['scenario_type', 'status'],
    }),
    makeHistogramProvider({
      name: 'scenario_duration_seconds',
      help: 'Scenario run duration in seconds',
      labelNames: ['scenario_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),
  ],
})
export class ScenariosModule {}
```

---

## Endpoint Creation Checklist

- [ ] DTO with `class-validator` decorators
- [ ] `ValidationPipe` on controller with `whitelist: true`
- [ ] Response DTO (no raw Prisma models returned)
- [ ] Prometheus counter + histogram registered in module
- [ ] Logger at start, success, and error in service
- [ ] Sentry capture for unhandled exceptions (see observability skill)
- [ ] Module imported in `AppModule`
- [ ] TypeScript compiles: `npx tsc --noEmit`

## References
- `.cursor/skills/observability/SKILL.md` — full observability wiring
- `.cursor/rules/stack-constraints.md` — allowed libraries
- `.cursor/rules/error-handling.md` — NestJS exception patterns
- `.cursor/rules/prisma-patterns.md` — Prisma usage
- `.cursor/hooks/after-new-endpoint.md` — post-creation checklist
