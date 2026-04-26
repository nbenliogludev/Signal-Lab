# Stack Constraints

## Scope
Applies to all code in this repository. These rules are non-negotiable — deviations require explicit written justification in the PR description.

## Frontend — Allowed

| Concern | Library |
|---------|---------|
| Framework | Next.js (App Router) |
| UI components | shadcn/ui only |
| Styling | Tailwind CSS |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |

## Frontend — FORBIDDEN

| Forbidden | Use instead |
|-----------|-------------|
| Redux / Redux Toolkit / Zustand | TanStack Query for server state |
| SWR | TanStack Query |
| Axios | Native `fetch` or `ky` |
| MUI / Chakra / Ant Design | shadcn/ui |
| styled-components / emotion | Tailwind CSS |
| Custom CSS modules (new files) | Tailwind CSS |
| react-query v3 | `@tanstack/react-query` v5 |

## Backend — Allowed

| Concern | Library |
|---------|---------|
| Framework | NestJS |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | `class-validator` + `class-transformer` |
| HTTP client | `axios` (backend only) |
| Metrics | `prom-client` |
| Logging | Structured JSON via `winston` or `pino` |
| Error tracking | Sentry (`@sentry/nestjs`) |

## Backend — FORBIDDEN

| Forbidden | Use instead |
|-----------|-------------|
| TypeORM / Sequelize / Drizzle | Prisma |
| Raw SQL queries | Prisma query API |
| `console.log` for structured logs | Winston/Pino structured logger |
| `express` directly | NestJS |
| Other ORMs | Prisma |

## Infra — Allowed

| Concern | Tool |
|---------|------|
| Container orchestration | Docker Compose |
| Metrics collection | Prometheus |
| Dashboards | Grafana |
| Log aggregation | Loki + Promtail |

## Enforcement
- If you are about to add a forbidden library, STOP and explain why to the user.
- Suggest the correct alternative from the allowed list.
- Never silently introduce a forbidden dependency.
