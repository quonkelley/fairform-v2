# Sprint 2 Plan: Case Journey Map (Epic 6)

**Sprint Duration:** 2 weeks
**Sprint Goal:** Deliver a fully functional Case Journey Map that visualizes case progress and enables step-by-step tracking for self-represented litigants.
**Owner:** Shaquon K.
**Status:** Active - Week 1 Complete (50% done, 2 of 4 stories)
**Created:** 2025-10-10
**Last Updated:** 2025-10-10

---

## Sprint Overview

### Sprint Objective
Build the **Case Journey Map** (Epic 6), the core "Legal GPS" feature that empowers users to understand their position in the legal process. This includes a visual timeline of case steps, completion tracking, and dashboard progress synchronization.

### Business Value
- **Primary**: Reduces user confusion and anxiety by showing clear procedural steps
- **Secondary**: Establishes foundation for future guided workflows (Epic 7+)
- **Metrics Target**: 70% of users complete ≥1 case step

### Sprint Scope

**In Scope ✅**
- Story 6.1: Visual timeline component showing all case steps
- Story 6.2: Step completion logic and Firestore updates
- Story 6.3: Step detail modal with instructions
- Story 6.4: Dashboard progress sync (percent complete)
- Accessibility compliance (WCAG 2.1 AA)
- Mobile and desktop responsive design

**Out of Scope ❌**
- Story 6.5: Real-time sync (deferred to Sprint 3 if needed)
- AI guidance or conversational explanations (Phase 2)
- Jurisdiction-specific step templates (Phase 1.5+)
- Multi-user collaboration features

---

## Story Breakdown

### Week 1: Foundation & Core Timeline

#### Story 6.1: Case Journey Visual Timeline ✅
**Priority:** Must-Have
**Estimated Effort:** 3 days
**Actual Effort:** 3 days
**Status:** COMPLETE (2025-10-10)
**Dependencies:** None (builds on Epic 4 & 5 foundation)

**Deliverables:**
- `stepsRepo.ts` - Repository pattern for case steps data
- `/api/cases/[id]/steps` - API endpoint for fetching steps
- `useCaseSteps` hook - React Query integration
- `CaseJourneyMap` component - Timeline container
- `StepNode` component - Individual step display
- Case detail page at `/cases/[id]`
- Full test suite (≥80% coverage)

**Acceptance Criteria:**
1. Timeline displays steps in correct procedural order
2. Visual states for upcoming/current/completed steps
3. Responsive layout (mobile and desktop)
4. Keyboard-navigable and screen-reader compatible
5. Data fetched via repository pattern
6. Performance: ≤1.5s load time on mobile

**Tech Stack:**
- Firestore `caseSteps` collection
- Next.js App Router dynamic routes
- React Query for data fetching
- shadcn/ui Card, lucide-react icons
- Vitest + React Testing Library + jest-axe

---

#### Story 6.2: Step Completion Logic
**Priority:** Must-Have
**Estimated Effort:** 2 days
**Dependencies:** Story 6.1 (requires timeline component)

**Deliverables:**
- Update `stepsRepo.ts` with `updateStepCompletion()` method
- Enhance `/api/steps/[id]/complete` endpoint (already exists, may need updates)
- `useCompleteStep` mutation hook
- "Mark Complete" button UI on StepNode
- Optimistic UI updates with rollback on error
- Progress calculation logic
- Test suite for completion flow

**Acceptance Criteria:**
1. Users can mark a step complete via button click
2. Firestore updates `isComplete=true` for the step
3. Visual state changes immediately (optimistic update)
4. Progress bar updates based on completed steps
5. Error handling with user-friendly messages
6. Completion state persists across page refreshes

**Technical Notes:**
- Use React Query mutations with `onSuccess` invalidation
- Optimistic update: set local state before server response
- Rollback mechanism if Firestore write fails
- Calculate progress: `(completedSteps / totalSteps) * 100`

---

### Week 2: Details & Integration

#### Story 6.3: Step Detail Modal
**Priority:** Must-Have
**Estimated Effort:** 2 days
**Dependencies:** Story 6.1 (requires StepNode component)

**Deliverables:**
- `StepDetailModal` component
- Step instruction content (hardcoded templates for MVP)
- Due date display logic
- Modal trigger on StepNode click
- Accessibility: focus trap, ESC to close, ARIA dialog
- Test suite for modal interactions

**Acceptance Criteria:**
1. Clicking a step opens detail modal
2. Modal displays step name, instructions, and due date
3. Modal is dismissible (X button, ESC, click outside)
4. Keyboard accessible (Tab to navigate, ESC to close)
5. Screen reader announces modal open/close
6. Mobile-friendly modal design

**Content Template (MVP):**
```typescript
// Hardcoded for Small Claims - "File Complaint" step
const stepInstructions = {
  "File Complaint": {
    title: "File Your Small Claims Complaint",
    instructions: [
      "Complete form SC-100 (Plaintiff's Claim)",
      "Make 2 copies of the completed form",
      "File original at the courthouse clerk's office",
      "Pay filing fee or request fee waiver (form FW-001)"
    ],
    estimatedTime: "1-2 hours",
    resources: ["Form SC-100", "Fee Waiver Form FW-001"]
  }
};
```

---

#### Story 6.4: Dashboard Progress Sync
**Priority:** Should-Have
**Estimated Effort:** 1.5 days
**Dependencies:** Story 6.2 (requires completion logic)

**Deliverables:**
- Update `casesRepo.ts` to calculate and store `progressPct`
- Modify `CaseCard` component to display progress bar
- Real-time progress updates when steps complete
- Progress indicator on dashboard
- Test suite for progress calculation

**Acceptance Criteria:**
1. Dashboard case cards show progress percentage
2. Progress bar visual indicator (0-100%)
3. Progress updates within 1s of step completion
4. Progress calculation accurate: `(completed / total) * 100`
5. Empty state handling (0 steps completed)
6. Accessible progress bar with `aria-valuenow`

**UI Mockup:**
```
┌─────────────────────────────┐
│ Small Claims Case #12345    │
│ vs. Acme Corp               │
│                             │
│ ████████░░░░░░░░  60%      │ ← Progress bar
│ 3 of 5 steps complete       │
└─────────────────────────────┘
```

---

## Technical Architecture

### Data Model

**Firestore Collections:**

```typescript
// Collection: caseSteps
{
  id: "step_abc123",
  caseId: "case_xyz789",
  name: "File Complaint",
  order: 1,
  dueDate: Timestamp | null,
  isComplete: false,
  instructions: string,      // Added in Story 6.3
  estimatedTime: string,     // Added in Story 6.3
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Collection: cases (updated)
{
  id: "case_xyz789",
  userId: "user_123",
  title: "Small Claims vs. Acme",
  caseType: "small-claims",
  status: "active",
  progressPct: 60,           // Added in Story 6.4
  totalSteps: 5,             // Added in Story 6.4
  completedSteps: 3,         // Added in Story 6.4
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### API Endpoints

| Method | Endpoint | Purpose | Story |
|--------|----------|---------|-------|
| GET | `/api/cases/[id]/steps` | Fetch all steps for a case | 6.1 |
| PATCH | `/api/steps/[id]/complete` | Mark step as complete | 6.2 |
| GET | `/api/steps/[id]` | Fetch single step details | 6.3 |
| GET | `/api/cases/[id]` | Fetch case with progress | 6.4 |

### Component Hierarchy

```
CaseDetailPage (/cases/[id])
├─ AppHeader (from Epic 5)
├─ CaseJourneyMap (Story 6.1)
│  ├─ ProgressBar (Story 6.4)
│  └─ StepNode[] (Story 6.1)
│     ├─ StepIcon (visual state indicator)
│     ├─ StepContent (name, order)
│     └─ CompleteButton (Story 6.2)
│        └─ onClick → StepDetailModal (Story 6.3)
└─ AppFooter (from Epic 5)
```

### State Management

**React Query Keys:**
```typescript
['cases', userId]                    // User's cases (Epic 4)
['cases', caseId]                    // Single case detail (6.4)
['caseSteps', caseId]                // Steps for a case (6.1)
['step', stepId]                     // Single step detail (6.3)
```

**Mutations:**
```typescript
useMutation(['completeStep', stepId])  // Story 6.2
```

---

## Testing Strategy

### Coverage Targets
- **Repositories**: ≥80% coverage (stepsRepo, casesRepo updates)
- **API Routes**: ≥70% coverage (steps endpoints)
- **Components**: ≥75% coverage (CaseJourneyMap, StepNode, Modal)
- **Integration**: Full user flow (view timeline → complete step → see progress)

### Test Types

**Unit Tests:**
- stepsRepo: data mapping, error handling
- useCaseSteps hook: fetch logic, cache invalidation
- useCompleteStep hook: optimistic updates, rollback
- StepNode: visual states, click handlers
- Progress calculation logic

**Integration Tests:**
- Full flow: Dashboard → Case Detail → Complete Step → Dashboard update
- Modal interaction: Open → Read instructions → Close → Complete step
- Error scenarios: Network failure, Firestore errors

**Accessibility Tests:**
- jest-axe: Zero violations on all components
- Keyboard navigation: Tab through steps, Enter to open modal, ESC to close
- Screen reader: VoiceOver/NVDA testing for ARIA labels
- Color contrast: WCAG 2.1 AA compliance (4.5:1 minimum)

**Responsive Tests:**
- Mobile (360px): Vertical timeline, touch-friendly buttons
- Tablet (768px): Centered timeline, optimized spacing
- Desktop (1280px): Full-width timeline with clear visual hierarchy

---

## Design System Usage

### Components
- **Card**: StepNode containers (shadcn/ui)
- **Button**: Mark Complete, Close Modal (variants: primary, ghost)
- **Dialog**: StepDetailModal (shadcn/ui Dialog)
- **Progress**: Linear progress bar (shadcn/ui)
- **Icons**: CheckCircle2, Circle, Clock, Info (lucide-react)

### Color Palette
- **Completed Steps**: `text-success` (#22c55e), `bg-success/10`
- **Current Step**: `text-primary` (#2563eb), `border-primary`
- **Upcoming Steps**: `text-muted-foreground` (#71717a)
- **Progress Bar**: `bg-primary` fill, `bg-muted` background

### Typography
- **Timeline Title**: `text-2xl font-bold` (H1)
- **Step Names**: `text-base font-semibold` (H3)
- **Instructions**: `text-sm text-muted-foreground`
- **Progress Text**: `text-xs font-medium`

### Spacing
- Steps gap: `gap-4` (16px mobile), `gap-6` (24px desktop)
- Card padding: `p-4` (16px)
- Modal padding: `p-6` (24px)

---

## Risk Assessment & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Step order confusion** | High | Medium | Use hardcoded templates for Small Claims and Eviction; validate order field in Firestore |
| **Firestore sync lag** | Medium | Low | Implement optimistic UI updates; show loading states |
| **Accessibility gaps** | High | Low | Include jest-axe in all component tests; manual screen reader testing |
| **Scope creep (real-time sync)** | Medium | Medium | Defer Story 6.5 to Sprint 3; focus on polling/refresh for MVP |
| **Mobile UX complexity** | Medium | Medium | Mobile-first design; extensive touch testing on real devices |
| **Hardcoded content scalability** | Low | High | Document content structure for future CMS integration (Phase 2) |

---

## Dependencies

### External Dependencies
- Firebase Firestore SDK (already integrated)
- React Query v4 (already integrated)
- shadcn/ui components (Dialog, Progress)
- lucide-react icons

### Internal Dependencies
- Epic 4: Database and API layer ✅ Complete
- Epic 5: Authenticated layout ✅ Complete
- Epic 3: Design system ✅ Complete
- `caseSteps` Firestore collection schema
- `/api/steps/[id]/complete` endpoint (exists, may need enhancement)

### Blocking Dependencies
- None (all prerequisites complete)

---

## Definition of Done (Sprint 2)

### Story-Level DoD
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests passing (≥80% coverage for repos, ≥75% for components)
- [ ] jest-axe accessibility tests pass (zero violations)
- [ ] Manual QA completed (functional, responsive, accessibility)
- [ ] Documentation updated (dev notes, QA results)
- [ ] No critical or high-priority bugs

### Epic-Level DoD (End of Sprint)
- [ ] All 4 stories (6.1-6.4) marked Done
- [ ] Journey Map renders correctly for Small Claims case type
- [ ] Users can view timeline, complete steps, and see progress
- [ ] Progress syncs to dashboard within 1s
- [ ] UI passes WCAG 2.1 AA accessibility audit
- [ ] Performance ≤1.5s load time on 3G mobile
- [ ] QA sign-off: PASS gate
- [ ] Demo-ready for stakeholder review

---

## Sprint Ceremonies

### Daily Standup (Async via BMAD)
- What did I complete yesterday?
- What will I work on today?
- Any blockers or questions?

### Sprint Review (End of Week 2)
- Demo Case Journey Map functionality
- Show timeline, completion flow, dashboard sync
- Accessibility demonstration (keyboard nav, screen reader)
- Gather feedback for Epic 7 refinement

### Sprint Retrospective
- What went well?
- What could be improved?
- Action items for Sprint 3

---

## Success Metrics

### Development Metrics
- **Velocity**: 4 stories completed in 2 weeks
- **Test Coverage**: ≥80% for repositories, ≥75% for components
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Performance**: ≤1.5s load time on mobile

### User Metrics (Post-Launch)
- **Adoption**: ≥70% of users view Case Journey Map
- **Engagement**: ≥50% of users complete ≥1 step
- **Comprehension**: ≥80% rate "clear" or "very clear" (usability test)
- **Time to Next Step**: ≤2 minutes post-onboarding

---

## Next Steps (Sprint 3 Planning)

### Potential Stories for Sprint 3
1. **Story 6.5**: Real-time sync with Firestore listeners (deferred from Sprint 2)
2. **Epic 7 Stories**: Inline Glossary System
   - Story 7.1: Glossary tooltip component
   - Story 7.2: Firestore glossary integration
   - Story 7.3: Auto-linking in step instructions
3. **Enhancement**: Add second case type template (Eviction)
4. **Refinement**: User feedback improvements from Sprint 2 review

---

## Stakeholder Communication

### Weekly Updates
- **Every Monday**: Sprint progress email (stories completed, blockers, ETA)
- **Every Friday**: Demo video of new features (async stakeholder review)

### Demo Artifacts
- Video: Case Journey Map walkthrough (desktop + mobile)
- Screenshots: Timeline states (empty, in-progress, completed)
- Accessibility report: jest-axe results, keyboard nav demo

---

## Appendix: Reference Documents

- **Epic 6 PRD**: `/docs/prd/epic-6-case-journey-map.md`
- **Story 6.1**: `/docs/stories/6.1.case-journey-visual-timeline.md`
- **Design Spec**: `/docs/design-spec.md` §6-8 (Stepper & Progress)
- **Coding Standards**: `/CLAUDE.md`
- **Architecture**: `/docs/architecture/source-tree.md`
- **Accessibility Guidelines**: `/docs/accessibility-audit.md`

---

**Prepared by:** BMAD Project Manager
**Reviewed by:** (Pending)
**Approved for Sprint Start:** (Pending)

---

✅ **Sprint 2 is ready to begin. Let's build the Legal GPS!** 🚀
