---
name: prisma-schema
description: Guide for making safe Prisma schema changes — adding models, fields, relations, and enums — with the correct migration cycle and TypeScript verification. Use this skill any time you touch prisma/schema.prisma.
---

# Prisma Schema Skill

## When to Use

- Adding a new model to `schema.prisma`.
- Adding fields, relations, or indexes to an existing model.
- Adding or modifying an enum.
- Renaming a field or table.
- After this skill, always run the playbook `.cursor/hooks/after-prisma-schema-change.md`.

---

## Step 1 — Write the Schema Change

### New model template

```prisma
model ScenarioRun {
  id          String    @id @default(cuid())
  type        String
  name        String
  status      RunStatus @default(RUNNING)
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("scenario_runs")
}

enum RunStatus {
  RUNNING
  COMPLETED
  FAILED
}
```

### Naming rules (mandatory)

| What | Prisma (TS) | DB (`@map`) |
|------|-------------|-------------|
| Field | `camelCase` | `snake_case` via `@map` |
| Model | `PascalCase` | `snake_case` via `@@map` |
| Enum | `PascalCase` | values `UPPER_CASE` |

### Required fields on every model

```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

### Adding a field to an existing model

```prisma
// ✅ Optional field (safe, no default needed)
durationMs Int? @map("duration_ms")

// ✅ Required field with default (safe)
retryCount Int @default(0) @map("retry_count")

// ⚠️ Required field, no default — migration will fail on non-empty table
// Must add @default or provide a migration-time fill value
errorMessage String @map("error_message")
```

### Relations

```prisma
model ScenarioRun {
  id     String @id @default(cuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id])
  // ...
}

model User {
  id           String        @id @default(cuid())
  scenarioRuns ScenarioRun[]
}
```

### Indexes

```prisma
@@index([createdAt])          // single field
@@index([type, status])       // composite
@@unique([userId, scenarioId]) // unique constraint
```

---

## Step 2 — Run the Migration Cycle

**Always in this exact order:**

```bash
# 1. Create and apply the migration
npx prisma migrate dev --name <descriptive-name>

# Good names:
#   add-scenario-run-model
#   add-duration-ms-to-scenario-run
#   add-user-scenario-relation
#   add-created-at-index

# Bad names: update, fix, change, temp

# 2. Regenerate the Prisma client
npx prisma generate

# 3. Verify TypeScript is happy
cd apps/backend && npx tsc --noEmit
```

---

## Step 3 — Common Migration Pitfalls

### Adding a required field to a non-empty table

```bash
# Error: Column cannot be null
# Fix: provide a default in the migration SQL, or make the field optional first
```

Option A — add `@default(value)` in schema:
```prisma
errorMessage String @default("") @map("error_message")
```

Option B — make it optional, backfill, then make required in a second migration.

### Renaming a field (NOT rename — Prisma sees it as drop + add)

```prisma
// Add @map to keep old DB column name while renaming TS field
oldName String @map("old_name")  // change TS name but keep DB column
```

For true DB column renames, write a manual `ALTER TABLE` in the migration SQL.

### Enum changes

Adding enum values is safe. **Removing enum values** requires:
1. Migrate all rows away from the removed value first.
2. Then remove from schema.

---

## Step 4 — Seed Data

If the new model or field is required in `prisma/seed.ts`:

```typescript
// prisma/seed.ts
await prisma.scenarioRun.createMany({
  data: [
    { type: 'success', name: 'seed-run-1', status: 'COMPLETED' },
    { type: 'error',   name: 'seed-run-2', status: 'FAILED' },
  ],
});
```

Run the seed:
```bash
npx prisma db seed
```

---

## Step 5 — Verify Migration File is Committed

```bash
git status prisma/migrations/
# Expected: new directory staged
git add prisma/migrations/
```

**Never delete migration files.** They are the source of truth for the DB history.

---

## Full Checklist

- [ ] Schema follows naming conventions (`@map`, `@@map`, `camelCase` fields)  
- [ ] Every new model has `id`, `createdAt`, `updatedAt`  
- [ ] `npx prisma migrate dev --name <descriptive>` completed without errors  
- [ ] `npx prisma generate` completed  
- [ ] `npx tsc --noEmit` — no TypeScript errors  
- [ ] Seed updated if new required fields added  
- [ ] Migration files staged in git  
- [ ] No raw SQL in service code (use Prisma query API)  

## References
- `.cursor/rules/prisma-patterns.mdc` — full Prisma rules and forbidden patterns
- `.cursor/hooks/after-prisma-schema-change.md` — post-change verification playbook
