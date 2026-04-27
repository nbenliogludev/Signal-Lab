# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `https://github.com/nbenliogludev/Signal-Lab.git` *(обнови при форке)*
- **Ветка**: `___` *(укажи ветку PR, не обязательно текущая локальная)*
- **Время работы** (приблизительно): `___` часов

---

## Запуск

```bash
# Команда запуска:
docker compose up -d

# Команда проверки:
# См. раздел Verification Walkthrough в README.md

# Команда остановки:
docker compose down
```

**Предусловия**: Docker + Docker Compose; Node 20+ только при локальном запуске вне контейнеров. При занятом порту 5432: `POSTGRES_PORT=5433 docker compose up -d` (см. README).

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ☐ | `apps/frontend/app/` |
| shadcn/ui | ☐ | `apps/frontend/components/ui/` |
| Tailwind CSS | ☐ | `apps/frontend/` |
| TanStack Query | ☐ | `apps/frontend/` |
| React Hook Form | ☐ | `apps/frontend/` |
| NestJS | ☐ | `apps/backend/src/` |
| PostgreSQL | ☐ | `docker-compose.yml`, Prisma |
| Prisma | ☐ | `prisma/schema.prisma` |
| Sentry | ☐ | `apps/backend/src/observability/sentry.service.ts` |
| Prometheus | ☐ | `apps/backend/src/observability/metrics.service.ts`, `infra/prometheus/` |
| Grafana | ☐ | `infra/grafana/` |
| Loki | ☐ | `infra/loki/`, host порт **3102** |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | `curl http://localhost:3001/metrics`, запустить success-сценарий | `scenario_runs_total`, Grafana |
| Grafana dashboard | Открыть дашборд из README | `http://localhost:3100/d/signal-lab-observability/signal-lab-observability` |
| Loki log | Grafana → Explore → Loki `{app="signal-lab"}` после сценария | Loki datasource |
| Sentry exception | Реальный DSN в `.env`, сценарий `system_error` | Проект Sentry |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `observability` | Метрики / JSON-логи / Sentry через `MetricsService`, `AppLoggerService`, `SentryService` |
| 2 | `nestjs-endpoint` | Срез NestJS + `ObservabilityModule` по образцу `scenarios` |
| 3 | `prisma-schema` | Безопасные изменения `schema.prisma` и цикл migrate / generate |
| 4 | `signal-lab-orchestrator` | PRD 004: фазы, `context.json`, resume, субагенты |

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `/health-check` | Проверка Docker stack и смоук API (см. `.cursor/commands/health-check.md`) |
| 2 | `/check-obs` | Чеклист observability для файла/эндпоинта |
| 3 | `/add-endpoint` | Шаблон нового NestJS API с observability-сервисами |
| 4 | `/run-prd` | Запуск оркестратора PRD 004 по `SKILL.md` |

### Hooks

| # | Playbook | Какую проблему решает |
|---|----------|----------------------|
| 1 | `after-new-endpoint.md` | Забытые метрики/логи/Sentry/DTO после нового route |
| 2 | `after-prisma-schema-change.md` | Пропуск migrate / generate после правок схемы |
| 3 | `before-commit.md` | Секреты в git, `.env` в stage, `console.log`, TODO |

*(В репозитории это **ручные** playbook-файлы; авто-hooks через `hooks.json` не поставляются.)*

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `stack-constraints.mdc` | Разрешённые/запрещённые библиотеки |
| 2 | `observability-conventions.mdc` | Метрики, логи, Sentry |
| 3 | `prisma-patterns.mdc` | Prisma, без raw SQL по умолчанию |
| 4 | `frontend-patterns.mdc` | TanStack Query, RHF, shadcn |
| 5 | `error-handling.mdc` | Ошибки NestJS и фильтры |

### Marketplace Skills

Рекомендованный набор описан в `.cursor/marketplace-skills.md`. **Факты установки в Cursor из репозитория не проверяются** — отметь вручную, что реально включено у тебя в IDE:

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | Next.js + React + TypeScript | Базовые паттерны фронта |
| 2 | Next.js App Router | App Router, layouts, loading |
| 3 | shadcn/ui | UI-компоненты |
| 4 | NestJS best practices | Модульность NestJS |
| 5 | Prisma ORM | Запросы и ошибки Prisma |
| 6 | Docker / Compose | Контейнерный запуск |
| 7 | PostgreSQL table design | Типы и индексы в БД |

**Что закрыли custom skills, чего нет в marketplace:**

- Signal Lab-специфичная связка Prometheus + Loki + Sentry в коде (`observability` skill).
- Полный срез endpoint + observability-сервисы репозитория (`nestjs-endpoint`).
- Локальный цикл миграций Prisma под правила проекта (`prisma-schema`).
- Оркестратор PRD с `context.json` (`signal-lab-orchestrator`).

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/<executionId>/context.json` где `executionId` = `YYYY-MM-DD-HH-mm`
- **Сколько фаз**: 7 (`analysis`, `codebase`, `planning`, `decomposition`, `implementation`, `review`, `report`)
- **Какие задачи для fast model**: низкая/средняя сложность, атомарные 5–10 мин (см. PRD 004 F3 и `context.json` → `tasks[].model`)
- **Поддерживает resume**: да *(по спецификации в SKILL.md: чтение существующего `context.json`)*

---

## Скриншоты / видео

- [ ] UI приложения
- [ ] Grafana dashboard с данными
- [ ] Loki logs
- [ ] Sentry error

(Приложи файлы или ссылки ниже)

---

## Что не успел и что сделал бы первым при +4 часах

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил в Cursor, а какие закрыты custom — и почему?
4. Как playbook-файлы в `.cursor/hooks/` снижают ошибки, если они не авто-запускаются?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?
