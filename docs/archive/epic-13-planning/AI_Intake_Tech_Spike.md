# **⚡ AI Intake Tech Spike – Sprint 2 Parallel Initiative**

**Owner:** Shaquon K.  
 **Analyst:** Mary (BMAD AI Lead)  
 **Sprint:** 2 → 3 Bridge  
 **Duration:** 1–1.5 days  
 **Purpose:** Establish scaffolding and safety layers for Epic 12 – Smart Intake without touching production.

---

## **🎯 Objectives**

1. Create feature-flagged routes and backend plumbing for AI Intake.

2. Validate moderation, prompt, and schema pipelines.

3. Guarantee data safety \+ UPL compliance before live AI activation.

---

## **🧩 Ticket Breakdown**

| ID | Title | Summary | Est. hrs | Owner |
| ----- | ----- | ----- | ----- | ----- |
| **AI-TS-01** | Feature Flag \+ Route Scaffold | Add `lib/flags.ts`, `/intake` page, and `/api/ai/intake` stub (501 Not Implemented). | 2–3 | Dev |
| **AI-TS-02** | Moderation Layer | Implement `lib/ai/moderate.ts` → returns \`pass | block | review\`; include tests. |
| **AI-TS-03** | Prompt Templates \+ Schema Validation | Fixed taxonomy prompt \+ Zod schema for safe JSON. | 2–3 | Dev |
| **AI-TS-04** | API Handler \+ Env Wiring | Build guarded `/api/ai/intake` route w/ moderation → schema → model → response flow. | 3–4 | Dev |
| **AI-TS-05** | Anonymized Logs \+ Admin Rule | Log results (no PII) \+ restrict admin reads in Firestore rules. | 2–3 | Dev |

**Total Estimate:** \~12–15 hrs (≈ 1–1.5 days for one engineer).

---

## **✅ Definition of Done**

* AI intake is available to authenticated users who opt in via settings.

* Moderation, prompt, and schema tests passing (\>90 % coverage).

* `/api/ai/intake` returns validated JSON in staging; 503 in prod.

* No raw user text persisted; only hashed/anonymized logs.

* Firestore rules block non-admin reads.

* All lint, type, and a11y checks pass.

---

## **⚙️ Environment \+ Config**

Add to `.env.example` :

OPENAI\_API\_KEY=  
AI\_INTAKE\_MODEL=gpt-4o-mini  
AI\_INTAKE\_TEMP=0.2

Ensure staging and production both have keys configured; availability is governed by user opt-in only.

---

## **🧱 Output Artifacts**

* `lib/flags.ts`

* `lib/ai/moderate.ts` \+ tests

* `lib/ai/prompts/intake.ts` \+ `lib/ai/schemas.ts`

* `app/api/ai/intake/route.ts` \+ tests

* `lib/ai/logs.ts` \+ `firestore.rules` update

* Test files under `tests/ai/` namespace

---

## **🚀 Next Step (after merge)**

When merged and verified:

1. Confirm AI opt-in setting flow is available in staging.

Run smoke test:

 curl \-X POST /api/ai/intake \-d '{"text":"My landlord won't fix heat"}'

2.   
3. Confirm validated JSON response (\<3 s).

4. Sprint 3 starts with UI integration of `AIIntakeForm` and `AISummaryCard`.
