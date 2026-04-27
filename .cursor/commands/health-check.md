# /health-check

Verify the full Signal Lab Docker stack is running and all signals are flowing.

## What to do

Run these checks **in order** and report the status of each. For any failure, include the suggested fix.

---

### 1. Docker services

```bash
docker compose ps
```

Expected: all 7 services are `Up` (or `running`).

| Service | Expected state |
|---------|---------------|
| `postgres` | `Up`, port 5432 |
| `backend` | `Up`, port 3001 |
| `frontend` | `Up`, port 3000 |
| `prometheus` | `Up`, port 9090 |
| `grafana` | `Up`, port 3100 |
| `loki` | `Up`, host port **3102** → container 3100 (see `docker-compose.yml`) |
| `promtail` | `Up` |

**If any service is not Up:** run `docker compose logs <service> --tail 50` and report the error.

---

### 2. Backend health

```bash
curl -s http://localhost:3001/api/health
```

Expected:

```json
{ "status": "ok", "timestamp": "2026-..." }
```

---

### 3. Prometheus metrics

```bash
curl -s http://localhost:3001/metrics | grep scenario_runs_total
```

Expected: at least one line like `scenario_runs_total{...} N`.

---

### 4. Prometheus scraping

Open `http://localhost:9090/targets`

Expected: target `signal-lab-backend` is `UP`.

---

### 5. Grafana dashboard

Open `http://localhost:3100` → login `admin` / `admin`

Expected: **Signal Lab Observability** dashboard exists and shows panels (even if empty).

---

### 6. Loki logs

In Grafana → Explore → Loki, run:

```
{app="signal-lab"}
```

Expected: log entries appear after triggering at least one scenario run.

---

### 7. Frontend

Open `http://localhost:3000`

Expected: Observability Demo UI loads, health status shows `ok`.

---

### 8. End-to-end smoke test

```bash
# Run a success scenario
curl -s -X POST http://localhost:3001/api/scenarios/run \
  -H 'Content-Type: application/json' \
  -d '{"type":"success","name":"health-check smoke"}'

# Confirm it appears in run history
curl -s http://localhost:3001/api/scenarios | python3 -m json.tool | head -20
```

Expected: response contains `"status": "completed"` and the run is listed in history.
