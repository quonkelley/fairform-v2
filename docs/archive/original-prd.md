# **⚖️ FairForm – Product Requirements Document (PRD)**

**Phase:** 1 MVP – “Legal GPS”  
 **Version:** 1.1  **Date:** October 2025  
 **Owner:** Shaquon K.  **Analyst:** Mary

---

## **1\. Purpose**

FairForm helps **self-represented litigants** navigate civil legal procedures through a guided, conversational web app.  
 The MVP goal is to make civil justice **navigable, comprehensible, and actionable**—without providing legal advice.

---

## **2\. Problem Statement**

Over 92 % of civil litigants in U.S. courts appear without legal counsel.  
 They often lose viable cases because they cannot interpret forms, deadlines, or procedure.  
 Existing resources are fragmented, outdated, and written for lawyers, not people.

---

## **3\. Objectives & Success Metrics**

| Objective | KPI / Success Metric |
| ----- | ----- |
| Improve comprehension of legal process | ≥ 80 % of users can state their next required action after onboarding |
| Build procedural reliability | ≥ 70 % of users complete at least one case step |
| Establish user trust | ≥ 4.5 / 5 trust score on pilot survey |
| Ensure performance & accessibility | ≤ 2 s page load, WCAG 2.1 AA compliance |
| Demonstrate reusability for later phases | Codebase modular, reusable for Smart Intake (Phase 1.5) |

---

## **4\. Target Users**

| Segment | Description | Needs |
| ----- | ----- | ----- |
| **Primary:** Self-represented litigants (SRLs) | Individuals filing or defending small civil cases (eviction, small claims) | Simple guidance, confidence, deadline tracking |
| **Secondary:** Legal Aid Orgs & Courts | Partners providing access-to-justice tools | Reliable workflow, data insights, compliance |
| **Tertiary:** Policy Stakeholders | Funders / researchers | Aggregated impact metrics |

Demographics: Low- to moderate-income adults, 25–55 yrs, primarily mobile users.

---

## **5\. User Stories (Summarized)**

1️⃣ As a new user, I want to create a secure account so I can save my case data.  
 2️⃣ As a returning user, I want to see and create cases on one dashboard.  
 3️⃣ As an SRL, I want a visual timeline of my case so I know what’s next.  
 4️⃣ As a user, I want to tap a legal term and see a plain-language definition.  
 5️⃣ As a user, I want reminders before deadlines.  
 6️⃣ As an SRL, I want to review court day expectations so I feel prepared.

---

## **6\. Core Features & Acceptance Criteria**

| Feature | Description | Acceptance Criteria |
| ----- | ----- | ----- |
| **User Authentication** | Email/password sign-up & login using Firebase Auth | Users can create accounts, log in/out securely |
| **Case Dashboard** | List of cases \+ “Start New Case” workflow | Dashboard displays all user cases; new case saved to Firestore |
| **Interactive Case Journey Map** | Visual timeline of case steps | Users can see steps, mark complete, view progress |
| **Inline Glossary** | Contextual term definitions | Hover/tap reveals definition; no page change |
| **Deadline Reminders** | Email/SMS alerts | Users receive alerts X days before due date |
| **Day-in-Court Walkthrough** | Educational pre-hearing guide | Checklist completed by user; clear disclaimer present |

---

## **7\. Out of Scope (Phase 1 Deferrals)**

* AI Smart Intake (Phase 1.5)

* Document Readiness Assistant

* Evidence Checklist Manager

* Court Preparation Simulator

* Human Helpdesk Integration

* Open APIs / Justice OS Infrastructure

---

## **8\. Technical Architecture**

| Layer | Tool / Framework | Notes |
| ----- | ----- | ----- |
| **Frontend** | Next.js 14 (React 18\) | Server components \+ routing |
| **Styling** | Tailwind CSS \+ shadcn/ui | Accessible component library |
| **Backend** | Firebase Auth \+ Firestore | Lightweight NoSQL backend |
| **Hosting** | Vercel | Auto CI/CD \+ preview deploys |
| **Notifications** | Twilio (SMS) \+ Resend (Email) | Procedural alerts |
| **Analytics** | PostHog | Privacy-safe usage metrics |
| **CI/CD** | GitHub Actions | Continuous deployment |

---

## **9\. Data Model Summary**

User(user\_id, email, name, created\_at)  
Case(case\_id, user\_id, case\_type, jurisdiction, status, created\_at)  
CaseStep(step\_id, case\_id, name, order, due\_date, is\_complete)  
GlossaryTerm(term\_id, term, definition, jurisdiction)  
Reminder(reminder\_id, user\_id, case\_id, due\_date, message, sent)

---

## **10\. APIs / Endpoints**

| Endpoint | Method | Function |
| ----- | ----- | ----- |
| `/api/createUser` | POST | Registers new user |
| `/api/createCase` | POST | Adds case to Firestore |
| `/api/getCases` | GET | Retrieves user cases |
| `/api/getCaseSteps` | GET | Returns steps for case |
| `/api/updateStepStatus` | PATCH | Marks step complete |
| `/api/sendReminder` | POST | Dispatches notification |

---

## **11\. Design Requirements**

* **Mobile-first** (≤ 480 px priority)

* **Accessible UI:** ARIA labels, keyboard navigation, color contrast ≥ 4.5:1

* **Typography:** Inter family (Readable sans-serif)

* **Color Palette:** Justice Blue `#004E7C`, Soft Neutral `#F4F7FB`, Accent Yellow `#FFD166`

* **Layout:** 4-pt grid, 960 px max width, centered column

* **Tone & Voice:** Empathetic, plain language, “guide” not lawyer

---

## **12\. Compliance & Ethics**

| Area | Policy |
| ----- | ----- |
| **Unauthorized Practice of Law (UPL)** | Content is educational only; no personal legal advice. |
| **Data Privacy** | Firebase Auth handles PII; no sensitive data stored client-side. |
| **AI Use** | No front-facing AI in Phase 1; AI will be transparent and educational only in later phases. |
| **Accessibility** | WCAG 2.1 AA compliance required for launch. |
| **Transparency** | Terms \+ Disclaimers displayed at onboarding and footer. |

---

## **13\. Dependencies & Integrations**

* Firebase Project ID \+ API keys

* Twilio \+ Resend sandbox accounts

* Vercel deployment pipeline

* PostHog tracking token

* Google Fonts (Inter)

* Domain \+ SSL certificate

---

## **14\. Risks & Mitigations**

| Risk | Mitigation |
| ----- | ----- |
| UPL or perception of legal advice | Strong disclaimers; “educational resource” framing |
| User trust & data security | Firebase Auth \+ plain-language privacy policy |
| Accessibility non-compliance | Automated \+ manual WCAG testing in QA |
| Feature scope creep | Follow Sprint 1–3 MVP backlogs strictly |
| Performance issues | Optimize SSR \+ Firestore queries |

---

## **15\. Milestones & Deliverables**

| Milestone | Target Date | Deliverable |
| ----- | ----- | ----- |
| **Sprint 0** | Oct – Setup | Environment \+ schema ready |
| **Sprint 1** | Nov – Auth \+ Dashboard | User creation \+ case management |
| **Sprint 2** | Dec – Journey Map \+ Glossary | Core navigation experience |
| **Sprint 3** | Jan – Notifications | Procedural reliability features |
| **Beta Launch** | Feb 2026 | Pilot with 5–8 SRLs \+ 1 legal aid partner |

---

## **16\. Post-MVP Roadmap**

| Phase | Key Additions | Outcome |
| ----- | ----- | ----- |
| **1.5 – Guided Empowerment** | Smart Intake \+ Document Readiness \+ Evidence Checklist | Personalization \+ actionability |
| **2 – Civic Companion** | Conversational AI \+ Court Prep Simulator \+ Human Helpdesk | Interactive support |
| **3 – Justice OS** | Jurisdictional APIs \+ Open Form Schemas | Platform for partners & courts |

---

## **17\. Approval & Sign-Off**

| Role | Name | Signature / Date |
| ----- | ----- | ----- |
| Product Owner | Shaquon K. |  |
| Analyst | Mary |  |
| Design Lead | TBD |  |
| Engineering Lead | TBD |  |
| Legal Advisor | TBD |  |

---

✅ **This PRD is now complete and build-ready.**  
 It aligns with your Sprint Zero Blueprint, Sprint 1–2 Backlogs, and design system — providing full context for developers, AI tools, and collaborators.

---

Would you like me to generate the **02\_DesignSpec.md** next, using this PRD as the baseline (with component inventory, tokens, and interaction rules for Cursor)?  
 That file would complete the second core document in your `/docs` package.

