# Epic 18: Smart Form Filler

## 📝 Overview

**Status:** PLANNED - Phase 6 of Value-First Demo Roadmap
**Priority:** P1 (High value demo feature)
**Estimated Effort:** 3 weeks
**Dependencies:** Epic 13 (AI Copilot), Epic 7 (Glossary), Epic 16 (Deadline Engine)

## 🎯 Purpose

Enable users to complete and download legally valid court forms with AI guidance, bridging the gap between "knowing what to do" and "actually doing it." This epic adds the critical "Act" phase to the user journey, providing tangible output that users can file or bring to court.

**User Journey Addition:**
- **Old:** Talk → Import → Auto-Plan → Explain → Remind → Show Up Confident
- **New:** Talk → Import → Auto-Plan → Explain → Remind → **Act** → Show Up Confident

## 💡 Value Proposition

| Dimension | Description |
|-----------|-------------|
| **User Value** | Converts "knowing what to do" → "actually doing it." Gives users an artifact they can file or bring to court. |
| **Demo Value** | Visible and impressive — live AI → completed legal form (e.g., Appearance, Continuance Request). |
| **Technical Fit** | Reuses Copilot + Case Context (`caseId`, `caseType`, `jurisdiction`). |
| **UX Flow** | Conversational, friendly, guided question-by-question — "TurboTax for court forms." |
| **Emotional Arc** | 😕 Hesitant → 💬 Engaged → 🧾 Accomplished |

## 🌟 Demo Moment

> "Watch: FairForm recognizes you need an Appearance Form, walks you through the questions, fills it out, and gives you a downloadable PDF — all guided by AI."

**Expected Investor Reaction:** "This is tangible empowerment — not just advice, but action."

## 🧩 Integration with Existing Epics

| Existing Epic | Relationship to Smart Form Filler |
|---------------|----------------------------------|
| **13 – Copilot** | Entry point and context provider ("You probably need to file an Appearance Form"). |
| **15 – Case Lookup** | Supplies case type & court — determines which forms apply. |
| **16 – Deadline Engine** | Suggests when the form is due. |
| **7 – Explain-As-You-Go** | Provides inline legal coaching while filling fields. |
| **9 – Smart Reminders** | Adds "File [form name]" reminder with deadline. |
| **17 – Hearing Day Mode** | Connects by offering "Your form is ready — print for court." |

## 🎬 User Journey Flow

### 1. AI Detects Need for a Form
**Trigger:** Copilot recognizes from context
**Example:** "You'll need to file an Appearance Form for your Marion County eviction case."

### 2. AI Loads Form Template
**Source:** `/lib/forms/marion/*.json`
**Data:** Field definitions, instructions, conditions, PDF template reference

### 3. Guided Conversation
**Experience:** Question-answer dialogue for each field
**Support:** Glossary and hints (Epic 7) explain legal terms
**Pacing:** Conversational rhythm — one field at a time

### 4. AI Validation & Review
**Quality Checks:**
- Date validation
- Address formatting
- Case number verification
- Required field completion
- Logic rules (conditional fields)

### 5. Generate PDF
**Process:** Merge answers into form template → create printable file
**Fallback:** HTML preview if PDF generation fails (transparent to user)

### 6. User Action Options
- ✅ Download PDF
- 📧 Email to myself
- 📱 "Remind me to file this" (connects to Epic 9)
- 🎉 Celebration animation (confetti) on completion

## 📋 Stories

### Story 18.1: Form Template System
**Purpose:** Create JSON-based form definition system

**Key Requirements:**
- JSON schema for form definitions
- Field types: text, date, select, checkbox, radio
- Conditional field logic
- Validation rules per field
- Marion County form templates (Appearance, Continuance)

**Deliverables:**
- `/lib/forms/types.ts` - TypeScript interfaces
- `/lib/forms/marion/appearance.json` - Appearance form template
- `/lib/forms/marion/continuance.json` - Motion for Continuance template
- `/lib/forms/formLoader.ts` - Template loading utility

---

### Story 18.2: Conversational Form Session Component
**Purpose:** Build UI for guided form filling within chat interface

**Key Requirements:**
- `<FormSession />` component family
- Progress indicator (e.g., "Question 3 of 12")
- Field cards with conversational presentation
- Validation feedback
- Edit/back navigation
- Integration with `<ChatThread />`

**UX Notes:**
- Should feel like extension of chat, not separate app
- Modal overlay or embedded sub-thread
- Clear visual distinction from general chat
- Maintain conversational tone

**Deliverables:**
- `/components/ai-copilot/FormSession.tsx`
- `/components/ai-copilot/FormFieldCard.tsx`
- `/components/ai-copilot/FormProgressBar.tsx`
- `/components/ai-copilot/FormCompleteCard.tsx`

---

### Story 18.3: Form Intent Detection
**Purpose:** AI detects when user needs a specific form

**Key Requirements:**
- Intent detection in conversation context
- Form matching by case type and situation
- Confidence scoring
- Graceful offer (not forced)
- User can accept or decline

**Integration Points:**
- Copilot context analysis (Epic 13)
- Case type from case context (Epic 6.5)
- Glossary for form name explanations (Epic 7)

**Deliverables:**
- `/lib/ai/formIntentDetection.ts`
- `/lib/ai/formMatcher.ts`
- Updated `/app/api/ai/copilot/chat/route.ts`

---

### Story 18.4: Form Data Collector
**Purpose:** Extract and validate form data from conversation

**Key Requirements:**
- Parse user responses for each field
- Type coercion and formatting
- Validation per field rules
- Conversational error recovery
- Pre-populate from case context when possible

**Data Sources:**
- Case data (case number, type, jurisdiction)
- User profile (name, address, contact)
- Conversation context
- Direct user input during form session

**Deliverables:**
- `/lib/forms/dataCollector.ts`
- `/lib/forms/validators.ts`
- `/lib/forms/formatters.ts`

---

### Story 18.5: PDF Generation Engine
**Purpose:** Generate downloadable court forms as PDF

**Key Requirements:**
- PDF generation using `pdf-lib` or `@react-pdf/renderer`
- Field mapping to PDF form fields
- Proper formatting and positioning
- **Preflight check:** Verify all required fields mapped
- **Transparent fallback:** HTML preview if PDF fails
- Local generation (no external services)

**File Storage:**
- Path: `/user/forms/{caseId}/{formId}.pdf`
- Metadata stored in Firestore
- Linked to case record

**Deliverables:**
- `/lib/forms/pdfGenerator.ts`
- `/lib/forms/pdfPreflight.ts`
- `/lib/forms/htmlFallback.ts`
- PDF templates in `/public/forms/marion/`

---

### Story 18.6: Form Completion & Actions
**Purpose:** Post-completion user actions and integrations

**Key Requirements:**
- Download completed PDF
- Email PDF to user
- "Remind me to file" → creates reminder (Epic 9)
- Links form to case timeline
- Celebration UI (confetti animation)
- Form appears in case dashboard

**Integration Points:**
- Reminder system (Epic 9) - add filing reminder
- Deadline engine (Epic 16) - suggest due date
- Case context (Epic 6.5) - attach form to case
- Dashboard (Epic 2) - show completed forms

**Deliverables:**
- `/lib/forms/formActions.ts`
- `/components/ai-copilot/FormSuccessCard.tsx`
- `/app/api/forms/download/route.ts`
- `/app/api/forms/email/route.ts`

---

### Story 18.7: Demo Mode Form Flow
**Purpose:** Perfect demo experience with canned data

**Key Requirements:**
- Pre-filled form scenarios for demo
- Fast, deterministic flow
- No external dependencies
- Smooth timing (3-5 minutes total)
- Polished animations and transitions

**Demo Scenarios:**
1. Eviction case → Appearance form
2. Small claims → Continuance motion

**Deliverables:**
- `/lib/forms/demoScenarios.ts`
- Demo data fixtures
- Timing configuration
- Demo mode toggle

---

### Story 18.8: Form Testing & Validation
**Purpose:** Comprehensive testing of form system

**Key Requirements:**
- Unit tests for all form utilities
- Integration tests for full flow
- PDF generation testing
- Fallback scenario testing
- Accessibility testing
- E2E demo flow testing

**Test Coverage Targets:**
- Form logic: ≥85%
- UI components: ≥80%
- PDF generation: 100% (critical path)
- Integration: Full happy path + error scenarios

**Deliverables:**
- `/tests/lib/forms/*.test.ts`
- `/tests/components/ai-copilot/form*.test.tsx`
- `/tests/e2e/form-completion.spec.ts`

---

## 🧱 Technical Architecture

### Form Template Structure (JSON)
```json
{
  "formId": "marion-appearance",
  "title": "Appearance Form",
  "description": "Notice of appearance for court proceedings",
  "jurisdiction": "marion-county-in",
  "caseTypes": ["eviction", "small_claims"],
  "pdfTemplate": "/forms/marion/appearance-template.pdf",
  "fields": [
    {
      "id": "defendant_name",
      "label": "Your Full Legal Name",
      "type": "text",
      "required": true,
      "hint": "Enter your name exactly as it appears on official documents",
      "glossaryTerm": "defendant",
      "validation": {
        "minLength": 2,
        "pattern": "^[a-zA-Z\\s'-]+$"
      },
      "prefill": "case.defendantName"
    },
    {
      "id": "case_number",
      "label": "Case Number",
      "type": "text",
      "required": true,
      "hint": "Found on your court notice (e.g., 49D01-2410-SC-012345)",
      "prefill": "case.caseNumber",
      "validation": {
        "pattern": "^\\d{2}[A-Z]\\d{2}-\\d{4}-[A-Z]{2}-\\d{6}$"
      }
    },
    {
      "id": "hearing_date",
      "label": "Next Hearing Date",
      "type": "date",
      "required": true,
      "hint": "The date of your next scheduled court appearance",
      "prefill": "case.nextHearingDate",
      "validation": {
        "minDate": "today",
        "maxDate": "+1year"
      }
    },
    {
      "id": "has_attorney",
      "label": "Do you have an attorney?",
      "type": "radio",
      "required": true,
      "options": [
        {"value": "no", "label": "No, I am representing myself"},
        {"value": "yes", "label": "Yes, I have an attorney"}
      ],
      "default": "no"
    },
    {
      "id": "attorney_name",
      "label": "Attorney Name",
      "type": "text",
      "required": false,
      "condition": {
        "field": "has_attorney",
        "value": "yes"
      }
    }
  ]
}
```

### Component Architecture
```
components/ai-copilot/
├── FormSession.tsx          # Main form session container
├── FormFieldCard.tsx        # Individual field Q&A card
├── FormProgressBar.tsx      # Progress indicator
├── FormCompleteCard.tsx     # Success/completion UI
└── FormErrorBoundary.tsx    # Error handling

lib/forms/
├── types.ts                 # TypeScript interfaces
├── formLoader.ts            # Load form templates
├── dataCollector.ts         # Collect & validate data
├── validators.ts            # Field validation rules
├── formatters.ts            # Data formatting utilities
├── pdfGenerator.ts          # PDF generation
├── pdfPreflight.ts          # Pre-generation checks
├── htmlFallback.ts          # HTML preview fallback
├── formActions.ts           # Post-completion actions
└── demoScenarios.ts         # Demo data

lib/forms/marion/
├── appearance.json          # Appearance form template
└── continuance.json         # Continuance motion template

public/forms/marion/
├── appearance-template.pdf  # Blank PDF form
└── continuance-template.pdf # Blank PDF form
```

### Data Flow
```
1. User conversation with Copilot
2. Intent detection: "User needs Appearance form"
3. Load form template from JSON
4. Start FormSession component
5. For each field:
   a. Show conversational question card
   b. Collect user response
   c. Validate and format
   d. Show confirmation
6. All fields complete → Preflight check
7. Generate PDF (or HTML fallback)
8. Show success card with actions
9. User downloads/emails/sets reminder
```

## 🎯 Scope: Demo MVP

### Included (Demo)
✅ **Forms:** 2 Marion County forms (Appearance, Continuance)
✅ **Case Types:** Eviction, Small Claims
✅ **Fields:** 2-5 fields per form (core data only)
✅ **PDF Generation:** Local generation with fallback
✅ **Conversational UI:** Guided Q&A in chat interface
✅ **Prefill:** Auto-populate from case context
✅ **Validation:** Basic field validation
✅ **Actions:** Download, Remind me to file
✅ **Integration:** Copilot, Glossary, Deadlines, Reminders
✅ **Demo Mode:** Canned scenarios, fast flow

### Deferred (Post-Demo)
⏸️ E-filing integration
⏸️ Digital signatures
⏸️ Multi-county forms
⏸️ Complex conditional logic
⏸️ Form version management
⏸️ Multi-page forms (>2 pages)
⏸️ Attorney filing on behalf
⏸️ Batch form operations

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Form Completion Rate | ≥90% | Users who start form → complete it |
| Time to Complete | ≤5 min | Average time for Appearance form |
| PDF Generation Success | ≥98% | Successful PDF creation (with fallback) |
| User Satisfaction | ≥4.5/5 | Post-completion survey rating |
| Prefill Accuracy | ≥95% | Correct auto-populated fields |
| Validation Catch Rate | ≥90% | Invalid inputs caught before submission |
| Demo Flow Time | 3-5 min | Complete demo scenario timing |

## 🎨 UX Design Principles

### Conversational Pacing
- One field at a time
- Acknowledge each answer
- Natural conversation flow
- Clear progress indication

### Emotional Support
- Encouraging microcopy
- Celebration on completion
- Clear explanations for legal terms
- "You've got this" tone

### Error Recovery
- Conversational error messages
- Easy to go back and edit
- Clear validation feedback
- No dead ends

### Visual Continuity
- Matches chat interface
- Smooth transitions
- Progress always visible
- Clear mode indication

## 🔗 Integration Points

### Epic 13 (AI Copilot)
- **Form intent detection** in conversation
- **Launch FormSession** from chat
- **Return to chat** after completion
- **Share context** bidirectionally

### Epic 7 (Glossary)
- **Inline definitions** for legal terms in form fields
- **"What does this mean?"** buttons
- **Example answers** for complex fields

### Epic 16 (Deadline Engine)
- **Suggest filing deadline** based on form type
- **Show urgency** if deadline approaching
- **Link form to timeline** events

### Epic 9 (Reminders)
- **"Remind me to file"** action
- **Set reminder** with suggested deadline
- **Include form download link** in reminder

### Epic 6.5 (Case Context)
- **Auto-populate** from case data
- **Attach completed form** to case
- **Show forms** in case dashboard
- **Track form status** (draft, complete, filed)

### Epic 17 (Hearing Day Mode)
- **Include form** in court checklist
- **"Print your forms"** reminder
- **Form verification** checklist item

## ⚙️ Technical Considerations

### PDF Generation
- **Library:** Use `pdf-lib` for flexibility
- **Fallback:** Always offer HTML preview
- **Preflight:** Verify all mappings before generation
- **Templates:** Store blank PDFs in `/public/forms/`
- **Browser:** Client-side generation (no server round-trip)

### Data Privacy
- **No external services:** All processing local/Firebase
- **Temporary storage:** Form data cleared after download
- **User control:** Can delete form data anytime
- **Audit trail:** Track form creation, not content

### Performance
- **Template preload:** Load form definitions on mount
- **Lazy PDF generation:** Only generate when user downloads
- **Optimistic UI:** Show success before full save
- **Progress feedback:** Show each step clearly

### Accessibility
- **Keyboard navigation:** Full form completion without mouse
- **Screen reader support:** Proper ARIA labels
- **Focus management:** Logical tab order
- **Error announcements:** Screen reader feedback

## 📝 Implementation Timeline

### Week 1: Foundation & Templates
**Stories:** 18.1, 18.2
**Focus:** Form template system + UI components
**Deliverables:**
- JSON form definitions
- FormSession component family
- Basic field rendering

### Week 2: AI Integration & Data Flow
**Stories:** 18.3, 18.4
**Focus:** Intent detection + data collection
**Deliverables:**
- Form intent detection in Copilot
- Data collection and validation
- Context prefilling

### Week 3: PDF Generation & Polish
**Stories:** 18.5, 18.6, 18.7, 18.8
**Focus:** PDF output + completion flow + demo + testing
**Deliverables:**
- PDF generation with fallback
- Download/email/reminder actions
- Demo scenarios perfected
- Full test coverage

## 🚀 Demo Script

### Setup
"I've created my eviction case through conversation with the AI. Now I need to file an Appearance form with the court."

### Act 1: Intent Detection
**Copilot:** "For your Marion County eviction case, you'll need to file an Appearance Form to notify the court you're representing yourself. I can help you fill it out now. Would you like me to guide you through it?"

**User:** "Yes, let's do it."

### Act 2: Guided Form Filling
**Copilot:** "Great! Let's start with your full legal name as it appears on official documents..."

*[Conversational Q&A for 3-4 fields, 2-3 minutes]*

**Progress shown:** "Question 3 of 5"

### Act 3: Completion
**Copilot:** "Perfect! I have all the information I need. Let me generate your Appearance Form..."

*[Brief processing animation]*

**Success Card:**
```
🎉 Your Appearance Form is ready!

✓ Case Number: 49D01-2410-SC-012345
✓ Hearing Date: November 15, 2025
✓ Court: Marion County Superior Court

[Download PDF] [Email to Me] [Remind Me to File]
```

### Act 4: Action
**User clicks:** "Remind Me to File"

**Copilot:** "I've set a reminder for November 13, 2025 (2 days before your hearing) to file this form. You can download it anytime from your case dashboard."

### Investor Reaction
"That's brilliant — you've taken legal advice and made it actionable. This is real empowerment."

## 🛡️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF generation fails | High | Transparent HTML fallback always available |
| Wrong form suggested | Medium | Confidence threshold + user can decline |
| Field validation too strict | Medium | Conversational error recovery + examples |
| Slow form completion | Low | Progress indication + can save and return |
| Legal accuracy concerns | High | Clear disclaimers + attorney review recommended |
| Browser compatibility | Medium | Test major browsers + graceful degradation |

## ✅ Definition of Done

**Epic 18 is complete when:**
- ✅ Users can complete Appearance form via conversation
- ✅ PDF generation works with fallback
- ✅ Forms integrate with Copilot, Glossary, Deadlines, Reminders
- ✅ Demo scenario runs smoothly in 3-5 minutes
- ✅ All 8 stories pass acceptance criteria
- ✅ Test coverage meets targets (≥80%)
- ✅ Accessibility compliance verified
- ✅ Demo script validated with stakeholders
- ✅ Documentation complete

---

**Created by:** Strategic Roadmap Planning
**Date:** October 15, 2025
**Roadmap Context:** Phase 6 - Action Layer (VALUE-FIRST strategy)
**Status:** PLANNED - Ready for story breakdown
**Next Steps:** Create individual story files (18.1-18.8) using BMAD methodology

---

## 📚 References

- **Strategic Context:** `docs/STRATEGIC-ROADMAP-VALUE-FIRST.md`
- **Roadmap:** `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md`
- **Form Filler Concept:** `docs/Form_filler_idea.md`
- **UX Journey:** `docs/fairform_ux_journey_map.md`
- **Related PRDs:**
  - Epic 13: `docs/prd/epic-13-ai-copilot.md`
  - Epic 7: `docs/prd/epic-7-inline-glossary-system.md`
  - Epic 16: (to be created) Deadline Engine
  - Epic 9: `docs/prd/epic-9-reminder-system.md`
