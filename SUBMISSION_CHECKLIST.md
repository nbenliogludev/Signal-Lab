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

| # | Command name | Purpose |
|---|----------------|---------|
| 1 | `/health-check` | Docker Compose status (services up), `GET /api/health`, basic stack smoke checks (see `.cursor/commands/health-check.md`) |
| 2 | `/check-obs` | Metrics / logs / Sentry checklist for a given backend file or endpoint (see `.cursor/commands/check-obs.md`) |
| 3 | `/add-endpoint` | Scaffold a new NestJS REST slice with observability per `nestjs-endpoint` skill (see `.cursor/commands/add-endpoint.md`) |
| 4 | `/run-prd` | Run multi-phase PRD 004 orchestrator: `SKILL.md`, `context.json`, phases and report (see `.cursor/commands/run-prd.md`) |

Files: `.cursor/commands/<name>.md`.

### Hooks / playbooks

`.cursor/hooks/*.md` — **manual** checklists. No `hooks.json` in repo; not auto-run by Cursor.

| # | File | Purpose |
|---|------|---------|
| 1 | `after-new-endpoint.md` | Metrics / logs / Sentry / DTO after new routes |
| 2 | `after-prisma-schema-change.md` | Migrate + generate after schema changes |
| 3 | `before-commit.md` | Secrets, staged `.env`, `console.log`, blocking TODOs |

### Rules

`.cursor/rules/*.mdc`

| # | File | Scope |
|---|------|--------|
| 1 | `stack-constraints.mdc` | Allowed / forbidden libraries |
| 2 | `observability-conventions.mdc` | Metrics, logs, Sentry |
| 3 | `prisma-patterns.mdc` | Prisma usage |
| 4 | `frontend-patterns.mdc` | TanStack Query, RHF, shadcn |
| 5 | `error-handling.mdc` | Nest HTTP errors |

### Marketplace skills

See `.cursor/marketplace-skills.md` — **documented / recommended**; the repo cannot prove what is installed in Cursor.

**Custom-only coverage in repo:** `observability`, `nestjs-endpoint`, `prisma-schema`, `signal-lab-orchestrator`.

---

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

- **Marketplace:** installation cannot be verified from repo files alone.
- **Hooks:** manual playbooks only; no automatic Cursor `hooks.json` hooks shipped.
- **Sentry:** end-to-end verification needs a real local `SENTRY_DSN`.

---

## Defense prep questions

1. Why this decomposition of custom skills?
2. Which tasks fit a small/fast model and why?
3. Which marketplace skills did you enable in Cursor vs custom skills — and why?
4. How do playbook files under `.cursor/hooks/` reduce mistakes if they do not auto-run?
5. How does the orchestrator save context vs one large prompt?
