# Signal Lab — Submission Checklist

## Репозиторий

- **URL**: `https://github.com/nbenliogludev/Signal-Lab.git`
- **Ветка**: `main`
- **Время работы** (приблизительно): **11-12** часов

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
| Next.js (App Router) | ☑ | `apps/frontend/app/` |
| shadcn/ui | ☑ | `apps/frontend/components/ui/` |
| Tailwind CSS | ☑ | `apps/frontend/` (`tailwind.config.ts`, глобальные стили) |
| TanStack Query | ☑ | `apps/frontend/` (`@tanstack/react-query`, например `components/dashboard.tsx`) |
| React Hook Form | ☑ | `apps/frontend/` (`react-hook-form`, например `components/dashboard.tsx`) |
| NestJS | ☑ | `apps/backend/src/` |
| PostgreSQL | ☑ | `docker-compose.yml` (сервис `postgres`), Prisma datasource |
| Prisma | ☑ | `prisma/schema.prisma`, клиент в `apps/backend/generated/prisma` (после generate) |
| Sentry | ☑ | `apps/backend/src/observability/sentry.service.ts` |
| Prometheus | ☑ | `apps/backend/src/observability/metrics.service.ts`, scrape в `infra/prometheus/prometheus.yml` |
| Grafana | ☑ | `infra/grafana/provisioning/`, UI на хосте **3100** → контейнерный порт 3000 (`docker-compose.yml`) |
| Loki | ☑ | `infra/loki/config.yaml`, host порт **3102** → контейнерный 3100 (`docker-compose.yml`) |

---

## Observability Verification

Как проверить каждый сигнал (после `docker compose up -d`, см. README — Verification walkthrough):

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| **Prometheus metric** | Запустить любой сценарий (UI или `curl` к `POST /api/scenarios/run` как в README), затем `curl -s http://localhost:3001/metrics` и найти в выводе строки `scenario_runs_total` | Счётчик `scenario_runs_total` и гистограмма `signal_lab_scenario_run_duration_seconds` в тексте `/metrics`; таргеты Prometheus: `http://localhost:9090/targets` |
| **Grafana dashboard** | Открыть в браузере (логин по умолчанию из README: `admin` / `admin`) | **`http://localhost:3100/d/signal-lab-observability/signal-lab-observability`** — дашборд из README и provisioning в `infra/grafana/provisioning/dashboards/` |
| **Loki log** | После сценария: Grafana → **Explore** → datasource **Loki** → запрос **`{app="signal-lab"}`** (как в README) | JSON-логи бэкенда из файла, который Promtail читает с volume `backend_logs` (`docker-compose.yml`) |
| **Sentry exception** | В **локальном** `.env` задать реальный **`SENTRY_DSN`** (значение не копировать в чеклист); в `.env.example` остаётся **placeholder**. Затем выполнить сценарий **`system_error`** | Событие в проекте Sentry (если DSN валидный); при placeholder DSN SDK по коду репозитория не шлёт реальные события |

---

## Cursor AI Layer

### Custom Skills

Файлы: `.cursor/skills/<имя>/SKILL.md`.

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `observability` | Метрики / JSON-логи / Sentry через `MetricsService`, `AppLoggerService`, `SentryService` |
| 2 | `nestjs-endpoint` | Срез NestJS + `ObservabilityModule` по образцу `scenarios` |
| 3 | `prisma-schema` | Безопасные изменения `schema.prisma` и цикл migrate / generate |
| 4 | `signal-lab-orchestrator` | PRD 004: фазы, `context.json`, resume, субагенты |

### Commands

Файлы: `.cursor/commands/*.md`.

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `/health-check` | Проверка Docker stack и смоук API (см. `.cursor/commands/health-check.md`) |
| 2 | `/check-obs` | Чеклист observability для файла/эндпоинта |
| 3 | `/add-endpoint` | Шаблон нового NestJS API с observability-сервисами |
| 4 | `/run-prd` | Запуск оркестратора PRD 004 по `SKILL.md` |

### Hooks (hook playbooks)

Файлы: `.cursor/hooks/*.md`. Это **ручные** чеклисты для агента/разработчика; **не** автозапуск Cursor: в репозитории **нет** `hooks.json`, события из IDE сами по себе эти файлы не выполняют.

| # | Playbook | Какую проблему решает |
|---|----------|----------------------|
| 1 | `after-new-endpoint.md` | Забытые метрики/логи/Sentry/DTO после нового route |
| 2 | `after-prisma-schema-change.md` | Пропуск migrate / generate после правок схемы |
| 3 | `before-commit.md` | Секреты в git, `.env` в stage, `console.log`, TODO |

### Rules

Файлы: `.cursor/rules/*.mdc`.

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `stack-constraints.mdc` | Разрешённые/запрещённые библиотеки |
| 2 | `observability-conventions.mdc` | Метрики, логи, Sentry |
| 3 | `prisma-patterns.mdc` | Prisma, без raw SQL по умолчанию |
| 4 | `frontend-patterns.mdc` | TanStack Query, RHF, shadcn |
| 5 | `error-handling.mdc` | Ошибки NestJS и фильтры |

### Marketplace Skills

Рекомендованный набор **описан** в `.cursor/marketplace-skills.md` (идеи для Cursor Marketplace / community skills). **По одним только файлам репозитория нельзя доказать**, что те или иные marketplace skills установлены в конкретном Cursor — установка и включение проверяются **в UI Cursor** (Settings / Rules / Skills / Marketplace — формулировка зависит от версии).

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
- **Контекст последнего зафиксированного прогона**: `.execution/2026-04-27-02-01/context.json` (общий шаблон пути по PRD 004: `.execution/{executionId}/context.json`, где `executionId` = `YYYY-MM-DD-HH-mm`)
- **Отчёт того же прогона**: `.execution/2026-04-27-02-01/report.md` (в т.ч. секция **manual hook playbooks** — pass / fail / skipped)
- **Фаз**: **7** — `analysis`, `codebase`, `planning`, `decomposition`, `implementation`, `review`, `report`
- **Короткий тест `/run-prd`**: промпт вида  
  `/run-prd Add a new Signal Lab scenario: cache_miss_spike. Use the orchestrator skill and existing repo rules/skills.`  
  (текст сохранён в `prdText` внутри указанного `context.json`)
- **Результат прогона**: в репозитории добавлен сценарий **`cache_miss_spike`** как дополнительная демонстрация оркестратора; в `context.json` — атомарная декомпозиция задач, смешение **fast** / **default** по задачам, `suggestedSkill`, итоговый отчёт и состояние для **resume** (читать `context.json` первым; не повторять `completed`; **`failed`** не скрывать)
- **Декомпозиция (F4)**: см. `SKILL.md` — без mega-task; разделение по слоям по необходимости
- **Review**: только **ручной** разбор hook playbooks из `.cursor/hooks/*.md`; в чеклисте **не** утверждаем, что хуки Cursor выполняются автоматически

---

## Скриншоты / видео

Файлы в репозитории (папка `docs/`):

| Что показано | Файл | Содержимое (кратко) |
|--------------|------|---------------------|
| UI приложения | [`docs/dashboard_ui.png`](docs/dashboard_ui.png) | Сценарный раннер и история запусков |
| Grafana dashboard | [`docs/grafana.png`](docs/grafana.png) | Дашборд Signal Lab (метрики / панели) |
| Loki logs | [`docs/loki.png`](docs/loki.png) | Explore Loki, структурированные логи бэкенда |
| Sentry error | [`docs/sentry.png`](docs/sentry.png) | Зафиксированное исключение (при реальном DSN) |
| Метрики / Prometheus | [`docs/metrics.png`](docs/metrics.png) | Вывод или UI, связанный с метриками сценариев |

*(Видео в репозитории не приложено — при необходимости добавь ссылку отдельно.)*

---

## Что не успел и что сделал бы первым при +4 часах

- **Marketplace skills**: из файлов репозитория нельзя доказать установку в Cursor; список рекомендаций — в `.cursor/marketplace-skills.md`, факт включения — только в UI IDE.
- **Hooks**: в репозитории — **ручные** hook playbooks (`.cursor/hooks/*.md`), не автоматический `hooks.json`.
- **Sentry**: полная проверка требует **реального** `SENTRY_DSN` в локальном `.env`; в репозитории в шаблонах остаётся **placeholder** (см. README про `.env.example`).
- **+4 часа**: при необходимости — автоматизировать smoke-проверку после сценариев или расширить Grafana-панели под новые типы сценариев.

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?  
2. Какие задачи подходят для малой модели и почему?  
3. Какие marketplace skills подключил в Cursor, а какие закрыты custom — и почему?  
4. Как playbook-файлы в `.cursor/hooks/` снижают ошибки, если они не авто-запускаются?  
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?  
