# **🧭 Leadership Decision Memo – AI Gating Removal & Copilot Launch**

**To:** FairForm Leadership Team  
 **From:** Mary (BMAD AI), Product Strategy  
 **Date:** October 2025  
 **Subject:** Transition from AI Intake → AI Copilot & Dynamic Intake Experience

---

## **1\. Executive Summary**

We propose removing all gating around AI interactions and upgrading our “AI Intake” to a full **AI Copilot** — a persistent, context-aware conversational assistant.

This change:

* Dramatically improves demo impact (instant access, frictionless experience)

* Aligns with user feedback for “always-on help”

* Keeps compliance and safety frameworks intact

* Positions FairForm as a leader in accessible, AI-guided justice experiences

---

## **2\. Why This Change**

| Challenge | Proposed Solution |
| ----- | ----- |
| Gated experience limits exploration | Remove gating – AI chat available anywhere |
| AI feels like a form filler, not an assistant | Introduce context-aware, continuous chat |
| Lost context after intake | Persistent Firestore \+ context broker architecture |
| Demo lacks wow factor | Instant, conversational onboarding |
| Compliance risk of open chat | New moderation \+ disclaimers layer ensures safety |

---

## **3\. What Changes Technically**

| Layer | Before | After |
| ----- | ----- | ----- |
| **UI** | “Start Case” button gated flow | Persistent chat bubble accessible app-wide |
| **Data Model** | AI writes to new case doc only after completion | Copilot dynamically syncs case context mid-conversation |
| **Architecture** | One-time form Q\&A | Continuous context injection via middleware |
| **Compliance** | Static disclaimer at start | Dynamic disclaimers per sensitive response |
| **Demo Mode** | Disabled AI for non-auth users | Full sandbox mode enabled for demos |

---

## **4\. Compliance & Safety Impact**

* Updated **Responsible AI Framework** (Epic 13 PRD §5) ensures educational-only boundaries.

* **Moderation endpoints** and **disclaimer injection** mitigate risk of perceived advice.

* **Demo sandbox mode** isolates data and disables PII logging.

---

## **5\. Implementation Timeline**

| Week | Deliverable |
| ----- | ----- |
| Week 1 | Chat shell, middleware, demo sandbox |
| Week 2 | Context integration (case \+ user data) |
| Week 3 | Compliance layer, QA polish, demo-ready handoff |

---

## **6\. Demo Readiness Criteria**

✅ Conversational case creation  
 ✅ Context-aware chat memory  
 ✅ Accessible anywhere in-app  
 ✅ No login or form gate  
 ✅ Zero flagged compliance issues

---

## **7\. Decision Points (Leadership Input Requested)**

1. **Demo Scope:** Real Firestore or sandbox dataset?

2. **Form Integration:** Allow AI to reference real SC-100 forms?

3. **Disclaimers:** Persistent or conditional display?

4. **Telemetry:** Should AI chat analytics be logged during demo?

5. **Public vs Internal:** Is Copilot ready for external testing?

---

## **8\. Strategic Value**

This evolution is more than a feature — it’s a **new user experience layer** that transforms FairForm from a form-based legal app into an **AI-powered guidance platform**.  
 Removing gates and adding context-awareness shows leadership, accessibility, and innovation in the justice tech space — all aligned with our core mission.

---

**Prepared by:** Mary (BMAD AI)  
 **For:** FairForm Product & Leadership Team  
 **Date:** October 2025  
 **Version:** v1.0