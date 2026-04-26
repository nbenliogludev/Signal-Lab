# Marketplace Skills

Список подключённых community marketplace skills и обоснование выбора каждого.
Фактические rule-файлы находятся в `.cursor/rules/marketplace/`.

---

## 1. Next.js + React + TypeScript

**Файл:** `.cursor/rules/marketplace/marketplace-nextjs-react-typescript.md`
**Источник:** [awesome-cursorrules / nextjs-react-typescript](https://github.com/PatrickJS/awesome-cursorrules)

**Зачем:** Signal Lab frontend построен на Next.js App Router с TypeScript. Этот rule задаёт общие принципы: functional components, TypeScript over enums, правила обработки ошибок, минимизация `useEffect`.

**Что не покрывает (закрыто custom rules):** Signal Lab-специфичные паттерны TanStack Query и RHF — см. `.cursor/rules/frontend-patterns.md`.

---

## 2. Next.js App Router

**Файл:** `.cursor/rules/marketplace/marketplace-nextjs-app-router.md`
**Источник:** [awesome-cursorrules / nextjs-app-router](https://github.com/PatrickJS/awesome-cursorrules)

**Зачем:** Фиксирует конвенции специальных файлов App Router (`layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`), структуру папок и правила data fetching на уровне сервера.

**Что не покрывает:** Наши API routes и интеграцию с backend — см. `.cursor/commands/add-endpoint.md`.

---

## 3. shadcn/ui

**Файл:** `.cursor/rules/marketplace/marketplace-shadcn-ui.md`
**Источник:** [awesome-cursorrules / cursor-ai-react-typescript-shadcn-ui](https://github.com/PatrickJS/awesome-cursorrules)

**Зачем:** Signal Lab UI строится исключительно на shadcn/ui. Rule предотвращает ручное копирование компонентов, требует установку через CLI и правильный импорт.

**Что не покрывает:** Наш конкретный паттерн Form + RHF + Zod — см. `.cursor/rules/frontend-patterns.md`.

---

## 4. NestJS Best Practices

**Файл:** `.cursor/rules/marketplace/marketplace-nestjs-best-practices.md`
**Источник:** [awesome-cursorrules / nestjs-best-practices](https://github.com/PatrickJS/awesome-cursorrules) (адаптировано)

**Зачем:** Задаёт модульную архитектуру NestJS: тонкие контроллеры, бизнес-логика в сервисах, DI через конструктор, ConfigService для env. Без этого rule агент может создать "толстый" контроллер или использовать `process.env` напрямую.

**Что не покрывает:** Observability-специфика (метрики, Sentry) — см. `.cursor/skills/observability/SKILL.md`.

---

## 5. Prisma ORM

**Файл:** `.cursor/rules/marketplace/marketplace-prisma-orm.md`
**Источник:** [awesome-cursorrules / prisma-typescript](https://github.com/PatrickJS/awesome-cursorrules) (адаптировано)

**Зачем:** Покрывает общие паттерны Prisma: pagination, relations, upsert, $transaction, обработку Prisma-специфичных ошибок (P2002, P2025). Дополняет наш запрет на raw SQL.

**Что не покрывает:** Наши naming conventions (snake_case mapping) — см. `.cursor/rules/prisma-patterns.md`.

---

## 6. Docker & Docker Compose

**Файл:** `.cursor/rules/marketplace/marketplace-docker-best-practices.md`
**Источник:** [awesome-cursorrules / docker-best-practices](https://github.com/PatrickJS/awesome-cursorrules) (адаптировано)

**Зачем:** Signal Lab целиком запускается в Docker Compose. Rule предотвращает типичные ошибки: hardcoded secrets в compose, `depends_on` без health check, анонимные volumes, тег `latest`.

**Что не покрывает:** Наша конкретная топология сервисов — см. `docker-compose.yml` и `infra/`.

---

## 7. PostgreSQL Table Design

**Файл:** `.cursor/rules/marketplace/marketplace-postgresql-table-design.md`
**Источник:** [awesome-cursorrules / postgresql-table-design](https://github.com/PatrickJS/awesome-cursorrules) (адаптировано)

**Зачем:** Покрывает PostgreSQL-уровень: выбор типов данных (`TIMESTAMPTZ` вместо `TIMESTAMP`, `JSONB` вместо `JSON`), стратегию индексирования, cursor-based pagination. Важно для решений, которые Prisma не диктует.

**Что не покрывает:** Prisma-синтаксис schema.prisma — см. `.cursor/skills/prisma-schema/SKILL.md`.

---

## Почему custom skills закрывают то, чего нет в marketplace

| Тема | Marketplace покрывает | Custom skill добавляет |
|------|----------------------|----------------------|
| Observability | Нет аналога | `.cursor/skills/observability/` — Signal Lab Prometheus + Loki + Sentry |
| NestJS endpoint | Общая архитектура | `.cursor/skills/nestjs-endpoint/` — полный scaffold с observability |
| Prisma workflow | Query patterns | `.cursor/skills/prisma-schema/` — миграционный цикл + naming conventions |
