# Sprint 3 Master Plan - UPDATED

**Sprint:** Sprint 3  
**Duration:** ~12-14 days  
**Sprint Goal:** Complete Case Detail V2, deliver AI Copilot foundation for demo readiness  
**Owner:** Sarah (Product Owner)  
**Date:** January 13, 2025 (Updated from October 10, 2025)

**⚠️ STATUS UPDATE:** This plan has been updated to reflect Epic 13 (AI Copilot) as the primary demo priority, with Epic 10 and 11 as supporting features.

---

## 🎯 Sprint 3 Vision - UPDATED

Transform FairForm into an AI-augmented justice platform by:
1. Completing the case detail experience with progress tracking and actionable guidance
2. **Delivering AI Copilot foundation for impressive demos**
3. Establishing context-aware conversational AI capabilities

**Strategic Focus:** Demo-ready AI features that showcase FairForm's potential as an intelligent legal guidance platform.

---

## 📋 Epic Sequence & Dependencies

### Critical Path (Must Complete in Order) - UPDATED

```
Sprint 2 Completion (Prerequisites) ✅
  ↓
Epic 6 Complete (6.3, 6.4) ✅
  ↓
Epic 6.5: Case Detail V2 Enhancement (2-3 days remaining) ← CURRENT
  ↓
Epic 13: AI Copilot Foundation (3 weeks) ← DEMO PRIORITY
  ↓
Epic 10: Day-in-Court Checklist (parallel) ← Supporting feature
Epic 11: User Settings (parallel) ← Supporting feature
Epic 8: Case Journey Polish (parallel) ← Maintenance work
```

---

## 🚀 Epic 6.5: Case Detail V2 Enhancement

**Status:** 📋 Ready (First Priority)  
**Duration:** 4-5 days  
**Owner:** Dev (James)

### Stories
1. **6.5.1:** Data Model & Status Adapter (1 day)
2. **6.5.2:** Case Type Templates & Journey Generation (1.5 days)
3. **6.5.3:** Next Steps Generator & Panel (1 day)
4. **6.5.4:** Two-Column Layout & Progress Overview (1.5 days)

### Deliverables
- ✅ Enhanced case data model with case type support
- ✅ Template registry with Small Claims implementation
- ✅ Rule-based next steps generation
- ✅ Two-column dashboard layout with progress overview
- ✅ Status adapter for enum-based step mapping

### Strategic Value
- **Enables Epic 13:** Provides case type system needed for AI context
- **Enables Epic 10:** Provides case type templates for checklists
- **Completes Case Journey:** Finishes the "Legal GPS" feature family

### Dependencies
- **Prerequisite:** Epic 6 complete (Stories 6.3 & 6.4) ✅
- **Blocks:** Epic 13 (AI Copilot needs case type system)

---

## 🤖 Epic 13: AI Copilot & Dynamic Intake Experience - NEW PRIORITY

**Status:** 📋 Ready (Primary Demo Priority)  
**Duration:** 3 weeks  
**Owner:** Dev (James)

### Stories (13 stories total)
1. **13.1:** AI Sessions Repository (1 day) ✅ Validated
2. **13.2:** Chat API with SSE Streaming (1 day)
3. **13.3:** Context Builder & Fingerprinting (1 day)
4. **13.4:** Demo Firebase Project Setup (0.5 day)
5. **13.5:** Chat Widget UI Component (1 day)
6. **13.6:** Chat Panel Component (1 day)
7. **13.7:** useAICopilot Hook (1 day)
8. **13.8:** Conversation Summarization (1 day)
9. **13.9:** Message Pagination API (0.5 day)
10. **13.10:** Context Snapshot System (1 day)
11. **13.11:** Glossary Integration (0.5 day)
12. **13.12:** Session Lifecycle Management (0.5 day)
13. **13.13:** Context Fingerprint Caching (0.5 day)

### Deliverables
- ✅ Persistent AI chat accessible anywhere in app
- ✅ Context-aware responses based on case data
- ✅ SSE streaming for real-time responses
- ✅ Demo Firebase project for sandbox isolation
- ✅ Conversation history and summarization
- ✅ Session lifecycle management
- ✅ Performance optimization and caching

### Strategic Value - DEMO PRIORITY
- **Demo Impact:** Removes all gating, instant AI access
- **User Experience:** Context-aware conversational assistance
- **Platform Vision:** Positions FairForm as AI-augmented justice platform
- **Stakeholder Appeal:** Impressive showcase of AI capabilities

### Dependencies
- **Prerequisite:** Epic 6.5 complete (case type system needed for AI context)
- **Architecture:** Uses unified architecture specification (validated)

### Demo Readiness Criteria
- ✅ Conversational case creation working
- ✅ Context-aware responses accurate
- ✅ Accessible anywhere in app
- ✅ No login/form gates for demo
- ✅ Zero compliance issues

---

## 🧾 Epic 10: Day-in-Court Checklist

**Status:** 📋 Ready  
**Duration:** 4.25 days  
**Owner:** Dev (James)

### Stories
1. **10.1:** Checklist Page Scaffold & Routing (0.5 day)
2. **10.2:** Checklist Templates & Components (1 day)
3. **10.3:** LocalStorage Persistence & Progress (1 day)
4. **10.4:** Reset Functionality & Analytics (0.75 day)
5. **10.5:** Polish, Accessibility Audit & QA (1 day)

### Deliverables
- ✅ Small Claims checklist with 20+ actionable items
- ✅ LocalStorage persistence (no backend required)
- ✅ Progress tracking with visual feedback
- ✅ Reset functionality with confirmation
- ✅ PostHog analytics integration
- ✅ WCAG 2.1 AA compliance

### Strategic Value
- **User Confidence:** Reduces court preparation anxiety
- **Engagement:** Encourages return visits pre-hearing
- **Foundation:** Base for future coaching features
- **No Backend Cost:** localStorage-only architecture

### Dependencies
- **Prerequisite:** Epic 6.5 complete (needs case type templates)
- **Integration:** Links from Dashboard and Case Journey Map

---

## ⚙️ Epic 11: User Settings

**Status:** 📋 Ready (Prerequisite for Epic 12)  
**Duration:** 1.5 days  
**Owner:** Dev (James)

### Stories (from existing documentation)
1. **11.1:** Settings Page Scaffold (0.5 day)
2. **11.2:** Update Profile Preferences (0.5 day)
3. **11.3:** Toggle AI Intake Participation (0.5 day) ← **CRITICAL for Epic 12**

### Deliverables
- ✅ Settings page with profile updates
- ✅ User preference management
- ✅ **AI opt-in toggle** (required for Epic 12 compliance)

### Strategic Value
- **Compliance:** Required for AI feature consent
- **User Control:** Empowers users to manage preferences
- **Foundation:** Enables future notification and reminder settings

### Dependencies
- **Prerequisite:** None (can start after Epic 10)
- **Blocks:** Epic 12 (AI Intake requires opt-in)

---

## 🔧 Epic 8: Case Journey Polish & Integration Bridges

**Status:** 📋 Ready (Maintenance Work)  
**Duration:** 2-3 days  
**Owner:** Dev (James) / QA (Quinn)

### Stories
1. **8.1:** Regression QA & Accessibility Audit (3 pts)
2. **8.2:** Reminder Hook Scaffold (4 pts)
3. **8.3:** AI Context Bridge (3 pts)
4. **8.4:** Mobile Modal Polish (2 pts)
5. **8.5:** Documentation & Handoff (1 pt)

### Deliverables
- ✅ Comprehensive QA audit of Epic 6 + 6.5
- ✅ Integration hooks for Epic 9 (Reminders)
- ✅ Integration hooks for Epic 12 (AI Intake)
- ✅ Mobile UX polish
- ✅ Complete handoff documentation

### Strategic Value
- **Quality Assurance:** Ensures Epic 6 + 6.5 stability
- **Integration Prep:** Prepares for Epic 9 and 12
- **Mobile Polish:** Enhances mobile user experience

### Dependencies
- **Prerequisite:** Epic 6.5 complete
- **Can Run Parallel:** With Epic 11 to save time

---

## 📊 Sprint 3 Timeline

### Week 1 (Days 1-5)
- **Days 1-2:** Epic 6.5 Stories 6.5.1 & 6.5.2
- **Days 3-5:** Epic 6.5 Stories 6.5.3 & 6.5.4
- **Day 5:** Epic 6.5 QA Review

### Week 2 (Days 6-10)
- **Days 6-7:** Epic 10 Stories 10.1, 10.2, 10.3
- **Days 8-9:** Epic 10 Stories 10.4 & 10.5
- **Day 9:** Epic 10 QA Review
- **Day 10:** Epic 11 Story 11.1 & 11.2

### Week 3 (Days 11-14)
- **Day 11:** Epic 11 Story 11.3 + QA Review
- **Days 12-14:** Epic 8 (Stories 8.1-8.5) - Can start in parallel
- **Day 14:** Sprint 3 Demo & Retrospective

**Total Sprint Duration:** 12-14 days

---

## ✅ Sprint 3 Success Criteria

### Must-Have (P0)
- [ ] Epic 6.5 complete with all 4 stories
- [ ] Epic 10 complete with all 5 stories
- [ ] Epic 11 complete with all 3 stories (especially 11.3 AI opt-in)
- [ ] All epics pass QA review
- [ ] Zero critical bugs
- [ ] WCAG 2.1 AA compliance maintained

### Should-Have (P1)
- [ ] Epic 8 complete with all 5 stories
- [ ] Performance targets met (Lighthouse ≥95)
- [ ] Analytics events firing correctly
- [ ] Documentation complete

### Nice-to-Have (P2)
- [ ] Epic 7 (Inline Glossary) scoped for Sprint 4
- [ ] Sprint 4 planning complete
- [ ] User feedback collected on new features

---

## 🎯 Sprint 3 Deliverables by Feature

### For Users
1. **Enhanced Case Dashboard:**
   - Progress overview with percentage
   - Two-column layout with journey + next steps
   - Actionable guidance based on case type

2. **Day-in-Court Checklist:**
   - Comprehensive preparation checklist
   - Progress tracking that persists
   - Mobile-optimized interface

3. **User Settings:**
   - Profile management
   - AI feature opt-in control
   - Preference management

### For Developers
1. **Case Type System:**
   - Template registry for multiple case types
   - Journey generation framework
   - Next steps generation system

2. **Integration Hooks:**
   - Reminder system scaffold
   - AI context bridge
   - Analytics events

3. **Quality Standards:**
   - Comprehensive test coverage
   - Accessibility compliance
   - Performance benchmarks

---

## 📈 Sprint 3 Metrics & Targets

### Development Metrics
| Metric | Target |
|--------|--------|
| Story Points Completed | ~35-40 points |
| Test Coverage | ≥80% |
| Accessibility Violations | 0 |
| Performance (Lighthouse Mobile) | ≥95 |
| Critical Bugs | 0 |
| High Priority Bugs | ≤2 |

### User Experience Metrics
| Metric | Target |
|--------|--------|
| Page Load Time (3G) | ≤1.5s |
| Time to Interactive | ≤3.8s |
| Checklist Completion Rate | ≥70% |
| User Confidence Rating | ≥85% |

### Quality Gates
| Epic | Gate Status | QA Approval |
|------|-------------|-------------|
| Epic 6.5 | TBD | Quinn |
| Epic 10 | TBD | Quinn |
| Epic 11 | TBD | Quinn |
| Epic 8 | TBD | Quinn |

---

## 🚧 Known Risks & Mitigation

### Risk 1: Epic 6.5 Template Content
**Risk:** Small Claims template content may need refinement  
**Mitigation:** Use existing case journey steps as baseline  
**Impact:** Low - content can be refined post-sprint  

### Risk 2: LocalStorage Quota Limits
**Risk:** Users may hit localStorage limits  
**Mitigation:** Graceful error handling, clear user messaging  
**Impact:** Low - unlikely with current data size  

### Risk 3: Sprint Scope Too Large
**Risk:** 4 epics may be ambitious for Sprint 3  
**Mitigation:** Epic 8 can slip to Sprint 4 without blocking  
**Impact:** Medium - Epic 8 is pure polish/maintenance  

### Risk 4: AI Opt-In Compliance
**Risk:** Epic 11.3 AI opt-in may need legal review  
**Mitigation:** Use standard consent language, get early feedback  
**Impact:** Medium - could delay Epic 12 if not approved  

---

## 🔄 Handoff to Sprint 4

### Prerequisites for Epic 12 (AI Intake)
- ✅ Epic 11 complete (AI opt-in toggle)
- ✅ Epic 6.5 complete (case type classification)
- ✅ Epic 8.3 complete (AI context bridge)
- ⚠️ Legal disclaimer approved
- ⚠️ OpenAI API access configured
- ⚠️ Moderation layer tested

### Sprint 4 Candidates
1. **Epic 12:** AI Intake (if compliance ready)
2. **Epic 9:** Reminders System (depends on Epic 11)
3. **Epic 7:** Inline Glossary (polish feature)
4. **Additional Case Types:** Employment, Housing templates

---

## 📝 Sprint 3 Ceremonies

### Sprint Planning (Day 0)
- Review Epic Sequencing Guide
- Confirm story acceptance criteria
- Assign stories to Dev (James)
- Set up tracking in project board

### Daily Standups
- Progress on current epic
- Blockers or questions
- QA coordination needs

### Mid-Sprint Check-in (Day 7)
- Review Epic 6.5 completion
- Adjust Epic 10 timeline if needed
- Confirm Epic 11 readiness

### Sprint Review (Day 14)
- Demo all completed features
- Gather stakeholder feedback
- Document lessons learned

### Sprint Retrospective (Day 14)
- What went well
- What needs improvement
- Action items for Sprint 4

---

## 🎉 Sprint 3 Success Vision

**By the end of Sprint 3, users will:**
- See their case progress at a glance with clear next steps
- Prepare confidently for court with comprehensive checklists
- Control their AI feature participation through settings
- Experience a polished, accessible mobile-first interface

**By the end of Sprint 3, developers will have:**
- A robust case type system for future expansion
- Integration hooks ready for AI and reminders
- Comprehensive test coverage and documentation
- Performance and accessibility benchmarks met

---

**Document Status:** Active Sprint Plan  
**Owner:** Sarah (Product Owner)  
**Last Updated:** October 10, 2025  
**Next Review:** After Epic 6.5 completion (mid-sprint)

---

*This Sprint 3 Master Plan supersedes conflicting information in:*
- *docs/Sprint3_Backlog.md*
- *docs/sprint-3-epic-11-12-story-summary.md*
- *docs/Sprint3_Integration_Summary (1).md*

