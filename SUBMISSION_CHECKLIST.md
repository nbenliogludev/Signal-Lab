# Signal Lab — Submission Checklist

## Repository

| | |
|---|---|
| **URL** | `https://github.com/nbenliogludev/Signal-Lab.git` |
| **Branch** | `main` |
| **Time (approx.)** | ~9–10 h |

---

## Runbook

| | |
|---|---|
| **Start** | `docker compose up -d` |
| **Health** | `curl http://localhost:3001/api/health` |
| **Stop** | `docker compose down` |

**Prerequisites:** Docker + Compose. Node 20+ only if you run apps outside containers. If host port 5432 is busy: `POSTGRES_PORT=5433 docker compose up -d` (see README).

---

## Stack — confirmation

| Technology | In use? | Where to look |
|-----------|:-------:|---------------|
| Next.js (App Router) | ☑ | `apps/frontend/app/` |
| shadcn/ui | ☑ | `apps/frontend/components/ui/` |
| Tailwind CSS | ☑ | `apps/frontend/` |
| TanStack Query | ☑ | `apps/frontend/components/dashboard.tsx` |
| React Hook Form | ☑ | `apps/frontend/components/dashboard.tsx` |
| NestJS | ☑ | `apps/backend/src/` |
| PostgreSQL | ☑ | `docker-compose.yml` → `postgres`, Prisma |
| Prisma | ☑ | `prisma/schema.prisma` |
| Sentry | ☑ | `apps/backend/src/observability/sentry.service.ts` |
| Prometheus | ☑ | `apps/backend/.../metrics.service.ts`, `infra/prometheus/` |
| Grafana | ☑ | `infra/grafana/provisioning/`, host **3100** |
| Loki | ☑ | `infra/loki/`, host **3102** |

---

## Observability verification

| Signal | How to reproduce | Where to check |
|--------|------------------|----------------|
| Prometheus metric | Run `success` or `system_error` from UI | `http://localhost:3001/metrics`, search `scenario_runs_total` |
| Grafana dashboard | Run several scenarios | `http://localhost:3100` → dashboard `http://localhost:3100/d/signal-lab-observability/signal-lab-observability` |
| Loki log | Run any scenario | Grafana → Explore → Loki → query `{app="signal-lab"}` (README) |
| Sentry exception | Set real `SENTRY_DSN` in local `.env`, run `system_error` | Sentry project → Issues |

---

## Cursor AI layer

### Custom skills

| # | Skill name | Purpose |
|---|------------|---------|
| 1 | `observability` | Adds metrics, structured logs, and Sentry handling using the project’s `MetricsService`, `AppLoggerService`, and `SentryService`. |
| 2 | `nestjs-endpoint` | Helps add or update NestJS endpoints following the existing controller/service/DTO pattern. |
| 3 | `prisma-schema` | Guides safe Prisma schema changes, migrations, and client regeneration. |
| 4 | `signal-lab-orchestrator` | Runs PRD work through a 7-phase flow with `context.json`, task decomposition, model selection, review, and resume support. |


Files: `.cursor/skills/<name>/SKILL.md`.

### Commands

| # | Command | What it does |
|---|---------|--------------|
| 1 | `/health-check` | Checks Docker Compose status, backend health endpoint, and basic stack availability. |
| 2 | `/check-obs` | Checks metrics, logs, Sentry, and observability wiring for a backend endpoint. |
| 3 | `/add-endpoint` | Guides adding a new NestJS endpoint with the project’s observability conventions. |
| 4 | `/run-prd` | Runs a task or PRD through the Signal Lab orchestrator with `context.json`, phases, review, and report. |

Files: `.cursor/commands/<name>.md`.

### Hooks / Playbooks

`.cursor/hooks/*.md` contains manual checklists. There is no `hooks.json`, so these hooks are not auto-run by Cursor.

| # | Hook playbook | What it helps prevent |
|---|---------------|------------------------|
| 1 | `after-new-endpoint.md` | Missing metrics, logs, Sentry handling, DTO updates, or Swagger docs after endpoint changes. |
| 2 | `after-prisma-schema-change.md` | Missing migration, Prisma client regeneration, or backend updates after schema changes. |
| 3 | `before-commit.md` | Committed secrets, staged `.env` files, debug logs, and unfinished TODOs before submission. |

### Rules

Rules are stored in `.cursor/rules/*.mdc`.

| # | Rule file | What it enforces |
|---|-----------|------------------|
| 1 | `stack-constraints.mdc` | Required stack and forbidden replacements. |
| 2 | `observability-conventions.mdc` | Metrics, structured logs, Sentry, and scenario signal conventions. |
| 3 | `prisma-patterns.mdc` | Prisma usage, migrations, and database access rules. |
| 4 | `frontend-patterns.mdc` | Next.js App Router, TanStack Query, React Hook Form, shadcn/ui, and Tailwind patterns. |
| 5 | `error-handling.mdc` | Backend exception handling and frontend error display. |

### Marketplace Skills

Marketplace skills are listed in `.cursor/settings.json`; detailed justification is in `.cursor/marketplace-skills.md`.

| # | Skill | Why connected |
|---|-------|---------------|
| 1 | `next-best-practices` | App Router and component boundaries |
| 2 | `shadcn-ui` | UI primitives and form patterns |
| 3 | `tailwind-design-system` | Consistent layout and styling |
| 4 | `nestjs-best-practices` | Controllers, services, modules, DTOs, DI |
| 5 | `prisma-orm` | Schema, migrations, generated client |
| 6 | `docker-expert` | Docker Compose and container workflows |


## Orchestrator

- **Skill:** `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Context:** `.execution/2026-04-27-02-01/context.json`
- **Report:** `.execution/2026-04-27-02-01/report.md`
- **Phases (7):** `analysis` → `codebase` → `planning` → `decomposition` → `implementation` → `review` → `report`
- **Models:** tasks use `fast` / `default` (see `context.json` tasks, e.g. 3 fast + 1 default in proof run)
- **Resume:** yes — read `context.json`, skip completed phases/tasks
- **Test prompt:** `/run-prd Add a new Signal Lab scenario: cache_miss_spike. Use the orchestrator skill and existing repo rules/skills.`
- **Outcome:** `cache_miss_spike` scenario + proof artifacts above; manual hook playbook notes in `report.md`

---

## Screenshots / video

- [x] UI application — `docs/dashboard_ui.png`
- [x] Grafana dashboard — `docs/grafana.png`
- [x] Loki logs — `docs/loki.png`
- [x] Sentry error — `docs/sentry.png`
- [x] Metrics endpoint — `docs/metrics.png`

---

## Not completed / first +4h priorities

- **Grafana polish:** improve the dashboard with latency heatmaps, alert rules, and a seeded demo dataset for a richer first-run experience.
- **Scenario tests:** add backend integration tests for `success`, `validation_error`, `system_error`, `slow_request`, and timeout scenarios.
- **CI checks:** add GitHub Actions for typecheck, lint, `docker compose config`, and basic health verification.
- **Alert rules:** add Prometheus/Grafana alerts for high error rate, slow request spikes, and missing backend metrics.

---

## Defense Questions

1. Why this decomposition of skills?
2. Which tasks are suitable for a small model and why?
3. Which marketplace skills did you connect, which ones did you replace with custom skills, and why?
4. Which hooks actually reduce mistakes in daily work?
5. How does the orchestrator save context compared to one large prompt?
`
