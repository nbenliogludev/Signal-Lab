# Signal Lab — Submission Checklist

## Репозиторий

| | |
|---|---|
| **URL** | `https://github.com/nbenliogludev/Signal-Lab.git` |
| **Ветка** | `main` |
| **Время** | ~10–12 ч |

---

## Запуск

| | |
|---|---|
| **Старт** | `docker compose up -d` |
| **Health** | `curl http://localhost:3001/api/health` |
| **Стоп** | `docker compose down` |

**Предусловия:** Docker + Compose. Node 20+ — только вне контейнеров. Порт 5432 занят: `POSTGRES_PORT=5433 docker compose up -d` (см. README).

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
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
| Grafana | ☑ | `infra/grafana/provisioning/`, хост **3100** |
| Loki | ☑ | `infra/loki/`, хост **3102** |

---

## Observability Verification

| Signal | How to reproduce | Where to check |
|--------|------------------|----------------|
| Prometheus metric | Run `success` or `system_error` from UI (or `POST /api/scenarios/run` per README) | `http://localhost:3001/metrics`, search `scenario_runs_total` |
| Grafana dashboard | Run several scenarios | `http://localhost:3100` → dashboard `http://localhost:3100/d/signal-lab-observability/signal-lab-observability` (README) |
| Loki log | Run any scenario | Grafana → Explore → Loki → query `{app="signal-lab"}` (README) |
| Sentry exception | Set real `SENTRY_DSN` in local `.env`, run `system_error` | Sentry project → Issues |

---

## Cursor AI Layer

### Custom Skills

`.cursor/skills/<name>/SKILL.md`

| # | Skill | Role |
|---|--------|------|
| 1 | `observability` | Metrics, JSON logs, Sentry services |
| 2 | `nestjs-endpoint` | Nest slice + observability like `scenarios` |
| 3 | `prisma-schema` | `schema.prisma`, migrate / generate |
| 4 | `signal-lab-orchestrator` | PRD 004 phases, `context.json`, resume |

### Commands

`.cursor/commands/*.md`

| # | Command | Role |
|---|---------|------|
| 1 | `/health-check` | Stack + smoke API |
| 2 | `/check-obs` | Observability checklist |
| 3 | `/add-endpoint` | Nest endpoint template |
| 4 | `/run-prd` | Orchestrator (see skill) |

### Hooks / playbooks

`.cursor/hooks/*.md` — **manual** checklists. No `hooks.json` in repo; not auto-run by Cursor.

| # | File | Purpose |
|---|------|---------|
| 1 | `after-new-endpoint.md` | Metrics / logs / Sentry / DTO after routes |
| 2 | `after-prisma-schema-change.md` | Migrate + generate after schema |
| 3 | `before-commit.md` | Secrets, `.env` on stage, `console.log`, TODOs |

### Rules

`.cursor/rules/*.mdc`

| # | File | Scope |
|---|------|--------|
| 1 | `stack-constraints.mdc` | Allowed / forbidden libs |
| 2 | `observability-conventions.mdc` | Metrics, logs, Sentry |
| 3 | `prisma-patterns.mdc` | Prisma usage |
| 4 | `frontend-patterns.mdc` | TanStack Query, RHF, shadcn |
| 5 | `error-handling.mdc` | Nest HTTP errors |

### Marketplace Skills

See `.cursor/marketplace-skills.md` — **documented / recommended**; repo cannot verify what is installed in Cursor.

**Custom in repo:** `observability`, `nestjs-endpoint`, `prisma-schema`, `signal-lab-orchestrator`.

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

## Скриншоты / видео

- [x] UI application — `docs/dashboard_ui.png`
- [x] Grafana dashboard — `docs/grafana.png`
- [x] Loki logs — `docs/loki.png`
- [x] Sentry error — `docs/sentry.png`
- [x] Metrics endpoint — `docs/metrics.png`

---

## Что не успел и что сделал бы первым при +4 часах

- Marketplace: installation not verifiable from repo alone.
- Hooks: manual playbooks only, not automatic Cursor hooks.
- Sentry: needs real local `SENTRY_DSN` for end-to-end verification.

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил в Cursor, а какие закрыты custom — и почему?
4. Как playbook-файлы в `.cursor/hooks/` снижают ошибки, если они не авто-запускаются?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?
