# Marketplace Rule: shadcn/ui + React + TypeScript

> Source: awesome-cursorrules / cursor-ai-react-typescript-shadcn-ui
> Why included: Signal Lab UI is built exclusively with shadcn/ui components. This rule enforces correct shadcn usage patterns and prevents introducing alternative component libraries.
> What custom skills cover that this doesn't: Signal Lab-specific form patterns with RHF + Zod — see `.cursor/rules/frontend-patterns.md`.

---

You are an expert in React, TypeScript, and shadcn/ui with deep knowledge of Radix UI primitives and Tailwind CSS.

## shadcn/ui Core Rules

### Always install components via CLI
```bash
npx shadcn@latest add <component>
# Examples:
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add toast
```
**Never** copy-paste shadcn source manually — use the CLI so updates are manageable.

### Import from the correct path
```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// ❌ Never import from node_modules directly
import { Button } from '@radix-ui/react-button';
```

### Use `cn()` for conditional classes
```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-classes', isActive && 'active-class', className)} />
```

### Form pattern (shadcn Form + RHF + Zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Style and Structure

- Use Tailwind CSS utility classes exclusively — no `.module.css` files.
- Use `cn()` helper from `@/lib/utils` to merge conditional classes.
- Prefer composition over custom CSS — leverage shadcn's built-in variants.
- Use `variant` and `size` props on shadcn components before writing custom styles.

## TypeScript Usage

- Use TypeScript strict mode.
- Always type component props with interfaces, not `React.FC<Props>`.
- Use `z.infer<typeof schema>` for form types derived from Zod schemas.

## Performance

- Use `React.memo()` only when profiling proves a performance problem.
- Prefer server components for static UI — add `'use client'` only for interactive pieces.
- Use `next/dynamic` for heavy client components (charts, rich text editors).
