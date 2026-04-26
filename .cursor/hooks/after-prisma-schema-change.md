# Hook: After Prisma Schema Change

## When this hook fires
After any edit to `prisma/schema.prisma` — new model, new field, changed relation, changed enum.

## Problem this solves
The most common Prisma mistake: editing `schema.prisma` but forgetting to run `migrate dev` and `generate`. The result is a runtime crash or stale TypeScript types that silently lie about the DB shape. This hook ensures the migration + client regeneration cycle is never skipped.

## What to do (in order)

### Step 1 — Verify the change is intentional
Review the diff in `prisma/schema.prisma`:
- Is the new model / field named in `camelCase` with `@map("snake_case")` for the DB column?
- Does every new model have `id`, `createdAt`, `updatedAt` with the standard defaults?
- Does the table have `@@map("snake_case_table_name")`?

If naming conventions are wrong, fix them **before** running the migration.

### Step 2 — Run the migration
```bash
npx prisma migrate dev --name <descriptive_name>
```
- Use a descriptive name: `add-scenario-run-duration`, `add-user-email-index`, etc.
- NEVER use generic names like `update`, `change`, `fix`.
- If the migration file was auto-generated, review it before committing.

### Step 3 — Regenerate the Prisma client
```bash
npx prisma generate
```

### Step 4 — Verify TypeScript compiles
```bash
cd apps/backend && npx tsc --noEmit
```
No errors should appear. If there are type errors in services that use the changed model, fix them now.

### Step 5 — Check seed data
- If the new field is required (no `?`, no `@default`), update `prisma/seed.ts` to include it.
- Re-run the seed if needed: `npx prisma db seed`

### Step 6 — Confirm migration file is committed
```bash
git status prisma/migrations/
```
The new migration directory must be staged. **Never gitignore migration files.**

## Checklist before moving on
- [ ] `npx prisma migrate dev` completed without errors
- [ ] `npx prisma generate` completed
- [ ] TypeScript compiles (`tsc --noEmit`)
- [ ] Seed updated if needed
- [ ] Migration file staged in git

## References
- Full Prisma rules: `.cursor/rules/prisma-patterns.md`
