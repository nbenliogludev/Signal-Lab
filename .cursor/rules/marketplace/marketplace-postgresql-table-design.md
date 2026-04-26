# Marketplace Rule: PostgreSQL Table Design

> Source: awesome-cursorrules / postgresql-table-design (adapted)
> Why included: Signal Lab uses PostgreSQL via Prisma. Understanding PostgreSQL-level design prevents schema decisions that are correct in Prisma but poor at the DB level.
> What custom skills cover that this doesn't: Prisma-specific schema syntax and migration workflow — see `.cursor/rules/prisma-patterns.md` and `.cursor/skills/prisma-schema/SKILL.md`.

---

You are an expert in PostgreSQL database design, indexing, query optimization, and data integrity.

## Primary Keys

```sql
-- ✅ Use CUID or UUID for distributed systems (Prisma @default(cuid()))
id TEXT PRIMARY KEY DEFAULT gen_random_uuid()

-- ✅ Use SERIAL/BIGSERIAL only for internal tables with no external references
id BIGSERIAL PRIMARY KEY
```

Rule: **Never use user-supplied values as primary keys** (emails, usernames, etc.) — they change.

## Naming Conventions

| Object | Convention | Example |
|--------|------------|---------|
| Table | `snake_case`, plural | `scenario_runs` |
| Column | `snake_case` | `created_at`, `scenario_type` |
| Index | `idx_<table>_<columns>` | `idx_scenario_runs_created_at` |
| Foreign key | `fk_<table>_<referenced>` | `fk_runs_user_id` |
| Constraint | `chk_<table>_<description>` | `chk_runs_status` |

## Timestamps (mandatory on every table)

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

Always use `TIMESTAMPTZ` (with timezone), never `TIMESTAMP` — avoids DST bugs.

## Indexes

### Index frequently queried columns
```sql
-- Single column
CREATE INDEX idx_scenario_runs_created_at ON scenario_runs(created_at DESC);

-- Composite (order matters — put equality filters first)
CREATE INDEX idx_scenario_runs_type_status ON scenario_runs(type, status);

-- Partial index (only index rows matching a condition)
CREATE INDEX idx_scenario_runs_failed ON scenario_runs(created_at)
  WHERE status = 'FAILED';
```

### When to index
- Columns in `WHERE` clauses on large tables.
- Foreign key columns (`user_id`, `run_id`).
- Columns used in `ORDER BY` on paginated queries.
- Columns used in `JOIN` conditions.

### When NOT to index
- Small tables (< 1000 rows) — sequential scan is faster.
- Columns with very low cardinality (boolean, status with 2 values on small tables).
- Columns rarely used in queries.

## Constraints

```sql
-- NOT NULL by default for required fields
status TEXT NOT NULL

-- CHECK constraint for enums (Prisma handles this, but good to know)
status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))

-- UNIQUE constraint
UNIQUE (user_id, scenario_id)

-- Foreign key with cascade
user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

## Query Performance Rules

- Always use `LIMIT` on queries that could return many rows.
- Use `EXPLAIN ANALYZE` to investigate slow queries.
- Avoid `SELECT *` in production queries — select only needed columns.
- Avoid `OFFSET` for large paginations — use cursor-based pagination (`WHERE id > last_seen_id`).
- Use `COUNT(*)` not `COUNT(column)` for row counting.

## Data Types

| Use case | Type |
|----------|------|
| Text (variable) | `TEXT` |
| Integer | `INTEGER` or `BIGINT` |
| Decimal | `NUMERIC(precision, scale)` — never `FLOAT` for money |
| Boolean | `BOOLEAN` |
| Timestamp | `TIMESTAMPTZ` |
| JSON | `JSONB` (indexed) over `JSON` |
| UUID | `UUID` or `TEXT` |

## Migrations Safety Rules

- Always test migrations on a copy of production data before applying.
- Adding a nullable column: safe, no lock.
- Adding a NOT NULL column with default: safe in PostgreSQL 11+.
- Adding a NOT NULL column without default: **requires backfill first**.
- Dropping a column: safe, but check all application code first.
- Adding an index: use `CREATE INDEX CONCURRENTLY` on large tables to avoid locking.
