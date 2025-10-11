# 🚀 Sprint 2 Kickoff: Case Journey Map

**Status:** Ready to Start
**Duration:** 2 weeks
**Goal:** Deliver the core "Legal GPS" feature - visual case journey timeline with step tracking

---

## Quick Start

### Documents Created
1. ✅ **Story 6.1**: `/docs/stories/6.1.case-journey-visual-timeline.md`
   - First story of Epic 6
   - Visual timeline component with all acceptance criteria
   - 8 tasks with detailed subtasks
   - Ready for Dev Agent

2. ✅ **Sprint Plan**: `/docs/sprint-2-plan.md`
   - Complete 2-week plan for Epic 6
   - 4 stories breakdown (6.1-6.4)
   - Technical architecture
   - Testing strategy
   - Risk assessment

---

## What to Work On First

### Recommended: Start with Story 6.1

**Command to begin:**
```bash
# Switch to Dev Agent and load Story 6.1
/BMad:dev
```

Then say: *"Let's implement Story 6.1: Case Journey Visual Timeline"*

---

## Story 6.1 Overview

**Goal:** Build visual timeline showing case steps in procedural order

**Key Deliverables:**
- `lib/db/stepsRepo.ts` - Repository for case steps
- `/api/cases/[id]/steps` - API endpoint
- `useCaseSteps` hook - React Query integration
- `CaseJourneyMap` component - Timeline UI
- `StepNode` component - Individual step display
- `/cases/[id]` page - Case detail view

**Estimated Time:** 3 days

**Acceptance Criteria:**
1. ✅ Timeline displays steps in correct order
2. ✅ Visual states (upcoming/current/completed)
3. ✅ Responsive mobile/desktop layout
4. ✅ Keyboard-navigable & screen-reader compatible
5. ✅ Repository pattern (no direct Firestore calls)
6. ✅ Performance ≤1.5s load time

---

## Sprint 2 Story Sequence

### Week 1: Foundation
1. **Story 6.1** (3 days) - Visual timeline ← **START HERE**
2. **Story 6.2** (2 days) - Step completion logic

### Week 2: Integration
3. **Story 6.3** (2 days) - Step detail modal
4. **Story 6.4** (1.5 days) - Dashboard progress sync

---

## Technical Stack Ready

✅ All prerequisites complete:
- Epic 4: Database & API layer
- Epic 5: Authenticated layout
- Epic 3: Design system components
- Testing: Vitest + React Testing Library + jest-axe
- React Query configured
- Firebase Firestore integrated

---

## Success Criteria

**Development:**
- 4 stories completed
- ≥80% test coverage
- Zero accessibility violations (jest-axe)
- ≤1.5s mobile load time

**User Impact:**
- 70% of users complete ≥1 step
- 80% rate comprehension as "clear"
- ≤2 min to understand next step

---

## Next Action

**Option 1: Start Development**
```bash
/BMad:dev
```
Say: "Implement Story 6.1"

**Option 2: Ask Questions**
Ask the PM (me) any clarifying questions about:
- Story requirements
- Technical approach
- Sprint scope
- Epic 7 planning

**Option 3: Review Architecture**
Read these docs first:
- `/docs/stories/6.1.case-journey-visual-timeline.md`
- `/docs/sprint-2-plan.md`
- `/docs/prd/epic-6-case-journey-map.md`

---

## Questions?

I'm here to help! Ask about:
- Story clarification
- Acceptance criteria details
- Technical architecture decisions
- Sprint scope management
- Risk mitigation

Let's build the Legal GPS! 🗺️

---

**Prepared by:** BMAD PM Agent
**Date:** 2025-10-10
**Sprint Start:** Pending your approval
