# Marketplace Rule: Next.js App Router Best Practices

> Source: awesome-cursorrules / nextjs-app-router
> Why included: Signal Lab uses Next.js App Router. This rule ensures correct file conventions (layout.js, loading.js, error.js) and routing patterns.
> What custom skills cover that this doesn't: Signal Lab API routes, TanStack Query integration, shadcn-specific UI choices — see `.cursor/rules/frontend-patterns.md`.

---

## Next.js App Router Best Practices

### Core Principles

- Use **server components by default** — only add `'use client'` when you need browser APIs, event listeners, or React hooks.
- Implement client components only when necessary and keep them small (leaf components).
- Utilize the file-based routing system — never manually manage routes.

### Special File Conventions

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared UI that wraps multiple pages — persists across navigations |
| `page.tsx` | Unique UI for a route — makes the route publicly accessible |
| `loading.tsx` | Instant loading UI shown while a page segment loads |
| `error.tsx` | Error UI for a route segment — must be a client component |
| `not-found.tsx` | UI shown when `notFound()` is thrown |
| `route.ts` | API endpoint (replaces `pages/api/`) |

### Folder Structure

```
app/
  layout.tsx          ← root layout (html, body)
  page.tsx            ← home page
  (dashboard)/        ← route group (no URL segment)
    layout.tsx
    page.tsx
  api/
    scenarios/
      route.ts        ← API handler
components/
  ui/                 ← shadcn components
  <feature>/          ← feature-specific components
lib/
  utils.ts
public/
```

### Data Fetching

- Fetch data in **Server Components** by default — no `useEffect`, no `useState`.
- Use `fetch()` with Next.js cache options in server components.
- Use TanStack Query for **client-side** data that needs real-time updates or mutations.
- Never fetch data in layouts — pass data via props or use parallel route segments.

### Additional Rules

1. Use TypeScript strict mode for type safety.
2. Implement proper `<head>` metadata using `generateMetadata()` for SEO.
3. Use `next/image` for all images — never raw `<img>` tags.
4. Use Tailwind CSS for all styling.
5. Implement error boundaries with `error.tsx`.
6. Use environment variables via `process.env` — never hardcode config values.
7. Use `next/font` for font loading — never link external font URLs directly.
