# FairForm Sprint 2 Team Update
**For: ChatGPT Development Team**  
**From: Sarah (Product Owner)**  
**Date:** October 10, 2025  
**Sprint:** Sprint 2 - Case Journey Map (Epic 6)  
**Status:** 🟢 ON TRACK - Week 1 Complete, Week 2 Starting

---

## 🎯 Executive Summary

Sprint 2 is **50% complete** with Stories 6.1 and 6.2 successfully delivered. We're on schedule to deliver the full Case Journey Map feature by end of Week 2. All tests passing (59/59), zero accessibility violations, and strong code quality throughout.

**What's Working Well:**
- Test-first approach with comprehensive coverage
- Repository pattern consistently applied
- Accessibility compliance from the start
- Clean TypeScript with strict mode

**Focus for Week 2:**
- Story 6.3: Step Detail Modal (2 days estimated)
- Story 6.4: Dashboard Progress Sync (1.5 days estimated)
- Sprint review preparation

---

## ✅ Week 1 Completed Work

### Story 6.1: Case Journey Visual Timeline ✅ DONE
**Status:** QA PASSED - Ready for Production  
**Completed:** 2025-10-10  
**Test Results:** 44/44 tests passing (100%)

**What Was Delivered:**
- Visual timeline component showing all case steps in procedural order
- Three distinct visual states: Completed (green ✓), Current (blue clock), Upcoming (gray circle)
- Fully responsive mobile-first design
- Zero accessibility violations (WCAG 2.1 AA compliant)
- Repository pattern with no direct Firestore calls from UI
- React Query integration with caching strategy

**Files Created:**
- `lib/hooks/useCaseSteps.ts` - React Query hook (23 lines)
- `components/case-journey/case-journey-map.tsx` - Timeline container (112 lines)
- `components/case-journey/step-node.tsx` - Step display (146 lines)
- `app/cases/[id]/page.tsx` - Case detail page (44 lines)
- Full test suite: 44 tests across 5 test files

**Key Technical Decisions:**
- Used React Query with 5-minute stale time for optimal performance
- Semantic HTML (`<ol>`, `<li>`) for screen reader compatibility
- ARIA labels with completion status for each step
- Mobile-first responsive design with Tailwind utilities

---

### Story 6.2: Step Completion Logic ✅ DONE
**Status:** QA PASSED - Ready for Production  
**Completed:** 2025-10-10  
**Test Results:** 51/51 tests passing (100%)

**What Was Delivered:**
- "Mark Complete" button on incomplete steps
- Optimistic UI updates for instant feedback
- Automatic query invalidation and refetch on completion
- Error handling with rollback mechanism
- Firestore persistence with `completedAt` timestamp
- User-friendly loading states and error messages

**Files Created:**
- `lib/hooks/useCompleteStep.ts` - React Query mutation hook (73 lines)
- Updated `components/case-journey/step-node.tsx` - Added completion button
- Full test suite: 51 tests including mutation, accessibility, integration

**Key Technical Decisions:**
- React Query mutations with optimistic updates pattern
- Snapshot-based rollback on error for data consistency
- Loading states with "Completing..." button text
- Authorization validation in API endpoint

---

## 📋 Week 2 Work - What's Next

### Story 6.3: Step Detail Modal 📌 PRIORITY 1
**Status:** Not Started  
**Estimated Effort:** 2 days  
**Dependencies:** Story 6.1 complete ✅

**What Needs to Be Built:**
A modal component that opens when users click a step, showing detailed instructions and due date information.

**Acceptance Criteria:**
1. Clicking a step opens detail modal
2. Modal displays step name, instructions, and due date
3. Modal is dismissible (X button, ESC key, click outside)
4. Keyboard accessible (Tab navigation, ESC to close)
5. Screen reader announces modal open/close
6. Mobile-friendly modal design

**Implementation Guidance:**
- **Component:** `components/case-journey/step-detail-modal.tsx`
- **Library:** Use shadcn/ui Dialog component (already in design system)
- **Content:** Hardcoded instruction templates for MVP (see template below)
- **Trigger:** Add click handler to `StepNode` component
- **Accessibility:** Must include focus trap, ESC handler, ARIA dialog role
- **Testing:** Component tests, accessibility tests (jest-axe), keyboard navigation

**Instruction Template Structure:**
```typescript
// For MVP - Hardcoded for Small Claims case type
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
    resources: ["Form SC-100", "Fee Waiver Form FW-001"],
    dueDate: "Calculate based on case creation + 30 days (example)"
  }
  // Add other steps as needed
};
```

**Design Requirements:**
- Use shadcn/ui Dialog with custom content
- Modal max-width: 600px on desktop, full-width on mobile
- Padding: 24px (p-6)
- Close button: Top-right corner with X icon
- Instruction list: Numbered list with clear typography
- Due date: Prominent display with calendar icon

**Files to Create:**
- `components/case-journey/step-detail-modal.tsx` - Modal component
- `tests/case-journey/step-detail-modal.test.tsx` - Component tests
- Update `step-node.tsx` - Add click handler and modal trigger

**Testing Requirements:**
- Component renders with correct content
- Modal opens on step click
- Modal closes on X button, ESC key, outside click
- Keyboard navigation works (Tab through content, ESC to close)
- Screen reader announces modal correctly
- jest-axe shows zero violations
- Mobile responsive design

---

### Story 6.4: Dashboard Progress Sync 📌 PRIORITY 2
**Status:** Not Started  
**Estimated Effort:** 1.5 days  
**Dependencies:** Story 6.2 complete ✅

**What Needs to Be Built:**
Progress calculation and display on dashboard case cards, showing users their completion percentage at a glance.

**Acceptance Criteria:**
1. Dashboard case cards show progress percentage
2. Progress bar visual indicator (0-100%)
3. Progress updates within 1s of step completion
4. Progress calculation accurate: `(completed / total) * 100`
5. Empty state handling (0 steps completed)
6. Accessible progress bar with `aria-valuenow`

**Implementation Guidance:**
- **Data Layer:** Update `lib/db/casesRepo.ts` with progress calculation
- **UI Update:** Modify `components/dashboard/case-card.tsx` to display progress
- **Calculation:** Compute progress when steps change, store in case document
- **Real-time:** React Query cache invalidation ensures dashboard updates
- **Component:** Use shadcn/ui Progress component (already in design system)

**Firestore Schema Update:**
```typescript
// Collection: cases (add these fields)
{
  // ... existing fields
  progressPct: number,       // 0-100
  totalSteps: number,        // Total steps for case type
  completedSteps: number,    // Count of isComplete=true
  // Updated whenever step completion changes
}
```

**Dashboard UI Mockup:**
```
┌─────────────────────────────┐
│ Small Claims Case #12345    │
│ vs. Acme Corp               │
│                             │
│ ████████░░░░░░░░  60%      │ ← Progress bar
│ 3 of 5 steps complete       │
└─────────────────────────────┘
```

**Implementation Steps:**
1. Update `casesRepo.ts`:
   - Add `updateCaseProgress(caseId)` method
   - Calculate completed vs total steps
   - Update case document with progress fields

2. Update step completion logic:
   - After marking step complete, trigger progress recalculation
   - Ensure React Query invalidates cases query

3. Update `CaseCard` component:
   - Display Progress component from shadcn/ui
   - Show percentage and "X of Y steps complete" text
   - Handle 0% case gracefully
   - Add aria-label for accessibility

4. Testing:
   - Test progress calculation accuracy
   - Test progress updates after step completion
   - Test edge cases (0%, 100%, empty state)
   - Verify accessibility with jest-axe
   - Integration test: Complete step → Dashboard updates

**Files to Modify:**
- `lib/db/casesRepo.ts` - Add progress calculation
- `components/dashboard/case-card.tsx` - Add progress display
- `tests/lib/db/casesRepo.test.ts` - Add progress tests
- `tests/dashboard/case-card.test.tsx` - Add progress display tests

---

## 🏗️ Architecture Context

### Current Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript (strict mode)
- **Styling:** Tailwind CSS, shadcn/ui components
- **State Management:** React Query v4 for server state
- **Database:** Firebase Firestore with repository pattern
- **Testing:** Vitest, React Testing Library, jest-axe
- **Hosting:** Vercel

### Data Flow Pattern
```
UI Component
  → React Hook (React Query)
    → API Route (/app/api/...)
      → Repository (lib/db/*Repo.ts)
        → Firestore
```

### Repository Pattern (CRITICAL)
**Never call Firestore directly from UI components.**
- All DB operations go through repository files in `lib/db/`
- Repositories return `Result<T>` type for error handling
- API routes use repositories and validate auth/ownership
- React Query hooks call API routes, not repositories directly

### Testing Standards
- **Repositories:** ≥80% coverage
- **API Routes:** ≥70% coverage
- **Components:** ≥75% coverage
- **Accessibility:** Zero jest-axe violations required
- **Type Safety:** TypeScript strict mode, no `any` types

---

## 📚 Key Documents to Reference

### Essential Reading
1. **Sprint Plan:** `docs/sprint-2-plan.md` - Full sprint breakdown
2. **Sprint Status:** `docs/SPRINT-2-STATUS.md` - Current progress
3. **Epic 6 PRD:** `docs/prd/epic-6-case-journey-map.md` - Business requirements
4. **Story 6.1:** `docs/stories/6.1.case-journey-visual-timeline.md` - Complete example
5. **Story 6.2:** `docs/stories/6.2.step-completion-logic.md` - Complete example

### Architecture & Standards
1. **Coding Standards:** `docs/architecture/coding-standards.md` - Must follow
2. **Tech Stack:** `docs/architecture/tech-stack.md` - Dependencies and versions
3. **Source Tree:** `docs/architecture/source-tree.md` - File organization
4. **Design Spec:** `docs/design-spec.md` - UI components and patterns
5. **Accessibility:** `docs/accessibility-audit.md` - WCAG requirements

### Quick References
- **Project Brief:** `PROJECT_BRIEF.md` - Overall project context
- **README:** `README.md` - Developer onboarding
- **PRD Overview:** `docs/prd.md` - All epics summary

---

## 🔧 Development Setup

### Getting Started
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Environment Variables
Required in `.env.local` (see `.env.example`):
- Firebase config (auth, Firestore)
- Twilio credentials (SMS reminders)
- Resend API key (email reminders)
- PostHog analytics key

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/case-journey/step-detail-modal.test.tsx

# Run with coverage
pnpm test --coverage

# Run in watch mode
pnpm test --watch
```

---

## ✨ Code Quality Requirements

### Must-Haves for All PRs
- ✅ All tests passing (100%)
- ✅ TypeScript strict mode (zero errors)
- ✅ ESLint clean (zero warnings)
- ✅ jest-axe clean (zero violations)
- ✅ Repository pattern followed
- ✅ No direct Firestore calls from UI
- ✅ Proper error handling
- ✅ Loading states implemented
- ✅ Mobile-responsive design
- ✅ Keyboard accessible

### Accessibility Checklist (WCAG 2.1 AA)
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation (Tab, Enter, ESC)
- [ ] ARIA labels and roles
- [ ] Semantic HTML
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] jest-axe zero violations

---

## 🎨 Design System Components Available

### shadcn/ui Components (Already Installed)
- **Dialog** - Use for Story 6.3 modal
- **Progress** - Use for Story 6.4 progress bar
- **Card** - Already used in StepNode
- **Button** - Standard buttons with variants
- **Badge** - Status indicators

### Icons (lucide-react)
- **CheckCircle2** - Completed steps
- **Clock** - Current step
- **Circle** - Upcoming steps
- **X** - Close buttons
- **Calendar** - Due dates
- **Info** - Help tooltips

### Color Palette
```typescript
// Success (completed)
text-success: #22c55e (green)
bg-success/10: rgba(34, 197, 94, 0.1)

// Primary (current)
text-primary: #2563eb (blue)
border-primary: #2563eb

// Muted (upcoming)
text-muted-foreground: #71717a (gray)
```

---

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This
1. **Direct Firestore calls from components** - Use repositories
2. **Using `any` type** - TypeScript strict mode required
3. **Skipping tests** - All code must have tests
4. **Ignoring accessibility** - jest-axe must pass
5. **Hardcoding user data** - Always use dynamic data
6. **Missing error handling** - Handle all error cases
7. **No loading states** - Always show loading feedback

### ✅ Do This Instead
1. **Use repository pattern** - All DB through `lib/db/*Repo.ts`
2. **Proper TypeScript types** - Define interfaces for all data
3. **Test-first approach** - Write tests before/with implementation
4. **Accessibility first** - Include ARIA, keyboard nav, focus
5. **Dynamic data** - Fetch from Firestore, never hardcode
6. **Result pattern** - `Result<T>` for error handling
7. **Loading/error states** - Handle all async states

---

## 📊 Current Sprint Metrics

### Progress
- **Stories Complete:** 2 of 4 (50%)
- **Test Pass Rate:** 59/59 (100%)
- **Accessibility Violations:** 0
- **TypeScript Errors:** 0
- **ESLint Warnings:** 0

### Code Coverage
- **Repositories:** 100% (exceeds 80% target)
- **Components:** ~85% (exceeds 75% target)
- **Hooks:** 100%

### Velocity
- **Week 1:** 5 story points completed (Stories 6.1, 6.2)
- **Week 2 Plan:** 3.5 story points (Stories 6.3, 6.4)
- **On Track:** Yes, ahead of schedule

---

## 🎯 Success Criteria for Sprint 2

### Sprint Complete When:
- [ ] All 4 stories (6.1-6.4) marked Done
- [ ] Journey Map renders correctly for Small Claims case
- [ ] Users can view timeline, complete steps, see progress
- [ ] Progress syncs to dashboard within 1s
- [ ] UI passes WCAG 2.1 AA accessibility audit
- [ ] Performance ≤1.5s load time on 3G mobile
- [ ] All tests passing (≥80% coverage)
- [ ] QA sign-off: PASS gate
- [ ] Demo-ready for stakeholder review

### Story 6.3 Complete When:
- [ ] Modal component implemented with shadcn/ui Dialog
- [ ] Click step → modal opens with instructions
- [ ] Modal dismissible (X, ESC, outside click)
- [ ] Keyboard accessible (Tab, ESC)
- [ ] Screen reader compatible
- [ ] Hardcoded templates for 5 Small Claims steps
- [ ] All tests passing (≥75% component coverage)
- [ ] jest-axe zero violations

### Story 6.4 Complete When:
- [ ] Progress calculation in casesRepo
- [ ] Progress bar on dashboard case cards
- [ ] Progress updates after step completion
- [ ] Accurate calculation: (completed/total) * 100
- [ ] Empty state (0%) handled gracefully
- [ ] Accessible with aria-valuenow
- [ ] All tests passing
- [ ] Integration test: Complete step → Dashboard updates

---

## 🤝 Team Communication

### Daily Standups (Async)
Please update in project channel:
- **Yesterday:** What you completed
- **Today:** What you're working on
- **Blockers:** Any issues or questions

### Questions?
- **Product/Requirements:** Ask Sarah (PO)
- **Technical/Architecture:** Check `docs/architecture/` or ask in dev channel
- **Design/UX:** Reference `docs/design-spec.md`
- **Process/Sprint:** Check `docs/sprint-2-plan.md`

### Code Review Process
1. Create feature branch: `feature/story-6.3-step-modal`
2. Implement with tests
3. Ensure all checks pass locally
4. Push and create PR
5. Request review in channel
6. Address feedback
7. Merge when approved

---

## 📦 Deliverables Expected

### Story 6.3 Deliverables
- `components/case-journey/step-detail-modal.tsx` (new file)
- `tests/case-journey/step-detail-modal.test.tsx` (new file)
- Updated `step-node.tsx` with click handler
- Hardcoded instruction templates (in modal component or separate file)
- All tests passing
- QA gate document: `docs/qa/gates/6.3-step-detail-modal.yml`

### Story 6.4 Deliverables
- Updated `lib/db/casesRepo.ts` with progress methods
- Updated `components/dashboard/case-card.tsx` with progress display
- Progress calculation tests
- Integration tests for complete flow
- All tests passing
- QA gate document: `docs/qa/gates/6.4-dashboard-progress-sync.yml`

---

## 🎉 Sprint 2 End Goal

By end of Week 2, users should be able to:
1. ✅ View their case with visual timeline
2. ✅ See which steps are completed/current/upcoming
3. ✅ Mark steps complete with instant feedback
4. 🔲 Click a step to see detailed instructions
5. 🔲 See their progress on the dashboard

This completes the **"Legal GPS"** core feature - showing users where they are, what's next, and how far they've come!

---

## 📞 Need Help?

### Resources
- **Documentation:** All docs in `docs/` folder
- **Examples:** Stories 6.1 and 6.2 are complete examples
- **Architecture:** Check `docs/architecture/` for patterns
- **Tests:** Look at existing tests for patterns

### Contacts
- **Product Owner:** Sarah (that's me!)
- **Tech Lead:** (Reference team structure)
- **QA:** Quinn (reviews completed stories)

---

**Let's finish Sprint 2 strong! The Legal GPS is coming together beautifully.** 🚀

**Next Update:** Mid-Week 2 (Day 7) status check

---

*Generated by: Sarah, Product Owner*  
*Last Updated: October 10, 2025*  
*Sprint 2 - Week 1 Complete ✅*

