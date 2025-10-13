# Epic 6.5: Case Detail V2 Enhancement

**Status:** 📋 Ready  
**Sprint:** Sprint 3 (Immediate Priority)  
**Owner:** SM (Bob)  
**Dependencies:** Epic 6 complete (Stories 6.3 & 6.4)  
**Estimated Duration:** 4-5 days  

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
**Priority:** Must-Have  
**Effort:** 1 day  
**Dependencies:** Epic 6 complete  

**Objective:** Add case type support and status adapter for enum-based step status mapping

**Key Deliverables:**
- Add `caseType` field to Case model
- Create status adapter in `lib/adapters/steps.ts`
- Update `casesRepo.ts` with case type support
- Add progress calculation logic for `currentStep`

---

### Story 6.5.2: Case Type Templates & Journey Generation
**Priority:** Must-Have  
**Effort:** 1.5 days  
**Dependencies:** Story 6.5.1 complete  

**Objective:** Create case type template registry and journey generation system

**Key Deliverables:**
- Create `lib/journeys/templates/index.ts` with case type definitions
- Implement journey template for Small Claims (current 5-step set)
- Add template registry for future case types (Employment, Housing, etc.)
- Create `generateCaseJourney()` function for step materialization

---

### Story 6.5.3: Next Steps Generator & Panel
**Priority:** Must-Have  
**Effort:** 1 day  
**Dependencies:** Story 6.5.2 complete  

**Objective:** Implement rule-based next steps generation and display panel

**Key Deliverables:**
- Create `lib/nextSteps/generate.ts` for deterministic suggestions
- Build `NextStepsCard` component for right column
- Generate 2-3 actionable tasks based on case type and current step
- Integrate with case progress state

---

### Story 6.5.4: Two-Column Layout & Progress Overview
**Priority:** Must-Have  
**Effort:** 1.5 days  
**Dependencies:** Story 6.5.3 complete  

**Objective:** Implement two-column layout with progress overview and mobile optimization

**Key Deliverables:**
- Update `/app/cases/[id]/page.tsx` with two-column grid
- Create `ProgressOverview` component for top section
- Implement responsive layout (stack on mobile)
- Maintain keyboard navigation and accessibility
- Preserve existing `StepDetailModal` functionality

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

**Document Status:** Ready for Sprint Planning  
**Created:** October 10, 2025  
**Owner:** SM (Bob)  
**Next Review:** After Epic 6 completion
