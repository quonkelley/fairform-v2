# Epic 17: Enhanced Hearing Day Experience

## 🧭 Overview

- **Status:** Planned – Phase 5 ("Show up ready")
- **Priority:** P1 (final confidence crescendo before form filler)
- **Timebox:** 1 short sprint (can overlap with Epic 18 ramp-up)
- **Dependencies:** Epic 6.5 (case journey system), Epic 16 (deadline engine), Epic 9 (reminders)

## 🎯 Purpose

Deliver an enhanced experience for hearing day preparation by making hearing steps in the case journey special. When users open a hearing step, they get an immersive, confidence-building modal with interactive checklists, day-of guidance, and all the resources they need to show up prepared.

### Success Definition

- User clicks on a hearing step in their case journey
- An enhanced modal opens (larger than normal steps) with:
  - Interactive preparation checklist
  - Day-of timeline and courtroom guidance
  - Quick access to completed documents
  - Court location/details
  - Confidence-building tips
- Completing checklist items provides immediate feedback
- Marking step complete triggers special celebration
- All state persists in Firestore

## 💡 Roadmap Alignment

| Roadmap Phase | Contribution |
| ------------- | ------------ |
| **Phase 5 – Hearing Day Mode** | Implements "Court-day confidence" moment (`docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:90`). |
| **Epic 6.5 outputs** | Leverages case journey system and step modal infrastructure. |
| **Phase 3 & 4 outputs** | Consumes deadline engine + reminder data to highlight urgent tasks. |
| **Phase 6 (Epic 18)** | Surfaces completed forms generated in Smart Form Filler. |

## 🏗️ Architecture Guardrails

- **Step Type Integration:** Add new `hearing` step type to existing StepType enum
- **Modal Enhancement:** Create `HearingStepModal` component that extends/replaces standard `StepDetailModal` for hearing steps
- **Component Location:** New components under `components/case-journey/hearing/`
- **Data Source:** Hearing prep data in journey templates (`hearingPrep` metadata), persisted checklist state in Firestore
- **Repository Pattern:** Use `stepsRepo` and `casesRepo` for all data operations
- **Accessibility:** Enhanced modal maintains focus trap, keyboard navigation, ARIA labels, reduced-motion fallback

## ⚖️ Scope & Boundaries

### In Scope
- New `hearing` step type in StepTypeSchema
- Enhanced modal UI for hearing steps with:
  - Interactive checklist with persistence
  - Day-of timeline section
  - Court details section
  - Quick document access
  - Confidence tips
- Special visual treatment for hearing steps in journey timeline (icon, badge, countdown)
- Hearing prep checklist data in journey templates (eviction + small claims)
- Integration with reminders (show reminder status per checklist item)
- Special celebration animation on step completion
- Checklist state persistence in Firestore

### Out of Scope
- Scheduling hearings or calendar integration
- Court calendar sync
- User-generated checklist items
- Multi-hearing case workflows
- Real-time updates from court systems

## 📦 Deliverables

1. **Step Type Addition:** Add `hearing` to StepTypeSchema in `lib/validation.ts`
2. **Enhanced Modal:** `HearingStepModal` component under `components/case-journey/hearing/`
3. **Checklist Component:** `HearingChecklist` with interactive items and persistence
4. **Journey Template Data:** Extend small claims and eviction templates with `hearingPrep` metadata
5. **Visual Enhancements:** Special styling/icon for hearing steps in step-node.tsx
6. **Firestore Schema:** Add `hearingChecklist` field to case steps document structure
7. **Repository Methods:** Add methods to stepsRepo for checklist state management
8. **QA Materials:** Playwright tests for hearing step flow; accessibility audit

## 📚 Stories

### Story 17.1 – Hearing Step Type & Data Model

**Objective:** Add `hearing` step type and define hearing prep data structure

**Tasks:**
- Add `hearing` to StepTypeSchema in lib/validation.ts
- Create Zod schema for hearing checklist items (id, label, completed, reminderId)
- Add `hearingChecklist` field to CaseStepSchema (optional array)
- Update journey templates for small claims and eviction with hearingPrep metadata
- Add hearing step content to stepTypeContent.ts

**Acceptance Criteria:**
- TypeScript compiles without errors
- Zod validation passes for hearing steps with checklist data
- Test coverage for new schemas
- Journey templates include realistic hearing prep items
- Content reviewed by legal/UX

**Estimated Effort:** 2 days

---

### Story 17.2 – Enhanced Hearing Step Modal UI

**Objective:** Build special modal experience for hearing steps

**Tasks:**
- Create `HearingStepModal` component extending Dialog from shadcn/ui
- Design layout with sections: Overview, Checklist, Timeline, Court Details, Documents, Tips
- Implement responsive design (mobile-friendly, desktop enhanced)
- Add special header with hearing date countdown
- Implement keyboard navigation and focus management
- Add reduced-motion fallbacks for animations
- Create `HearingChecklist` component with checkboxes and state
- Style with special visual treatment (perhaps primary/accent colors)

**Acceptance Criteria:**
- Modal opens smoothly when clicking hearing step
- All sections render correctly with mock data
- Fully keyboard accessible (tab navigation, ESC to close)
- jest-axe accessibility tests pass (0 violations)
- Works on mobile, tablet, desktop viewports
- Reduced motion preference respected
- Design review approved by UX

**Estimated Effort:** 3 days

---

### Story 17.3 – Checklist State Persistence & Integration

**Objective:** Wire up hearing checklist with Firestore and integrate with reminders/documents

**Tasks:**
- Add methods to stepsRepo: `updateHearingChecklist(stepId, checklist)`
- Create React hook: `useHearingChecklist(stepId)` for state management
- Implement optimistic updates for checkbox toggles
- Integrate reminder status (show "Reminder sent" badge if applicable)
- Wire up document section to query completed forms for case
- Add special completion celebration (confetti + message)
- Handle error states gracefully

**Acceptance Criteria:**
- Checking/unchecking checklist items persists to Firestore
- State updates in real-time across sessions
- Reminder badges show correctly when applicable
- Documents section shows all completed forms with download links
- Celebration triggers when step marked complete
- Error messages display for failed operations
- Playwright test covers full flow: open modal → check items → mark complete → verify persistence

**Estimated Effort:** 3 days

---

### Story 17.4 – Visual Journey Enhancements for Hearing Steps

**Objective:** Make hearing steps stand out in the case journey timeline

**Tasks:**
- Add special icon for hearing steps (perhaps Gavel icon from lucide-react)
- Add countdown badge when hearing is within 7 days ("In 3 days")
- Apply special styling to hearing step cards (perhaps subtle glow/border)
- Conditionally render `HearingStepModal` vs `StepDetailModal` based on stepType
- Update step-node.tsx to detect hearing steps
- Add tooltip/hover state explaining it's a hearing

**Acceptance Criteria:**
- Hearing steps visually distinct in journey list
- Countdown badge accurate and updates daily
- Correct modal opens based on step type
- Icon and styling consistent with design system
- No performance impact on journey rendering
- React Testing Library tests verify conditional rendering

**Estimated Effort:** 2 days

## 🔗 Inputs & References

- Roadmap Phase 5 entry – `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:90`
- Journey system – `lib/journeys/templates/`, `lib/journeys/generate.ts`
- Step modal infrastructure – `components/case-journey/step-detail-modal.tsx`, `components/case-journey/step-node.tsx`
- Case repository – `lib/db/casesRepo.ts`
- Steps repository – `lib/db/stepsRepo.ts`
- Celebration components – `components/case-journey/StepCompletionCelebration.tsx`
- Completed forms system – `lib/hooks/useCompletedForms.ts`

## 📊 Metrics

- Modal open animation completes within <200ms
- Checklist toggle responds within <100ms (optimistic update)
- Accessibility audit: 0 violations
- User completion rate: Track % of users who complete hearing checklist
- Time to prepare: Average time users spend in hearing modal
- Step completion: Track hearing step completion rates

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Modal feels too different from other steps | Maintain consistent header/footer patterns; only enhance content area. |
| Checklist items too generic | Work with legal advisor to create case-type-specific checklists. |
| State sync issues with checklist | Use optimistic updates + error recovery; add retry logic. |
| Performance with large checklists | Virtualize checklist if >20 items; use React.memo for item components. |
| Users miss the hearing step | Add visual prominence + optional notification when hearing approaches. |

## ✅ Definition of Done

- `hearing` step type added and integrated throughout system
- HearingStepModal renders correctly with all sections
- Checklist state persists to Firestore and syncs in real-time
- Hearing steps visually distinct in journey timeline
- Reminders and documents integrate seamlessly
- Special celebration on step completion
- Accessibility tests pass (WCAG 2.1 AA)
- Playwright test suite covers full hearing step flow
- Code review approved
- PM + UX sign-off after user flow testing
