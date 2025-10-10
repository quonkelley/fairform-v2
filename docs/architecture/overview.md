# System Overview

**Goal:** Ship a secure, accessible, mobile-first MVP with minimal DevOps overhead while keeping a clear migration path to a relational backend (Supabase) in later phases.

```
Client (Next.js 14, React 18, TypeScript)
 ├─ UI: Tailwind + shadcn/ui
 ├─ State: React Query + lightweight Context
 ├─ Routing: App Router (/app)
 ├─ Analytics: PostHog
 └─ Accessibility: WCAG 2.1 AA patterns

Backend (Serverless)
 ├─ Auth: Firebase Auth (email/password)
 ├─ Database: Firestore
 ├─ Files: Firebase Storage (future phase)
 ├─ Functions: Firebase Cloud Functions (Node 20)
 └─ Notifications: Resend (email) + Twilio (SMS)

Infrastructure
 ├─ Hosting: Vercel (preview + production)
 ├─ CI/CD: GitHub Actions → Vercel
 └─ Secrets: Vercel env variables + GitHub OIDC
```

**Migration path:** Phase 2 moves Auth/DB to Supabase (Postgres) using repository interfaces to minimize refactor scope.

## Architecture Principles

- **Accessibility and empathy first:** Every surface meets WCAG 2.1 AA.
- **Modular and future-proof:** Repositories isolate data access for future Supabase migration.
- **Serverless friendly:** Lean infrastructure and CI/CD via Vercel.
- **Performance conscious:** SSR and Firestore reads optimized for sub‑2s load times.
- **Responsible AI:** No end-user AI in MVP; scaffolding is present but behind flags.

## Key Integrations

- Firebase (Auth, Firestore, optional Storage)
- Resend (email reminders)
- Twilio (SMS reminders)
- PostHog (product analytics)
- GitHub Actions (automation) → Vercel deployments

## Related Documents

- `docs/prd.md` – Product vision and objectives.
- `docs/architecture/tech-stack.md` – Detailed tooling breakdown.
- `docs/architecture/security.md` – Rules, monitors, and compliance posture.
