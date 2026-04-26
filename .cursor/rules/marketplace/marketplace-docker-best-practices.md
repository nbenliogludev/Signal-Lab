# Marketplace Rule: Docker & Docker Compose Best Practices

> Source: awesome-cursorrules / docker-best-practices (adapted)
> Why included: Signal Lab runs entirely in Docker Compose. Correct Dockerfile and compose patterns prevent common issues with layer caching, secrets, and service dependencies.
> What custom skills cover that this doesn't: Signal Lab-specific service topology and monitoring stack — see `docker-compose.yml` and `infra/` directory.

---

You are an expert in Docker, Docker Compose, and containerized application deployment.

## Dockerfile Best Practices

### Multi-stage builds (mandatory for Node.js)
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner (smallest possible image)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Layer caching — copy dependencies before source
```dockerfile
# ✅ Copy package.json first — only reinstalls when dependencies change
COPY package*.json ./
RUN npm ci

# Then copy source — cache miss only when source changes
COPY . .
RUN npm run build
```

### Security
- Use `node:alpine` images — smaller attack surface.
- Run as non-root user:
  ```dockerfile
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser
  ```
- Never `COPY . .` before installing dependencies.
- Never store secrets in Dockerfile — use environment variables.
- Never use `latest` tag — pin to a specific version.

## Docker Compose Best Practices

### Service health checks
```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Dependency ordering with health checks
```yaml
services:
  backend:
    depends_on:
      postgres:
        condition: service_healthy  # ✅ Wait for healthy, not just started
      # ❌ Never: depends_on: postgres (only waits for container start, not DB ready)
```

### Environment variables
```yaml
# ✅ Use .env file for secrets
env_file:
  - .env

# ✅ Or reference individual vars
environment:
  - NODE_ENV=production
  - DATABASE_URL=${DATABASE_URL}

# ❌ Never hardcode secrets in docker-compose.yml
environment:
  - DATABASE_URL=postgres://user:password@localhost/db
```

### Named volumes (not anonymous)
```yaml
volumes:
  postgres_data:    # ✅ Named — survives compose down
  # ❌ Anonymous volumes get deleted with compose down -v
```

### Resource limits (production)
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '0.5'
```

## Common Issues

| Problem | Fix |
|---------|-----|
| Service starts before DB is ready | Use `healthcheck` + `condition: service_healthy` |
| Container can't reach another service | Use service name as hostname (e.g., `postgres:5432`) |
| Changes not reflected after rebuild | `docker compose up --build` |
| Old data persisting | `docker compose down -v` to remove volumes |
| Port conflict | Check `lsof -i :<port>` on host |
