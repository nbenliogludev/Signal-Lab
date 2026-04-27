# Signal Lab - PRD 002 Observability Demo

Signal Lab is a small fullstack observability playground. The UI runs scenario flows against a NestJS backend, persists every run in PostgreSQL through Prisma, and emits metrics, structured logs, and Sentry-ready exceptions.

This branch implements PRD 002 (Observability Demo), PRD 003 (Cursor AI Layer), and PRD 004 (orchestrator skill + `/run-prd` command) as documented under **Cursor AI Layer** below.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, TanStack Query, React Hook Form
- Backend: NestJS with strict TypeScript
- Database: PostgreSQL 16 with Prisma
- Observability: Prometheus, Grafana, Loki, Promtail, Sentry SDK
- Infra: Docker Compose

## Repository Layout

```text
signal-lab/
  apps/
    frontend/
    backend/
  prisma/
    schema.prisma
    migrations/
  infra/
    prometheus/
    grafana/
    loki/
    promtail/
  docker-compose.yml
  .env.example
  README.md
```

## Prerequisites

- Docker
- Docker Compose
- Node.js 20+ only if running the apps outside Docker

## Environment

Docker Compose includes safe defaults. To customize values, copy the example file:

```bash
cp .env.example .env
```

Expected variables:

```bash
POSTGRES_PORT=5432
POSTGRES_USER=signal_lab
POSTGRES_PASSWORD=signal_lab_password
POSTGRES_DB=signal_lab
DATABASE_URL=postgresql://signal_lab:signal_lab_password@postgres:5432/signal_lab?schema=public
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
LOG_FILE_PATH=/var/log/signal-lab/backend.log
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=development
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

The Sentry DSN in `.env.example` is a placeholder. Replace it with a real DSN to verify remote Sentry events.

## Start

From the repository root:

```bash
docker compose up -d
```

This starts:

- frontend at `http://localhost:3000`
- backend at `http://localhost:3001`
- PostgreSQL 16 at `localhost:5432`
- Prometheus at `http://localhost:9090`
- Grafana at `http://localhost:3100`
- Loki at `http://localhost:3102`
- Promtail for backend log shipping

The backend container runs Prisma generate and migration deploy during startup.

## Verify Backend

Health:

```bash
curl http://localhost:3001/api/health
```

Metrics:

```bash
curl http://localhost:3001/metrics
```

Swagger:

- `http://localhost:3001/api/docs`

## Scenario API Checks

Success:

```bash
curl -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"success","name":"README success"}'
```

Validation error:

```bash
curl -i -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"validation_error","name":"README validation"}'
```

System error:

```bash
curl -i -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"system_error","name":"README system"}'
```

Slow request:

```bash
curl -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"slow_request","name":"README slow"}'
```

Bonus teapot:

```bash
curl -i -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"teapot","name":"README teapot"}'
```

Recent runs:

```bash
curl http://localhost:3001/api/scenarios
```

## Frontend

Open:

- `http://localhost:3000`

The UI includes:

- backend health card
- scenario runner with Select, Input, Button, RHF, TanStack Query mutation, loading state, and toast feedback
- run history with auto-refresh and colored badges
- observability links for Grafana, Prometheus metrics, Loki, and Sentry

## Observability

Prometheus metrics:

- `http://localhost:3001/metrics`
- `http://localhost:9090`

Expected metric names:

- `scenario_runs_total`
- `scenario_run_duration_seconds`
- `http_requests_total`

Grafana:

- `http://localhost:3100`
- default login: `admin` / `admin`
- dashboard: `http://localhost:3100/d/signal-lab-observability/signal-lab-observability`

Loki logs in Grafana Explore:

```text
{app="signal-lab"}
```

Useful filtered query:

```text
{app="signal-lab", scenarioType="system_error"}
```

Sentry:

- Set `SENTRY_DSN` to a real project DSN.
- Run `system_error`.
- Check the configured Sentry project for the captured exception.

## Verification Walkthrough

1. Start the stack:

```bash
docker compose up -d
```

2. Open `http://localhost:3000`.
3. Run `success` and confirm a green `completed` badge in history.
4. Run `system_error` and confirm an error toast plus a red `error` badge in history.
5. Open `http://localhost:3001/metrics` and confirm `scenario_runs_total`.
6. Open Grafana at `http://localhost:3100`.
7. Open the Signal Lab dashboard and confirm runs, latency, and error panels.
8. In Grafana Explore, select Loki and run `{app="signal-lab"}`.
9. If a real Sentry DSN is configured, confirm the `system_error` event in Sentry.

## Logs

If something fails, inspect the relevant service logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
docker compose logs prometheus
docker compose logs grafana
docker compose logs loki
docker compose logs promtail
```

## Stop

```bash
docker compose down
```

Reset containers and volumes:

```bash
docker compose down -v
```

## Prisma

The backend applies migrations automatically on container startup.

If running locally outside Docker from `apps/backend`, use:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
```

The Prisma schema lives at `prisma/schema.prisma`.

## Local Development Outside Docker

Backend:

```bash
cd apps/backend
npm install
npm run start:dev
```

Frontend:

```bash
cd apps/frontend
npm install
npm run dev
```

For local backend development outside Docker, point `DATABASE_URL` at a running PostgreSQL database.

## If Port 5432 Is Busy

The default host port is `5432`, matching the PRD requirement. If your machine already has PostgreSQL running, override only the host port:

```bash
POSTGRES_PORT=5433 docker compose up -d
```

## Cursor AI Layer (PRD 003)

This project has been transformed into a fully context-aware workspace for the Cursor AI Agent. The AI layer provides guardrails and automated workflows to maintain project standards.

### 1. Rules (`.cursor/rules/*.mdc`)
Rules are strictly enforced constraints loaded automatically by Cursor for all chats:
- **`stack-constraints.mdc`**: Explicit lists of allowed (Next.js, Prisma, shadcn) and forbidden (Redux, TypeORM) libraries.
- **`observability-conventions.mdc`**: Mandatory naming for Prometheus metrics, Loki log formats, and Sentry rules.
- **`prisma-patterns.mdc`**: Restricts direct SQL and defines standard migration steps.
- **`frontend-patterns.mdc`**: Enforces TanStack Query for server state and React Hook Form + Zod for validation.
- **`error-handling.mdc`**: Enforces NestJS built-in exceptions and global filters, forbidding silent error swallowing.

### 2. Custom Skills (`.cursor/skills/`)
Reusable runbooks for the agent (read `SKILL.md` in each folder):
- **`observability`**: Wire **MetricsService**, **AppLoggerService**, and **SentryService** plus module import patterns used by the backend.
- **`nestjs-endpoint`**: NestJS feature slice aligned with **`ObservabilityModule`** and the scenarios reference implementation.
- **`prisma-schema`**: Safe Prisma schema edits and the migrate → generate → typecheck cycle.
- **`signal-lab-orchestrator`**: PRD 004 pipeline — `.execution/<executionId>/context.json`, phased work through **report**, resume, and subagent prompts (`COORDINATION.md`).

### 3. Commands (`.cursor/commands/`)
Slash commands (markdown prompts the agent executes):
- **`/health-check`**: Docker Compose status, curls, metrics scrape hints, Grafana/Loki checks.
- **`/check-obs`**: Read-only checklist against `MetricsService` / `AppLoggerService` / `SentryService` usage for a file or route.
- **`/add-endpoint`**: Scaffold a NestJS endpoint using the observability services pattern.
- **`/run-prd`**: Runs the PRD 004 orchestrator protocol — loads `.cursor/skills/signal-lab-orchestrator/SKILL.md` and the shared `context.json` contract.

### 4. Hook playbooks (`.cursor/hooks/`)
Markdown **playbooks** the agent (or developer) follows manually; **they do not auto-execute** in this repo (no `hooks.json`). Each file states which workflow it applies to and which mistakes it prevents:
- **`after-new-endpoint.md`**: Metrics, structured logs, Sentry, DTO validation after route work.
- **`after-prisma-schema-change.md`**: Migration + `prisma generate` + compile after `schema.prisma` edits.
- **`before-commit.md`**: Secret patterns, `.env` staging, `console.log`, TODO scan, typecheck reminders.

### 5. Marketplace skills (`.cursor/marketplace-skills.md`)
**Recommended** third-party Cursor marketplace skills for Next.js, NestJS, Prisma, Docker, and PostgreSQL. They are **not** vendored as files here; the doc explains intent only. Installation is via **your** Cursor settings — the repo cannot verify what is enabled.
