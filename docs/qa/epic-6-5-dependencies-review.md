# Epic 6.5 Dependencies Review & QA Strategy

**Reviewer:** Quinn (Test Architect)  
**Date:** October 10, 2025  
**Epic:** 6.5 Case Detail V2 Enhancement  
**Status:** Pre-Development Review  

---

## Executive Summary

Epic 6.5 is **APPROVED for development** with recommended quality gates and testing strategies outlined below. The epic presents **LOW to MEDIUM risk** with clear mitigation strategies. Key findings:

✅ **Strengths:**
- Strong alignment with Epic 6 foundation
- Clear incremental approach
- Well-defined acceptance criteria
- Comprehensive story breakdown

⚠️ **Concerns:**
- Template content accuracy needs legal review
- Regression risk with layout changes
- Status adapter mapping requires thorough testing
- Mobile responsiveness critical for two-column layout

🎯 **Recommendation:** Proceed with development following QA strategy outlined in this document.

---

## Part 1: Technical Approach Review

### 1.1 Epic 6 Integration Analysis

**Current State (Epic 6 - Stories 6.1-6.4):**
- ✅ Story 6.1: Case Journey Visual Timeline (Done, QA: PASS)
  - Repository pattern established: `stepsRepo.ts`
  - React Query hook: `useCaseSteps`
  - Components: `CaseJourneyMap`, `StepNode`
  - Test coverage: 59/59 tests passing
  - Accessibility: 0 violations
  
- ✅ Story 6.2: Step Completion Logic (Done, QA: PASS)
  - Optimistic updates with React Query
  - Progress sync mechanism
  - Repository methods for step completion
  
- 📋 Story 6.3: Step Detail Modal (Ready for dev)
  - `StepDetailModal` component
  - Hardcoded Small Claims instructions
  - Modal trigger integration
  
- 📋 Story 6.4: Dashboard Progress Sync (Ready for dev)
  - `progressPct`, `completedSteps`, `totalSteps` fields
  - Dashboard card updates
  - Real-time progress calculation

**Epic 6.5 Integration Points:**

| Epic 6.5 Component | Integrates With Epic 6 | Risk Level | Mitigation |
|--------------------|-------------------------|------------|------------|
| Status Adapter | `CaseJourneyMap`, `StepNode` | LOW | Adapter is UI-only, doesn't change DB |
| Case Type Field | Firestore `cases` collection | MEDIUM | New optional field, backward compatible |
| Progress Overview | Story 6.4 progress fields | LOW | Uses existing fields, new component |
| Two-Column Layout | `CaseJourneyMap` component | MEDIUM | Major UI change, needs regression testing |
| Next Steps Panel | Case progress state | LOW | New component, no changes to existing |

**Verdict:** ✅ **APPROVED** - Integration approach is sound with clear separation of concerns.

---

### 1.2 Case Detail Realignment Validation

**Alignment with Realignment Plan (`case_detail_realignment.md`):**

| Realignment Item | Epic 6.5 Story | Status | Notes |
|------------------|----------------|--------|-------|
| **Data & Adapters** | Story 6.5.1 | ✅ ALIGNED | Status adapter matches plan exactly |
| **Template Registry** | Story 6.5.2 | ✅ ALIGNED | Case type templates as specified |
| **Next Steps Panel** | Story 6.5.3 | ✅ ALIGNED | Rule-based generator, no AI |
| **Layout Upgrade** | Story 6.5.4 | ✅ ALIGNED | Two-column grid with mobile stack |
| **Repo Updates** | Story 6.5.1 | ✅ ALIGNED | `currentStep` calculation included |

**Gap Analysis:**
- ❌ **No Gaps Found** - Epic 6.5 comprehensively covers the realignment plan
- ✅ **Scope Control** - Epic correctly excludes out-of-scope items (AI features, dynamic templates from DB)

**Verdict:** ✅ **APPROVED** - Epic 6.5 fully implements the realignment plan without scope creep.

---

### 1.3 Regression Risk Assessment

**Potential Regression Risks:**

#### Risk 1: CaseJourneyMap Component Changes
**Severity:** MEDIUM  
**Probability:** MEDIUM  
**Impact:** Broken timeline display, lost step navigation

**Affected Code:**
- `app/cases/[id]/page.tsx` - Major layout restructure
- `components/case-journey/case-journey-map.tsx` - Integration with new layout

**Mitigation:**
- Preserve existing `CaseJourneyMap` component interface
- Add regression test suite before Epic 6.5 work begins
- Test step navigation and modal triggers after layout changes
- Verify all Story 6.1 and 6.2 tests still pass

**QA Requirements:**
- [ ] Run full Story 6.1 test suite (59 tests)
- [ ] Run full Story 6.2 test suite
- [ ] Manual smoke test of case journey timeline
- [ ] Verify `StepDetailModal` still opens correctly

---

#### Risk 2: Repository Pattern Changes
**Severity:** LOW  
**Probability:** LOW  
**Impact:** Data fetching broken, progress calculation errors

**Affected Code:**
- `lib/db/casesRepo.ts` - Adding `currentStep`, `caseType` support
- `lib/db/stepsRepo.ts` - Potential template generation integration

**Mitigation:**
- New fields are additive only
- Existing methods remain unchanged
- Status adapter doesn't touch repository layer

**QA Requirements:**
- [ ] Unit tests for new repository methods
- [ ] Integration tests for data fetching
- [ ] Verify existing React Query hooks still work

---

#### Risk 3: Mobile Responsiveness
**Severity:** HIGH  
**Probability:** MEDIUM  
**Impact:** Broken mobile experience, unusable on small screens

**Affected Code:**
- `app/cases/[id]/page.tsx` - Two-column to single-column stacking
- All new components must be mobile-first

**Mitigation:**
- Mobile-first development approach
- Test on actual mobile devices (iOS Safari, Android Chrome)
- Responsive design system utilities (Tailwind)
- Keyboard navigation order preserved on mobile

**QA Requirements:**
- [ ] Test on iPhone (Safari) - 375px, 414px widths
- [ ] Test on Android (Chrome) - 360px, 412px widths
- [ ] Test landscape and portrait orientations
- [ ] Verify touch targets ≥ 44x44px
- [ ] Test keyboard navigation order on mobile

---

#### Risk 4: Accessibility Regressions
**Severity:** HIGH  
**Probability:** LOW  
**Impact:** WCAG violations, broken screen reader experience

**Affected Code:**
- All new components must maintain WCAG 2.1 AA compliance
- Layout changes could break keyboard navigation

**Mitigation:**
- Run jest-axe on all new components
- Preserve existing ARIA labels and landmarks
- Maintain keyboard navigation patterns
- Test with screen readers (NVDA, VoiceOver)

**QA Requirements:**
- [ ] Zero jest-axe violations (target: 0)
- [ ] Screen reader testing on new components
- [ ] Keyboard navigation flow verification
- [ ] Focus management in two-column layout

---

### 1.4 Template Content Review

**Legal Accuracy Concerns:**

⚠️ **CRITICAL FINDING:** Template content for Small Claims and future case types requires legal review to ensure:
- Procedural steps are legally accurate
- Jurisdiction-specific requirements are correct
- No Unauthorized Practice of Law (UPL) violations
- Disclaimers are prominent and appropriate

**Small Claims Template Review (Story 6.5.2):**

| Template Field | Risk Level | Review Required |
|----------------|------------|-----------------|
| Step Titles | LOW | Generic, procedurally accurate |
| Step Descriptions | MEDIUM | Should be legally reviewed |
| Instructions | HIGH | Must not constitute legal advice |
| Estimated Times | LOW | User guidance only |
| Step Types | LOW | Metadata only |

**Recommendations:**

1. **Immediate Actions:**
   - [ ] Add prominent disclaimer: "This is general information, not legal advice"
   - [ ] Use "typically" or "generally" language to avoid absolutes
   - [ ] Include jurisdiction caveats (e.g., "In most California small claims courts...")
   - [ ] Add "Consult local court for specific requirements" messaging

2. **Before Production:**
   - [ ] Legal counsel review of all template content
   - [ ] Focus group testing with actual SRLs
   - [ ] Jurisdiction-specific validation (start with California)

3. **Template Content Guidelines:**
   - ✅ DO: Provide procedural guidance and general information
   - ✅ DO: Link to official court resources
   - ✅ DO: Use disclaimers prominently
   - ❌ DON'T: Give specific legal advice
   - ❌ DON'T: Interpret laws or statutes
   - ❌ DON'T: Make guarantees about outcomes

**Verdict:** ⚠️ **APPROVED WITH CONDITIONS** - Proceed with development using safe, general language. Legal review required before production deployment.

---

## Part 2: Epic 6.5 QA Strategy

### 2.1 Testing Pyramid for Epic 6.5

```
                    /\
                   /  \
                  / E2E \
                 /  (5%)  \
                /__________\
               /            \
              / Integration  \
             /     (15%)      \
            /_________________ \
           /                    \
          /   Component Tests    \
         /        (30%)           \
        /_________________________\
       /                           \
      /      Unit Tests (50%)       \
     /_______________________________\
```

**Test Distribution:**
- **Unit Tests (50%):** Adapters, generators, utilities
- **Component Tests (30%):** React components, hooks
- **Integration Tests (15%):** Component interaction, data flow
- **E2E Tests (5%):** Critical user flows

---

### 2.2 Regression Test Requirements

**Epic 6 Regression Test Suite:**

Before Epic 6.5 development, establish baseline:

```bash
# Epic 6 Regression Suite
- Story 6.1 Tests: 59 tests (100% pass required)
- Story 6.2 Tests: [count from implementation]
- Story 6.3 Tests: [pending completion]
- Story 6.4 Tests: [pending completion]

Total Baseline: [count] tests
Target: 100% pass rate maintained throughout Epic 6.5
```

**Regression Test Strategy:**

1. **Pre-Epic 6.5:**
   - [ ] Run full Epic 6 test suite
   - [ ] Document current test count and pass rate
   - [ ] Take screenshots of working functionality
   - [ ] Record Lighthouse scores (performance baseline)

2. **During Each Story:**
   - [ ] Run Epic 6 regression suite before starting
   - [ ] Run regression suite after each major change
   - [ ] Fix any broken tests immediately
   - [ ] Update tests if intentional behavior changes

3. **Post-Epic 6.5:**
   - [ ] Run combined Epic 6 + 6.5 test suite
   - [ ] Compare performance metrics (no degradation)
   - [ ] Visual regression testing (screenshots)
   - [ ] Manual smoke test checklist

---

### 2.3 Accessibility Audit Approach

**Automated Testing:**

```typescript
// Run on all new components
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('ProgressOverview has no accessibility violations', async () => {
  const { container } = render(<ProgressOverview {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Repeat for: NextStepsCard, updated CaseJourneyMap
```

**Manual Testing Checklist:**

- [ ] **Keyboard Navigation:**
  - Tab order is logical through two-column layout
  - Focus visible on all interactive elements
  - Modal can be opened and closed via keyboard
  - Next steps cards keyboard accessible

- [ ] **Screen Reader Testing (NVDA on Windows, VoiceOver on Mac):**
  - Page structure announced correctly
  - Progress percentage announced
  - Next steps list announced with proper semantics
  - Case journey timeline maintains screen reader support
  - Modal announcements work correctly

- [ ] **Color Contrast:**
  - All text meets 4.5:1 minimum (WCAG AA)
  - Status indicators don't rely solely on color
  - Links have 3:1 contrast with surrounding text

- [ ] **Zoom Testing:**
  - Page usable at 200% zoom
  - No horizontal scrolling required
  - Text reflows appropriately

**WCAG 2.1 AA Compliance Checklist:**

| WCAG Criterion | Test Method | Target |
|----------------|-------------|--------|
| 1.3.1 Info & Relationships | Screen reader | PASS |
| 1.4.3 Contrast (Minimum) | Contrast checker | ≥4.5:1 |
| 2.1.1 Keyboard | Manual testing | PASS |
| 2.4.3 Focus Order | Tab through UI | Logical |
| 2.4.7 Focus Visible | Visual check | Visible |
| 3.2.3 Consistent Navigation | Manual check | Consistent |
| 4.1.2 Name, Role, Value | Screen reader | PASS |

**Target:** Zero WCAG 2.1 AA violations

---

### 2.4 Integration Test Scenarios

**Scenario 1: End-to-End Case Detail Flow**
```
Given: User is authenticated
When: User navigates to case detail page
Then:
  - Progress overview displays with correct percentage
  - Case journey timeline shows all steps
  - Next steps panel shows 2-3 relevant tasks
  - Two-column layout renders correctly
  - Can click step to open modal
  - Can complete step and see progress update
  - Next steps update based on new progress
```

**Scenario 2: Status Adapter Integration**
```
Given: Case has steps with mixed completion status
When: Page renders with status adapter
Then:
  - Completed steps show "completed" status
  - Current step (lowest incomplete order) shows "in_progress"
  - Future steps show "pending" status
  - Visual indicators match status correctly
  - Screen reader announces status correctly
```

**Scenario 3: Mobile Responsive Behavior**
```
Given: User is on mobile device (< 768px width)
When: Page renders
Then:
  - Two-column layout stacks vertically
  - Progress overview renders at top
  - Case journey timeline renders second
  - Next steps panel renders third
  - All touch targets ≥ 44x44px
  - Keyboard navigation order is logical
```

**Scenario 4: Template System Integration**
```
Given: Case has caseType = 'small_claims'
When: Journey generation runs
Then:
  - Correct template is selected
  - 5 Small Claims steps are generated
  - Step types match template
  - Next steps generated match current step
  - Template registry supports future case types
```

**Scenario 5: Progress Calculation Accuracy**
```
Given: Case with 5 steps, 2 completed
When: Progress is calculated
Then:
  - progressPercentage = 40%
  - completedSteps = 2
  - totalSteps = 5
  - currentStep = 3 (lowest incomplete order)
  - Progress overview displays correctly
```

---

### 2.5 Performance Testing Strategy

**Performance Targets:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Page Load Time (3G) | ≤ 1.5s | Lighthouse, Network throttling |
| Time to Interactive | ≤ 3.8s | Lighthouse |
| First Contentful Paint | ≤ 1.8s | Lighthouse |
| Largest Contentful Paint | ≤ 2.5s | Lighthouse |
| Cumulative Layout Shift | ≤ 0.1 | Lighthouse |
| Modal Open Time | ≤ 100ms | Performance API |
| Status Adapter Performance | ≤ 50ms | Performance API |
| Next Steps Generation | ≤ 100ms | Performance API |

**Performance Testing Checklist:**

- [ ] Run Lighthouse audit on mobile (target: ≥95)
- [ ] Run Lighthouse audit on desktop (target: ≥95)
- [ ] Test with slow 3G network throttling
- [ ] Measure component render times
- [ ] Profile React Query cache behavior
- [ ] Test with large datasets (100+ steps)
- [ ] Memory leak testing (long sessions)

**Performance Regression Prevention:**

```javascript
// Add performance marks
performance.mark('nextSteps-start');
const nextSteps = generateNextSteps(caseType, currentStep);
performance.mark('nextSteps-end');
performance.measure('nextSteps-generation', 'nextSteps-start', 'nextSteps-end');

// Assert performance in tests
expect(performance.getEntriesByName('nextSteps-generation')[0].duration).toBeLessThan(100);
```

---

### 2.6 Cross-Browser Testing Matrix

| Browser | Version | Desktop | Mobile | Priority |
|---------|---------|---------|--------|----------|
| Chrome | Latest | ✅ | ✅ | P0 |
| Safari | Latest | ✅ | ✅ | P0 |
| Firefox | Latest | ✅ | ❌ | P1 |
| Edge | Latest | ✅ | ❌ | P1 |
| Samsung Internet | Latest | ❌ | ✅ | P2 |

**Testing Approach:**
- **P0 Browsers:** Full manual testing + automated tests
- **P1 Browsers:** Smoke testing + critical flows
- **P2 Browsers:** Visual verification only

**Known Browser-Specific Issues to Watch:**
- Safari: Grid layout quirks, flexbox differences
- iOS Safari: Bottom nav bar height (safe-area-inset)
- Firefox: focus-visible differences
- Edge: Legacy CSS Grid support

---

## Part 3: Story-Level QA Requirements

### Story 6.5.1: Data Model & Status Adapter

**QA Focus:** Data integrity, adapter logic correctness

**Test Requirements:**
- [ ] Unit tests for `toStepStatus()` adapter (100% coverage)
  - [ ] Returns 'completed' when `isComplete === true`
  - [ ] Returns 'in_progress' when `order === currentOrder`
  - [ ] Returns 'pending' for future steps
  - [ ] Edge cases: no steps, all completed, none completed
  
- [ ] Repository tests for `currentStep` calculation
  - [ ] Correctly identifies lowest incomplete step
  - [ ] Returns 1 when no steps completed
  - [ ] Returns totalSteps + 1 when all completed
  
- [ ] Database migration testing
  - [ ] New fields added to Firestore schema
  - [ ] Existing cases work without `caseType`
  - [ ] Default values handled correctly

**Acceptance Criteria Verification:**
- [ ] AC1: Case type field added ✓
- [ ] AC2: Status adapter created and tested ✓
- [ ] AC3: Progress calculation implemented ✓
- [ ] AC4: Backward compatibility maintained ✓

**Gate Decision:** PASS if all adapter tests pass and no data corruption occurs.

---

### Story 6.5.2: Case Type Templates

**QA Focus:** Template accuracy, generation logic

**Test Requirements:**
- [ ] Template registry structure validation
  - [ ] All case types have template entries
  - [ ] Small Claims template has 5 steps
  - [ ] Step types are valid enum values
  - [ ] Instructions are arrays of strings
  
- [ ] Journey generation tests
  - [ ] Generates correct number of steps
  - [ ] Steps have correct order
  - [ ] Template data mapped to step structure
  - [ ] Persists to Firestore correctly
  
- [ ] Template content review
  - [ ] Legal language is appropriate
  - [ ] No absolute statements ("must", "will")
  - [ ] Disclaimers present
  - [ ] Jurisdiction caveats included

**Acceptance Criteria Verification:**
- [ ] AC1: Template registry created ✓
- [ ] AC2: Journey generation works ✓
- [ ] AC3: Small Claims template complete ✓
- [ ] AC4: Template extensibility validated ✓

**Gate Decision:** PASS if generation works correctly. CONCERNS if template content lacks legal review.

---

### Story 6.5.3: Next Steps Generator

**QA Focus:** Generator logic, UI rendering

**Test Requirements:**
- [ ] Next steps generation logic
  - [ ] Generates 2-3 steps per case type/current step
  - [ ] Steps are actionable and specific
  - [ ] Deterministic (same inputs = same outputs)
  - [ ] Handles edge cases (no steps, completed case)
  
- [ ] NextStepsCard component tests
  - [ ] Renders with loading state
  - [ ] Renders with generated steps
  - [ ] Renders empty state appropriately
  - [ ] Accessibility: proper heading structure
  - [ ] Accessibility: list semantics correct
  
- [ ] Integration with case progress
  - [ ] Updates when step completed
  - [ ] React Query invalidation works
  - [ ] Loading states handled correctly

**Acceptance Criteria Verification:**
- [ ] AC1: Next steps generator created ✓
- [ ] AC2: NextStepsCard component built ✓
- [ ] AC3: 2-3 actionable tasks displayed ✓
- [ ] AC4: Integration with progress works ✓

**Gate Decision:** PASS if generation logic is deterministic and UI is accessible.

---

### Story 6.5.4: Two-Column Layout

**QA Focus:** Layout integrity, mobile responsiveness, accessibility

**Test Requirements:**
- [ ] Layout rendering tests
  - [ ] Two columns on desktop (≥1024px)
  - [ ] Stacked on tablet (768px-1023px)
  - [ ] Stacked on mobile (<768px)
  - [ ] Progress overview at top
  - [ ] Correct column widths (2/3 + 1/3)
  
- [ ] ProgressOverview component tests
  - [ ] Displays percentage correctly
  - [ ] Shows current/total steps
  - [ ] Updates in real-time
  - [ ] Accessibility: ARIA labels present
  
- [ ] Regression testing
  - [ ] CaseJourneyMap still renders
  - [ ] StepNode components still work
  - [ ] Modal trigger still functions
  - [ ] Keyboard navigation preserved

**Acceptance Criteria Verification:**
- [ ] AC1: Progress overview displays ✓
- [ ] AC2: Two-column layout works ✓
- [ ] AC3: Responsive design verified ✓
- [ ] AC4: Existing functionality preserved ✓

**Gate Decision:** PASS if layout works across devices and no regressions detected.

---

## Part 4: Quality Gates & Sign-Off

### Epic 6.5 Quality Gate Criteria

**PASS Criteria:**
- ✅ All 4 stories complete and tested
- ✅ Zero critical bugs
- ✅ Zero WCAG 2.1 AA violations
- ✅ Performance targets met (Lighthouse ≥95)
- ✅ All Epic 6 regression tests pass
- ✅ Cross-browser testing complete (P0 browsers)
- ✅ Mobile device testing complete
- ✅ Template content has legal disclaimer

**CONCERNS Criteria:**
- ⚠️ Minor bugs found (≤3 low severity)
- ⚠️ Template content lacks legal review
- ⚠️ Performance close to targets but within range
- ⚠️ P1 browser issues (non-blocking)

**FAIL Criteria:**
- ❌ Critical bugs present
- ❌ WCAG violations detected
- ❌ Epic 6 regression tests fail
- ❌ Performance significantly below targets
- ❌ Mobile experience broken
- ❌ Data corruption or loss

---

### QA Sign-Off Checklist

**Pre-Development:**
- [x] Technical approach reviewed
- [x] Regression risks identified
- [x] QA strategy documented
- [ ] Dev team briefed on QA requirements

**During Development (Per Story):**
- [ ] Unit tests written and passing
- [ ] Component tests written and passing
- [ ] Accessibility tests passing (jest-axe)
- [ ] Code review completed
- [ ] QA manual testing completed
- [ ] Gate decision documented

**Post-Development (Epic Level):**
- [ ] All stories QA approved
- [ ] Regression suite passes
- [ ] Performance audit complete
- [ ] Accessibility audit complete
- [ ] Cross-browser testing complete
- [ ] Mobile device testing complete
- [ ] Documentation updated
- [ ] Final gate decision: PASS/CONCERNS/FAIL

---

## Part 5: Recommendations & Next Steps

### Immediate Actions (Before Development Starts)

1. **Establish Regression Baseline:**
   ```bash
   # Run and document current Epic 6 test results
   npm test -- --testPathPattern="6.1|6.2"
   # Take screenshots of working case detail page
   # Run Lighthouse audit for baseline metrics
   ```

2. **Create Template Content Guidelines:**
   - Draft disclaimer language
   - Define acceptable phrasing ("typically", "generally")
   - List prohibited content (specific legal advice)

3. **Set Up Accessibility Testing:**
   ```bash
   # Install jest-axe if not already
   npm install --save-dev jest-axe @axe-core/react
   ```

4. **Brief Dev Team:**
   - Review regression risks
   - Emphasize mobile-first approach
   - Highlight accessibility requirements

---

### During Development (Per Story)

1. **Story 6.5.1:**
   - Focus on adapter logic unit tests
   - Verify backward compatibility with existing cases
   - Test repository method changes thoroughly

2. **Story 6.5.2:**
   - Review template content with PO
   - Test generation logic with edge cases
   - Validate template extensibility

3. **Story 6.5.3:**
   - Test next steps determinism
   - Verify React Query integration
   - Check accessibility of NextStepsCard

4. **Story 6.5.4:**
   - Test on actual mobile devices (not just dev tools)
   - Run full Epic 6 regression suite
   - Verify keyboard navigation order

---

### Post-Development (Epic Level)

1. **Comprehensive Testing:**
   - Full regression suite (Epic 6 + 6.5)
   - Lighthouse audits (mobile and desktop)
   - Cross-browser testing matrix
   - Real device testing

2. **Documentation:**
   - Update component documentation
   - Document new hooks and utilities
   - Create troubleshooting guide

3. **Legal Review:**
   - Submit template content for legal review
   - Update content based on feedback
   - Document compliance measures

---

## Appendix A: Test Data Requirements

**Sample Cases for Testing:**

```typescript
// Case with no steps completed
const newCase = {
  id: 'case-1',
  caseType: 'small_claims',
  currentStep: 1,
  totalSteps: 5,
  progressPercentage: 0
};

// Case with partial completion
const partialCase = {
  id: 'case-2',
  caseType: 'small_claims',
  currentStep: 3,
  totalSteps: 5,
  progressPercentage: 40
};

// Case fully completed
const completedCase = {
  id: 'case-3',
  caseType: 'small_claims',
  currentStep: 6,
  totalSteps: 5,
  progressPercentage: 100
};
```

---

## Appendix B: Performance Benchmarks

**Baseline Performance (Pre-Epic 6.5):**
- To be measured before development starts
- Lighthouse scores documented
- Network waterfall captured
- Bundle size recorded

**Target Performance (Post-Epic 6.5):**
- No more than 10% increase in bundle size
- Lighthouse scores maintained (≥95)
- No new layout shifts (CLS ≤ 0.1)

---

## Document Status

**Status:** APPROVED FOR DEVELOPMENT  
**Reviewer:** Quinn (Test Architect)  
**Approval Date:** October 10, 2025  
**Next Review:** After Story 6.5.1 completion (mid-epic check-in)

---

**Epic 6.5 Quality Gate File:** `docs/qa/gates/6.5.case-detail-v2-enhancement.yml` (to be created during development)

---

*This review provides the comprehensive QA strategy for Epic 6.5. All recommendations should be followed to ensure quality and prevent regressions.*

