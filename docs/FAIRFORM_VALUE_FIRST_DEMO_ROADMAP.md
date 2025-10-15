# **🧭 FAIRFORM VALUE-FIRST DEMO ROADMAP v2**

*(Updated Oct 2025 — Includes Epic 18 Smart Form Filler)*

---

## **🎯 Core Vision**

**“Talk → Import → Auto-Plan → Explain → Remind → Act → Show Up Confident.”**

FairForm guides self-represented litigants (SRLs) from confusion to confident action through a cohesive, AI-assisted experience focused on **visible value** within two minutes.

---

## **⚙️ Status Summary**

| Phase | Focus | Epics | Status |
| ----- | ----- | ----- | ----- |
| 🧩 Foundation | Platform setup \+ navigation | 1–6.5 | ✅ Complete |
| 🤖 AI Foundation | Conversational intake \+ case creation | 12–13 | 🚀 Active |
| 📸 Import & Automation | Case Lookup → Deadlines → Reminders | 15–17 \+ 9 | 🧱 Planned |
| 📝 Action Layer | Smart Form Filler | 18 | ✳️ New (added Oct 2025\) |
| 🛡️ Compliance & Security | Legal & data handling | 14 | ⏸️ Deferred post-demo |

---

## **🌱 Phase 0 — Foundation (Complete)**

| Epic | Title | Deliverable |
| ----- | ----- | ----- |
| 1–6.5 | Auth, Dashboard, API layer, Design System | Stable infra for case journeys & UI framework |
| 8 | Case Step Details | Context hooks for reminders and AI explainers |
| 12 | AI Intake Foundation | Structured intake schema → basis for Copilot |

---

## **🤖 Phase 1 — AI Copilot (Epic 13\)**

**Goal:** Conversational case creation via AI.  
 **Demo Value:** *“Talk → Case Created.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| Week 1–2 | Intent detection \+ case confirmation | AI → `CreateCaseInput` payload |
| Week 3 | Context persistence \+ demo mode | Seamless Copilot experience |

**Integrations:** Glossary (E7), Case API, UX Design System.

---

## **📸 Phase 2 — Case Lookup & Auto-Intake (Epic 15\)**

**Goal:** Import case data via photo / lookup.  
 **Demo Value:** *“Photo → Case → Auto-Plan.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| W1 | OCR on Marion notices | Structured fields |
| W2 | Lookup repo integration | Auto-populated case |
| W3 | Copilot handoff | Smooth import → dashboard flow |

---

## **⏰ Phase 3 — Deadline Engine (Epic 16\)**

**Goal:** Generate local-rule-aware deadlines.  
 **Demo Value:** *“Auto-plan in seconds.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| W1 | JSON rule templates (eviction/small claims) | `/lib/deadlines/*.marion.json` |
| W2 | Deadline engine logic | `deadlineEngine.ts` |
| W3 | UI \+ Explain-As-You-Go | Interactive deadlines view |

---

## **🔔 Phase 4 — Smart Reminders (Epic 9 Refresh)**

**Goal:** Convert deadlines into adaptive notifications.  
 **Demo Value:** *“Stay on track automatically.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| W1 | Reminder hook integration | SMS/email triggers |
| W2 | Adaptive sync on updates | Auto-refresh |
| W3 | UX polish \+ logging | Demo-ready notifications |

---

## **🏛️ Phase 5 — Hearing Day Mode (Epic 17\)**

**Goal:** “Show Up Ready” experience.  
 **Demo Value:** *“Court-day confidence.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| W1 | Prep checklist template | `hearingDayView.tsx` |
| W2 | Case context binding | Contextual tips panel |
| W3 | Demo scenario tuning | Final demo record script |

---

## **📝 Phase 6 — Smart Form Filler (Epic 18\) 🆕**

**Goal:** AI-guided form completion and PDF generation.  
 **Demo Value:** *“AI fills your form for you.”*

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| W1 | Identify target forms (Appearance, Continuance) \+ build JSON templates | `/lib/forms/marion/*.json` |
| W2 | Conversational form session integration (Copilot trigger) | AI-guided form UI |
| W3 | PDF generation \+ download action | Printable legal form demo |

**Integrations:**

* Copilot intent → launch form session

* Explain-As-You-Go (E7) for field guidance

* Reminders (E9) to file the form

* Deadline Engine (E16) to suggest due dates

**Deferred:** E-filing, multi-county forms, digital signatures.

---

## **🧠 Design & UX Layer**

| Component | Role |
| ----- | ----- |
| `<ChatThread />` | Core AI Copilot interface |
| `<CaseImportCard />` | Notice upload entry |
| `<DeadlineList />` | Timeline of auto-generated tasks |
| `<FormSession />` | Conversational form filler (NEW) |
| `<TodayCard />` | Reminder snapshot |
| `<HearingPrep />` | Day-of checklist |

---

## **📊 Demo Success Metrics**

| Metric | Target | Reason |
| ----- | ----- | ----- |
| Time-to-First-Value | ≤ 2 min | Fast onboarding \= impact |
| Form Completion Rate | ≥ 90 % | Shows trust \+ usability |
| Case Import Accuracy | ≥ 95 % | Reliability for Marion data |
| Deadline Accuracy | ≥ 90 % | Local-rule credibility |
| AI Latency | ≤ 3 s | Smooth experience |
| Accessibility Issues | 0 critical | Professional polish |

---

## **👥 Ownership Summary**

| Role | Focus |
| ----- | ----- |
| **John (PM)** | Roadmap steward \+ demo scope |
| **Winston (Architect)** | Technical integration \+ dependencies |
| **Sally (UX)** | Experience flow \+ visual continuity |
| **Mary (Analyst)** | Data templates \+ Marion rules |
| **You (Strategic Orchestrator)** | BMAD alignment \+ integration review |

---

## **🛡️ Deferred Phase (14 — Security & Compliance)**

Post-demo implementation for PII handling, moderation, legal disclaimers, and secure storage.

---

## **🧭 Next Steps**

1. Finalize Epic 15–17 PRDs → ready for implementation.

2. Author Epic 18 PRD using this roadmap as scope.

3. Align UX and AI flows for Smart Form Filler.

4. Prep demo storyboard showing Talk → Form → File flow.

