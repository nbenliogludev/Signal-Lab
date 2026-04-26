# Signal Lab - PRD 001 Platform Foundation

Signal Lab is a small fullstack starter project for scenario runs. This PRD 001 implementation focuses only on the working platform foundation: Next.js frontend, NestJS backend, PostgreSQL 16, Prisma, Docker Compose, Swagger, and a minimal end-to-end flow.

Observability, Cursor artifacts, hooks, commands, and orchestrator work are intentionally left for later PRDs.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, TanStack Query, React Hook Form
- Backend: NestJS with strict TypeScript
- Database: PostgreSQL 16 with Prisma
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
```

## Start

From the repository root:

```bash
docker compose up -d
```

This starts:

- frontend at `http://localhost:3000`
- backend at `http://localhost:3001`
- PostgreSQL 16 at `localhost:5432`

The backend container runs Prisma generate and migration deploy during startup.

## Verify

Backend health:

```bash
curl http://localhost:3001/api/health
```

Expected response shape:

```json
{
  "status": "ok",
  "timestamp": "2026-04-26T12:00:00.000Z"
}
```

Run a scenario:

```bash
curl -X POST http://localhost:3001/api/scenarios/run \
  -H "Content-Type: application/json" \
  -d '{"type":"success","name":"README smoke test"}'
```

List recent runs:

```bash
curl http://localhost:3001/api/scenarios
```

Open the frontend:

- `http://localhost:3000`

Open Swagger:

- `http://localhost:3001/api/docs`

## Logs

If something fails, inspect the relevant service logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

## Stop

```bash
docker compose down
```

Reset containers and database volume:

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

The default host port is `5432`, matching PRD 001. If your machine already has PostgreSQL running, override only the host port:

```bash
POSTGRES_PORT=5433 docker compose up -d
```
