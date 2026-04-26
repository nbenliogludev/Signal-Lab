# Marketplace Rule: NestJS Best Practices

> Source: awesome-cursorrules / nestjs-best-practices (adapted)
> Why included: Signal Lab backend is built on NestJS. This rule provides general NestJS architecture patterns that complement project-specific rules.
> What custom skills cover that this doesn't: Signal Lab-specific observability wiring, Sentry integration, and Prometheus metric naming — see `.cursor/rules/observability-conventions.md` and `.cursor/skills/observability/SKILL.md`.

---

You are an expert in TypeScript, NestJS, and building scalable server-side Node.js applications.

## Architecture Principles

- Follow **modular architecture** — one module per domain feature.
- Use **Dependency Injection** via NestJS IoC container — never instantiate services manually.
- Keep **controllers thin** — only handle HTTP concerns (routing, validation, serialization).
- Put **all business logic in services**.
- Use **repositories** or the Prisma service for all data access — never query the DB from controllers.

## Module Structure

```
src/
  <feature>/
    <feature>.module.ts       ← imports, providers, exports
    <feature>.controller.ts   ← routes only
    <feature>.service.ts      ← business logic
    dto/
      create-<feature>.dto.ts
      update-<feature>.dto.ts
      <feature>-response.dto.ts
  common/
    filters/                  ← global exception filters
    guards/                   ← auth guards
    interceptors/             ← logging, transform interceptors
    pipes/                    ← custom validation pipes
  prisma/
    prisma.module.ts
    prisma.service.ts
  app.module.ts
  main.ts
```

## Controllers

```typescript
@Controller('api/scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  // ✅ Always use @UsePipes with whitelist: true
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateScenarioDto) {
    return this.scenariosService.create(dto);
  }

  // ✅ Return DTOs — never raw Prisma models
  @Get()
  findAll(): Promise<ScenarioResponseDto[]> {
    return this.scenariosService.findAll();
  }
}
```

## Services

```typescript
@Injectable()
export class ScenariosService {
  // ✅ Logger always uses the class name
  private readonly logger = new Logger(ScenariosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScenarioDto) {
    this.logger.log('Creating scenario', { type: dto.type });
    // business logic here
  }
}
```

## Validation

- Use `class-validator` decorators on all DTO fields.
- Use `class-transformer` with `@Transform()` for type coercion.
- Always enable `ValidationPipe` globally OR per-controller with `whitelist: true`.
- Never trust raw request body values without validation.

## Exception Handling

- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `InternalServerErrorException`.
- Use a global `ExceptionFilter` to standardize error responses.
- Never throw raw `Error` — always throw typed NestJS exceptions.

## Configuration

- Use `@nestjs/config` with `ConfigService` for all environment variables.
- Never access `process.env` directly in services — inject `ConfigService`.
- Validate env variables at startup with a Joi or Zod schema.

## Guards and Interceptors

- Use `Guards` for authorization checks.
- Use `Interceptors` for cross-cutting concerns: logging, response transformation.
- Register global guards/interceptors in `AppModule` providers with `APP_GUARD` / `APP_INTERCEPTOR` tokens.
