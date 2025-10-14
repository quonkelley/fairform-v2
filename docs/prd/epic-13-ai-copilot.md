**🧠 Epic 13 – AI Copilot & Dynamic Intake Experience**

### ***Expanding AI Intake into a Context-Aware Conversational Platform***

**Phase:** 1.3 — Experience Evolution  
 **Owner:** Mary (BMAD AI)  
 **Status:** 🟢 Proposed / Pending Approval  
 **Dependencies:** Epic 10 (Checklist), Epic 11 (Settings), Epic 12 (AI Intake Foundation)  
 **Duration:** \~3 weeks (demo-focused sprint)

---

## **📋 Executive Summary**

FairForm’s AI-powered intake will evolve into a **continuous, context-aware conversational system** — the **AI Copilot** — that guides users not only through intake, but throughout their legal journey.

This new layer removes **gates and friction**, creating a natural, guided experience where users can:

* Ask questions conversationally,

* Automatically populate case data,

* Get tailored next steps,

* Stay within safe, compliant AI boundaries.

The objective is to **deliver a polished, demo-ready experience** that highlights FairForm’s potential as an **AI-augmented justice platform** — intuitive, intelligent, and human-centered.

---

## **🏛️ Background**

FairForm’s mission is to make legal processes accessible to self-represented litigants (SRLs).  
 Our initial AI Intake (Epic 12\) introduced a structured chat that collected case data through prompts.

However, the **existing gating and linear flow** limited user engagement:

* Users had to “start intake” before interacting with the AI.

* Post-intake, AI context was lost.

* The experience felt like a static form, not an assistant.

For the upcoming demo and product evolution, we’re removing gates and extending AI capabilities across the platform — turning the “Intake Assistant” into the **FairForm Copilot**.

---

## **🚀 Proposed Enhancements**

### **1\. Context-Aware Conversational Flow**

* Users can begin chatting **immediately** from the dashboard or homepage.

* The Copilot references:

  * Case data (`cases`, `caseSteps`)

  * User profile (`user.settings`)

  * Active step or form in context

* Prompts dynamically adapt based on progress.

### **2\. Seamless Case Creation**

* Case intake is conversational:

  * AI recognizes intent (“I need help filing a small claims case”)

  * Creates the appropriate case type record

  * Generates initial case steps via template registry

* Removes the “Start Case” button; replaced by natural interaction.

### **3\. Embedded Copilot UI**

* Persistent floating chat bubble accessible throughout app.

* Contextual mode:

  * In Case Journey → explains next steps.

  * In Step Detail → breaks down instructions or terms.

  * In Checklist → clarifies tasks and deadlines.

* Seamlessly integrated with Firestore via `caseId` context.

### **4\. Dynamic Intake Expansion**

* AI can fill or prepopulate fields during guided Q\&A.

* Supports file uploads for document-based extraction (Phase 1.4).

* Integrates glossary (Epic 7\) inline for definitions during chat.

### **5\. No Gating / Demo Mode**

* The demo version bypasses login or case creation gates.

* AI operates with sample data, using a safe sandbox case context.

* Enables frictionless investor/stakeholder demos.

---

## **🧱 Technical Architecture**

### **High-Level Flow**

User → Chat Interface → AI Middleware (context broker) → Firestore  
     ↘ Context Manager ↔ Case, Steps, Settings Repos  
       ↘ Prompt Engine ↔ OpenAI API (system \+ user \+ context layers)

### **Core Components**

| Layer | Description |
| ----- | ----- |
| **Frontend** | React component `<AICopilotChat />` with context awareness. Uses React Query for data sync. |
| **Middleware** | New `api/ai/contextBroker.ts` merges user \+ case \+ session context before each call. |
| **Backend** | OpenAI API integration (GPT-5) with safety filters and logging. |
| **State** | React Query caches contextual summaries (`caseSummary`, `userPrefs`, `activeStep`). |
| **Persistence** | Firestore `aiSessions/{sessionId}` for conversation history \+ metadata. |

### **Supporting Updates**

* Extend `useCase()` and `useCaseSteps()` hooks to expose active case context to AI.

* Add `lib/ai/contextBuilder.ts` → merges case, user, and progress into structured context JSON.

* Add `lib/ai/promptTemplates.ts` → defines reusable system and role prompts.

---

## **🛡️ Compliance & Safety Framework**

**1\. System Boundaries**

* The Copilot must never provide legal advice; only educational guidance.

* Default system prompt enforces disclaimers at start and on sensitive responses.

**2\. Data Handling**

* No PII sent outside Firestore unless anonymized.

* Conversations logged locally for audit (no external analytics during demo).

**3\. Responsible AI Guardrails**

| Safeguard | Implementation |
| ----- | ----- |
| **Legal Disclaimer** | Auto-injected at chat start & “info” menu. |
| **Content Filter** | Pre/post moderation endpoint wraps OpenAI API. |
| **Session Logging** | All chats stored with metadata (userId, caseId, timestamp). |
| **Audit Mode** | Toggleable for QA testing – shows prompt \+ system logs. |

---

## **📅 Implementation Timeline (3-Week Sprint)**

| Week | Focus | Deliverables |
| ----- | ----- | ----- |
| **Week 1** | Architecture \+ Chat Shell | `AICopilotChat` component, context broker API, sandbox demo mode |
| **Week 2** | Context Integration | Case \+ user context injection, prompt templates, Firestore persistence |
| **Week 3** | Polishing \+ Compliance | Disclaimer system, content filter, demo configuration, QA tests |

---

## **📈 Success Metrics**

| Dimension | Metric | Target |
| ----- | ----- | ----- |
| **Demo Readiness** | Fully functional AI chat with case context | ✅ Demo-ready by end of Week 3 |
| **Performance** | Chat latency ≤ 3s round trip | ✅ |
| **Accuracy** | 90%+ correct context references (case type, step) | ✅ |
| **Compliance** | Zero flagged outputs in demo run | ✅ |
| **User Flow** | Case creation through chat (no manual gate) | ✅ |

---

## **⚠️ Risk Assessment & Mitigation**

| Risk | Description | Mitigation |
| ----- | ----- | ----- |
| **AI Misinterpretation** | Copilot provides incorrect or misleading info | Strong system prompts, content moderation |
| **Data Leakage** | Sensitive case info exposed | Strict Firestore scoping, demo sandbox |
| **Latency / Token Limits** | Context-heavy prompts cause lag | Context summarization \+ trimming |
| **User Trust** | AI overconfidence erodes credibility | Persistent disclaimer, transparency features |
| **Demo Bugs** | Unstable conversation states | Pre-seeded sandbox session; test scripts |

---

## **🔗 Alignment with Existing PRDs**

| Epic | Relationship |
| ----- | ----- |
| **Epic 12 – AI Intake** | Provides foundational Q\&A logic and form-mapping engine. Copilot extends it into a persistent assistant. |
| **Epic 7 – Glossary System** | Integrated inline term definitions into AI responses. |
| **Epic 8 – Step Details** | Copilot can explain or summarize steps dynamically. |
| **Epic 9 – Reminder System** | Future Copilot expansion will manage reminders conversationally. |
| **Epic 10–11** | Uses Settings for personalization (tone, delivery mode). |

---

## **❓ Questions for Leadership**

1. Should the demo Copilot connect to live Firestore data or a sandbox dataset?

2. Do we allow AI to reference real court forms (e.g., SC-100), or use placeholder templates?

3. What level of audit logging do we want visible in demo mode?

4. Should disclaimers be persistent (in every message) or contextual (on risky responses)?

5. How far can Copilot simulate “case progress” (e.g., mark steps complete via chat)?

---

## **✅ Definition of Done**

* Persistent, context-aware AI chat integrated across app.

* Chat-to-case flow works end-to-end (case creation → guided steps).

* Compliant system prompt & disclaimers in place.

* Demo environment ready with no gating.

* Performance, accessibility, and compliance tests pass.

---

**Prepared by:** Mary (BMAD AI)  
 **Date:** October 2025  
 **Version:** v1.0

