# Tech Stack

| Layer | Tooling | Notes |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | Server and client components, Route Handlers for APIs |
| Language | TypeScript (strict) | Enable `strict` and incremental builds |
| UI | Tailwind CSS + shadcn/ui | Custom theme tokens defined in `tailwind.config.ts` |
| State | React Query + lightweight Context | Cache Firestore reads, share auth session |
| Forms / Validation | `react-hook-form`, Zod | All form payloads validated client/server |
| Testing | Vitest + React Testing Library | Snapshot + interaction coverage |
| Linting | ESLint + Prettier | Enforce formatting and custom rules |
| Auth | Firebase Auth | Email/password, tokens persisted via cookies |
| Database | Firestore | Collections: `users`, `cases`, `caseSteps`, `glossary`, `reminders` |
| Functions | Firebase Cloud Functions (Node 20) | Scheduled reminders and background jobs |
| Notifications | Resend (email), Twilio (SMS) | Invoked via Cloud Functions |
| Analytics | PostHog | Client event tracking, stored with privacy defaults |
| Hosting | Vercel | Preview deployments per PR |
| CI/CD | GitHub Actions | Run lint, typecheck, tests, then trigger Vercel |

## Environment Variables

Populate `.env.local` from `.env.example`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

NEXT_PUBLIC_APP_ENV=staging
```

Secrets are stored in Vercel environment variables; never commit real credentials. Use GitHub OIDC to grant temporary access for CI jobs.

## Feature Flags

`lib/flags.ts`

```ts
export const flags = {
  dayInCourt: true,
  glossaryAdmin: false,
  smartIntake: false,
  documentReadiness: false,
};
```

Flags gate future-phase work without exposing unfinished functionality.
