# Prisma Patterns

## Scope
All database interactions in the NestJS backend. Prisma is the ONLY way to touch the database.

---

## Allowed Patterns

### Injecting PrismaService
```typescript
// ✅ Correct — inject via constructor
@Injectable()
export class ScenarioService {
  constructor(private readonly prisma: PrismaService) {}
}
```

### Basic CRUD
```typescript
// ✅ Create
const run = await this.prisma.scenarioRun.create({ data: { ... } });

// ✅ Find with filter
const runs = await this.prisma.scenarioRun.findMany({
  where: { type },
  orderBy: { createdAt: 'desc' },
  take: 20,
});

// ✅ Update
await this.prisma.scenarioRun.update({
  where: { id },
  data: { status: 'completed', completedAt: new Date() },
});
```

### Transactions (when multiple writes must be atomic)
```typescript
// ✅ Use $transaction for multi-step writes
await this.prisma.$transaction([
  this.prisma.scenarioRun.update({ where: { id }, data: { status: 'completed' } }),
  this.prisma.auditLog.create({ data: { ... } }),
]);
```

---

## FORBIDDEN Patterns

### Raw SQL
```typescript
// ❌ NEVER — use Prisma query API instead
await this.prisma.$queryRaw`SELECT * FROM scenario_runs`;
await this.prisma.$executeRaw`UPDATE scenario_runs SET ...`;
```
> Exception: Only allowed for DB migrations that Prisma Migrate cannot express. Must have a code comment explaining why.

### Other ORMs
```typescript
// ❌ NEVER
import { Repository } from 'typeorm';
import { Model } from 'sequelize';
```

### Direct database connections
```typescript
// ❌ NEVER
import { Pool } from 'pg';
```

---

## Schema Conventions

### Field naming
- Use `camelCase` in Prisma schema (maps to `snake_case` in DB via `@map`).
- Always add `@map("snake_case_name")` for DB columns.
- Always add `@@map("snake_case_table")` for table names.

### Required fields on every model
```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

### Migrations
- ALWAYS run `npx prisma migrate dev --name <descriptive_name>` after schema changes.
- NEVER manually edit migration SQL files.
- NEVER delete migration files.
- After migration, run `npx prisma generate` to update the client.

---

## Checklist after schema changes
- [ ] `npx prisma migrate dev` executed
- [ ] `npx prisma generate` executed
- [ ] Backend compiles without TypeScript errors
- [ ] Seed data updated if needed
