# Sprint 2 Completion & Sprint 3 Alignment

**Date:** October 10, 2025  
**Owner:** Sarah (Product Owner)  
**Purpose:** Align team on Sprint 2 completion priorities and Sprint 3 planning approach

---

## Executive Summary

Sprint 2 is **50% complete** with Stories 6.1 and 6.2 successfully delivered. To maintain project integrity and quality standards, we need to **complete Sprint 2 before committing to Sprint 3** scope.

This document addresses the alignment gap between our current Sprint 2 status and the excellent Sprint 3 planning work done by the ChatGPT team.

**Key Decisions:**
1. ✅ Complete Stories 6.3 & 6.4 before Sprint 2 close
2. 🤔 Make Epic 7 (Glossary) prioritization decision after 6.3/6.4 complete
3. 📋 Revise Sprint 3 scope to prioritize lower-risk, high-value features
4. ⏸️ Consider deferring AI features (Epic 12) to Sprint 4 for proper compliance review

---

## 1. Sprint 2 Current Status

### Stories Complete ✅
**Story 6.1: Case Journey Visual Timeline**
- Status: Complete & QA Approved
- Test Results: 44/44 tests passing (100%)
- Accessibility: Zero violations
- All acceptance criteria met
- Files created: 7 new files, 1 modified
- Ready for production

**Story 6.2: Step Completion Logic**
- Status: Complete & QA Approved
- Test Results: 51/51 tests passing (100%)
- Accessibility: Zero violations
- Optimistic updates working perfectly
- All acceptance criteria met
- Files created: 2 new files, 4 modified
- Ready for production

### Stories In Progress 🔄
**Story 6.3: Step Detail Modal**
- Status: Ready for development
- Estimated effort: 2 days
- Requirements: Fully documented in story file
- Dependencies: Story 6.1 complete ✅
- Story file created: `docs/stories/6.3.step-detail-modal.md`

**Story 6.4: Dashboard Progress Sync**
- Status: Ready for development
- Estimated effort: 1.5 days
- Requirements: Fully documented in story file
- Dependencies: Story 6.2 complete ✅
- Story file created: `docs/stories/6.4.dashboard-progress-sync.md`

### Sprint 2 Metrics
- **Progress:** 50% (2 of 4 stories complete)
- **Test Pass Rate:** 100% (59/59 tests)
- **Code Quality:** Zero TypeScript errors, zero lint warnings
- **Accessibility:** Zero violations across all components
- **Repository Pattern:** 100% adherence
- **Timeline:** Estimated 3.5 days remaining

---

## 2. Sprint 2 Remaining Work

### Story 6.3: Step Detail Modal

**What It Is:**
A modal component that opens when users click a case step, displaying detailed instructions, due date, and estimated time to complete.

**Key Deliverables:**
- `components/case-journey/step-detail-modal.tsx` component
- `lib/data/step-instructions.ts` with hardcoded templates
- Updated `step-node.tsx` with click handler
- Comprehensive test suite

**Technical Approach:**
- Use shadcn/ui Dialog component (already installed)
- Hardcoded instruction templates for 5 Small Claims steps
- Focus trap, keyboard navigation (ESC to close)
- Mobile-responsive design (full-width on mobile)

**Acceptance Criteria:**
1. Click step → modal opens with instructions
2. Modal shows step name, instructions, due date
3. Dismissible (X button, ESC, click outside)
4. Keyboard accessible (Tab, ESC)
5. Screen reader compatible
6. Mobile-friendly design

**Testing Requirements:**
- Component tests (modal open/close, content display)
- Accessibility tests (jest-axe, keyboard nav)
- Integration tests (click step → modal opens)
- Responsive tests (mobile/tablet/desktop)

---

### Story 6.4: Dashboard Progress Sync

**What It Is:**
Progress calculation and display on dashboard case cards, showing users their completion percentage at a glance.

**Key Deliverables:**
- `calculateCaseProgress()` function in `casesRepo.ts`
- Updated `CaseCard` component with progress bar
- Progress calculation triggered on step completion
- React Query cache invalidation for dashboard updates

**Technical Approach:**
- Add progress fields to Case interface: `progressPct`, `totalSteps`, `completedSteps`
- Calculate: `(completedSteps / totalSteps) * 100`
- Update on step completion (server-side calculation)
- Use shadcn/ui Progress component
- ARIA attributes for accessibility

**Acceptance Criteria:**
1. Dashboard cards show progress percentage (0-100%)
2. Progress bar provides visual indicator
3. Updates within 1s of step completion
4. Accurate calculation
5. Empty state handled (0% shows gracefully)
6. Accessible with proper ARIA attributes

**Testing Requirements:**
- Unit tests (progress calculation edge cases)
- Component tests (progress bar display)
- Integration tests (complete step → dashboard updates)
- Accessibility tests (ARIA attributes, screen reader)

---

### Sprint 2 Definition of Done

Sprint 2 is complete when:

- [ ] Stories 6.3 & 6.4 delivered and tested
- [ ] All tests passing (current 59 + new tests for 6.3/6.4)
- [ ] Zero accessibility violations maintained
- [ ] QA gates passed for both stories
- [ ] Case Journey Map fully functional (all 4 stories)
- [ ] Dashboard progress sync working end-to-end
- [ ] Sprint review conducted
- [ ] Documentation updated

**Estimated Completion:** 3.5 days of focused development

---

## 3. Epic 7 Decision Required

### The Question
**When should we implement Epic 7 (Inline Glossary)?**

Epic 7 has a complete PRD (`docs/prd/epic-7-inline-glossary.md`) and was mentioned in the Sprint 2 plan but not included in current work.

### Options

**Option 1: Include in Sprint 2**
- Extends Sprint 2 by 2-3 days
- Epic 6 complete, glossary integrated with step instructions
- Maintains sprint continuity

**Pros:**
- Delivers complete user experience (journey + glossary)
- High user value (clarifies legal terms)
- Natural integration point with step instructions

**Cons:**
- Delays Sprint 3 start
- Increases Sprint 2 scope mid-sprint
- Team may be fatigued after 4 stories

---

**Option 2: Create Sprint 2.5 Mini-Sprint**
- Dedicated 2-3 day sprint for Epic 7 only
- Clean boundaries between sprints
- Focused delivery

**Pros:**
- Delivers Epic 7 without extending Sprint 2
- Clear sprint boundaries
- Maintains team momentum

**Cons:**
- Adds another sprint to schedule
- May feel like artificial separation
- Delays Sprint 3 by 2-3 days anyway

---

**Option 3: Defer to Sprint 3 or Later**
- Focus Sprint 3 on other features first
- Implement glossary when team has capacity
- Consider user feedback on Epic 6 first

**Pros:**
- Sprint 2 closes on time (3.5 days)
- Sprint 3 can start with fresh scope
- Allows prioritization of other features

**Cons:**
- Users experience step instructions without glossary help
- Glossary implementation may be less integrated later
- User value delayed

---

### Recommendation

**Make decision after Stories 6.3 & 6.4 complete.**

**Decision Criteria:**
1. **Team Velocity:** Are we ahead or behind the 3.5 day estimate?
2. **Team Energy:** Is the team ready for more Sprint 2 work or need a break?
3. **User Feedback:** Do early users request glossary feature immediately?
4. **Sprint 3 Priorities:** Is Sprint 3 scope more urgent than Epic 7?

**Lean Toward:** Option 3 (defer to Sprint 3+) unless team is ahead of schedule and Epic 7 is critical for user success.

---

## 4. Sprint 3 Prerequisites

Before starting Sprint 3 with AI features (as proposed in ChatGPT team's plan), we must ensure:

### Must-Have Prerequisites

- [ ] **Sprint 2 Complete:** All 4 stories (6.1-6.4) delivered, tested, QA approved
- [ ] **Epic 7 Status Resolved:** Decision made on glossary timing
- [ ] **AI Compliance Review Completed:** Legal and UPL risk assessment done
- [ ] **OpenAI API Access Configured:** API keys, rate limits, billing set up
- [ ] **UPL Risk Assessment Done:** Legal disclaimer copy approved
- [ ] **Feature Flag Strategy Confirmed:** Infrastructure for controlled rollout
- [ ] **QA Resources Available:** Team ready to test AI features with specific scenarios

### Should-Have Prerequisites

- [ ] **Moderation Layer Tested:** Content moderation working and validated
- [ ] **User Settings Complete:** AI opt-in toggle functional (Epic 11)
- [ ] **Analytics Setup:** PostHog or similar for AI usage tracking
- [ ] **Error Handling Strategy:** Plan for AI API failures or slow responses

### Nice-to-Have Prerequisites

- [ ] **User Research:** Understand if users want AI intake vs. form-based intake
- [ ] **Competitor Analysis:** Review how other legal tech uses AI
- [ ] **Cost Modeling:** Understand OpenAI API costs at scale

---

## 5. Sprint 3 Scope Feedback

### Appreciation for ChatGPT Team's Work

The ChatGPT team has done **excellent forward-thinking work** on Sprint 3 planning:

✅ **Strengths:**
- Comprehensive Sprint 3 backlog with clear estimates
- Detailed integration summary showing cross-epic dependencies
- Strong QA gate document with compliance focus
- Thorough tech spike plan for AI infrastructure
- Well-structured epic PRDs (especially Epic 12)

✅ **Quality Indicators:**
- Evidence of systems thinking (integration document)
- Compliance awareness (moderation, disclaimers, logging)
- QA rigor (comprehensive gate criteria)
- BMAD method adherence (process followed well)

---

### Concerns About Proposed Sprint 3 Scope

❓ **Complexity Jump:**
- Sprint 2: UI features (timelines, modals, progress bars)
- Sprint 3 Proposed: **AI-powered features** (classification, moderation, compliance)
- This represents a significant technical and compliance complexity increase

❓ **Risk Profile:**
- Sprint 2 Features: Low risk (UI, forms, data display)
- AI Features: **High risk** (UPL concerns, API dependencies, moderation requirements)

❓ **Epic Sequence:**
- Sprint 3 proposes: Epic 10, 11, 12 (skipping Epic 7, 8, 9)
- Epic 9 (Reminders) builds notification infrastructure needed for other features
- Why skip to Epic 12 (highest complexity) instead of Epic 9 (medium complexity)?

❓ **Prerequisites Not Met:**
- AI compliance review status unclear
- OpenAI API not mentioned in current docs
- Feature flag strategy not documented
- Moderation layer not yet validated

---

### Alternative Sprint 3 Approach

**Recommendation: Focus on Lower-Risk, High-Value Features First**

**Proposed Sprint 3 Scope:**
1. **Epic 9: Reminders System** (5-6 days)
   - Email reminders via Resend
   - SMS reminders via Twilio
   - Builds notification infrastructure
   - Lower risk than AI features
   - High user value (deadline tracking)

2. **Epic 10: Day-in-Court Checklist** (2-3 days)
   - Interactive pre-hearing checklist
   - Case type specific templates
   - LocalStorage persistence (MVP)
   - Low complexity, quick win

3. **Epic 11: User Settings** (1.5-2 days)
   - Settings page scaffold
   - Notification preferences
   - AI opt-in toggle (prep for Epic 12)
   - Foundation for future features

**Total: 9-11 days** (vs. 14 days in original Sprint 3 plan)

**Benefits:**
- More manageable scope (9-11 vs 14 days)
- Lower risk profile (medium vs high risk features)
- Builds infrastructure for future AI features
- Delivers immediate user value
- Maintains quality standards

---

**Proposed Sprint 4: AI-Ready with Proper Foundation**

1. **AI Tech Spike** (1.5 days)
   - Moderation, schema, feature flags
   - Infrastructure tested and validated

2. **Epic 12: AI Intake** (8-9 days)
   - With full compliance review complete
   - Legal disclaimers approved
   - Moderation validated
   - Proper prerequisites met

**Total: 10-11 days** with solid foundation

---

## 6. Proposed Revised Roadmap

### Sprint 2 (Current Week)
- Stories 6.1, 6.2 ✅ Complete
- Stories 6.3, 6.4 🔄 In Progress (3.5 days)
- **Goal:** Complete Case Journey Map (Epic 6)

### Sprint 2.5 or Decision Point
- Epic 7: Inline Glossary (optional, 2-3 days)
- **Decision:** Made after 6.3/6.4 complete based on team velocity and priorities

### Sprint 3 (Revised Proposal)
- Epic 9: Reminders System (5-6 days)
- Epic 10: Day-in-Court Checklist (2-3 days)
- Epic 11: User Settings (1.5-2 days)
- **Total:** 9-11 days
- **Goal:** Build engagement features and notification infrastructure

### Sprint 4 (AI-Ready)
- AI Tech Spike (1.5 days)
- Epic 12: AI Intake (8-9 days)
- **Total:** 10-11 days
- **Goal:** Launch first AI feature with proper compliance foundation

### Future Sprints
- Epic 7: Inline Glossary (if deferred)
- Epic 8: Case Step Details (after clarification)
- Additional case types and jurisdictions
- Advanced features

---

## 7. Alignment Actions Required

### Immediate Actions (This Week)

1. **Review Stories 6.3 & 6.4**
   - ChatGPT team: Review story files for completeness
   - Dev team: Begin implementation
   - Target: 3.5 days to completion

2. **Epic 7 Decision Discussion**
   - Schedule discussion for after 6.3/6.4 complete
   - Review user feedback on Epic 6
   - Make timing decision (include, mini-sprint, or defer)

3. **Sprint 3 Scope Discussion**
   - Review proposed revised Sprint 3 scope
   - Discuss Epic 9 (Reminders) vs Epic 12 (AI) priority
   - Align on sprint goals and timeline

### Short-Term Actions (Next Week)

4. **AI Compliance Review**
   - If proceeding with Epic 12 in Sprint 3: Complete UPL risk assessment
   - If deferring to Sprint 4: Schedule review for next sprint
   - Legal disclaimer copy review and approval

5. **OpenAI API Setup**
   - Configure API access (if not done)
   - Test rate limits and quotas
   - Set up billing alerts

6. **Sprint 3 Planning Session**
   - Finalize Sprint 3 scope based on alignment
   - Create/validate story files for Sprint 3 epics
   - Confirm team capacity and availability

---

## 8. Communication Plan

### To ChatGPT Development Team

**Message Tone:** Appreciative and collaborative

**Key Points to Communicate:**
1. Excellent Sprint 3 planning work - comprehensive and thoughtful
2. Sprint 2 needs completion first (integrity and quality)
3. Propose revised Sprint 3 approach (lower risk, high value)
4. Request collaboration on completing Stories 6.3 & 6.4
5. Open discussion on Sprint 3 priorities

**Format:** Separate response document (`docs/CHATGPT-TEAM-RESPONSE.md`)

---

### To Internal Stakeholders

**Update Format:** Sprint status report

**Key Points:**
- Sprint 2 at 50% completion, on track
- Stories 6.3 & 6.4 ready for implementation (3.5 days)
- Epic sequencing clarity established
- Sprint 3 planning in progress with team alignment focus

---

## 9. Success Criteria

### Alignment Complete When:

- [ ] All stakeholders understand Sprint 2 status and remaining work
- [ ] Epic sequencing guide published and referenced
- [ ] ChatGPT team has clear direction for Stories 6.3 & 6.4
- [ ] Epic 7 decision criteria agreed upon
- [ ] Sprint 3 scope aligned between teams
- [ ] Prerequisites for AI features (if Sprint 3) identified and tracked
- [ ] Team agreement on revised roadmap

### Sprint 2 Complete When:

- [ ] Stories 6.3 & 6.4 delivered with tests passing
- [ ] Zero accessibility violations maintained
- [ ] QA gates passed
- [ ] Case Journey Map fully functional
- [ ] Dashboard progress sync working
- [ ] Sprint review conducted
- [ ] Epic 7 decision made

---

## 10. Risk Mitigation

### Risk: Sprint 2 Takes Longer Than 3.5 Days

**Mitigation:**
- Daily standups to track progress
- Unblock issues immediately
- Adjust scope if needed (defer non-critical tests)
- Clear on what "done" means

---

### Risk: Team Disagrees on Sprint 3 Scope

**Mitigation:**
- Present data-driven reasoning (complexity, risk, dependencies)
- Focus on user value and quality standards
- Be open to compromise
- Document decision rationale

---

### Risk: AI Features Delayed Too Long

**Mitigation:**
- Emphasize this is prioritization, not cancellation
- Sprint 4 (not 6 months away) is appropriate timeline
- Building proper foundation (Epic 9, 11) enables better AI implementation
- Compliance requirements are real and necessary

---

## 11. Open Questions

1. **Epic 7 Timing:** Sprint 2, Sprint 2.5, or defer? (Decision after 6.3/6.4)
2. **Epic 8 Scope:** What does it cover vs. Epic 6? (Needs clarification)
3. **Sprint 3 Priority:** Reminders first or AI first? (Team discussion needed)
4. **AI Compliance:** Who owns the review process? When can it complete?
5. **Resource Availability:** Is the team available for full Sprint 3 scope?

---

## 12. Next Steps

**This Week (Sprint 2 Completion):**
1. ChatGPT team implements Stories 6.3 & 6.4
2. Daily progress updates
3. QA review as stories complete
4. Make Epic 7 decision

**Next Week (Sprint 3 Planning):**
1. Finalize Sprint 3 scope (revised proposal or original)
2. Create/validate story files for Sprint 3 epics
3. Complete prerequisites for chosen sprint scope
4. Kick off Sprint 3 with aligned team

---

## Conclusion

We have strong momentum with Sprint 2 at 50% completion and excellent quality metrics. By completing Sprint 2 properly and making thoughtful decisions about epic sequencing, we set ourselves up for sustained success.

The ChatGPT team's Sprint 3 planning work is valuable and will inform our approach. We're proposing a revised sequence (Reminders → Checklist → Settings → AI) that prioritizes lower-risk, high-value features while building the foundation for AI features to succeed.

**Next Action:** Review and discuss this alignment document with the team, then execute Sprint 2 completion plan.

---

**Document Owner:** Sarah (Product Owner)  
**Status:** Active - Requires Team Review  
**Last Updated:** October 10, 2025  
**Next Update:** After Sprint 2 completion

---

*This document is part of the FairForm project alignment process.*  
*Referenced documents: EPIC-SEQUENCING-GUIDE.md, sprint-2-plan.md, Sprint3_Backlog.md*

