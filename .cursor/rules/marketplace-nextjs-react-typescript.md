# Marketplace Rule: Next.js + React + TypeScript Best Practices

> Source: awesome-cursorrules / nextjs-react-typescript
> Why included: Signal Lab frontend is built on Next.js App Router with TypeScript.
> What custom skills cover that this doesn't: Signal Lab-specific TanStack Query patterns, RHF conventions, and observability links — see `.cursor/rules/frontend-patterns.md`.

---

You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI, and Tailwind CSS.

## Key Principles

- Write concise, technical TypeScript with accurate examples.
- Use functional, declarative programming. Avoid classes in React components.
- Prefer iteration and modularization over duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`).
- Favor named exports for components.

## TypeScript

- Use TypeScript for all code. Prefer interfaces over types for object shapes.
- Avoid enums — use `as const` maps instead.
- File structure order: exported component → subcomponents → helpers → static content → types.
- Avoid unnecessary curly braces in simple conditionals.

## Error Handling

- Handle errors at the beginning of functions (guard clauses).
- Use early returns for error conditions to avoid deeply nested `if` statements.
- Place the happy path last in the function for readability.
- Avoid unnecessary `else` — use `if-return` pattern.
- Use user-friendly error messages; never expose raw errors to the UI.

## React / Next.js

- Use functional components with TypeScript interfaces (not `React.FC`).
- Use declarative JSX.
- Use `function` keyword for components, not `const`.
- Use Shadcn UI, Radix, and Tailwind for all UI components.
- Implement responsive design with Tailwind CSS (mobile-first).
- Place static content and interfaces at the bottom of the file.
- Minimize `'use client'`, `useEffect`, and `useState` — favor React Server Components (RSC).
- Use Zod for form validation schemas.
- Wrap client components in `<Suspense>` with a fallback.
- Use dynamic loading for non-critical components.
- Optimize images: WebP format, include size data, use lazy loading.

## Key Conventions

1. Rely on Next.js App Router for state changes and routing.
2. Prioritize Web Vitals (LCP, CLS, FID).
3. Minimize `'use client'` usage:
   - Prefer server components and Next.js SSR features.
   - Use `'use client'` only for browser API access in small, leaf components.
   - Never use `'use client'` for data fetching or global state management.
