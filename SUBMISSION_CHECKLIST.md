# Signal Lab — Submission Checklist

## Репозиторий

| | |
|---|---|
| **URL** | `https://github.com/nbenliogludev/Signal-Lab.git` |
| **Ветка** | `main` |
| **Время** | ~9–10 ч |

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
| Prometheus metric | Run `success` or `system_error` from UI | `http://localhost:3001/metrics`, search `scenario_runs_total` |
| Grafana dashboard | Run several scenarios | `http://localhost:3100` → dashboard `http://localhost:3100/d/signal-lab-observability/signal-lab-observability` |
| Loki log | Run any scenario | Grafana → Explore → Loki → query `{app="signal-lab"}` (README) |
| Sentry exception | Set real `SENTRY_DSN` in local `.env`, run `system_error` | Sentry project → Issues |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|------------|------------|
| 1 | `observability` | Метрики, структурированные JSON-логи (Loki/Promtail) и Sentry для NestJS-путей и сервисов; опирается на `MetricsService`, `AppLoggerService`, `SentryService` с примерами в SKILL |
| 2 | `nestjs-endpoint` | Новый endpoint-срез: module, controller, service, DTO, `ObservabilityModule`, Prisma — по шаблону и слоям как в `scenarios` |
| 3 | `prisma-schema` | Изменения `schema.prisma`, цикл migrate / generate и проверки без небезопасного raw SQL по умолчанию |
| 4 | `signal-lab-orchestrator` | 7-фазный pipeline PRD 004 с `context.json`, выбором fast/default, циклом review, ручными hook playbooks и resume |

Файлы: `.cursor/skills/<name>/SKILL.md`.

### Commands

| # | Command name | Назначение |
|---|--------------|------------|
| 1 | `/health-check` | Проверка Docker Compose (сервисы «Up»), `GET /api/health` и базовых смоук-проверок стека (см. `.cursor/commands/health-check.md`) |
| 2 | `/check-obs` | Чеклист метрик / логов / Sentry для конкретного backend-файла или эндпоинта (см. `.cursor/commands/check-obs.md`) |
| 3 | `/add-endpoint` | Скаффолд нового NestJS REST-среза с observability по шаблону навыка `nestjs-endpoint` (см. `.cursor/commands/add-endpoint.md`) |
| 4 | `/run-prd` | Запуск многофазного оркестратора PRD 004: `SKILL.md`, `context.json`, фазы и отчёт (см. `.cursor/commands/run-prd.md`) |

Файлы: `.cursor/commands/<name>.md`.

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
