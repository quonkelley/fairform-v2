# Epic 6.5: Case Detail V2 Enhancement

**Status:** ✅ Complete
**Sprint:** Sprint 3 (Immediate Priority)
**Owner:** SM (Bob)
**Dependencies:** Epic 6 complete (Stories 6.3 & 6.4)
**Estimated Duration:** 4-5 days
**Actual Duration:** 4 days
**Completed:** October 13, 2025  

---

## Epic Goal

Transform the Case Detail page from a single-column timeline into a comprehensive two-column dashboard that aligns with the v2 guide architecture, providing users with progress overview, actionable next steps, and enhanced case journey visualization.

---

## Business Value

**User Value:**
- Clear progress tracking with visual percentage and step counts
- Actionable next steps based on case type and current progress
- Enhanced case journey visualization with better status indicators
- Mobile-optimized two-column layout that stacks responsively

**Strategic Value:**
- Aligns with v2 guide architecture for future AI integration
- Creates foundation for Epic 12 (AI Intake) case type classification
- Establishes template system for multiple case types beyond Small Claims
- Maintains accessibility and performance standards

---

## Epic Description

This epic implements the Case Detail realignment plan to converge current implementation with the v2 guide architecture. It adds progress tracking, next steps generation, case type templates, and a two-column layout while preserving existing functionality and maintaining our repository pattern.

**Key Changes:**
- Add Progress Overview card showing completion percentage and current step
- Implement two-column layout: Case Journey (left) + Your Next Steps (right)
- Create case type template system for journey generation
- Add status adapter for enum-based step status mapping
- Implement rule-based next steps generator
- Maintain mobile-first responsive design

---

## Stories

### Story 6.5.1: Data Model & Status Adapter Foundation
**Status:** ✅ Complete
**Priority:** Must-Have
**Effort:** 1 day
**Actual Effort:** 1 day
**Dependencies:** Epic 6 complete

**Objective:** Add case type support and status adapter for enum-based step status mapping

**Key Deliverables:**
- ✅ Add `caseType` field to Case model (7 case types supported)
- ✅ Create status adapter in `lib/adapters/steps.ts` (3 exported functions)
- ✅ Update `casesRepo.ts` with case type support
- ✅ Add progress calculation logic for `currentStep`
- ✅ 17 comprehensive unit tests (100% coverage)

---

### Story 6.5.2: Case Type Templates & Journey Generation
**Status:** ✅ Complete
**Priority:** Must-Have
**Effort:** 1.5 days
**Actual Effort:** 1.5 days
**Dependencies:** Story 6.5.1 complete

**Objective:** Create case type template registry and journey generation system

**Key Deliverables:**
- ✅ Create `lib/journeys/templates/index.ts` with case type definitions
- ✅ Implement journey template for Small Claims (current 5-step set)
- ✅ Add template registry for future case types (Employment, Housing, etc.)
- ✅ Create `generateCaseJourney()` function for step materialization
- ✅ Add `createCaseWithJourney()` method to casesRepo
- ✅ 41 comprehensive tests (23 template + 18 generation)

---

### Story 6.5.3: Next Steps Generator & Panel
**Status:** ✅ Complete
**Priority:** Must-Have
**Effort:** 1 day
**Actual Effort:** 1 day
**Dependencies:** Story 6.5.2 complete

**Objective:** Implement rule-based next steps generation and display panel

**Key Deliverables:**
- ✅ Create `lib/nextSteps/generate.ts` for deterministic suggestions (15 next steps)
- ✅ Build `NextStepsCard` component for right column
- ✅ Generate 2-3 actionable tasks based on case type and current step
- ✅ Integrate with case progress state
- ✅ Create `useNextSteps` React Query hook
- ✅ 47 comprehensive tests (27 generation + 20 component)

---

### Story 6.5.4: Two-Column Layout & Progress Overview
**Status:** ✅ Complete
**Priority:** Must-Have
**Effort:** 1.5 days
**Actual Effort:** 0.5 days
**Dependencies:** Story 6.5.3 complete

**Objective:** Implement two-column layout with progress overview and mobile optimization

**Key Deliverables:**
- ✅ Update `/app/cases/[id]/page.tsx` with two-column grid (CSS Grid)
- ✅ Create `ProgressOverview` component for top section
- ✅ Implement responsive layout (stack on mobile, lg:grid-cols-3)
- ✅ Maintain keyboard navigation and accessibility (WCAG 2.1 AA)
- ✅ Preserve existing `StepDetailModal` functionality
- ✅ Create `/api/cases/[id]` endpoint with authentication
- ✅ Create `useCaseDetails` React Query hook
- ✅ 19 comprehensive tests for ProgressOverview component

---

## Technical Architecture

**Data Model Updates:**
```typescript
interface Case {
  // Existing fields...
  caseType: 'small_claims' | 'employment' | 'housing' | 'consumer' | 'contract' | 'discrimination' | 'other';
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
}
```

**New Components:**
- `ProgressOverview.tsx` - Progress percentage and step count display
- `NextStepsCard.tsx` - Actionable next steps panel
- `lib/adapters/steps.ts` - Status enum adapter
- `lib/journeys/templates/index.ts` - Case type templates
- `lib/nextSteps/generate.ts` - Next steps generator

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│ Progress Overview Card                  │
├─────────────────────┬───────────────────┤
│ Case Journey        │ Your Next Steps   │
│ (Left Column)       │ (Right Column)    │
│ - Timeline          │ - Actionable      │
│ - Step Details      │   Tasks           │
│ - Modal Trigger     │ - Case Type       │
│                     │   Specific        │
└─────────────────────┴───────────────────┘
```

---

## Acceptance Criteria

### Epic Level Acceptance Criteria

1. **Progress Tracking**: Case detail shows progress percentage, current step number, and total steps
2. **Two-Column Layout**: Left column displays case journey timeline, right column shows next steps
3. **Next Steps Generation**: Right panel displays 2-3 actionable tasks based on case type and current step
4. **Template System**: Small Claims template implemented, registry ready for additional case types
5. **Status Adapter**: UI components use enum-based status mapping while maintaining boolean storage
6. **Mobile Optimization**: Layout stacks vertically on mobile with logical keyboard navigation
7. **Accessibility**: Zero WCAG 2.1 AA violations, proper ARIA labels and keyboard navigation
8. **Performance**: Page load time ≤ 1.5s mobile, modal open ≤ 100ms
9. **Integration**: Preserves existing StepDetailModal functionality and repository pattern
10. **Testing**: 100% test coverage for new components and adapters

---

## Dependencies

**Prerequisites:**
- Epic 6 complete (Stories 6.3 & 6.4) - provides StepDetailModal and progress sync
- Current case journey timeline functionality working

**Integration Points:**
- Uses existing `useCaseSteps` hook and repository pattern
- Integrates with `StepDetailModal` from Story 6.3
- Prepares foundation for Epic 12 (AI Intake) case type classification

**Future Dependencies:**
- Epic 12 will use case type templates for AI-assisted case creation
- Additional case types can be added to template registry
- Next steps generator can be enhanced with AI recommendations

---

## Risk Assessment

**Low Risk:**
- Building on stable Epic 6 foundation
- Incremental changes to existing components
- Maintains current data model compatibility

**Mitigation Strategies:**
- Preserve existing functionality during transition
- Comprehensive testing of status adapter mapping
- Mobile-first responsive design approach
- Feature flag for next steps panel if needed

---

## Success Metrics

**Technical Metrics:**
- Zero accessibility violations (jest-axe)
- Page load time ≤ 1.5s mobile
- Test coverage ≥ 80% for new components
- Zero TypeScript errors

**User Experience Metrics:**
- Logical keyboard navigation flow
- Proper screen reader announcements
- Responsive layout on all device sizes
- Intuitive next steps presentation

---

## Definition of Done

**Epic Complete When:**
- All 4 stories completed and QA approved
- Two-column layout implemented and tested
- Progress overview displays accurate information
- Next steps panel shows relevant actionable tasks
- Mobile responsive design verified
- Accessibility audit passes (0 violations)
- Integration tests confirm existing functionality preserved
- Documentation updated for new components

**Quality Gates:**
- All stories pass QA review
- Performance targets met
- Accessibility compliance verified
- Cross-browser testing completed
- Mobile device testing completed

---

## Sprint 3 Integration

**Positioning:** Epic 6.5 should be completed early in Sprint 3, before Epic 10 (Day-in-Court Checklist) and Epic 12 (AI Intake) development begins.

**Rationale:**
- Provides foundation for Epic 10 case type-specific checklists
- Enables Epic 12 AI Intake case type classification
- Completes the Case Journey Map feature family
- Low risk, high value incremental enhancement

**Handoff Requirements:**
- Epic 6.5 completion enables Epic 10 and Epic 12 development
- Template system ready for additional case types
- Next steps generator ready for AI enhancement
- Two-column layout ready for additional panels

---

## Epic Completion Summary

**Completion Date:** October 13, 2025
**Total Duration:** 4 days
**Branch:** `epic-6.5-case-detail-v2-enhancement`

### Implementation Results

**All Stories Completed:**
- ✅ Story 6.5.1: Data Model & Status Adapter Foundation (1 day)
- ✅ Story 6.5.2: Case Type Templates & Journey Generation (1.5 days)
- ✅ Story 6.5.3: Next Steps Generator & Panel (1 day)
- ✅ Story 6.5.4: Two-Column Layout & Progress Overview (0.5 days)

**Testing Results:**
- **192 tests passing** across all Epic 6.5 functionality
  - Story 6.5.1: 17 tests (adapters)
  - Story 6.5.2: 41 tests (templates + generation)
  - Story 6.5.3: 47 tests (next steps)
  - Story 6.5.4: 19 tests (progress overview)
  - Epic 6 regression: 68 tests (case journey components)
- Zero TypeScript errors
- 100% test coverage for all new business logic

**Files Created/Modified:**
- 12 new source files (components, hooks, adapters, templates, generators)
- 5 new test files with comprehensive coverage
- 2 modified files (casesRepo, case detail page)

**Key Features Delivered:**
1. **Progress Tracking**: Visual progress bar with percentage and step counts
2. **Case Type Support**: 7 case types with template registry system
3. **Next Steps Generator**: 15 predefined next steps (5 steps × 3 next steps)
4. **Two-Column Layout**: Responsive CSS Grid layout (mobile-first)
5. **Status Adapter**: Enum-based UI status mapping while maintaining boolean storage
6. **API Integration**: Authentication, authorization, and data fetching with React Query

**Quality Metrics:**
- ✅ WCAG 2.1 AA compliance maintained
- ✅ Mobile-responsive design (stacks vertically on small screens)
- ✅ Performance targets met (< 1ms next steps generation)
- ✅ Backward compatibility maintained (all new fields optional)
- ✅ Repository pattern preserved throughout

**Epic Acceptance Criteria Status:**
1. ✅ Progress Tracking - Complete with visual indicators
2. ✅ Two-Column Layout - Implemented with responsive grid
3. ✅ Next Steps Generation - Rule-based system with 15 predefined steps
4. ✅ Template System - Small Claims implemented, registry ready for expansion
5. ✅ Status Adapter - Enum-based mapping functional
6. ✅ Mobile Optimization - Responsive layout with keyboard navigation
7. ✅ Accessibility - Zero WCAG violations
8. ✅ Performance - All targets met
9. ✅ Integration - Existing functionality preserved
10. ✅ Testing - 192 tests passing, comprehensive coverage

### Handoff Notes

**Ready for:**
- Epic 10 (Day-in-Court Checklist) - can leverage case type templates
- Epic 12 (AI Intake) - can use case type classification system
- User acceptance testing and deployment
- Additional case type template creation (Employment, Housing, etc.)

**Technical Debt:** None identified

**Known Issues:** None

---

**Document Status:** Epic Complete - Ready for Deployment
**Created:** October 10, 2025
**Completed:** October 13, 2025
**Owner:** SM (Bob) / Dev: James (BMad:dev)
