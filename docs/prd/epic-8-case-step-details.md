# **🗂 Epic 8 – Case Journey Polish & Integration Bridges**

**Status:** Post-Epic 6.5 Maintenance & Polish  
**Phase:** 1.2 – Smart Intake & Prep  
**Sprint Window:** After Epic 6.5 completion  
**Epic Link:** `/docs/prd/epic-8-case-step-details.md`  
**PO:** Sarah **Analyst:** Mary **Owner:** Shaquon K.

---

## **📋 Epic Scope Clarification**

**IMPORTANT:** Epic 8 has been clarified as **pure maintenance and polish work** for the Case Journey Map feature after Epic 6.5 completion. This epic does NOT create new major features - it focuses on:

1. **Quality Assurance**: Regression testing and accessibility audits
2. **Integration Bridges**: Hooks and scaffolding for Epic 9 (Reminders) and Epic 12 (AI Intake)
3. **Mobile Polish**: Touch gesture refinements and mobile UX improvements
4. **Documentation**: Handoff materials and QA reports

**What Epic 8 is NOT:**
- Epic 8 does NOT implement case detail page enhancements (that's Epic 6.5)
- Epic 8 does NOT create new UI components or major features
- Epic 8 does NOT overlap with Epic 6.5's two-column layout, progress overview, or next steps work

---

## **🎯 Sprint Goal**

Polish, test, and prepare the **Case Journey Map** (Epic 6 + 6.5) for integration with upcoming AI Intake (Epic 12) and Reminder System (Epic 9), ensuring stability, accessibility, and smooth handoff to future epics.

---

## **Dependencies**

**Prerequisites:**
- ✅ Epic 6 complete (Stories 6.1-6.4) - Case Journey Map foundation
- ✅ Epic 6.5 complete (Stories 6.5.1-6.5.4) - Case Detail V2 Enhancement

**Note:** Epic 8 work begins AFTER Epic 6.5 is complete to avoid overlap and ensure we're polishing the final Case Journey implementation.

---

## **✅ Story 8.1 – Regression QA & Accessibility Audit**

**Objective:** Confirm Epic 6 and 6.5 functionality remains stable and accessible.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | 0 jest-axe violations; LCP ≤ 2.5 s; all tests pass. |
| **Deliverables** | Comprehensive QA audit covering Epic 6 + 6.5 components |
| **Owner** | QA / Quinn |
| **Priority** | 🟢 Must-Have |
| **Effort** | 3 pts |

---

## **🔔 Story 8.2 – Reminder Hook Scaffold (Epic 9 Bridge)**

**Objective:** Add placeholder hooks for due-date reminders without triggering notifications.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | `useReminders()` stub returns mock data; feature flag `reminders=true` only on staging. |
| **Deliverables** | `lib/hooks/useReminders.ts` + unit tests + README. |
| **Owner** | Dev / James |
| **Priority** | 🟡 Should-Have |
| **Effort** | 4 pts |

---

## **🧠 Story 8.3 – AI Context Bridge (Epic 12 Hook)**

**Objective:** Expose completed step metadata to AI Intake engine for context-aware summaries.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | `useCaseSteps()` exports completed steps JSON; validated by AI mock agent. |
| **Deliverables** | JSON schema + PostHog event `step_context_exported`. |
| **Owner** | Dev / James |
| **Priority** | 🟢 Must-Have |
| **Effort** | 3 pts |

---

## **📱 Story 8.4 – Mobile Modal Polish & Gestures**

**Objective:** Refine step modal UX for touch screens (gestures + scroll lock).

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | Swipe-down closes modal; no scroll bleed; contrast ≥ 4.5 : 1. |
| **Deliverables** | Updated CSS + Playwright mobile test. |
| **Owner** | Dev / James |
| **Priority** | 🟢 Must-Have |
| **Effort** | 2 pts |

---

## **🧾 Story 8.5 – Documentation & Handoff**

**Objective:** Publish comprehensive handoff documentation for Epic 6 + 6.5 completion.

| Field | Detail |
| ----- | ----- |
| **Acceptance Criteria** | Complete handoff documentation + QA reports committed. |
| **Deliverables** | Epic 6/6.5 handoff doc + QA summary. |
| **Owner** | PO / Sarah |
| **Priority** | 🟢 Must-Have |
| **Effort** | 1 pt |

---

## **⚙️ Technical Tasks / Maintenance**

| Task | Owner | Effort | Notes |
| ----- | ----- | ----- | ----- |
| Add PostHog events (`step_viewed`, `step_completed`). | Dev | 2 pts | For metrics tracking. |
| Update CI workflow to run Case Journey tests on PR. | Dev | 1 pt | `.github/workflows/ci.yml`. |

---

## **📊 Sprint Success Metrics**

| Metric | Target |
| ----- | ----- |
| QA coverage | ≥ 85% (all Epic 6 + 6.5 files) |
| A11y violations | 0 |
| Modal LCP | ≤ 2.5 s |
| Regression bugs | 0 critical, ≤ 2 minor |
| Compliance score | 100% WCAG AA |

---

## **✅ Definition of Done**

* All Epic 8 tickets closed with QA sign-off.
* No performance or accessibility regressions in Epic 6 + 6.5 features.
* Handoff & QA reports published.
* Integration hooks ready for Epics 9 and 12.
* Mobile polish complete and tested.

---

**Epic 8 Estimated Effort:** 13 points (~2-3 days)  
**Timing:** After Epic 6.5 completion, can run parallel with Epic 10 or Epic 11  
**Priority:** Medium - Quality and bridge work, not blocking other epics
