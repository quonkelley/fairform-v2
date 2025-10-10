# **🎨 FairForm – Design Specification**

**Phase:** 1 MVP – “Legal GPS”  
 **Version:** 1.0  **Date:** October 2025  
 **Owner:** Shaquon K.  **Design Analyst:** Mary

---

## **1\. Purpose**

This design specification defines the **visual language, components, and interaction behaviors** of FairForm’s Phase 1 MVP.  
 It ensures design consistency, accessibility, and emotional alignment across all UI components — enabling both human and AI developers (e.g., Codex in Cursor) to implement features faithfully.

---

## **2\. Design Philosophy**

| Principle | Description |
| ----- | ----- |
| **Empathy over expertise** | Design for people unfamiliar with legal systems — clarity is more important than cleverness. |
| **Guided simplicity** | Every screen leads users toward understanding, not decisions. |
| **Trust through transparency** | Calm, honest visuals build credibility. Avoid aggressive “AI” language or gamified aesthetics. |
| **Mobile-first** | Most SRLs access legal resources via mobile; layouts should scale from 360px up. |
| **Accessible by default** | WCAG 2.1 AA compliance is non-negotiable. |

Tone of voice: *Encouraging, plainspoken, steady.*  
 Example: “Let’s take this one step at a time.” → ✅  
 Avoid: “Don’t worry, we’ve got your case covered.” → ❌ (too presumptive)

---

## **3\. Brand System**

### **Logo & Symbol**

Minimal wordmark: `FairForm`  
 Typeface: Inter SemiBold  
 Color: Justice Blue (\#004E7C)

### **Color Palette**

| Type | Color | Hex | Usage |
| ----- | ----- | ----- | ----- |
| **Primary** | Justice Blue | `#004E7C` | Buttons, highlights, links |
| **Secondary** | Neutral Gray | `#4B5563` | Body text, icons |
| **Background** | Soft Neutral | `#F4F7FB` | Page backgrounds |
| **Accent** | Empower Yellow | `#FFD166` | Progress indicators, alerts |
| **Success** | Balanced Green | `#3BA55D` | Step completed, checkmarks |
| **Error** | Legal Red | `#E63946` | Form validation states |
| **Link / Hover** | Deep Blue | `#023E58` | Active state transitions |

### **Color Ratios**

* Text contrast ≥ 4.5:1

* Interactive elements ≥ 3:1 minimum

* Use of red/yellow limited to 15% of screen area

---

## **4\. Typography**

| Usage | Typeface | Size | Weight | Line Height |
| ----- | ----- | ----- | ----- | ----- |
| Headline (H1) | Inter Bold | 32px | 700 | 1.2 |
| Subhead (H2) | Inter SemiBold | 24px | 600 | 1.3 |
| Body | Inter Regular | 16px | 400 | 1.5 |
| Caption / Label | Inter Medium | 14px | 500 | 1.4 |
| Tooltip / Glossary | Inter Regular | 13px | 400 | 1.5 |

**Typography Rules:**

* One type family (Inter) across all screens for simplicity and accessibility.

* Max 2 font weights per page (Regular \+ SemiBold).

* Headings use sentence case (not title case).

* Text never justified; left-aligned for legibility.

---

## **5\. Spacing, Grid, and Layout**

| Element | Rule |
| ----- | ----- |
| **Grid** | 12-column grid (mobile: 4), 4pt baseline |
| **Container width** | Max 960px, centered |
| **Vertical spacing** | 8 / 16 / 24 / 32px increments |
| **Card padding** | 16px internal, 8px external margin |
| **Touch target size** | Minimum 44×44px |

Example responsive breakpoints:

* Mobile: ≤480px

* Tablet: 768px

* Desktop: ≥1024px

---

## **6\. Component Library (shadcn/ui \+ Tailwind)**

### **Buttons**

| Variant | Styles | Purpose |
| ----- | ----- | ----- |
| Primary | Blue background, white text | Main CTAs (“Next Step”, “Save Case”) |
| Secondary | White background, blue border | Navigation or neutral actions |
| Ghost | Transparent background | Secondary inline actions |
| Disabled | 50% opacity | Non-interactive state |

Hover: lighten blue by 10%.  
 Focus: outline accent yellow (\#FFD166).  
 Keyboard accessible: `tabindex="0"`, `aria-label` on all icons.

---

### **Cards**

Used for case summaries, step instructions, and glossary entries.

**Properties:**

* Background: White

* Border-radius: 16px (2xl)

* Shadow: subtle (`shadow-md`)

* Padding: 16px

* Layout: vertical stack with heading \+ content

---

### **Progress Stepper (Case Journey Map)**

Visual horizontal timeline showing case step sequence.

**Design Rules:**

* Circle nodes connected by progress bar

* Active node: Blue (\#004E7C)

* Completed node: Green (\#3BA55D)

* Inactive node: Gray (\#E5E7EB)

* Label below each node with short action (“File Complaint”, “Serve Notice”)

* Progress bar animates (300ms ease-in-out)

---

### **Form Fields**

| Field Type | Validation | State |
| ----- | ----- | ----- |
| Text / Email | Required | Red border \+ error text on fail |
| Dropdown | Default “Select one…” | On focus: highlight border |
| Date Picker | Due date selector | Calendar popover |
| Checkbox | Checklist steps | Animated checkmark |

All forms use consistent spacing, labels, and error handling.

---

### **Glossary Tooltip**

Triggered on hover/tap of legal term.

| Property | Behavior |
| ----- | ----- |
| Background | White |
| Border | `1px solid #E5E7EB` |
| Shadow | Subtle elevation (`shadow-lg`) |
| Position | Above text by default; responsive fallback below |
| Text | Max 200 characters; plain language only |
| Interaction | Close on ESC or outside click |
| Accessibility | `role="tooltip"`, focusable, keyboard accessible |

---

### **Modals**

Used for “Step Detail” and glossary expansion.

| Attribute | Spec |
| ----- | ----- |
| Width | 600px (max) |
| Close Behavior | Click outside or ESC key |
| Focus Trap | True |
| Transition | Fade-in (250ms) |
| Scroll Lock | Enabled |

---

### **Checklist Items**

For evidence lists or Day-in-Court preparation.

**Layout:**

* Checkbox left, label right

* Optional “info” icon for tips

* Completed items fade to 60% opacity

Color states:

* Default: Neutral gray

* Completed: Green check \+ faded text

---

## **7\. Interaction Patterns**

| Interaction | Expected Behavior |
| ----- | ----- |
| **Navigation** | Persistent top bar with breadcrumbs. Always returnable to Dashboard. |
| **Progress Updates** | Animates incrementally (300ms) upon marking step complete. |
| **Form Save** | Auto-save on blur \+ confirmation toast. |
| **Reminders Setup** | Trigger modal with simple “How would you like reminders?” prompt. |
| **Glossary Access** | Tap → Tooltip → “Learn More” opens modal (no external links in MVP). |

---

## **8\. Motion & Transitions**

* Global fade duration: 200–300ms

* Easing: `ease-in-out`

* Avoid excessive movement — legal users prefer stability.

* Use motion only for *reinforcement*, not decoration.

Examples:

* Step completion → progress bar animation

* Tooltip → scale from 95% to 100%

---

## **9\. Accessibility Guidelines (WCAG 2.1 AA)**

| Area | Requirement |
| ----- | ----- |
| **Contrast** | Text: 4.5:1, icons: 3:1 |
| **Keyboard Nav** | All interactive elements reachable by `Tab` |
| **ARIA Roles** | Tooltips, modals, alerts labeled |
| **Screen Reader Text** | Add visually hidden labels for buttons without text |
| **Focus Indicators** | High-contrast outline (Accent Yellow) |
| **Error Feedback** | Must include text \+ color (not color only) |

---

## **10\. Tone & Content Style Guide**

| Element | Style | Example |
| ----- | ----- | ----- |
| **Headings** | Sentence case | “Your next step” |
| **Buttons** | Verb-driven | “Mark step complete”, not “Continue” |
| **Glossary terms** | Plain language | “Motion” → “A written request to the court.” |
| **Helper text** | Supportive, never judgmental | “Don’t worry, you can update this later.” |
| **Empty states** | Encouraging | “No cases yet — let’s start your first one.” |

---

## **11\. Example Layouts**

### **Dashboard**

Header: FairForm logo \+ user avatar  
Body:  
 ├── “Start New Case” button (primary)  
 ├── List of case cards (title, status, progress)  
Footer: Terms | Privacy | Contact

### **Case Details**

Top: Case summary (type, jurisdiction, status)  
Body:  
 ├── Progress Stepper  
 ├── Step cards (title \+ instructions)  
 ├── Glossary terms embedded  
Bottom: “Mark Complete” button

### **Glossary Modal**

Header: Term  
Body: Plain-language definition  
Footer: “Got it” button

---

## **12\. Deliverables**

| File | Format | Owner |
| ----- | ----- | ----- |
| Component Library | Figma / Tailwind config | Design |
| Logo \+ Colors | SVG \+ JSON tokens | Design |
| Typography Scale | Figma text styles | Design |
| Layout Templates | Figma frames | Design |
| Accessibility Report | WCAG AA checklist | QA |

---

## **13\. Versioning & Change Control**

All visual components follow **semantic versioning** tied to product releases:

* `v1.x` \= Phase 1 MVP

* `v1.5.x` \= Guided Empowerment update

* `v2.x` \= Civic Companion

Component updates documented in `/docs/changelog.md`.

---

✅ **This design specification completes the visual and behavioral blueprint for FairForm’s Phase 1 MVP.**  
 It is ready for development handoff in Cursor, ensuring Codex or human engineers can build UI components accurately and accessibly.

---

Would you like me to now generate the **03\_TechnicalPlan.md** (technical implementation doc: stack setup, schema, environment variables, deployment, and CI/CD workflow)?  
 That will finalize your `/docs` core and make FairForm 100 % build-ready in Cursor.

