# Source Tree Guide

```
fairform/
├─ app/                          # Next.js App Router
│  ├─ (auth)/login/page.tsx
│  ├─ (auth)/signup/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ case/[id]/page.tsx
│  └─ api/                       # Route handlers (server)
│     ├─ cases/route.ts          # POST create case, GET list
│     ├─ cases/[id]/steps/route.ts
│     ├─ steps/[id]/complete/route.ts
│     └─ reminders/route.ts
├─ components/
│  ├─ ui/                        # shadcn-generated primitives
│  ├─ cards/
│  ├─ layouts/
│  └─ glossary/
├─ lib/
│  ├─ firebase.ts                # Firebase SDK init
│  ├─ db/                        # Repository interfaces
│  │  ├─ casesRepo.ts
│  │  ├─ stepsRepo.ts
│  │  └─ glossaryRepo.ts
│  ├─ auth/
│  │  └─ guard.ts                # Route protection
│  ├─ notifications/
│  │  ├─ email.ts
│  │  └─ sms.ts
│  ├─ validation.ts              # Zod schemas
│  └─ deps.ts                    # Central export for third-party libs
├─ styles/                       # Tailwind base styles
├─ functions/                    # Firebase Cloud Functions
│  ├─ index.ts
│  └─ reminders.ts
├─ tests/                        # Vitest + RTL suites
├─ public/
├─ .github/workflows/
│  └─ ci.yml                     # Lint, test, deploy pipeline
├─ .env.example
├─ tailwind.config.ts
├─ posthog.ts
└─ README.md
```

## Conventions

- Mirror UI feature folders between `app/` and `components/` where possible.
- Keep repository implementations in `lib/db`; UI files import through service functions, not Firestore SDK.
- Shared constants live in `lib/constants.ts`.
- Story files (BMAD) reside in `docs/stories/`.
- QA outputs will live under `docs/qa/` per BMAD configuration.

## File Naming

- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Tests: `*.test.ts(x)` to align with Vitest discovery.
- CSS utilities belong in Tailwind config or scoped modules.
