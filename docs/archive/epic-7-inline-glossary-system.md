## **🧩 Epic 7 – Inline Glossary System**

**Phase:** 1.1 — Legal GPS Experience  
 **Owner:** Mary (BMAD AI)  
 **Status:** 🟡 Planned / Design Approved  
 **Sprint Target:** Sprint 3 UI Polish  
 **Dependencies:** Epic 6 (Case Journey Map), Epic 8 (Step Details)

---

### **🎯 Goal**

Help users understand legal terminology instantly, without leaving the flow of their task.

### **💡 Problem Statement**

Legal forms and procedural instructions are full of jargon that confuses SRLs (self-represented litigants). Every time they stop to look something up, they lose momentum or misinterpret a requirement.

---

### **🧠 Solution Concept**

An inline hover/tap glossary system that recognizes and defines legal terms wherever they appear in the app (forms, case journey steps, modals, and checklists).

When a user hovers or taps a highlighted term, a small tooltip or popover shows a plain-language definition and optional “Learn More” link.

---

### **⚙️ Functional Requirements**

| ID | Requirement | Acceptance Criteria |
| ----- | ----- | ----- |
| 7.1 | Glossary Data Source | Static JSON or Firestore collection `legalTerms` with `term`, `definition`, `category`. |
| 7.2 | Term Detection | Component `<GlossaryTerm term="affidavit" />` renders highlighted text with popover. |
| 7.3 | UI Behavior | Popover opens on hover (desktop) or tap (mobile); closes on blur or ESC. |
| 7.4 | Accessibility | Keyboard navigation and screen reader announce definitions. |
| 7.5 | Integration Points | Step Detail Modal, Form Filler, Checklist pages. |

---

### **🔩 Technical Implementation**

* **Component:** `components/common/GlossaryTerm.tsx`

* **UI:** shadcn/ui Popover component \+ Tailwind for styles

* **Data:** `lib/data/legalTerms.json` (seed 50 core terms)

* **Hook:** `useGlossary()` for lookup \+ caching

* **Design Pattern:** Client-side hydration of term dictionary for offline use

---

### **🧪 Testing Criteria**

* Unit tests for term rendering and tooltip content.

* jest-axe 0 violations (ARIA role \= “definition”).

* Verify mobile tap behavior \+ desktop hover.

* Snapshot tests for definition render consistency.

---

### **⚖️ Compliance / Ethics**

* Content written in plain-language grade ≤ 8 reading level.

* Legal accuracy vetted by editorial review.

* Definitions are educational only — not legal advice.

---

### **🚀 Deliverables**

1. `GlossaryTerm` component and unit tests

2. Seed dataset (`legalTerms.json`)

3. Inline integration in Case Journey Modal and Checklist

---

### **✅ Definition of Done**

* Inline definitions appear where terms exist.

* All tests pass ≥ 85 coverage.

* No accessibility violations.

* Content review approved by compliance.

---

---

