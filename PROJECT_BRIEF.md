# **FairForm – Project Brief (Phase 1: “Legal GPS”)**

**Version:** 1.0  
 **Date:** October 2025  
 **Owner:** Shaquon K.  
 **Methods:** BMAD Framework (Business • Market • Adoption • Differentiation)  
 **Build Context:** Cursor IDE with Codex assistance

---

## **1\) One-Page Overview**

**What:** FairForm helps **self-represented litigants (SRLs)** navigate civil legal processes with a simple, guided experience—showing *where they are*, *what to do next*, and *when it’s due*.  
 **Why:** Over 90% of civil litigants go to court without a lawyer and lose time or cases due to confusing procedures—not merit.  
 **Phase 1 Goal:** Ship a mobile-first MVP that delivers **clarity and procedural reliability** (no legal advice).

**North Star:**

Phase 1 (Legal GPS) → Phase 1.5 (Guided Empowerment) → Phase 2 (Civic Companion) → Phase 3 (Justice OS).

---

## **2\) The Problem (BMAD: Market)**

* SRLs struggle with **what to file, in what order, by when**, and what the legal terms mean.

* Existing self-help sites are text-heavy, fragmented, and county-specific.

* Result: missed deadlines, incomplete forms, and poor outcomes—*avoidable* with clear guidance.

---

## **3\) Vision & Strategy (BMAD: Differentiation)**

* **Design moat:** *Plain-language*, *calm*, *mobile-first* UI that makes law navigable.

* **Trust first, AI second:** Earn trust with rules-based clarity. Introduce AI later with clear guardrails.

* **Platform path:** Standardize steps/terms per jurisdiction → open schemas → **Justice OS** APIs for courts & nonprofits.

---

## **4\) Phase 1 Objective (MVP)**

**Deliverable:** A working “Legal GPS” that lets users:

1. Create an account and a case,

2. See a visual **Case Journey Map**,

3. Understand terms via **Inline Glossary**,

4. Get **deadline reminders** (email/SMS),

5. Review a **Day-in-Court** preparation checklist.

**Success Metrics (MVP):**

* ≥ 80% users can state their next step after first session

* ≥ 70% complete at least one step

* ≤ 2s load time (Core Web Vitals in range)

* ≥ 4.5/5 trust rating on pilot survey

---

## **5\) Core Features (Phase 1 Scope)**

* **Auth & Accounts** – Firebase Auth, secure sessions

* **Dashboard \+ New Case** – organized entry point

* **Case Journey Map** – interactive progress (steps, status)

* **Inline Glossary** – tap/hover definitions in context

* **Deadline Reminders** – Resend (email) \+ Twilio (SMS)

* **Day-in-Court Walkthrough** – educational checklist

See `docs/prd.md` (features & acceptance criteria) and `docs/design-spec.md` (components & behaviors).

---

## **6\) Technology Overview (for non-engineers)**

* **Frontend:** Next.js 14 (React), Tailwind, shadcn/ui

* **Backend:** Firebase Auth \+ Firestore (Phase 2 path to Supabase/Postgres)

* **Hosting:** Vercel (CI/CD via GitHub Actions)

* **Notifications:** Resend (email) \+ Twilio (SMS)

* **Analytics:** PostHog (privacy-safe)

See `docs/architecture.md` for architecture, APIs, environment variables, and CI/CD.

---

## **7\) Responsible AI Position (Phase 1\)**

* No user-facing AI in MVP; all content is **educational**, not advice.

* We **use Codex only as a development assistant** inside Cursor.

* When AI becomes user-facing (Phase 2), it will be clearly labeled and human-correctable.

See `/docs/05_AI_Guide.md` and “Responsible AI Introduction Plan” (internal) for guardrails.

---

## **8\) BMAD Alignment & Specialists**

| Pillar | Focus Now | Specialist Touchpoints |
| ----- | ----- | ----- |
| **Business** | Funding & pilots (post-MVP) | Alex: pricing/partnership model |
| **Market** | Build for SRLs in Marion County first | Mary: research → PRD/backlogs |
| **Adoption** | Usability testing plan after Sprint 2 | Shazad: pilot design, metrics |
| **Differentiation** | Calm, human navigation (not AI hype) | Sienna: brand voice & narrative |

Adjuncts: **Amira (legal compliance)**, **Eli (architecture)**, **Lena (community partnerships)**.

---

## **9\) Roadmap Snapshot**

* **Phase 1 (now):** Legal GPS → clarity & reminders

* **Phase 1.5:** Smart Intake (case type classifier), Document Readiness, Evidence Checklist

* **Phase 2:** Conversational AI intake, Court Prep Simulator, Human Helpdesk

* **Phase 3:** Justice OS – Jurisdictional Rules API, Open Form Schemas, Partner SDK

See “Ecosystem Roadmap: From Problem → Platform” doc for full detail.

---

## **10\) Pilot Scope & Impact (BMAD: Adoption)**

**Pilot Jurisdiction:** Marion County, IN  
 **Initial Case Types:** Eviction, Small Claims  
 **Pilot Goals:**

* Validate comprehension & step-completion metrics

* Identify usability gaps and prepare Phase 1.5 features

* Collect qualitative quotes for funders/partners

Outcomes shared via short **Pilot Report** (metrics \+ user quotes).

---

## **11\) Team & Roles**

* **Product Owner:** Shaquon K.

* **Analyst / PMO:** Mary (docs, sprints, validation)

* **Design Lead:** TBD (Figma, accessibility)

* **Engineering Lead:** TBD (Next.js, Firebase)

* **Legal Advisor:** TBD (UPL/accessibility review)

* **Adoption/Research:** Shazad (pilot testing plan)

---

## **12\) Timeline & Near-Term Milestones**

* **Sprint 1:** Auth \+ Dashboard (done at sprint end)

* **Sprint 2:** Journey Map \+ Inline Glossary

* **Sprint 3:** Reminders (email/SMS), polish & QA

* **Beta:** 5–8 SRLs \+ 1 legal-aid partner pilot

Stories: `docs/stories/` (current sprint backlog). Legacy sprint plans live under `docs/archive/`.

---

## **13\) Risks & Mitigations**

| Risk | Mitigation |
| ----- | ----- |
| UPL confusion | Persistent disclaimers; educational tone only |
| Scope creep | Honor Phase 1 boundaries; Phase 1.5 scaffold only |
| Accessibility gaps | WCAG 2.1 AA checklist \+ QA in every sprint |
| Vendor lock-in | Repository pattern; Supabase migration plan ready |
| Trust & privacy | Minimal PII; Firebase Auth; transparent copy |

See `docs/06_Compliance.md` and `docs/architecture/security.md`.

---

## **14\) How We Work in Cursor (with Codex)**

* **Context first:** Open `docs/prd.md`, `docs/design-spec.md`, and `docs/architecture/tech-stack.md` in Cursor so Codex has current context.

* **Start from stories:** Work from the latest ready story in `docs/stories/`.

* **Follow AI guardrails:** `/docs/05_AI_Guide.md` (no PII in prompts, a11y required, TS strict).

* **Human review required:** All Codex code → PR → human review → Vercel preview → merge.

---

## **15\) What “Good” Looks Like (Definition of Done)**

* Users can create an account, start a case, see steps, mark a step complete, and receive a reminder.

* Glossary is inline and accessible.

* App is fast, readable, and calming.

* MVP metrics hit targets (Section 4).

* Phase 1.5 scaffolding exists behind flags (no UI exposure).
