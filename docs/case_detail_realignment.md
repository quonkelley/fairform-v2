# **1\) What we have now (current app)**

**Architecture**

* Next.js 14 (App Router), TypeScript strict, shadcn/ui, Tailwind

* Repo pattern: UI → hooks → API route → `*Repo.ts` → Firestore

* Live pieces:

  * `/app/cases/[id]/page.tsx` (Case Detail shell)

  * `CaseJourneyMap`, `StepNode` (timeline \+ “Mark Complete”)

  * Hooks: `useCaseSteps`, `useCompleteStep` (optimistic updates)

* In-flight (Week 2 of Sprint 2):

  * `StepDetailModal` (Story 6.3) with instruction templates (Small Claims MVP)

  * Dashboard progress sync fields `progressPct`, `completedSteps`, `totalSteps` (Story 6.4)

**Data model (conceptual)**

* `cases/{caseId}`: (soon) `progressPct`, `completedSteps`, `totalSteps`

* `caseSteps/{stepId}`: `{ caseId, name, order, isComplete, completedAt, dueDate? }`

* Status derived from booleans & order (completed/current/upcoming)

**UX**

* Full timeline (accessible `<ol>/<li>`), status icons, “Mark Complete”, soon: detail modal

---

# **2\) What the v2 guide proposes**

**Types**

* Rich enums for `CaseStatus`, `CaseType`, `StepStatus`, `StepType`

* Case: includes `currentStep`, `progressPercentage`, `totalSteps`

* CaseStep: includes `status`, `isCurrent`, `isCompleted`, `isRequired`, `estimatedTime`, `instructions[]`, links to prev/next

**Templates & logic**

* Per-case-type journey **templates** (Employment, Housing, etc.)

* Helper: `generateCaseJourney(caseId, caseType, currentStep)` to materialize steps

* “Next Steps” generator (2–3 actionable tasks per step)

**API sketch**

* `GET /api/cases/:id`

* `GET /api/cases/:id/steps`

* `PATCH /api/cases/:id` (progress update)

**UI layout**

* Two-column: Journey (left) \+ “Your Next Steps” (right)

* Progressive disclosure (completed \+ current \+ next 2–3)

* Progress card at top

---

# **3\) Gaps & mapping (contrast)**

| Area | Current App | V2 Guide | Delta / Plan |
| ----- | ----- | ----- | ----- |
| **Status model** | `isComplete`, computed current via `order` | `StepStatus` enum \+ `isCurrent`, `isCompleted` | Keep booleans in DB for simplicity; **add an adapter** in UI to expose enum for components/tests. |
| **Case progress** | (Adding) `progressPct`, `completedSteps`, `totalSteps` | `progressPercentage`, `currentStep`, `totalSteps` | We’re aligned; also compute `currentStep` on write. |
| **Case types** | Not first-class yet (Small Claims MVP) | Strong `CaseType` enum \+ per-type templates | Introduce `case.caseType` (Epic 12 will provide); scaffold template registry now. |
| **Journey source** | Steps stored per case in Firestore | Generate from templates then persist | Do a **hybrid**: generate on case creation → persist to Firestore (keeps real-time \+ repo pattern). |
| **Next steps panel** | Not implemented | Actionable tasks list | Add right-column card fed by a simple rule-based generator (no AI yet). |
| **API shape** | Next.js `/app/api/...` with repos | REST-like endpoints | Keep Next.js routes; match semantics (`GET/ PATCH`) behind repo layer. |
| **UI layout** | Single-column \+ modal | Two-column with progress \+ next steps | Update page layout; stack on mobile. |
| **A11y** | Strong (WCAG AA, tested) | (Unspecified) | Keep our current a11y bar—no change. |

---

# **4\) Minimal convergence plan (no churn, fast wins)**

## **A) Data & adapters (safe)**

* **Add case fields** in `cases` (if not already):  
   `caseType: 'small_claims' | ...`, `currentStep: number` (kept in sync by repo), `totalSteps: number`.

**Status adapter** (UI-only): map `{ isComplete, order }` → `StepStatus: 'completed'|'in_progress'|'pending'`.

 // lib/adapters/steps.ts  
export function toStepStatus(step: { order:number; isComplete:boolean }, currentOrder:number) {  
  if (step.isComplete) return 'completed';  
  if (step.order \=== currentOrder) return 'in\_progress';  
  return 'pending';  
}

* 

## **B) Template registry (non-AI, ready for AI Intake later)**

`lib/journeys/templates/index.ts`

 export type CaseType \= 'small\_claims'|'employment'|'housing'|'consumer'|'contract'|'discrimination'|'other';  
export const templates: Record\<CaseType, Array\<{ title:string; description:string; stepType:'form'|'document'|'review'|'submit'|'wait'|'meeting'|'communication'; instructions:string\[\]; estimatedTime?:number }\>\> \= {  
  small\_claims: \[ /\* our current 5-step set \*/ \],  
  housing:     \[ /\* stub for later \*/ \],  
  // …  
};

*   
* **Generation on case creation** (or when case type set):  
   `generateCaseSteps(caseId, caseType)` → persist steps to Firestore (keeps our real-time syncing model).

## **C) Next Steps panel (rule-based)**

* `lib/nextSteps/generate.ts`  
   Deterministic suggestions based on `caseType` \+ `currentStep` (no AI).  
   Display in a **“Your Next Steps”** card.

## **D) Case Detail layout upgrade (incremental)**

* Update `/app/cases/[id]/page.tsx`:

  * Add **Progress Overview** card (reads `progressPct`, `currentStep`, `totalSteps`).

  * Two-column grid: **Case Journey** (left) \+ **Your Next Steps** (right).

  * Keep `StepDetailModal` trigger on step click (Story 6.3).

* Mobile: stack columns; ensure keyboard order is logical.

## **E) Repo updates (Story 6.4 synergy)**

* In `casesRepo.ts`:

  * `updateCaseProgress(caseId)`: recompute `completedSteps`, `totalSteps`, `progressPct`, and **derive `currentStep`** (lowest `!isComplete` order).

  * Expose `getCaseById`, `getCaseSteps`, `setCaseType` (prep for Epic 12).

---

# **5\) Suggested file touches (surgical)**

app/cases/\[id\]/page.tsx                \# add two-column layout \+ NextSteps card  
components/case-journey/step-detail-modal.tsx  \# (in-flight) MVP instructions  
components/case-journey/case-journey-map.tsx   \# minor: onClick \-\> modal  
components/case-detail/NextStepsCard.tsx       \# NEW  
components/case-detail/ProgressOverview.tsx    \# NEW

lib/adapters/steps.ts                    \# NEW \- enum adapter  
lib/journeys/templates/index.ts          \# NEW \- registry  
lib/nextSteps/generate.ts                \# NEW  
lib/db/casesRepo.ts                      \# extend with currentStep calc  
lib/dates/dueDate.ts                     \# (nice) shared date helpers

---

# **6\) Acceptance criteria (for “aligned with v2 guide”)**

* Case detail shows **Progress Overview** (percent \+ “X of Y” \+ current step).

* Left column: journey with **completed/current/next** visible; modal opens on click.

* Right column: **Your Next Steps** shows 2–3 actionable tasks based on case type \+ step.

* Back-end progress recompute updates `progressPct`, `completedSteps`, `totalSteps`, `currentStep`.

* Status adapter in UI maps to enum semantics; tests cover mapping.

* Mobile-first layout; 0 axe violations; strict TS.

---

# **7\) Testing checklist**

* **Unit:** adapters, next-step generator, repo progress math (0%, 100%, edge cases).

* **Integration:** mark step complete → progress & next steps update.

* **A11y:** keyboard flow, dialog announcements, labels on progress & next steps.

* **Perf:** page TTI ≤ 1.5s mobile, modal open \<100ms.

---

# **8\) Why this path**

* Preserves our **repo \+ real-time** architecture (no churn).

* Unlocks v2’s **template/next-steps value** without AI dependency.

* Sets clean interfaces for **Epic 12** (AI Intake) to plug in `caseType` later.

* Keeps Sprint-2 promises (6.3, 6.4) intact and complements them.

---

If you want, I can draft the two new components (`ProgressOverview.tsx`, `NextStepsCard.tsx`) in production-ready Next.js/TSX (shadcn/ui \+ Tailwind), wired to our data shapes and adapters—ready to paste into Cursor.

