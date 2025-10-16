# 🎨 FairForm UX Journey Map — Visual & Interaction Blueprint (v2)

## 🧭 Journey Overview
**Goal:** Visualize how FairForm guides SRLs from confusion to confidence through interconnected experience phases. Each epic contributes to both the *functional progression* and the *emotional arc*.

> **Experience Flow:** Talk → Import → Auto-Plan → Explain → Remind → Act → Show Up Confident

---

## 🧩 Phase 1 — Talk (Epic 13 — AI Copilot)
### 🎬 Emotional Arc
😟 Confused → 🤝 Understood → 💡 Hopeful

### 🧠 Entry Points (Simplified UX - Oct 2025)

**Empty Dashboard State:**
- **Primary CTA:** "Talk to FairForm" → Opens Copilot immediately
- **Secondary Option:** "Already have all your case details?" → Manual case creation
- **Clear Choice:** AI-guided help OR expert direct entry (no confusion)

**Navigation:**
- Desktop nav: "Talk to FairForm" → Opens dashboard with Copilot
- Mobile nav: "AI Assistant" → Opens dashboard with Copilot
- Legacy `/intake` URLs → Redirect to dashboard with Copilot auto-open

**Design Decision (Oct 2025):**
We simplified from 3 confusing options (Copilot, Quick Form, Manual) to 2 clear paths:
1. **AI-Guided:** For users who need conversational help
2. **Manual:** For power users who know exactly what they need

### 🧠 UX Moments
1. User clicks "Talk to FairForm" → Copilot opens with welcoming message
2. User describes situation: "I got an eviction notice in Indianapolis"
3. AI collects information conversationally
4. AI detects readiness (score ≥80) → Shows confirmation card
5. User reviews details → Confirms case creation
6. Case created → Clickable link to case detail page

### 🎨 Visual Layout
- Left: Chat timeline (conversational flow)
- Right: Context card area (case confirmation, case preview)
- Interaction cue: animated Copilot icon to show AI reasoning
- Progress: Readiness score drives when to show confirmation

### ✏️ Components
- `<ChatThread />`
- `<CaseConfirmationCard />` (shows collected details before creating)
- `<CaseCreateCard />` (success message with link)
- `<ActionChips />`
- `<EmptyState />` (with clear AI-guided vs Manual choice)

---

## 📸 Phase 2 — Import (Epic 15 — Case Lookup)
### 🎬 Emotional Arc
😕 Curious → 😌 Relieved

### 🧠 UX Moments
1. User uploads photo of notice.
2. OCR scans and animates highlights on document.
3. Case auto-populates and fades into dashboard.

### 🎨 Visual Layout
- Upload modal → transition into case summary view.
- Progress bar + animated checkmarks for recognized fields.

### ✏️ Components
- `<CaseImportCard />`
- `<UploadProgress />`
- `<CaseSummaryCard />`

---

## ⏰ Phase 3 — Auto-Plan (Epic 16 — Deadline Engine)
### 🎬 Emotional Arc
😰 Overwhelmed → 😌 Organized → 💪 Motivated

### 🧠 UX Moments
1. Timeline slides in with key deadlines.
2. Each deadline has an “Explain” option.
3. AI highlights urgent deadlines.

### 🎨 Visual Layout
- Center timeline with scrolling horizontal animation.
- Color-coded urgency (green, amber, red).

### ✏️ Components
- `<DeadlineList />`
- `<TimelineDot />`
- `<ExplainChip />`

---

## 💬 Phase 4 — Explain (Epic 7 — Inline Glossary)
### 🎬 Emotional Arc
😐 Unsure → 📘 Informed

### 🧠 UX Moments
1. User taps “What does this mean?”
2. Inline definition bubble appears.
3. Option: “Give me an example.” → conversational follow-up.

### 🎨 Visual Layout
- Tooltip overlay on highlighted legal terms.
- Optional expansion card for deeper examples.

### ✏️ Components
- `<StepHint />`
- `<GlossaryTerm />`
- `<HintExampleCard />`

---

## 🔔 Phase 5 — Remind (Epic 9 — Smart Notifications)
### 🎬 Emotional Arc
😬 Distracted → ⏰ Supported → ✅ Prepared

### 🧠 UX Moments
1. Reminder toast appears with clear context.
2. User customizes reminder timing.
3. Notification panel shows sync success.

### 🎨 Visual Layout
- Notification panel slides from top-right.
- Gentle animations (fade-in/out, bell pulse).

### ✏️ Components
- `<ReminderCard />`
- `<NotificationPanel />`
- `<SyncBadge />`

---

## 📝 Phase 6 — Act (Epic 18 — Smart Form Filler)
### 🎬 Emotional Arc
😕 Hesitant → 💬 Engaged → 🧾 Accomplished

### 🧠 UX Moments
1. Copilot detects form need (“You’ll need an Appearance form.”)
2. User confirms → Chat morphs into guided form Q&A.
3. Progress bar shows completion.
4. “Your form is ready” card → download or reminder option.

### 🎨 Visual Layout
- Conversational Q&A cards stacked vertically.
- Progress indicator top-right.
- Celebration animation on completion.

### ✏️ Components
- `<FormSession />`
- `<FormFieldCard />`
- `<ProgressBar />`
- `<FormCompleteCard />`

---

## 🏛️ Phase 7 — Show Up Confident (Epic 17 — Hearing Day Mode)
### 🎬 Emotional Arc
😟 Anxious → 😌 Grounded → 💪 Confident

### 🧠 UX Moments
1. User opens “Court Mode.”
2. Checklist appears with prep items and tips.
3. Calming microcopy and animations.

### 🎨 Visual Layout
- Minimal dark mode screen for focus.
- Checklist UX with clear completion states.
- Encouraging message as final item.

### ✏️ Components
- `<HearingPrep />`
- `<ChecklistItem />`
- `<EncouragementCard />`

---

## 🎨 Emotional Journey Summary
```
Confused → Understood → Relieved → Organized → Informed → Supported → Empowered → Confident
```
Visual transitions between phases should feel like progress toward control.

---

## 💡 Core UX Design Principles
| Principle | Description | Example |
|------------|--------------|----------|
| **Empathetic Flow** | Emotionally aware microcopy + visual calm | “We’ve got this together.” during OCR scan |
| **Progress Transparency** | Visualize state changes and user wins | Progress bar + confetti moments |
| **Consistency Across Modes** | Maintain unified layout and tone | Same design language in chat, forms, dashboard |
| **Accessibility First** | Readable, focusable, high-contrast UI | Dark mode for Court Mode |
| **Guided Autonomy** | Let users feel in control, never lost | Undo, confirm, and explain actions |

---

**Design North Star:**  
> "Every screen helps the user breathe easier."

