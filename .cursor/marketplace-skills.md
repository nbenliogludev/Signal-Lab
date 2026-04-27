# Marketplace skills (recommended)

These entries are **recommended Cursor Marketplace / community skills** for this stack. They are **not** shipped as files in this repository unless you add them yourself in Cursor Settings. **Repository state alone cannot prove** that any marketplace skill is installed in your Cursor profile.

Use Settings → Rules / Skills / Marketplace (wording depends on Cursor version) to enable skills that match your workflow.

---

## Recommended set (7)

| # | Skill id / name (typical) | Why it fits Signal Lab |
|---|---------------------------|-------------------------|
| 1 | **Next.js + React + TypeScript** | Frontend is Next.js + TypeScript; reduces ad-hoc patterns and `useEffect` misuse. |
| 2 | **Next.js App Router** | App Router layouts, `loading.tsx`, server vs client boundaries. |
| 3 | **shadcn/ui** | UI is shadcn-style components; avoids hand-rolled design systems. |
| 4 | **NestJS best practices** | Backend is NestJS; keeps controllers thin and DI consistent. |
| 5 | **Prisma ORM** | Database access is Prisma; complements repo rule `prisma-patterns.mdc`. |
| 6 | **Docker / Docker Compose** | Runtime is Docker Compose; avoids fragile local-only assumptions. |
| 7 | **PostgreSQL table design** | PostgreSQL types, indexing, and migration-level decisions beyond Prisma syntax. |

---

## What repo-local rules already cover

Signal Lab ships **custom** rules under `.cursor/rules/*.mdc` (stack, observability, Prisma, frontend, errors). Marketplace skills are **optional** extras; they must not contradict those `.mdc` files.

---

## What custom skills add (not replaced by marketplace)

| Topic | Custom path |
|-------|-------------|
| Signal Lab metrics + logs + Sentry wiring | `.cursor/skills/observability/SKILL.md` |
| NestJS endpoint slice + observability services | `.cursor/skills/nestjs-endpoint/SKILL.md` |
| Prisma migration cycle + naming | `.cursor/skills/prisma-schema/SKILL.md` |
