# FairForm Epic Sequencing Guide

**Owner:** Sarah (Product Owner)  
**Version:** 1.0  
**Date:** October 10, 2025  
**Purpose:** Establish clear epic sequencing and status for FairForm development

---

## Overview

This document provides the definitive reference for epic status, sequencing, and prioritization across the FairForm project. It ensures all team members understand what's complete, what's in progress, and what's coming next.

---

## Epic Status Definitions

| Status | Meaning |
|--------|---------|
| ✅ **Complete** | All stories delivered, tested, and QA approved |
| 🔄 **In Progress** | Active development, some stories complete |
| 📋 **Ready** | PRD complete, ready for sprint planning |
| 📝 **Draft** | PRD in progress or under review |
| 🤔 **Pending** | Awaiting prioritization decision |
| ⏸️ **Deferred** | Intentionally postponed to future phase |

---

## Completed Epics (Sprint 1-2)

### Epic 1: Authentication System ✅
**Status:** Complete  
**Sprint:** Sprint 1  
**Stories:** 1.1 Authentication Foundations  
**QA Gate:** PASSED

**Deliverables:**
- Firebase Authentication integration
- Login, signup, password reset flows
- Protected route middleware
- Session management

**Value Delivered:** Users can create accounts and securely access FairForm

---

### Epic 2: Dashboard Foundations ✅
**Status:** Complete  
**Sprint:** Sprint 1  
**Stories:** 2.1 Case Dashboard Foundations  
**QA Gate:** PASSED

**Deliverables:**
- Dashboard page with case list
- Case card component
- "Create New Case" functionality
- Navigation structure

**Value Delivered:** Users have a central place to view and manage their cases

---

### Epic 3: Design System Foundations ✅
**Status:** Complete  
**Sprint:** Sprint 1  
**Stories:** 3.1 Design System Foundations  
**QA Gate:** PASSED

**Deliverables:**
- shadcn/ui component library integration
- Typography and color system
- Responsive layout patterns
- Accessibility baseline (WCAG 2.1 AA)

**Value Delivered:** Consistent, accessible UI foundation for all features

---

### Epic 4: Database and API Layer ✅
**Status:** Complete  
**Sprint:** Sprint 1  
**Stories:** 4.1 Database and API Layer  
**QA Gate:** PASSED (with comprehensive assessments)

**Deliverables:**
- Firestore collections: users, cases, caseSteps
- Repository pattern: casesRepo, stepsRepo, remindersRepo
- API routes: /api/cases, /api/steps
- TypeScript validation schemas (Zod)

**Value Delivered:** Robust data layer with proper separation of concerns

---

### Epic 5: Authenticated Layout & Navigation ✅
**Status:** Complete  
**Sprint:** Sprint 1  
**Stories:** 5.1 Authenticated Layout Navigation  
**QA Gate:** PASSED

**Deliverables:**
- AppHeader with navigation
- AppFooter with disclaimers
- Protected route wrapper
- Responsive navigation (mobile + desktop)

**Value Delivered:** Consistent navigation and legal compliance across the app

---

### Epic 6: Case Journey Map ✅
**Status:** Complete  
**Sprint:** Sprint 2  
**Stories:**
- 6.1 Case Journey Visual Timeline ✅ (Complete)
- 6.2 Step Completion Logic ✅ (Complete)
- 6.3 Step Detail Modal ✅ (Complete)
- 6.4 Dashboard Progress Sync ✅ (Complete)

**Deliverables (Completed):**
- Visual timeline component with step states
- Step completion button with optimistic updates
- React Query integration with cache management
- 100% test coverage, zero accessibility violations

**Remaining Work:**
- Modal for step details with hardcoded instructions (Story 6.3)
- Dashboard progress bar and percentage calculation (Story 6.4)

**Value Delivered (when complete):** Users can see where they are in their case, what's next, and track their progress - the core "Legal GPS" feature

**Estimated Completion:** 3.5 days (per Sprint 2 plan)

---

### Epic 6.5: Case Detail V2 Enhancement 🔄
**Status:** In Progress  
**Sprint:** Sprint 3 (Current Priority)  
**Stories:**
- 6.5.1 Data Model & Status Adapter Foundation 🔄 (In progress)
- 6.5.2 Case Type Templates & Journey Generation 📋 (Ready for dev)
- 6.5.3 Next Steps Generator & Panel 📋 (Ready for dev)
- 6.5.4 Two-Column Layout & Progress Overview 📋 (Ready for dev)

**Dependencies:** Epic 6 complete (Stories 6.3 & 6.4) ✅

**Deliverables:**
- Enhanced case data model with case type support
- Case type template registry with Small Claims implementation
- Rule-based next steps generation system
- Two-column dashboard layout with progress overview
- Status adapter for enum-based step status mapping

**Value Delivered:** Comprehensive case dashboard with progress tracking, actionable next steps, and case-type-specific guidance - foundation for AI Intake integration

**Estimated Duration:** 4-5 days

**Strategic Importance:** Enables Epic 10 (Day-in-Court Checklist) and Epic 12 (AI Intake) development by providing case type classification and template system

---

## Pending Epic Resolution

### Epic 7: Inline Glossary 🤔
**Status:** Pending Prioritization Decision  
**Sprint:** TBD  
**PRD:** Complete (`docs/prd/epic-7-inline-glossary.md`)

**Proposed Deliverables:**
- Tooltip component for legal term definitions
- Firestore glossary collection
- Auto-linking logic for terms in step instructions
- Mobile-friendly modal fallback
- WCAG 2.1 AA accessibility compliance

**Value Proposition:** Clarifies legal jargon for users without leaving the page

**Decision Required:** 
- **Option 1:** Include in Sprint 2 (extends sprint by 2-3 days)
- **Option 2:** Create Sprint 2.5 mini-sprint for Epic 7 only
- **Option 3:** Defer to Sprint 3 or later

**Recommendation:** Evaluate after Stories 6.3 & 6.4 complete. Epic 7 has high user value but Epic 6 completion is priority.

**Dependencies:** Epic 6 complete (glossary integrates with step instructions)

---

### Epic 8: Case Journey Polish & Integration Bridges 📋
**Status:** Ready (Post-Epic 6.5 Maintenance)  
**Sprint:** Sprint 3 or 4 (After Epic 6.5)  
**PRD:** Complete (`docs/prd/epic-8-case-step-details.md`)

**Scope Clarified:** Epic 8 is pure maintenance and polish work for Case Journey Map
- **Story 8.1:** Regression QA & accessibility audit (3 pts)
- **Story 8.2:** Reminder hook scaffold for Epic 9 (4 pts)
- **Story 8.3:** AI context bridge for Epic 12 (3 pts)
- **Story 8.4:** Mobile modal polish & gestures (2 pts)
- **Story 8.5:** Documentation & handoff (1 pt)

**Dependencies:** Epic 6 complete AND Epic 6.5 complete

**Value Delivered:** Quality assurance, mobile polish, and integration preparation for Epic 9 and Epic 12

**Estimated Effort:** 13 points (~2-3 days)

**Strategic Position:** Post-Epic 6.5 maintenance that can run parallel with Epic 10 or Epic 11

---

## Future Epics (Sprint 3+)

### Epic 9: Reminders System 📝
**Status:** Draft/Planning  
**Sprint:** Sprint 3 (Proposed)  
**PRD:** Mentioned in Sprint 3 backlog

**Proposed Scope:**
- Email reminders via Resend
- SMS reminders via Twilio
- Reminder scheduling based on due dates
- User notification preferences
- Reminder history/logs

**Dependencies:**
- User settings for notification preferences (Epic 11)
- Case step due dates (Epic 6)

**Value Proposition:** Helps users stay on track with court deadlines

**Complexity:** Medium - requires external API integration but lower risk than AI features

**Recommendation:** Strong candidate for Sprint 3 - high value, manageable complexity

---

### Epic 10: Day-in-Court Checklist 📋
**Status:** Ready  
**Sprint:** Sprint 3 (Proposed)  
**PRD:** Referenced in Sprint 3 backlog

**Proposed Scope:**
- Interactive pre-hearing checklist
- Case type specific templates (Small Claims, Eviction)
- Local storage for progress (MVP)
- Link from case dashboard

**Dependencies:** Case type classification (from Epic 6 or AI Intake)

**Value Proposition:** Prepares users for their court appearance with confidence

**Complexity:** Low - primarily frontend, localStorage persistence

**Recommendation:** Good fit for Sprint 3 - quick win, high user value

---

### Epic 11: User Settings 📋
**Status:** Ready  
**Sprint:** Sprint 3 (Proposed)  
**PRD:** Referenced in Sprint 3 backlog

**Proposed Scope:**
- Settings page scaffold
- Profile updates (time zone, contact preferences)
- Notification preferences
- AI feature opt-in toggle (prerequisite for Epic 12)

**Dependencies:** None (foundation feature)

**Value Proposition:** User control over app experience and preferences

**Complexity:** Low-Medium - standard CRUD operations

**Recommendation:** Must-have for Sprint 3 if Epic 12 is included (AI opt-in required)

---

### Epic 13: AI Copilot & Dynamic Intake Experience 📋
**Status:** Ready (Demo Priority)  
**Sprint:** Sprint 3 (Primary Priority)  
**PRD:** Complete (`docs/prd/epic-13-ai-copilot.md`)  
**Architecture:** Unified specification validated (`docs/epic-13-unified-architecture-specification.md`)

### Epic 12: AI Intake (Smart Intake) 📝
**Status:** Superseded by Epic 13  
**Sprint:** Deferred  
**PRD:** Complete (`docs/prd/epic-12-ai-intake.md`)  
**Tech Spike:** AI Intake Tech Spike (`docs/AI_Intake_Tech_Spike.md`)

**Proposed Scope:**
- AI-assisted case type classification
- Plain-language problem description
- Follow-up Q&A for context
- User confirmation before saving
- Moderation layer for safety
- Anonymized logging for compliance

**Prerequisites (CRITICAL):**
- [ ] Epic 11 complete (AI opt-in toggle required)
- [ ] AI compliance review completed
- [ ] UPL (Unauthorized Practice of Law) risk assessment done
- [ ] OpenAI API access configured and tested
- [ ] Feature flag strategy confirmed
- [ ] Legal disclaimer copy approved
- [ ] Moderation layer tested and validated

**Value Proposition:** Simplifies case creation with intelligent guidance

**Complexity:** High - first AI feature, significant compliance requirements

**Recommendation:** Consider deferring to Sprint 4 to allow proper compliance review and Sprint 3 focus on lower-risk features (Epic 9, 10, 11)

---

## Epic Sequencing Principles

### 1. Complete Before Starting Next
- Finish all stories in current epic before moving to next
- "In Progress" means active development, not just started
- Don't split team across multiple epics unnecessarily

### 2. Foundation Before Features
- Infrastructure (auth, data layer, design system) before user features
- User features (journey map, glossary) before AI features
- Settings and preferences before features that require them

### 3. Risk-Based Sequencing
- **Low Risk** (UI features, forms): Can implement quickly
- **Medium Risk** (integrations, notifications): Require external dependencies
- **High Risk** (AI features, legal advice): Require compliance review and careful rollout

### 4. User Value Increments
- Each epic should deliver tangible user value
- Prioritize features that complete user journeys
- Consider feature flags for experimental features

### 5. Maintain Quality Gates
- All stories must pass QA before epic marked complete
- Test coverage targets: ≥80% repositories, ≥75% components
- Accessibility: Zero WCAG 2.1 AA violations
- TypeScript: Strict mode, zero errors

---

## Recommended Epic Sequence

### Phase 1: MVP Foundation (Complete)
1. ✅ Epic 1: Authentication
2. ✅ Epic 2: Dashboard
3. ✅ Epic 3: Design System
4. ✅ Epic 4: Database/API
5. ✅ Epic 5: Layout/Navigation

### Phase 2: Core User Features (Current)
6. 🔄 Epic 6: Case Journey Map (in progress, 50% done)
6.5. 📋 Epic 6.5: Case Detail V2 Enhancement (ready for Sprint 3)
7. 🤔 Epic 7: Inline Glossary (decision pending)

### Phase 3: Engagement & Preparation (Sprint 3)
8. Epic 6.5: Case Detail V2 Enhancement (4-5 days) - PRIORITY
9. Epic 10: Day-in-Court Checklist (4.25 days)
10. Epic 11: User Settings (1.5 days)
11. Epic 8: Case Journey Polish & Integration Bridges (2-3 days) - Can run parallel

### Phase 4: AI Features (Sprint 4+)
12. AI Tech Spike (infrastructure)
13. Epic 12: AI Intake (with full compliance review)
14. Epic 9: Reminders System (after Epic 11 settings)
- Additional case types and jurisdictions
- Advanced AI features (conversational help, document analysis)
- Admin tools and analytics

---

## Decision Points & Dependencies

### Current Decision: Epic 6.5 Priority
**Question:** Should Epic 6.5 be the first priority in Sprint 3?

**Impact Analysis:**
- **Epic 6.5 First:** Enables Epic 10 and Epic 12 development, completes Case Journey Map feature family
- **Epic 6.5 Later:** Delays case type classification and template system needed for other epics

**Dependencies:** Epic 6 complete (Stories 6.3 & 6.4)

**Recommendation:** Epic 6.5 should be Sprint 3's first priority because:
- Provides foundation for Epic 10 (Day-in-Court Checklist) case type templates
- Enables Epic 12 (AI Intake) case type classification
- Completes the Case Journey Map feature family
- Low risk, high value incremental enhancement

---

### Next Decision: Epic 7 Timing
**Question:** When should we implement the Inline Glossary?

**Impact Analysis:**
- **Include in Sprint 3:** After Epic 6.5 completion
- **Sprint 3.5 Mini-Sprint:** Separate 2-3 day sprint, clean boundaries
- **Defer to Sprint 4+:** Focus Sprint 3 on reminders/settings/checklist first

**Dependencies:** Epic 6.5 complete (glossary integrates with step instructions)

**Recommendation:** Make decision after Epic 6.5 completion, based on:
- Team capacity and velocity
- User feedback on Epic 6.5 (do they need glossary immediately?)
- Sprint 3 scope and priorities

---

### Upcoming Decision: Epic 12 Timing
**Question:** Should AI Intake be in Sprint 3 or deferred to Sprint 4?

**Risk Factors:**
- Complexity jump from UI features to AI features
- Compliance requirements (UPL, disclaimers, moderation)
- OpenAI API dependency and costs
- Feature flag strategy needed

**Alternative for Sprint 3:**
- Focus on Epic 9 (Reminders), Epic 10 (Checklist), Epic 11 (Settings)
- Build notification infrastructure (needed for AI features later)
- Less compliance risk, more predictable delivery

**Dependencies for Epic 12:**
- Must have Epic 11 complete (AI opt-in)
- Must complete compliance review
- Must have legal disclaimer approved

**Recommendation:** Defer Epic 12 to Sprint 4, focus Sprint 3 on lower-risk, high-value features

---

## Epic Health Metrics

### Completed Epics Performance
- **Average Stories per Epic:** 1-2 stories
- **QA Pass Rate:** 100% (all epics passed QA gates)
- **Test Coverage:** Exceeds targets (≥80% repositories, ≥75% components)
- **Accessibility:** Zero violations across all completed epics
- **Sprint Velocity:** Completing epics on schedule

### Current Epic (Epic 6) Health
- **Progress:** 50% complete (2 of 4 stories done)
- **Test Results:** 100% pass rate (59/59 tests)
- **Accessibility:** Zero violations
- **Quality:** Strong code quality, proper patterns followed
- **Timeline:** On track for completion in 3.5 days

---

## Communication & Updates

### When to Update This Guide
- Epic status changes (in progress → complete)
- New epics added to roadmap
- Epic sequencing decisions made
- Dependencies identified or resolved

### How to Reference Epics
- **By Number:** "Epic 6" (standard reference)
- **By Name:** "Case Journey Map" (descriptive)
- **By Status:** "In Progress" epics (for status reports)

### Stakeholder Communication
- Use this guide as source of truth for epic status
- Link to specific epics when discussing features
- Reference sequencing principles when proposing changes

---

## Questions or Concerns?

**Epic Sequencing Issues:**
Contact Sarah (Product Owner) for prioritization decisions

**Technical Dependencies:**
Contact Dev Lead for implementation questions

**Scope Clarifications:**
Reference epic PRDs in `docs/prd/epic-{n}-*.md`

---

**Document Status:** Active  
**Last Updated:** October 10, 2025  
**Next Review:** After Epic 6 completion (Sprint 2 end)

---

*This guide maintained by: Sarah (Product Owner)*  
*Part of the FairForm project documentation ecosystem*

