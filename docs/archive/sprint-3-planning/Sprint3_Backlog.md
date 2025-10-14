# **🚀 FairForm – Sprint 3 Backlog**

**Phase:** 1.2 – Smart Intake & Prep  
 **Sprint Dates:** TBD (2 weeks after Sprint 2 close)  
 **Version:** v1.0  
 **Owner:** Shaquon K. (Product)  
 **Analyst:** Mary (BMAD)  
 **Product Owner:** Sarah  
 **Tech Lead:** TBD  
 **Last Updated:** October 2025

---

## **🎯 Sprint Goal**

Deliver the **Smart Intake & Preparation** release — enabling users to describe their legal issue in plain language, classify it with AI assistance, and prepare for court confidently.

This sprint introduces the **first Responsible AI feature** within FairForm: the AI Intake system (Epic 12), supported by a Day-in-Court preparation checklist (Epic 10\) and new user settings (Epic 11).

---

## **🧱 Sprint Theme:**

**“Start Smarter, Prepare Better.”**

Users should be able to:

1. Begin their case intake via guided, AI-assisted questions.

2. Review their case type and jurisdiction in plain language.

3. Customize preferences (e.g., notifications, time zone).

4. Access a basic “Day-in-Court” checklist preview.

---

## **🔁 Sprint Composition Overview**

| Type | Epic / Workstream | Est. Effort | Priority | Owner |
| ----- | ----- | ----- | ----- | ----- |
| 🔧 Pre-Work | AI Intake Tech Spike (5 tickets) | 1–1.5 days | 🟢 Must-Have | Dev |
| 🧠 Epic 12 | AI Intake (Smart Intake) | 8–9 days | 🟢 Must-Have | Dev \+ Product |
| 🧾 Epic 10 | Day-in-Court Checklist | 2–3 days | 🟡 Should-Have | Dev |
| ⚙️ Epic 11 | User Settings | 1.5–2 days | 🟢 Must-Have | Dev |
| 🧪 QA & Review | Testing, Accessibility, Demo Prep | 1.5 days | 🟢 Must-Have | QA |

**Total Estimate:** \~14 days (10 working days \+ 2 buffer)

---

## **⚡ Pre-Work: AI Intake Tech Spike (Carryover from Sprint 2\)**

**Objective:** Establish safe, feature-flagged infrastructure for AI Intake prior to UI implementation.

| ID | Title | Deliverable | Status |
| ----- | ----- | ----- | ----- |
| AI-TS-01 | Feature Flag \+ Route Scaffold | `/intake` page \+ API stub | 🔜 In Progress |
| AI-TS-02 | Moderation Layer | `lib/ai/moderate.ts` | 🔜 In Progress |
| AI-TS-03 | Prompt \+ Schema Validation | `lib/ai/prompts/intake.ts` \+ Zod schema | 🔜 In Progress |
| AI-TS-04 | API Handler \+ Env Wiring | `/api/ai/intake` with moderation → model | 🔜 Pending |
| AI-TS-05 | Anonymized Logs \+ Rules | `aiIntakeLogs` \+ Firestore rule | 🔜 Pending |

**Definition of Done (Pre-Work):**

* API stub returns safe validated JSON (staging only)

* No PII logged

* AI intake experience accessible to opted-in users

* Tests \>90% coverage

---

## **🧠 Epic 12 – AI Intake (Smart Intake)**

### **Objective**

Implement user-facing AI-assisted intake flow allowing SRLs to describe their problem and classify their case in plain language.

| Story ID | Description | Priority | Est. Effort |
| ----- | ----- | ----- | ----- |
| 12.1 | Free-text problem description | 🟢 Must-Have | 1 day |
| 12.2 | Follow-up Q\&A for jurisdiction/context | 🟢 Must-Have | 1.5 days |
| 12.3 | AI summary \+ confirmation | 🟡 Should-Have | 1 day |
| 12.4 | Edit & submit summary to Firestore | 🟢 Must-Have | 1 day |
| 12.5 | Admin logs \+ analytics view (anonymized) | 🟡 Should-Have | 1 day |

**Total:** \~5.5 days (core stories)

### **Dependencies**

* AI Tech Spike (moderation, prompt, schema) ✅

* Firestore `cases` collection ready ✅

* OpenAI API key \+ staging env configured 🔜

### **Definition of Done**

* Intake flow end-to-end functional for opted-in users

* AI classification accuracy ≥75%

* All moderation \+ disclaimers active

* No advisory outputs detected

* All tests (unit, integration, accessibility) passing

---

## **🧾 Epic 10 – Day-in-Court Checklist**

### **Objective**

Provide a simple, interactive pre-hearing checklist for Small Claims and Family case types.

| Story ID | Description | Priority | Est. Effort |
| ----- | ----- | ----- | ----- |
| 10.1 | Checklist display page (per case type) | 🟢 Must-Have | 0.5 day |
| 10.2 | Save progress locally (client storage) | 🟢 Must-Have | 0.5 day |
| 10.3 | Add “Mark Item Complete” behavior | 🟡 Should-Have | 0.5 day |
| 10.4 | Link checklist to case dashboard | 🟢 Must-Have | 0.5 day |

**Total:** \~2 days

### **Dependencies**

* Case type field (from AI Intake) ✅

* Firestore not required (MVP localStorage)

### **Definition of Done**

* Checklist visible and usable on `/cases/[id]/checklist`

* State persists via browser localStorage

* 0 accessibility violations

---

## **⚙️ Epic 11 – User Settings**

### **Objective**

Let users configure their app preferences (notifications, time zone, AI feature opt-in).

| Story ID | Description | Priority | Est. Effort |
| ----- | ----- | ----- | ----- |
| 11.1 | Settings page scaffold | 🟢 Must-Have | 0.5 day |
| 11.2 | Update profile (time zone, opt-ins) | 🟢 Must-Have | 0.5 day |
| 11.3 | Toggle AI intake participation | 🟡 Should-Have | 0.5 day |

**Total:** \~1.5 days

### **Dependencies**

* Auth system ✅

* Firestore `users` collection ✅

### **Definition of Done**

* Settings accessible via nav

* Preferences saved and persist on reload

* AI Intake toggle functional

* No console errors, all tests passing

---

## **🧪 QA & Review Plan**

| QA Area | Tools | Criteria |
| ----- | ----- | ----- |
| **Unit Tests** | Vitest | ≥85% coverage across new files |
| **Accessibility** | jest-axe | 0 violations |
| **Performance** | Lighthouse | ≥90 score on 3G mobile |
| **Compliance** | Manual | No advisory outputs, all disclaimers visible |
| **Demo Readiness** | Manual | End-to-end flow functional for opted-in users |

---

## **📊 Sprint 3 Deliverables**

| Deliverable | Description | Owner |
| ----- | ----- | ----- |
| ✅ AI Tech Spike complete | Moderation, schema, flagging ready | Dev |
| ✅ AI Intake Flow | Full end-to-end Q\&A, classification, confirmation | Dev \+ Product |
| ✅ Day-in-Court Checklist | Interactive pre-hearing checklist | Dev |
| ✅ User Settings | Preferences \+ AI opt-in | Dev |
| ✅ QA Sign-off | All tests & compliance | QA |
| ✅ Sprint Demo | “Smart Intake & Prep” showcase | Product |

---

## **🔒 Compliance Checkpoints**

* Review `/docs/06_Compliance.md` (Appendix A: AI Intake).

* All AI responses must include:

   “This is educational guidance, not legal advice.”

* Test with 10 sample inputs per case type for safe output verification.

* Confirm Firestore `aiIntakeLogs` anonymization working.

---

## **🚧 Known Risks / Mitigations**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| API latency \>3s | Medium | Prefetch next step \+ spinner feedback |
| AI misclassification | Medium | Require user confirmation before save |
| UPL risk | High | Strict prompts, disclaimers, moderation |
| User confusion | Medium | Label “AI Intake (Educational Beta)” clearly |
| Feature creep (settings UX) | Low | Limit to three toggles max in MVP |

---

## **🧠 Success Metrics**

| Metric | Target | Source |
| ----- | ----- | ----- |
| Intake completion rate | ≥75% | Firestore analytics |
| Case-type accuracy | ≥75% | Manual QA check |
| Avg AI response time | ≤3s | API logs |
| User trust rating | ≥85% | Feedback survey |
| Accessibility compliance | 100% | jest-axe |

---

## **🧭 Sprint 3 Definition of Done (Global)**

* All pre-work merged and deployed to staging

* AI intake experience accessible without global flag

* AI moderation \+ schema validation working end-to-end

* Day-in-Court checklist usable and saved locally

* User Settings persistent and error-free

* Accessibility, compliance, and performance audits passed

* Sprint demo prepared (“Smart Intake & Prep”)

---

✅ **Sprint 3 Readiness Check**

* Tech stack stable from Sprint 2

* Firestore \+ API infra in place

* BMAD Responsible AI plan approved

* Cursor workspace configured for AI model context

* Devs aligned with repo structure \+ test-first process
