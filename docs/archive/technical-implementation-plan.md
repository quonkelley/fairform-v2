# **⚙️ FairForm – Technical Implementation Plan**

**Phase:** 1 MVP – “Legal GPS”  
 **Version:** 1.0  **Date:** October 2025  
 **Owner:** Shaquon K.  **Tech Lead:** TBA

---

## **1\) Architecture Overview**

**Goal:** Ship a secure, accessible, mobile-first MVP with minimal DevOps, while preserving a clean path to a relational backend later (Supabase).

Client (Next.js 14, React 18, TS)  
  ├─ UI: Tailwind \+ shadcn/ui  
  ├─ State: React Query \+ Context (light)  
  ├─ Routing: App Router (/app)  
  ├─ Analytics: PostHog  
  └─ A11y: WCAG AA patterns

Backend (Serverless)  
  ├─ Auth: Firebase Auth (email/password)  
  ├─ DB: Firestore  
  ├─ Files: Firebase Storage (future)  
  ├─ Functions: Firebase Cloud Functions (Node 20\)  
  └─ Notifications: Resend (email), Twilio (SMS)

Infra  
  ├─ Hosting: Vercel (preview \+ prod)  
  ├─ CI/CD: GitHub Actions → Vercel  
  └─ Secrets: Vercel env \+ GitHub OIDC

**Migration path:** Phase 2 moves `Auth/DB` to **Supabase (Postgres)** behind repository interfaces to limit refactor scope.

---

## **2\) Repository Structure**

fairform/  
├─ app/                     \# Next.js App Router  
│  ├─ (auth)/login/page.tsx  
│  ├─ (auth)/signup/page.tsx  
│  ├─ dashboard/page.tsx  
│  ├─ case/\[id\]/page.tsx  
│  └─ api/                  \# Route handlers (server)  
│     ├─ cases/route.ts     \# POST create case, GET list  
│     ├─ cases/\[id\]/steps/route.ts  
│     ├─ steps/\[id\]/complete/route.ts  
│     └─ reminders/route.ts  
├─ components/  
│  ├─ ui/                   \# shadcn components  
│  ├─ cards/  
│  ├─ stepper/  
│  └─ glossary/  
├─ lib/  
│  ├─ firebase.ts           \# SDK init  
│  ├─ db/                   \# repository interfaces  
│  │  ├─ casesRepo.ts  
│  │  ├─ stepsRepo.ts  
│  │  └─ glossaryRepo.ts  
│  ├─ auth/  
│  │  └─ guard.ts           \# route protection  
│  ├─ notifications/  
│  │  ├─ email.ts  
│  │  └─ sms.ts  
│  ├─ a11y.ts  
│  └─ validation.ts         \# Zod schemas  
├─ styles/                   \# Tailwind  
├─ functions/                \# Firebase Functions  
│  ├─ index.ts  
│  └─ reminders.ts  
├─ tests/                    \# Vitest \+ Testing Library  
├─ public/  
├─ .github/workflows/  
│  └─ ci.yml  
├─ .env.example  
├─ tailwind.config.ts  
├─ posthog.ts  
├─ package.json  
└─ README.md

---

## **3\) Environment Variables**

**`.env.example`**

\# Firebase  
NEXT\_PUBLIC\_FIREBASE\_API\_KEY=  
NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN=  
NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID=  
NEXT\_PUBLIC\_FIREBASE\_STORAGE\_BUCKET=  
NEXT\_PUBLIC\_FIREBASE\_MESSAGING\_SENDER\_ID=  
NEXT\_PUBLIC\_FIREBASE\_APP\_ID=

\# Notifications  
RESEND\_API\_KEY=  
TWILIO\_ACCOUNT\_SID=  
TWILIO\_AUTH\_TOKEN=  
TWILIO\_FROM\_NUMBER=

\# Analytics  
NEXT\_PUBLIC\_POSTHOG\_KEY=  
NEXT\_PUBLIC\_POSTHOG\_HOST=https://us.i.posthog.com

\# App  
NEXT\_PUBLIC\_APP\_ENV=staging

Secrets live in **Vercel Project → Settings → Environment Variables**. Never commit real keys.

---

## **4\) Data Model (MVP)**

**Collections (Firestore):**

* `users/{userId}`

* `cases/{caseId}` with `userId`, `caseType`, `jurisdiction`, `status`, `createdAt`

* `caseSteps/{stepId}` with `caseId`, `name`, `order`, `dueDate`, `isComplete`

* `glossary/{termId}` with `term`, `definition`, `jurisdiction`, `lastReviewed`

* `reminders/{reminderId}` with `userId`, `caseId`, `dueDate`, `message`, `sent`

**Indexes:**

* `caseSteps` composite: `caseId` ASC, `order` ASC

* `cases` single field: `userId` ASC

---

## **5\) Firestore Security Rules (MVP)**

rules\_version \= '2';  
service cloud.firestore {  
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth \!= null; }  
    function isOwner(userId) { return isSignedIn() && request.auth.uid \== userId; }

    match /users/{userId} {  
      allow read, write: if isOwner(userId);  
    }

    match /cases/{caseId} {  
      allow create: if isSignedIn();  
      allow read, update, delete: if isSignedIn() && resource.data.userId \== request.auth.uid;  
    }

    match /caseSteps/{stepId} {  
      allow read, update: if isSignedIn() && get(/databases/$(database)/documents/caseSteps/$(stepId)).data.caseId in  
        \[c.id for c in get(/databases/$(database)/documents/cases)  
          .where('userId', '==', request.auth.uid)\];  
      allow create: if isSignedIn();  
      allow delete: if false; // no deletes in MVP  
    }

    match /glossary/{termId} {  
      allow read: if true;  
      allow write: if false; // admin-only (future)  
    }

    match /reminders/{reminderId} {  
      allow create: if isSignedIn() && request.resource.data.userId \== request.auth.uid;  
      allow read: if isSignedIn() && resource.data.userId \== request.auth.uid;  
      allow update, delete: if false; // managed by Cloud Function  
    }  
  }  
}

Note: Firestore queries can’t easily filter across collections in rules. For MVP, repository layer must ensure ownership checks when writing steps. Keep step writes limited to case owners.

---

## **6\) API Route Contracts (Next.js Route Handlers)**

**`POST /api/cases`** – create case  
 Request body:

{ "caseType": "eviction", "jurisdiction": "marion\_in" }

Response: `201 { caseId }`

**`GET /api/cases`** – list user cases  
 Response: `200 [{ caseId, caseType, status, progressPct, createdAt }]`

**`GET /api/cases/:id/steps`** – list steps  
 Response: `200 [{ stepId, name, order, isComplete, dueDate }]`

**`PATCH /api/steps/:id/complete`** – mark complete  
 Response: `200 { success: true }`

**`POST /api/reminders`** – schedule reminder  
 Request body:

{ "caseId": "abc", "dueDate": "2025-12-10", "channel": "sms|email" }

Response: `201 { reminderId }`

**Error shape (all endpoints):**

{ "error": { "code": "BAD\_REQUEST|UNAUTHORIZED|NOT\_FOUND|INTERNAL", "message": "..." } }

---

## **7\) Cloud Functions (Server-Side Automations)**

**`functions/reminders.ts`**

* CRON (every 15 mins) fetches `reminders` where `sent=false AND dueDate - now <= threshold`

* Sends via **Twilio** (SMS) or **Resend** (email)

* Idempotent (mark `sent=true` on success; exponential backoff on fail)

* Logs structured events for monitoring

**`functions/index.ts`**

export { scheduleDueReminders } from './reminders';  
// future: webhook handlers, nightly cleanup, anonymized metrics export

**Deployment:** `firebase deploy --only functions`

---

## **8\) UI Implementation Notes**

* **Auth Guard:** Next.js middleware redirects unauthenticated users to `/login`.

* **Journey Map:** `Stepper` component receives steps from `useCaseSteps(caseId)` (React Query).

* **Inline Glossary:** parse step content; wrap matched terms in `<GlossaryTooltip term="..."/>`.

* **A11y:** All actionable icons have `aria-label`; modals trap focus; tooltips close on `Esc`.

* **Performance:**

  * Image-less MVP, CSS only.

  * Avoid N+1 reads — batch with `getDocs(query(...))`.

  * Cache lists with React Query; revalidate on focus.

---

## **9\) Validation & Types**

* **TypeScript everywhere** (strict mode)

* **Zod** for request/response validation at API boundaries

* **Repository layer** (lib/db/\*.ts) centralizes Firestore queries; do not call SDK directly in components.

---

## **10\) Analytics & Events (PostHog)**

Initialize in `posthog.ts`, load in `layout.tsx`.

**Core events:**

* `auth_signed_up`

* `case_created` ({ caseType, jurisdiction })

* `step_completed` ({ caseId, stepId, order })

* `reminder_scheduled` ({ channel })

* `glossary_viewed` ({ term })

Respect DNT and add a settings toggle: “Help improve FairForm (anonymous analytics).”

---

## **11\) Testing**

**Unit:** Vitest  
 **Component:** React Testing Library  
 **E2E (optional MVP):** Playwright

Minimum coverage targets:

* Repos: 80%

* API routes: 70%

* Critical UI (Stepper, Glossary): snapshot \+ interaction tests

---

## **12\) CI/CD**

**GitHub Actions (`.github/workflows/ci.yml`):**

* PNPM install → typecheck → lint → test

* On `main`: deploy to Vercel `production`

* On PR: deploy preview to Vercel

Branch protections:

* Require passing checks

* Require review before merge

---

## **13\) Accessibility (WCAG 2.1 AA) Checklist**

* Color contrast ≥ 4.5:1

* Keyboard navigation for all flows

* `aria-*` roles for tooltips, dialogs, alerts

* Error messages: color \+ text, linked with `aria-describedby`

* Focus ring visible (accent yellow)

* Screen reader pass on: Login, Dashboard, Case, Step Modal

---

## **14\) Content & Compliance**

* **Global disclaimer bar:** “FairForm offers educational guidance, not legal advice.”

* **Terms & Privacy:** linked in footer and onboarding.

* **PII:** stored only in Auth and minimal profile; no sensitive docs in MVP.

* **Retention:** MVP retains data for pilot duration; deletion on user request.

* **Logging:** Store only technical logs in Functions; no content payloads.

---

## **15\) Performance Budgets**

* LCP ≤ 2.5s on 3G / mid-tier mobile

* JS bundle (initial route) ≤ 250KB gzip

* API latency (serverless) p95 ≤ 500ms

* Tooltip open ≤ 100ms

* Step complete → progress update ≤ 300ms

---

## **16\) Feature Flags (simple, file-based for MVP)**

`lib/flags.ts`

export const flags \= {  
  dayInCourt: true,  
  glossaryAdmin: false,  
  // scaffolds for Phase 1.5  
  smartIntake: false,  
  documentReadiness: false,  
};

Use flags to ship dark code paths safely.

---

## **17\) Phase 1.5 Scaffolding (Future Hooks, No UI Exposure)**

* `lib/intake/` – placeholder classifier interface

* `lib/forms/` – field maps & validators for “Document Readiness”

* `lib/evidence/` – checklist generators by `caseType`

Keep behind flags; include unit tests to stabilize contracts.

---

## **18\) Supabase Migration Plan (High-Level)**

**Why:** relational data, partner integrations, exportability.

**Abstractions now:**

* Repositories: `casesRepo`, `stepsRepo`, `glossaryRepo`

* DTO types & Zod schemas at boundaries

* No component reaches Firestore APIs directly

**Migration steps (Phase 2):**

1. Create Supabase schemas (users, cases, steps, reminders, glossary)

2. Implement new repos with Supabase client

3. Run migration script to port Firestore data → Postgres

4. Flip env flag `DB_VENDOR=supabase` and A/B test on staging

5. Decommission Firestore reads after validation

---

## **19\) Monitoring & Ops**

* **Runtime errors:** Vercel \+ console forwarding; (optional) Sentry next

* **Function logs:** `firebase functions:log` \+ Vercel logs

* **Health checks:** Add `/api/health` returning `{ ok: true }`

* **Incident playbook:** Roll back via Vercel “Promote previous build”

---

## **20\) Developer Onboarding (README excerpt)**

1. `pnpm i`

2. Copy `.env.example` → `.env.local` and fill keys

3. `pnpm dev` (runs Next.js locally)

4. Login flow → create test case → complete a step

5. Run tests: `pnpm test`

6. Deploy PR → verify preview on Vercel

---

## **21\) Milestones (Tech)**

* **T0:** Repo \+ CI \+ env wired

* **T1:** Auth \+ Dashboard vertical slice

* **T2:** Case Journey \+ Steps \+ Glossary

* **T3:** Notifications (email/SMS) \+ CRON

* **T4:** A11y audit \+ perf pass \+ beta tag

---

## **22\) Open Questions / Assumptions**

* Initial case types: **Eviction, Small Claims** (confirm)

* Pilot jurisdiction: **Marion County, IN** (confirmed in PRD)

* Deadline logic: static seed (MVP) vs dynamic calc (later)

* Document uploads: **deferred** to Phase 1.5

---

### **✅ Definition of “Tech Done” (MVP)**

* All endpoints implemented and validated

* Firestore rules enforce ownership

* Journey Map works end-to-end

* Inline glossary accessible and performant

* Reminders fire via functions on schedule

* CI/CD green; a11y and perf budgets met

---

This document gives Cursor \+ Codex (and your developers) everything needed to stand up the MVP swiftly and sanely — while keeping future migration and scale in mind.

Want me to generate a **starter `/docs/05_AI_Guide.md` \+ `/docs/06_Compliance.md`** next so the repo is fully handoff-ready?

