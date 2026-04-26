# Observability Conventions

## Scope
All NestJS backend code that produces metrics, logs, or errors. Every new endpoint MUST implement all three signals.

---

## Metrics (Prometheus via `prom-client`)

### Naming convention
```
signal_lab_<noun>_<unit>_total      # counters
signal_lab_<noun>_<unit>            # gauges
signal_lab_<noun>_<unit>_seconds    # histograms (duration)
```

### Required labels for scenario metrics
```typescript
{ scenario_type: string, status: 'completed' | 'failed' | 'error' }
```

### Mandatory metrics per endpoint
| Metric | Type | When to increment |
|--------|------|-------------------|
| `scenario_runs_total` | Counter | Every scenario execution attempt |
| `scenario_duration_seconds` | Histogram | Duration of each scenario run |
| `http_requests_total` | Counter | Every incoming HTTP request |

### Rules
- NEVER use ad-hoc label values from user input (cardinality explosion risk).
- All counters end in `_total`.
- All duration histograms end in `_seconds`.
- Register metrics in the module's provider, NOT inline in the service.

---

## Structured Logging (Loki-compatible)

### Log format — always JSON
```json
{
  "level": "info",
  "message": "human readable description",
  "context": "ClassName",
  "scenarioId": "uuid",
  "scenarioType": "success",
  "durationMs": 120,
  "timestamp": "2026-04-26T21:00:00.000Z"
}
```

### Log levels
| Level | When to use |
|-------|-------------|
| `error` | Unhandled exceptions, scenario failures, 5xx |
| `warn` | Recoverable issues, degraded state |
| `info` | Scenario started, scenario completed, service lifecycle |
| `debug` | Internal steps — off in production |

### Rules
- NEVER log sensitive data (tokens, passwords, PII).
- ALWAYS include `context` field (NestJS class name).
- For scenario events always include `scenarioId` and `scenarioType`.

---

## Sentry

### When to send to Sentry
| Situation | Action |
|-----------|--------|
| Unhandled exception in any service | `Sentry.captureException(err)` |
| Scenario with `type === "system_error"` | `Sentry.captureException` with scenario context |
| 500-level HTTP response | Captured automatically via NestJS filter |

### When NOT to send to Sentry
- Expected business errors (validation, not found, bad request).
- `teapot` scenario (418 is intentional, not an error).

### Context to always attach
```typescript
Sentry.withScope((scope) => {
  scope.setTag('scenario_type', type);
  scope.setExtra('scenarioId', id);
  scope.captureException(err);
});
```

---

## Checklist for every new endpoint
- [ ] Prometheus counter incremented on each call
- [ ] Prometheus histogram records duration
- [ ] Structured JSON log on start (`info`)
- [ ] Structured JSON log on completion (`info`) or failure (`error`)
- [ ] Sentry capture on unhandled exceptions
