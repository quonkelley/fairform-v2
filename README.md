# **FairForm – Developer Onboarding (README\_DEV)**

**Phase:** 1 MVP – “Legal GPS”  
 **Stack:** Next.js 14 • Tailwind • shadcn/ui • Firebase (Auth/Firestore) • Vercel • Resend • Twilio  
 **Methods:** BMAD • Responsible AI • WCAG 2.1 AA

Start here if you’re a developer (human or AI assistant in Cursor) joining the project.

---

## **1) Quick Links (must read)**

- 📘 **Project Brief:** [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md)
- 🧭 **PRD Overview:** [`docs/prd.md`](./docs/prd.md)
- 📂 **Epics:** [`docs/prd/`](./docs/prd/)
- 🎨 **Design Specification:** [`docs/design-spec.md`](./docs/design-spec.md)
- 🏗️ **Architecture Hub:** [`docs/architecture.md`](./docs/architecture.md)
- 🗂️ **Stories in Progress:** [`docs/stories/`](./docs/stories/)
- 🤖 **AI Dev Guide:** [`docs/05_AI_Guide.md`](./docs/05_AI_Guide.md)
- ⚖️ **Compliance & Ethics:** [`docs/06_Compliance.md`](./docs/06_Compliance.md)

---

## **2\) Getting Started**

### **Prereqs**

* Node 20+, PNPM

* Firebase account (Project ID), Vercel account

* Twilio \+ Resend sandbox creds, PostHog key

### **Install & run**

pnpm i  
cp .env.example .env.local  
\# fill in Firebase, Twilio, Resend, PostHog keys  
pnpm dev

Local app: [http://localhost:3000](http://localhost:3000/)

### **Scripts**

pnpm dev         \# run Next.js locally  
pnpm build       \# production build  
pnpm lint        \# eslint \+ prettier  
pnpm test        \# vitest \+ rtl  
pnpm typecheck   \# tsc \--noEmit

---

## **3\) Environment Variables**

Edit `.env.local` (see details in `docs/architecture/tech-stack.md`):

NEXT\_PUBLIC\_FIREBASE\_API\_KEY=  
NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN=  
NEXT\_PUBLIC\_FIREBASE\_PROJECT\_ID=  
NEXT\_PUBLIC\_FIREBASE\_STORAGE\_BUCKET=  
NEXT\_PUBLIC\_FIREBASE\_MESSAGING\_SENDER\_ID=  
NEXT\_PUBLIC\_FIREBASE\_APP\_ID=

RESEND\_API\_KEY=  
TWILIO\_ACCOUNT\_SID=  
TWILIO\_AUTH\_TOKEN=  
TWILIO\_FROM\_NUMBER=

NEXT\_PUBLIC\_POSTHOG\_KEY=  
NEXT\_PUBLIC\_POSTHOG\_HOST=https://us.i.posthog.com

NEXT\_PUBLIC\_APP\_ENV=staging

Never commit real secrets. Use Vercel project env vars for staging/prod.

---

## **4\) Project Structure (high level)**

app/                \# Next.js App Router (routes \+ API handlers)  
components/         \# UI components (shadcn/ui \+ custom)  
lib/                \# db repos, auth guard, notifications, utils  
functions/          \# Firebase Cloud Functions (reminders, cron)  
docs/               \# PRD, architecture, design spec, stories, AI & compliance  
tests/              \# unit \+ component tests

Repositories in `lib/db/*` abstract Firestore. Do not call SDK directly from components.

---

## **5\) Working in Cursor (with Codex)**

1. **Open context tabs:** `PROJECT_BRIEF.md`, `docs/prd.md`, `docs/prd/epic-1-authentication-system.md`, `docs/architecture/tech-stack.md`, `docs/architecture/coding-standards.md`.

2. **Pick a story** from `docs/stories/` that is marked Ready (or work with the PO/SM to draft one).

3. **Prompt Codex narrowly** (one component or endpoint at a time).

4. **Run locally**, write tests, and open a PR.

**AI guardrails (must follow):** `/docs/05_AI_Guide.md`

* No PII in prompts.

* Add ARIA, keyboard nav, and focus states.

* TypeScript strict, JSDoc for custom hooks.

* Label generated code in header comments.

---

## **6\) Branching, Commits, PRs**

**Branch naming**

feature/\<short-desc\>      \# e.g., feature/case-dashboard  
fix/\<short-desc\>  
chore/\<short-desc\>

**Conventional commits**

feat: add case journey stepper  
fix: correct firestore ownership check  
chore: update deps  
docs: add design spec link

**PR checklist**

* Matches acceptance criteria in the backlog ticket

* Types pass (`pnpm typecheck`)

* Lint pass (`pnpm lint`)

* Tests added/updated (`pnpm test`)

* A11y check (keyboard, focus, contrast)

* No secrets / PII in code or prompts

* Screenshots or short Loom of UX if UI change

---

## **7\) Testing**

* **Unit/Component:** Vitest \+ React Testing Library

* **Targets:**

  * Repos ≥80% coverage

  * API routes ≥70%

  * Critical UI (Stepper, Glossary) snapshot \+ interaction tests

Run:

pnpm test

---

## **8\) Accessibility (must ship AA)**

* Contrast ≥ 4.5:1

* All interactive elements keyboard reachable (`Tab`)

* `aria-label`/roles for tooltips, dialogs, alerts

* Visible focus rings (accent yellow)

* Error states: color \+ text

* Screen-reader pass on Login, Dashboard, Case Details

See `docs/design-spec.md` §9 and `docs/06_Compliance.md`.

---

## **9\) Deploys & Environments**

* PRs → **Vercel Preview**

* `main` → **Production** (Vercel)

* Env vars set per-env in Vercel

**CI:** `.github/workflows/ci.yml` runs typecheck, lint, tests, then deploy.

Rollback via Vercel “Promote previous build”.

---

## **10\) Current Sprint**

See: [`/docs/04_SprintBacklogs/Sprint2_Backlog.md`](https://chatgpt.com/g/g-68c0bfee309c8191898bf526c849e458-bglad/c/docs/04_SprintBacklogs/Sprint2_Backlog.md)

**Sprint Goal:** Interactive Case Journey \+ Inline Glossary

* Journey Stepper component & data wiring

* Step detail modal \+ complete action

* Glossary tooltip parsing \+ mobile tap targets

* Progress sync to Dashboard

---

## **11\) Product & Design Source of Truth**

* Requirements: `docs/prd.md`

* Visuals & components: `docs/design-spec.md`

* Architecture & APIs: `docs/architecture.md`

* Responsible AI & Compliance: `/docs/05_AI_Guide.md`, `/docs/06_Compliance.md`

If a ticket conflicts with these, escalate to the PM (Shaquon) before coding.

---

## **12\) Troubleshooting**

**Firebase “permission-denied”**

* Check Firestore rules; ensure user owns the case/step.

* Confirm Auth state in Next middleware.

**Reminders not sending**

* Verify Function logs: `firebase functions:log`

* Check Twilio/Resend keys and sending quotas.

**Glossary tooltips not appearing**

* Verify text parsing; ensure terms exist in `glossary` collection.

* Check mobile tap targets ≥ 44×44px.

**Performance**

* Watch bundle size (\< 250KB gzip first load).

* Prefer server components where possible; cache with React Query.

---

## **13\) Definition of Done (MVP)**

* Account → Case → Journey → Step complete → Reminder flow works end-to-end

* Inline glossary accessible & performant

* A11y (AA), perf budgets, and analytics events in place

* Compliance copy & disclaimers visible in onboarding \+ footer

* Feature flags in place for Phase 1.5 scaffolds (off by default)

---

## **14\) Contacts**

* **Product Owner:** Shaquon K.

* **Analyst / PMO:** Mary

* **Design Lead:** TBD

* **Engineering Lead:** TBD

* **Legal Advisor:** TBD

---

**Welcome aboard.** Open `PROJECT_BRIEF.md` to understand the *why*, then tackle your first sprint ticket.
