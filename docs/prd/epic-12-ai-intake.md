# **🧠 Epic 12 – AI Intake (Smart Intake)**

**Epic Owner:** Shaquon K.  
 **Analyst:** Mary (BMAD AI)  
 **Product Owner:** Sarah (PM)  
 **Sprint:** 3 – Smart Intake & Prep  
 **Last Updated:** October 2025

---

## **🎯 Summary**

The **AI Intake** feature introduces a conversational, guided intake flow that helps self-represented litigants (SRLs) describe their legal problems in plain language — and automatically classifies them into a **case type, jurisdiction, and summary**.

This marks FairForm’s first **Responsible AI release**, blending transparency, explainability, and user control.

---

## **💡 Business Value**

* **Reduces intimidation:** SRLs can start with a conversation instead of a form.

* **Saves time:** Automatically classifies the case type for faster document prep.

* **Builds trust:** Human-centered disclaimers and opt-in AI ensure ethical use.

* **Scalable foundation:** Creates structured case data for later automation (forms, reminders, checklists).

---

## **🧭 Goals & Outcomes**

| Goal | Description |
| ----- | ----- |
| Provide plain-language intake flow | Users describe their issue naturally |
| Use AI to classify case type & jurisdiction | Return structured summary |
| Maintain ethical AI usage | Explain limitations and collect consent |
| Ensure moderation & privacy | Guard against unsafe inputs and store no PII |

**Success Metrics**

| Metric | Target |
| ----- | ----- |
| Successful intake completion | ≥ 75 % |
| Classification accuracy | ≥ 80 % (manual QA) |
| Average API response time | ≤ 3 s |
| Moderation block rate | \< 3 % |
| Accessibility compliance | 100 % (WCAG 2.1 AA) |

---

## **📦 Scope**

### **In Scope**

* Conversational text intake UI.

* AI classification and summary generation (OpenAI GPT-4o-mini).

* Moderation layer \+ schema validation.

* AI disclaimers and user opt-in toggle.

* Firestore integration for structured intake results.

* Available to all authenticated users who opt in to AI assistance.

### **Out of Scope (MVP)**

* Deep chat-style multi-turn AI conversations.

* Adaptive jurisdictional form generation (future).

* Integration with reminders or court APIs.

---

## **🧱 Functional Requirements**

| ID | Requirement | Type |
| ----- | ----- | ----- |
| 12.1 | Render `/intake` route with conversational input form | Functional |
| 12.2 | Accept user’s plain-language problem description | Functional |
| 12.3 | Submit text to `/api/ai/intake` endpoint (secured) | Functional |
| 12.4 | Apply moderation via `lib/ai/moderate.ts` | Security |
| 12.5 | Generate classification via GPT-4o-mini model | Functional |
| 12.6 | Parse result with `IntakeResult` schema | Functional |
| 12.7 | Display structured summary with confirmation screen | UX |
| 12.8 | Allow user to edit and approve before save | UX |
| 12.9 | Save structured result to Firestore `cases` collection | Data |
| 12.10 | Log anonymized result to `aiIntakeLogs` | Compliance |
| 12.11 | Enforce disclaimers \+ opt-in gating | Compliance |

---

## **🎨 Design & UX Guidelines**

* **Page Layout:** 3-step conversational flow (Input → Review → Confirm).

* **Tone:** Empathetic, educational, non-advisory.

* **Components:** `Textarea`, `Button`, `Card`, `Progress`, `Alert`.

* **Color Palette:** Reuse FairForm blues \+ greens for trust and success.

* **Mobile-first:** Single-column scroll layout.

* **Accessibility:** Ensure screen-reader announcements for AI processing states.

**Wireframe Example**

┌────────────────────────────┐  
│ 🧠 AI Intake (Educational Beta)             │  
│--------------------------------------------│  
│ Tell us what’s going on:                   │  
│ \[ I was evicted even though I paid rent. \] │  
│ \[ Submit \]                                 │  
│--------------------------------------------│  
│ 🤖 AI Summary                              │  
│ Case Type: Small Claims                    │  
│ Jurisdiction: Los Angeles County, CA       │  
│ Summary: Tenant alleges wrongful eviction… │  
│ \[ Edit Summary \] \[ Confirm & Continue \]    │  
└────────────────────────────┘

---

## **🧩 Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | API latency ≤ 3s (avg) |
| **Security** | All API calls authenticated \+ moderated |
| **Accessibility** | jest-axe 0 violations |
| **Test Coverage** | ≥ 85 % (unit \+ integration) |
| **Compliance** | Disclaimers visible \+ AI toggle enabled |
| **Data Retention** | No raw user text stored (only hashed summaries) |

---

## **🔐 Dependencies**

| Dependency | Description | Status |
| ----- | ----- | ----- |
| AI Tech Spike | Moderation, schema, prompts, API handler | ✅ Complete |
| Firestore `cases` | Target storage collection | ✅ Available |
| User Settings (Epic 11\) | AI opt-in preference | 🔜 Sprint 3 |
| Compliance Guide | `/docs/06_Compliance.md` | ✅ Published |

---

## **⚙️ Technical Flow**

### **Data Flow Diagram**

User Input  
  ↓  
Moderation (lib/ai/moderate.ts)  
  ↓  
Prompt Construction (lib/ai/prompts/intake.ts)  
  ↓  
AI Model (GPT-4o-mini)  
  ↓  
JSON Response → Schema Validation (lib/ai/schemas.ts)  
  ↓  
Structured Summary (caseType, jurisdiction, summary)  
  ↓  
Firestore (cases collection) \+ aiIntakeLogs

---

## **🧠 Prompt & Schema (Reference)**

**Prompt (from Spike)**

System:  
You are an educational assistant for court self-help users.  
Do NOT provide legal advice. Classify the issue into a U.S. civil case type.  
Return ONLY JSON following this schema:  
{ "caseType": "...", "confidence": 0.9, "jurisdiction": "...", "summary": "..." }

**Schema (Zod)**

export const IntakeResult \= z.object({  
  caseType: z.enum(\['Eviction', 'Small Claims', 'Family', 'Debt', 'Employment', 'Other'\]),  
  confidence: z.number().min(0).max(1),  
  jurisdiction: z.string().min(2),  
  summary: z.string().min(20).max(600)  
});

---

## **🧪 Acceptance Criteria**

* `/intake` route available to authenticated users (after AI opt-in in settings).

* AI moderation layer active (unsafe text blocked).

* AI output validated via schema (invalid \= reject).

* Summary and case type displayed clearly to user.

* User can edit summary before saving.

* Case record created in Firestore on confirmation.

* Anonymized log entry created in `aiIntakeLogs`.

* All disclaimers visible and acknowledged.

* Tests passing with ≥ 85 % coverage.

* 0 accessibility violations.

---

## **🧪 Testing Plan**

| Test Type | Scenario | Expected Outcome |
| ----- | ----- | ----- |
| **Unit** | Moderation rejects unsafe text | Returns 400 |
| **Integration** | Valid input → JSON classification | Correct schema |
| **UX** | Edit summary before save | Firestore reflects edit |
| **Compliance** | Disclaimers visible | Required |
| **Accessibility** | Screen reader reads all statuses | Pass |
| **Performance** | API \<3s | Pass |

---

## **📁 Deliverables**

| File | Purpose |
| ----- | ----- |
| `app/intake/page.tsx` | Main intake interface |
| `components/intake/AIIntakeForm.tsx` | Text input \+ submit UI |
| `components/intake/AISummaryCard.tsx` | Result display \+ edit |
| `lib/hooks/useAIIntake.ts` | API call \+ state management |
| `lib/ai/prompts/intake.ts` | AI prompt templates |
| `lib/ai/schemas.ts` | Zod schema for validation |
| `app/api/ai/intake/route.ts` | Main API endpoint |
| `tests/ai/intake.test.ts` | Full test suite |
| `docs/qa/gates/12.ai-intake.yml` | QA acceptance checklist |

---

## **🔍 Compliance Notes**

* **Disclaimers Required:**

   “AI features in FairForm are educational tools only and do not provide legal advice.”

* **Opt-in Requirement:**

  * Users must enable “AI Participation” in Settings before accessing `/intake`.

* **Moderation Logs:**

  * Store anonymized results only; no raw user input retained.

* **Accessibility:**

  * All conversational responses must be readable by screen readers.

---

## **🧩 Future Enhancements**

### **Phase 2 – Conversational Refinement**
* Multi-turn conversation flow (ask clarifying questions)
* Chat-style interface for back-and-forth dialogue
* Context retention across multiple exchanges
* Dynamic follow-up questions based on confidence scores

### **Phase 3 – Enhanced Input & Evidence**
* File upload for supporting documents (eviction notices, receipts, contracts)
* Voice-to-text input for accessibility
* Photo upload (e.g., housing conditions, property damage)
* Multi-language support

### **Phase 4 – Intelligence & Feedback**
* User feedback mechanism ("Was this classification accurate?")
* Analytics dashboard for administrators:
  - Classification accuracy trends
  - Confidence score distributions
  - Case type patterns
  - Moderation flag analysis
* A/B testing framework for prompt improvements
* Machine learning refinement based on user corrections

### **Phase 5 – Integration & Automation**
* Auto-generate case journey steps based on case type
* Jurisdiction-aware legal form suggestions
* Integration with Reminder system (auto-create deadlines)
* Integration with Day in Court Checklist (Epic 10)
* Link to relevant glossary terms (Epic 7)

### **Phase 6 – Admin & Compliance Tools**
* Admin dashboard for reviewing flagged content
* Manual override/correction of AI classifications
* Audit trail for compliance reporting
* Export logs for legal review
* Batch processing for training data

---

## **✅ Epic Complete When**

* AI Intake end-to-end flow functional in staging.

* Feature flag toggleable via `lib/flags.ts`.

* Users can describe issue → confirm summary → save case.

* All disclaimers visible and compliance approved.

* QA sign-off achieved and demo-ready for Sprint Review.

---

**End of Epic 12 PRD**
