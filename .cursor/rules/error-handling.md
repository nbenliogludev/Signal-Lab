# Error Handling

## Scope
All error handling in NestJS backend and Next.js frontend. Consistent error contracts prevent silent failures and help observability.

---

## Backend — NestJS

### HTTP Exceptions — use NestJS built-ins

```typescript
// ✅ Correct — throw typed exceptions, NestJS serializes them
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

// 404
throw new NotFoundException(`Scenario run ${id} not found`);

// 400
throw new BadRequestException('Invalid scenario type');

// 418 (teapot — intentional)
throw new HttpException("I'm a teapot", 418);
```

```typescript
// ❌ NEVER — raw Error, no status, no NestJS serialization
throw new Error('something went wrong');
res.status(500).json({ error: 'oops' });
```

### Global Exception Filter (already implemented — DO NOT remove)

The global filter in `apps/backend/src/common/filters/http-exception.filter.ts`:
- Catches all unhandled errors.
- Logs them as structured JSON at `error` level.
- Sends to Sentry if status >= 500.
- Returns consistent error shape:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2026-04-26T21:00:00.000Z",
  "path": "/api/scenarios/run"
}
```

### Service-level error handling pattern

```typescript
async runScenario(dto: RunScenarioDto): Promise<ScenarioRun> {
  try {
    // ... business logic
    return result;
  } catch (err) {
    this.logger.error('Scenario run failed', {
      error: err.message,
      scenarioType: dto.type,
    });
    // Re-throw NestJS exception — let global filter handle Sentry/logging
    throw new InternalServerErrorException('Scenario execution failed');
  }
}
```

### Rules
- NEVER swallow errors silently (`catch (err) {}`).
- NEVER log an error AND throw — choose one (global filter handles logging for re-thrown exceptions).
- ALWAYS use NestJS HTTP exceptions for controller-layer errors.
- ALWAYS include context (scenarioId, type) in error logs.

---

## Frontend — Next.js

### API call error handling

```typescript
// ✅ Correct — TanStack Query surfaces errors automatically
const { data, error, isLoading } = useQuery({ ... });

if (error) return <ErrorBanner message={error.message} />;
```

### Mutation error handling

```typescript
const mutation = useMutation({
  mutationFn: runScenario,
  onError: (err) => {
    toast.error(`Failed: ${err.message}`);
  },
});
```

### User-facing error messages
| Situation | Message pattern |
|-----------|----------------|
| Network error | "Connection failed. Check your network." |
| 400 Bad Request | Show field-level validation errors from API |
| 404 Not Found | "Not found. It may have been deleted." |
| 500 Server Error | "Something went wrong on our end. Try again." |
| 418 Teapot | "I'm a teapot ☕ — this is intentional!" |

### Rules
- NEVER show raw error objects or stack traces to users.
- ALWAYS handle `isLoading` and `error` states in components that fetch data.
- Use `toast` for transient errors, inline error messages for form validation.

---

## Error Severity Matrix

| Error | Backend log level | Sentry | HTTP status |
|-------|-------------------|--------|-------------|
| Validation error | `warn` | No | 400 |
| Resource not found | `info` | No | 404 |
| Auth failure | `warn` | No | 401/403 |
| Teapot scenario | `info` | No | 418 |
| Business logic failure | `error` | No | 422 |
| Unhandled exception | `error` | **Yes** | 500 |
| External service down | `error` | **Yes** | 503 |
