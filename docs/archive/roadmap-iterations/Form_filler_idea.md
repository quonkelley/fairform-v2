## **🧠 What You Just Described**

“The AI chatbot helps you identify the proper forms you need, guides you through filling them out, and produces a downloadable or printable PDF.”

That is essentially **AI-Guided Form Generation** — or what we might call **Epic 18: Smart Form Filler.**

It fits perfectly into the **Value-First journey** between “Auto-Plan” and “Show Up Confident,” and it bridges user guidance with *tangible output.*

---

## **✨ Value Proposition**

| Dimension | Description |
| ----- | ----- |
| **User Value** | Converts “knowing what to do” → “actually doing it.” Gives the user an artifact they can file or bring to court. |
| **Demo Value** | Visible and impressive — live AI → completed legal form (e.g., Appearance, Continuance Request). |
| **Technical Fit** | Reuses Copilot \+ Case Context (`caseId`, `caseType`, `jurisdiction`). |
| **UX Flow** | Conversational, friendly, guided question-by-question — “TurboTax for court forms.” |

---

## **🧩 How It Fits the Existing Ecosystem**

| Existing Epic | Relationship to Smart Form Filler |
| ----- | ----- |
| **13 – Copilot** | Entry point and context provider (“You probably need to file an Appearance Form”). |
| **15 – Case Lookup** | Supplies case type & court — determines which forms apply. |
| **16 – Deadline Engine** | Suggests when the form is due. |
| **7 – Explain-As-You-Go** | Provides inline legal coaching while filling fields. |
| **17 – Hearing Day Mode** | Connects by offering “Your form is ready — print for court.” |

So this isn’t a tangent — it’s the **natural continuation** of the Marion MVP experience.

---

## **🧱 Epic 18: Smart Form Filler (Draft Overview)**

| Attribute | Details |
| ----- | ----- |
| **Epic Goal** | Allow users to complete and download legally valid court forms with AI assistance. |
| **User Outcome** | “I can fill out the form I need in minutes, and I understand what each field means.” |
| **Demo Value** | AI identifies the correct form and walks the user through it conversationally → produces downloadable PDF. |
| **Scope (Demo)** | Limited to 1–2 key Marion County forms (e.g., Appearance, Motion for Continuance). |
| **Defer (Post-Demo)** | Signature validation, e-filing, multiple jurisdictions. |

---

### **🔧 Functional Flow (User Journey)**

1. **AI Detects Need for a Form**

   * Copilot recognizes from context (“You’ll need to file an Appearance”).

2. **AI Loads Form Template**

   * Pulls metadata from `/lib/forms/marion/*.json`  
      (fields, instructions, conditions, PDF template).

3. **Guided Conversation**

   * Each field is filled via question-answer dialogue.

   * Glossary and hints (Epic 7\) explain terms.

4. **AI Validation & Review**

   * Checks logic (dates, addresses, case numbers).

5. **Generate PDF**

   * Merges answers into local template → creates printable/downloadable file.

6. **User Action**

   * Options: Download / Email / “Remind me to file this” (hook to Epic 9).

---

### **🧩 Technical Architecture (Lightweight Demo Version)**

* **Frontend:** Reuse Copilot chat UI (`<ChatThread />` or `<FormSession />` variant).

**Templates:** JSON-based field definitions:

 {  
  "formId": "marion-appearance",  
  "title": "Appearance Form",  
  "fields": \[  
    {"name": "defendant\_name", "label": "Your Name", "type": "text"},  
    {"name": "case\_number", "label": "Case Number", "type": "text"},  
    {"name": "hearing\_date", "label": "Hearing Date", "type": "date"}  
  \]  
}

*   
* **AI Layer:** GPT-5 uses these definitions to drive Q\&A and validation.

* **PDF Engine:** `pdf-lib` or `@react-pdf/renderer` for local PDF generation.

* **Storage:** Saved in `/user/forms/{caseId}/{formId}.pdf`.

---

### **🧩 Suggested Epic 18 Timeline**

| Sprint | Focus | Output |
| ----- | ----- | ----- |
| **Week 1 (Jan 26–30)** | Identify target forms \+ create JSON templates | `/lib/forms/marion/*.json` |
| **Week 2 (Feb 2–6)** | Build conversational form filler | “AI walks you through Appearance form” |
| **Week 3 (Feb 9–13)** | Generate \+ download PDF | Local file generation demo-ready |

---

### **🔗 Integration Hooks**

| Integration | Function |
| ----- | ----- |
| **Copilot (Epic 13\)** | “Form Trigger” intent → starts form session |
| **Deadline Engine (16)** | Suggests deadline to file the form |
| **Reminders (9)** | Adds “File Appearance Form” reminder |
| **Explain-As-You-Go (7)** | Legal term explanations during form filling |
| **Case Context (6.5)** | Links generated PDF to `caseId` and stores metadata |

---

### **⚡ Demo Moment**

“Watch: FairForm recognizes you need an Appearance Form, walks you through the questions, fills it out, and gives you a downloadable PDF — all guided by AI.”

---

### **🧭 Roadmap Placement**

This becomes the **capstone feature** immediately after Hearing Day Mode:

| Phase | Epic | Title | Value Moment |
| ----- | ----- | ----- | ----- |
| 6 | **18 – Smart Form Filler** | “AI-guided form creation and PDF export.” | Tangible proof of user empowerment. |

It bridges your **AI conversational layer (Epic 13\)** and **actionable outcomes** (forms, documents, reminders).

