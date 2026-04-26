# Frontend Patterns

## Scope
All Next.js frontend code in `apps/frontend/`. These patterns ensure predictable, consistent UI development.

---

## Server State — TanStack Query

### Rule: ALL server data fetched via TanStack Query

```typescript
// ✅ Correct — use useQuery for GET, useMutation for writes
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys — always use arrays, document the shape
const QUERY_KEYS = {
  scenarios: ['scenarios'] as const,
  scenario: (id: string) => ['scenarios', id] as const,
};

function useScenarios() {
  return useQuery({
    queryKey: QUERY_KEYS.scenarios,
    queryFn: () => fetch('/api/scenarios').then(r => r.json()),
    staleTime: 10_000,
  });
}
```

```typescript
// ❌ NEVER — raw useEffect for data fetching
useEffect(() => {
  fetch('/api/scenarios').then(...);
}, []);
```

### Mutation pattern
```typescript
function useRunScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RunScenarioDto) =>
      fetch('/api/scenarios/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scenarios });
    },
  });
}
```

---

## Forms — React Hook Form + Zod

### Rule: ALL forms use RHF + Zod, NO uncontrolled inputs

```typescript
// ✅ Correct
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  type: z.enum(['success', 'error', 'teapot', 'system_error']),
  name: z.string().min(1).max(100),
});

type FormData = z.infer<typeof schema>;

function ScenarioForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  // ...
}
```

```typescript
// ❌ NEVER — raw useState for form fields
const [type, setType] = useState('');
```

---

## UI Components — shadcn/ui

### Rule: Use shadcn/ui for ALL UI primitives

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

```typescript
// ❌ NEVER — custom button/input/card HTML elements for interactive UI
<button className="bg-blue-500 ...">Click</button>
<input type="text" className="border ..." />
```

### Adding new shadcn components
```bash
npx shadcn@latest add <component-name>
```
Do NOT copy-paste shadcn source code manually.

---

## Component Conventions

### File naming
- Pages: `app/<route>/page.tsx`
- Components: `components/<feature>/<ComponentName>.tsx` (PascalCase)
- Hooks: `hooks/use<HookName>.ts` (camelCase with `use` prefix)

### Component structure (order within file)
1. Imports
2. Types / interfaces
3. Constants
4. Component function
5. Subcomponents (if small and tightly coupled)

### No prop drilling beyond 2 levels
- Use TanStack Query as shared server state.
- Use React Context for UI-only shared state (theme, modal state).
- NEVER add Redux or Zustand.

---

## Styling Rules
- Use Tailwind CSS utility classes exclusively.
- No inline `style={{}}` except for dynamic values that cannot be expressed in Tailwind.
- No new `.css` or `.module.css` files — use `globals.css` for true global overrides only.
- Use `cn()` helper from `@/lib/utils` to merge conditional classes.

---

## Checklist for new frontend feature
- [ ] Data fetching via `useQuery` / `useMutation`
- [ ] Form uses `useForm` + `zodResolver`
- [ ] UI components from shadcn/ui
- [ ] No new CSS files
- [ ] Loading and error states handled
