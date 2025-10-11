# Sprint 3 Story Preparation Summary

**Date:** October 11, 2025  
**Prepared By:** Bob (Scrum Master) & Sarah (Product Owner)  
**Sprint:** Sprint 3 - Smart Intake & Prep  
**Epics:** Epic 11 (User Settings) & Epic 12 (AI Intake)

---

## ✅ Sprint 2 Closure Complete

**Completed Stories:**
- ✅ 6.1: Case Journey Visual Timeline
- ✅ 6.2: Step Completion Logic
- ✅ 6.3: Step Detail Modal (Quality Score: 100/100, Gate: PASS)
- ✅ 6.4: Dashboard Progress Sync (Quality Score: 100/100, Gate: PASS)
- ✅ TypeScript errors fixed (lib/ai/schemas.ts, tests/api/ai-intake.test.ts)

**Sprint 2 Metrics:**
- Stories: 4/4 completed (100%)
- Tests: 106/106 passing (100%)
- Quality Gates: 2/2 PASS
- Accessibility Violations: 0
- Technical Debt: 0

**Sprint 2 Retrospective:** `docs/sprint-2-retrospective.md` ✅

---

## 📝 Epic 11: User Settings - All Stories Drafted

### Story 11.1: Settings Page Scaffold
**File:** `docs/stories/11.1.settings-page-scaffold.md`  
**Est. Effort:** 0.5 day  
**Status:** Draft ✅

**Focus:**
- Create `/settings` page with route protection
- Display user email (read-only)
- Add Settings link to navigation
- Placeholder sections for notifications and AI
- Responsive design, WCAG 2.1 AA compliance

**Key Deliverables:**
- `app/settings/page.tsx` (server component with auth)
- `components/settings/SettingsPage.tsx` (client component)
- `components/settings/SettingsCard.tsx` (reusable)
- Navigation integration in AppHeader

**Dependencies:** None (first story in Epic 11)

---

### Story 11.2: Update Profile Preferences
**File:** `docs/stories/11.2.update-profile-preferences.md`  
**Est. Effort:** 0.5 day  
**Status:** Draft ✅

**Focus:**
- Time zone selector (US timezones)
- Email/SMS notification toggles
- Save functionality with Firestore
- Toast notifications for success/error
- Form state management

**Key Deliverables:**
- `lib/hooks/useUserSettings.ts` (React Query hook)
- `lib/db/usersRepo.ts` (repository pattern)
- `lib/constants/timezones.ts` (timezone data)
- Toast integration (Sonner)
- Form controls (Select, Switch, Button)

**Dependencies:** Story 11.1

---

### Story 11.3: Toggle AI Intake Participation
**File:** `docs/stories/11.3.toggle-ai-intake-participation.md`  
**Est. Effort:** 0.5 day  
**Status:** Draft ✅

**Focus:**
- AI participation toggle (opt-in/opt-out)
- Compliance disclaimer and "Learn More" link
- Access control driven by user opt-in
- Intake route protection with checkAIAccess helper
- BETA badge and visual indicators

**Key Deliverables:**
- AI toggle in Settings page
- `lib/auth/check-ai-access.ts` (access control helper)
- Intake route protection
- Disclaimer and compliance link
- Updated Firestore security rules

**Dependencies:** Story 11.2 (uses same save function)

**Critical Integration:** Required for Epic 12 (AI Intake access control)

---

## 📝 Epic 12: AI Intake - All Stories Drafted

### Story 12.1: Free-Text Problem Description
**File:** `docs/stories/12.1.free-text-problem-description.md`  
**Est. Effort:** 1 day  
**Status:** Draft ✅

**Focus:**
- `/intake` page with large textarea
- Character counter (20 char minimum)
- Access control (AI opt-in)
- Loading states and form validation
- Tips accordion and privacy messaging

**Key Deliverables:**
- `app/intake/page.tsx` (server component with access control)
- `components/intake/IntakePage.tsx` (client component)
- Form validation and character counter
- Accessibility (WCAG 2.1 AA)

**Dependencies:** 
- Story 11.3 (checkAIAccess helper)
- AI Spike (moderation infrastructure)

---

### Story 12.2: API Integration & Classification
**File:** `docs/stories/12.2.api-integration-classification.md`  
**Est. Effort:** 1.5 days  
**Status:** Draft ✅

**Focus:**
- Integrate with `/api/ai/intake` endpoint
- Multi-stage loading indicators
- Comprehensive error handling
- Performance monitoring (≤3s target)
- Success navigation to results

**Key Deliverables:**
- `lib/hooks/useAIIntake.ts` (React Query mutation)
- Error mapping and user-friendly messages
- Performance timing and logging
- SessionStorage for navigation
- Retry functionality

**Dependencies:** Story 12.1

**Infrastructure:** Uses existing `/api/ai/intake` from AI Spike

---

### Story 12.3: Display AI Summary & Confirmation
**File:** `docs/stories/12.3.display-ai-summary-confirmation.md`  
**Est. Effort:** 1 day  
**Status:** Draft ✅

**Focus:**
- Results page with classification display
- Case type, jurisdiction, summary cards
- Confidence and risk level visualizations
- Recommended next steps display
- Action buttons (Start Over, Edit, Confirm)

**Key Deliverables:**
- `app/intake/results/page.tsx` (route)
- `components/intake/IntakeResultsPage.tsx` (component)
- Visual indicators (confidence bar, risk colors)
- Low confidence warnings
- AI disclaimers display

**Dependencies:** Story 12.2 (receives classification data)

---

### Story 12.4: Edit & Submit Summary to Firestore
**File:** `docs/stories/12.4.edit-submit-to-firestore.md`  
**Est. Effort:** 1 day  
**Status:** Draft ✅

**Focus:**
- Editable form for AI summary
- Save to Firestore `cases` collection
- AI metadata preservation (confidence, risk, original summary)
- Initial step creation based on case type
- Success flow and dashboard redirect

**Key Deliverables:**
- `app/intake/edit/page.tsx` (route)
- `components/intake/IntakeEditPage.tsx` (component)
- `lib/hooks/useSaveCase.ts` (save hook)
- Updated casesRepo with AI metadata support
- React Hook Form integration
- Initial step generation

**Dependencies:** Story 12.3

**Critical:** Creates case record in Firestore with AI provenance

---

### Story 12.5: Admin Logs & Analytics View
**File:** `docs/stories/12.5.admin-logs-analytics.md`  
**Est. Effort:** 1 day  
**Status:** Draft ✅  
**Priority:** Should-Have (can be deferred)

**Focus:**
- Admin dashboard for AI intake monitoring
- View anonymized classification logs
- Summary statistics (total, avg confidence, block rate)
- Filtering and export capabilities
- Admin role and access control

**Key Deliverables:**
- `app/admin/ai-intake/page.tsx` (admin-only route)
- `components/admin/AdminAIIntakePage.tsx` (component)
- `lib/db/aiIntakeLogsRepo.ts` (repository)
- `lib/auth/require-admin.ts` (admin check)
- Admin role system (isAdmin flag)
- CSV export functionality
- Statistics calculations

**Dependencies:** Story 12.4 (logs created during intake)

**Note:** Can be deferred to Sprint 4 if timeline is tight

---

## 📊 Epic Summary

### Epic 11: User Settings (Must-Have)
**Total Stories:** 3  
**Total Effort:** ~1.5 days  
**Status:** All drafted ✅  
**Sequence:** 11.1 → 11.2 → 11.3

**Critical Path:** Story 11.3 is a dependency for all of Epic 12

---

### Epic 12: AI Intake (Must-Have)
**Total Stories:** 5  
**Total Effort:** ~5.5 days  
**Status:** All drafted ✅  
**Sequence:** 12.1 → 12.2 → 12.3 → 12.4 (→ 12.5 optional)

**MVP Core:** Stories 12.1-12.4 are must-have  
**Optional:** Story 12.5 can be deferred

---

## 🎯 Sprint 3 Recommended Sequence

### Phase 1: Settings Foundation (Days 1-2)
1. **Story 11.1** - Settings scaffold (0.5 day)
2. **Story 11.2** - Profile preferences (0.5 day)
3. **Story 11.3** - AI participation toggle (0.5 day)

**Milestone:** User can enable AI features ✓

---

### Phase 2: AI Intake Core (Days 3-7)
4. **Story 12.1** - Text input UI (1 day)
5. **Story 12.2** - API integration (1.5 days)
6. **Story 12.3** - Results display (1 day)
7. **Story 12.4** - Edit & save (1 day)

**Milestone:** AI Intake end-to-end functional ✓

---

### Phase 3: Admin & QA (Days 8-9)
8. **Story 12.5** - Admin analytics (1 day) - OPTIONAL
9. **QA Review** - All stories (0.5 day)
10. **Integration Testing** - End-to-end flows (0.5 day)

**Milestone:** Sprint complete, demo-ready ✓

---

## 📋 Story Quality Checklist

All 8 stories include:
- ✅ Clear user story format (As a... I want... So that...)
- ✅ Detailed acceptance criteria (6-10 ACs each)
- ✅ Comprehensive task breakdowns with subtasks
- ✅ Dev Notes with:
  - Previous story insights
  - Architecture references
  - Code examples and patterns
  - TypeScript interfaces
  - Testing strategies
  - Accessibility requirements
  - Integration points
  - Out-of-scope items
- ✅ Technical constraints documented
- ✅ File locations specified
- ✅ Testing section with strategy

---

## 🔗 Dependencies & Integration Map

```
Epic 11 (Settings)
├─ 11.1 (Settings Scaffold)
│  └─ 11.2 (Preferences)
│     └─ 11.3 (AI Toggle) ──────┐
│                                │
Epic 12 (AI Intake)              │ Depends on
├─ 12.1 (Text Input) ←───────────┘
│  └─ 12.2 (API Integration)
│     └─ 12.3 (Results Display)
│        └─ 12.4 (Edit & Save)
│           └─ 12.5 (Admin Analytics)
```

**Critical Path:** 11.1 → 11.2 → 11.3 → 12.1 → 12.2 → 12.3 → 12.4

---

## 🚀 Ready to Begin Development

### Option 1: Sequential Development (Recommended)
Start with Story 11.1 and proceed in order:
```bash
"As dev, implement story 11.1"
```

### Option 2: Parallel Work (If Multiple Devs)
- Dev 1: Epic 11 (Stories 11.1-11.3)
- Dev 2: Epic 10 (Checklist - stories not yet drafted)
- Then merge and proceed to Epic 12 together

### Option 3: Review Stories First
Have PO validate all stories before development:
```bash
"As po, review Epic 11 and Epic 12 stories"
```

---

## 📦 Technical Prerequisites

**Already Available:**
- ✅ AI Spike infrastructure (API, schemas, moderation, prompts)
- ✅ Firestore collections (users, cases, caseSteps)
- ✅ Authentication system
- ✅ shadcn/ui components
- ✅ React Query
- ✅ Toast notifications (Sonner)

**Need to Install:**
- `react-hook-form` (Story 12.4)
- `@hookform/resolvers/zod` (Story 12.4)

**Need to Configure:**
- Admin role system (Story 12.5)
- Updated Firestore security rules (Stories 11.2, 11.3, 12.5)

---

## 🎯 Sprint 3 Success Criteria

### Must-Have for Sprint 3 Close:
1. ✅ Epic 11 complete (all 3 stories)
2. ✅ Epic 12 core complete (stories 12.1-12.4)
3. ✅ All tests passing (≥85% coverage)
4. ✅ Zero accessibility violations
5. ✅ Feature flag functional
6. ✅ Compliance disclaimers visible
7. ✅ Demo-ready

### Nice-to-Have:
- Story 12.5 (Admin analytics) - can defer to Sprint 4
- Epic 10 (Checklist) - depends on capacity

---

## 📋 Next Actions

**Immediate:**
1. Review drafted stories (optional but recommended)
2. Begin Story 11.1 development
3. Install required dependencies when needed

**This Week:**
- Complete Epic 11 (3 stories, ~1.5 days)
- Start Epic 12 (Stories 12.1-12.2)

**Next Week:**
- Complete Epic 12 core (Stories 12.3-12.4)
- QA review all stories
- Sprint 3 demo preparation

---

## 📁 All Drafted Stories

### Epic 11: User Settings
1. ✅ `docs/stories/11.1.settings-page-scaffold.md`
2. ✅ `docs/stories/11.2.update-profile-preferences.md`
3. ✅ `docs/stories/11.3.toggle-ai-intake-participation.md`

### Epic 12: AI Intake
1. ✅ `docs/stories/12.1.free-text-problem-description.md`
2. ✅ `docs/stories/12.2.api-integration-classification.md`
3. ✅ `docs/stories/12.3.display-ai-summary-confirmation.md`
4. ✅ `docs/stories/12.4.edit-submit-to-firestore.md`
5. ✅ `docs/stories/12.5.admin-logs-analytics.md`

**Total:** 8 comprehensive stories ready for development

---

## 🎉 Sprint 3 is Ready to Launch!

**Status:** ✅ ALL STORIES DRAFTED  
**Quality:** High - comprehensive Dev Notes, clear ACs, detailed tasks  
**Readiness:** Ready for immediate development

---

**What would you like to do next?**

**A) Start Development**
```
"As dev, implement story 11.1"
```

**B) Review Stories (PO Validation)**
```
"As po, review Epic 11 stories"
```

**C) Draft Epic 10 Stories (Checklist)**
```
"As sm, draft Epic 10 stories"
```

**D) Something Else**
