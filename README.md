# LayerStack — B2B Multi-Tenant SaaS Dashboard

A production-grade, multi-tenant B2B SaaS dashboard built from [`ai_prompt_requirements_checklist.md`](ai_prompt_requirements_checklist.md):
Next.js App Router + TypeScript + Tailwind CSS + shadcn UI, PostgreSQL + Prisma, role-based access
control, plan gating, and Stripe billing (with a demo-mode fallback so everything runs without API keys).

## Quick start

```bash
# 1. Environment (Postgres must be running — Homebrew postgresql@14 in this repo's dev setup)
cp .env.example .env          # then set AUTH_SECRET: openssl rand -hex 32
createdb layerstack           # if the database doesn't exist yet

# 2. Install, migrate, seed
npm install
npm run db:migrate            # prisma migrate dev
npm run db:seed               # demo data

# 3. Run
npm run dev                   # http://localhost:3000 (or pass --port <p>)
```

Production build: `npm run build && npm start`.

## Demo accounts

All passwords are `password123`:

| Account | Organization | Plan | Role |
|---|---|---|---|
| `ava@acme.test` | Acme Inc (seeded **at FREE limits**: 3/3 projects, 2/2 members) | Free | OWNER (also MEMBER of Globex) |
| `ben@acme.test` | Acme Inc | Free | ADMIN |
| `cara@globex.test` | Globex Corp | Pro | OWNER |

The sign-in page has one-click demo fill buttons.

## What's implemented

- **Multi-tenancy** — every Project/Invitation/Activity belongs to an `Organization`; the active
  org lives in a cookie and every server action is scoped to it (cross-org access is impossible).
- **RBAC** — `OWNER` / `ADMIN` / `MEMBER` enforced in the UI *and* re-checked in every server
  action (members see lock icons/disabled controls; admins can't manage owners; you can't
  demote/remove the last owner or remove yourself).
- **Plan gating** — FREE: 3 projects, 2 members. PRO ($29/mo): unlimited projects, 10 members.
  Hitting a limit returns `PLAN_LIMIT` and opens the polished **Upgrade to Pro** modal.
- **Pages** — `/` landing (features + pricing), `/sign-in`, `/sign-up`, `/dashboard` (KPI cards,
  interactive Recharts activity chart with metric/range toggles, activity feed),
  `/dashboard/projects` (grid, Zod-validated creation dialog, status menu, delete confirm),
  `/dashboard/team` (member table, invite dialog, role dropdown, revoke invites),
  `/dashboard/billing` (usage bars, plan card, Stripe Checkout/Portal, downgrade),
  `/dashboard/settings` (org profile, user profile, password). Loading skeletons for every route.
- **Server actions + Zod** for all mutations, with toast notifications and pending states.
- **Stripe** — real Checkout session, Customer Portal and `/api/stripe/webhook`
  (checkout completed → PRO, subscription deleted → FREE). Without keys, billing runs a clearly
  labelled **demo mode**: upgrades/downgrades apply instantly with no charge.

## Stripe setup (optional)

Set in `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO`, `STRIPE_WEBHOOK_SECRET`, then point a
Stripe webhook at `POST /api/stripe/webhook`. See `.env.example`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · shadcn UI (Base UI) ·
Prisma 7 + PostgreSQL (`@prisma/adapter-pg`) · Recharts · Stripe · Zod · Sonner toasts.

## Handy scripts

| Script | Purpose |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | create/apply Prisma migrations |
| `npm run db:seed` | reset & seed demo data |
| `npm run db:studio` | Prisma Studio |
