# **🗂 Sprint 3 Backlog – Epic 8 (Transition & Maintenance)**

**Phase:** 1.2 – Smart Intake & Prep  
 **Sprint Window:** Oct → Nov 2025  
 **Epic Link:** `/docs/prd/epic-8-case-step-details.md`  
 **PO:** Sarah **Analyst:** Mary **Owner:** Shaquon K.

---

## **🎯 Sprint Goal**

Stabilize, test, and extend the **Case Step Details & Actions** feature for integration with upcoming AI Intake (Epic 12\) and Reminder System (Epic 9), ensuring accessibility, compliance, and performance continuity.

---

## **✅ Story 8.1 – Regression QA & Accessibility Audit**

**Objective:** Confirm Epic 8’s existing functionality remains stable post-Sprint 2 merge.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | 0 jest-axe violations; LCP ≤ 2.5 s; all tests pass. |
| **Deliverables** | `step-detail-modal.test.tsx` report \+ `QA_Audit_Epic8.md`. |
| **Owner** | QA / Mary |
| **Priority** | 🟢 Must-Have |
| **Effort** | 3 pts |

---

## **🧩 Story 8.2 – Dynamic Instruction Template Refactor**

**Objective:** Move step-by-step instructions from static JSON to Firestore templates.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | Step content loads dynamically ≤ 150 ms; updates via repository pattern. |
| **Deliverables** | `casesRepo.ts` \+ migration script; updated unit tests. |
| **Owner** | Dev / Shaquon |
| **Priority** | 🟡 Should-Have |
| **Effort** | 5 pts |

---

## **🔔 Story 8.3 – Reminder Hook Scaffold (Epic 9 Bridge)**

**Objective:** Add placeholder hooks for due-date reminders without triggering notifications.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | `useReminders()` stub returns mock data; feature flag `reminders=true` only on staging. |
| **Deliverables** | `lib/hooks/useReminders.ts` \+ unit tests \+ README. |
| **Owner** | Dev / Shaquon |
| **Priority** | 🟡 Should-Have |
| **Effort** | 4 pts |

---

## **🧠 Story 8.4 – AI Context Bridge (Epic 12 Hook)**

**Objective:** Expose completed step metadata to AI Intake engine for context-aware summaries.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | `useCaseSteps()` exports completed steps JSON; validated by AI mock agent. |
| **Deliverables** | JSON schema \+ PostHog event `step_context_exported`. |
| **Owner** | Dev / Shaquon & AI team |
| **Priority** | 🟢 Must-Have |
| **Effort** | 3 pts |

---

## **📱 Story 8.5 – Mobile Modal Polish & Gestures**

**Objective:** Refine step modal UX for touch screens (gestures \+ scroll lock).

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | Swipe-down closes modal; no scroll bleed; contrast ≥ 4.5 : 1\. |
| **Deliverables** | Updated CSS \+ Playwright mobile test. |
| **Owner** | Design / Dev |
| **Priority** | 🟢 Must-Have |
| **Effort** | 2 pts |

---

## **🧾 Story 8.6 – Documentation & Passoff Sync**

**Objective:** Publish and store the official Epic 8 handoff and QA reports.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | `/docs/handoff/Epic8_Passoff_CaseStepDetails.md` \+ QA report committed to `main`. |
| **Deliverables** | Final PR \+ Notion link \+ Vercel preview. |
| **Owner** | Analyst / Mary |
| **Priority** | 🟢 Must-Have |
| **Effort** | 1 pt |

---

## **⚙️ Technical Tasks / Maintenance**

| Task | Owner | Effort | Notes |
| ----- | ----- | ----- | ----- |
| Refactor repo calls to match new Supabase adapter interface. | Dev | 3 pts | Prep for Phase 2 migration. |
| Update CI workflow to run Epic 8 tests on PR open. | DevOps | 1 pt | `.github/workflows/ci.yml`. |
| Add PostHog events (`step_viewed`, `step_completed`). | Dev | 2 pts | For metrics tracking. |

---

## **📊 Sprint Success Metrics**

| Metric | Target |
| ----- | ----- |
| QA coverage | ≥ 85 % (all Epic 8 files) |
| A11y violations | 0 |
| Modal LCP | ≤ 2.5 s |
| Regression bugs | ≤ 2 minor |
| Compliance score | 100 % WCAG AA \+ disclaimer visible |

---

## **✅ Definition of Done (Backlog Bundle)**

* All Epic 8 tickets closed with QA sign-off.

* No performance or a11y regressions.

* Handoff & QA reports published.

* Ready for integration tests with Epics 9 and 12\.  
