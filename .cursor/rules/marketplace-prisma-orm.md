# Marketplace Rule: Prisma ORM Best Practices

> Source: awesome-cursorrules / prisma-typescript (adapted)
> Why included: Signal Lab uses Prisma as its only ORM. This rule provides general Prisma patterns that complement project-specific restrictions.
> What custom skills cover that this doesn't: Signal Lab-specific schema naming conventions, migration workflow, and raw SQL prohibition — see `.cursor/rules/prisma-patterns.md` and `.cursor/skills/prisma-schema/SKILL.md`.

---

You are an expert in TypeScript, Prisma ORM, and PostgreSQL database design.

## Prisma Client Setup

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## Query Patterns

### Filtering and pagination
```typescript
// ✅ Always paginate large result sets
const runs = await prisma.scenarioRun.findMany({
  where: { type: 'success' },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20,
  select: {
    id: true,
    type: true,
    status: true,
    createdAt: true,
    // Only select fields you need — avoid select: undefined on large tables
  },
});
```

### Relations — use `include` sparingly
```typescript
// ✅ Include only when needed, limit depth to 1-2 levels
const run = await prisma.scenarioRun.findUnique({
  where: { id },
  include: { user: { select: { id: true, email: true } } },
});

// ❌ Never deeply nest includes — causes N+1 and performance issues
```

### Upsert pattern
```typescript
const run = await prisma.scenarioRun.upsert({
  where: { id: existingId },
  create: { type, name, status: 'RUNNING' },
  update: { status: 'COMPLETED', completedAt: new Date() },
});
```

### Atomic transactions
```typescript
// ✅ Use $transaction for multi-step writes
const [run, log] = await prisma.$transaction([
  prisma.scenarioRun.update({ where: { id }, data: { status: 'COMPLETED' } }),
  prisma.auditLog.create({ data: { action: 'scenario_completed', entityId: id } }),
]);
```

## Schema Design

- Use `cuid()` as default ID — globally unique, sortable, URL-safe.
- Always include `createdAt` and `updatedAt` timestamps on every model.
- Use `@map` for field-level snake_case DB mapping.
- Use `@@map` for table-level snake_case DB mapping.
- Index frequently queried fields: `@@index([createdAt])`, `@@index([type, status])`.

## Performance

- Always use `select` to return only needed fields from large queries.
- Use `findFirst` instead of `findMany` + `[0]` for single-record lookups.
- Avoid `findMany` without pagination on large tables.
- Use `count` for counting instead of fetching all records.
- Use connection pooling in production (PgBouncer or Prisma Accelerate).

## Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.scenarioRun.create({ data });
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      throw new ConflictException('Unique constraint violation');
    }
    if (err.code === 'P2025') {
      throw new NotFoundException('Record not found');
    }
  }
  throw err; // re-throw unknown errors
}
```

Common Prisma error codes:
| Code | Meaning |
|------|---------|
| `P2002` | Unique constraint failed |
| `P2025` | Record not found |
| `P2003` | Foreign key constraint failed |
| `P2014` | Relation violation |
