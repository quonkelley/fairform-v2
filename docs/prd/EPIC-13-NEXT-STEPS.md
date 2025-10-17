# Epic 13: AI Copilot - Implementation Roadmap

**Last Updated:** 2025-10-17
**Status:** Phase 2 Complete, Phase 3 & 4 Remaining
**Current Focus:** Bug Fixes → Phase 3 Enhanced Experience

---

## 🎯 Current State Summary

### ✅ Completed Work

**Phase 1: Foundation (Stories 13.1-13.7)** - Week 1 ✅
- AI sessions repository
- Chat API with SSE streaming
- Context builder with fingerprinting
- Demo Firebase project setup
- Chat widget and panel UI components
- useAICopilot hook

**Phase 2: Case Creation Flow (Stories 13.21-13.25)** - Week 2 ✅
- 13.21: Case Creation Intent Detection ✅
- 13.22: Case Creation Confirmation UI ✅
- 13.23: Connect Copilot to Intake API ✅
- 13.24: Redesign /intake Page (Simplified UX) ✅
- 13.25: Context Passing Between Copilot & Form ✅

**Partial Completion:**
- 13.8: Conversation Summarization ✅ (marked complete but needs review)
- 13.10: Context Snapshot System ✅ (implementation in git)
- 13.12: Session Lifecycle Management ✅ (implementation in git)

---

## 🚨 CRITICAL: Fix TypeScript/ESLint Errors First

**Status:** Blocking - must fix before continuing

**Location:** See `CURSOR_TASK.md` for detailed breakdown

**Summary:**
- 32 TypeScript errors (Case type properties, test mocks, imports)
- 11 ESLint errors (unused variables, explicit `any` types)

**Priority Issues:**
1. Case type missing properties (caseNumber, defendant, plaintiff, etc.)
2. Missing CaseStep/Reminder exports in lib/db/types.ts
3. Unused variables cleanup
4. Fix explicit `any` types

**Action:** Pass to Cursor for fixing

**Commands to verify:**
```bash
npm run type-check  # Should pass with 0 errors
npm run lint        # Should pass with 0 errors
npm test           # Should pass all tests
```

---

## 📋 Remaining Epic 13 Stories

### Phase 3: Enhanced Experience (Stories 13.8-13.13)

**Status:** 3 complete, 3 pending
**Estimated Time:** ~4-5 days
**Value:** High - performance and UX polish

#### ✅ 13.8: Conversation Summarization (Complete)
- **Status:** Marked complete but needs code review
- **Check:** Verify implementation exists and tests pass
- **Files:** lib/ai/summarization.ts

#### 🔨 13.9: Message Pagination API (Pending)
- **Effort:** 4 hours
- **Goal:** Paginate long conversations for performance
- **Implementation:** Firestore pagination with cursor-based paging
- **Priority:** Medium

#### ✅ 13.10: Context Snapshot System (Complete)
- **Status:** Implementation in git (lib/ai/contextSnapshot.ts)
- **Tests:** 28 tests passing
- **Ready:** Yes

#### 🔨 13.11: Glossary Service Foundation (Partial)
- **Effort:** 6 hours
- **Status:** Partial implementation (lib/ai/glossary.ts has ESLint errors)
- **Goal:** Inline legal term definitions in AI responses
- **Priority:** High (visible to users)
- **Action:** Fix errors and complete integration

#### ✅ 13.12: Session Lifecycle Management (Complete)
- **Status:** Implementation in git (lib/ai/sessionLifecycle.ts)
- **Tests:** 26 tests passing
- **Cron Job:** app/api/cron/session-lifecycle/route.ts
- **Ready:** Yes

#### 🔨 13.13: Context Fingerprint Caching (Pending)
- **Effort:** 3 hours
- **Goal:** Cache AI responses based on context fingerprints
- **Dependencies:** 13.10 (Context Snapshot)
- **Priority:** Medium

---

### Phase 4: Case Creation Enhancements (Stories 13.27-13.43)

**Status:** Planned, not started
**Estimated Time:** ~8-10 days
**Value:** Very High - major UX improvements

#### Sprint 1: Quick Wins (~8 hours)

**13.27: Visual Progress Indicator** (2 hours) ⭐
- Real-time checklist showing collected case info
- High visibility, easy implementation

**13.28: Context-Aware Quick Action Buttons** (3 hours) ⭐
- Suggestion chips that adapt to conversation stage
- Reduces typing, speeds up case creation

**13.29: Smart Follow-Up Questions** (3 hours) ⭐
- AI proactively asks for missing required info
- Higher completion rate

#### Sprint 2: Game Changers (~16 hours)

**13.30: Document Upload & OCR Extraction** (6 hours) 🔥
- Upload eviction notice/court docs for automatic extraction
- Uses GPT-4 Vision
- **Major differentiator**

**13.31: Structured Information Extraction** (4 hours)
- Replace regex patterns with OpenAI function calling
- 90%+ accuracy improvement

**13.32: Extraction Confidence & Validation UI** (3 hours)
- Show confidence scores with inline editing
- Builds user trust

**13.33: Urgency Detection** (3 hours) ⚠️
- Detect time-sensitive cases (<7 days to hearing)
- Show urgent warnings

#### Sprint 3: Enhanced Experience (~17 hours)

**13.34: Case Preview Before Creation** (2 hours)
- Show formatted case summary card
- Allow field editing before final creation

**13.35: Multi-Language Support** (8 hours)
- Auto-detect Spanish, Chinese, Vietnamese, Arabic
- Translate AI responses
- **High value for target demographics**

**13.36: Voice Input Support** (4 hours)
- Speech-to-text for hands-free case creation
- Accessibility feature

**13.37: Save & Resume Case Creation** (3 hours)
- Save partial case info
- Email reminder after 24 hours

#### Sprint 4: Quality & Analytics (~6 hours)

**13.38: Duplicate Case Detection** (2 hours)
- Warn if creating duplicate case

**13.39: Case Creation Analytics** (2 hours)
- Track funnel and drop-off points
- Product insights

**13.40: Success Celebration & Onboarding** (2 hours)
- Confetti animation on success
- Guide next steps

#### Research-Based Enhancements (~14 hours)

**13.41: Enhanced System Prompt V2** (3 hours) 🔥
- **Priority:** HIGH - Quick Win
- Implement research-backed prompt improvements
- 30% reduction in user confusion
- Source: Building Legal AI Chatbot docs

**13.42: Vector Database & RAG** (8 hours)
- **Priority:** MEDIUM
- Enable long-term memory with semantic search
- Cross-session memory
- Integrate Pinecone/Chroma/Weaviate

**13.43: Audit Logging & Compliance** (3 hours)
- **Priority:** LOW
- Immutable audit trail
- Legal defensibility
- 7-year retention

---

## 🎯 Recommended Implementation Order

### Immediate (This Session)
1. ✅ Review current state and create this roadmap
2. ⏳ **Fix TypeScript/ESLint errors** (Cursor)
3. ⏳ Verify existing implementations (13.8, 13.10, 13.12)
4. ⏳ Run full test suite to ensure nothing is broken

### Short-Term (Next 1-2 Sessions)
5. **Complete Phase 3 Enhanced Experience**
   - Fix and complete 13.11: Glossary Service
   - Implement 13.9: Message Pagination API
   - Implement 13.13: Context Fingerprint Caching

6. **Test and polish existing features**
   - End-to-end testing of case creation flow
   - Mobile responsiveness testing
   - Performance testing

### Medium-Term (Next Week)
7. **Implement Phase 4 Quick Wins** (Stories 13.27-13.29)
   - Visual progress indicator
   - Context-aware quick actions
   - Smart follow-up questions

8. **Implement Game Changers** (Stories 13.30-13.33)
   - Document upload & OCR (BIG WIN)
   - Structured extraction
   - Confidence & validation UI
   - Urgency detection

### Long-Term (Following Week)
9. **Enhanced Experience** (Stories 13.34-13.37)
   - Case preview
   - Multi-language support (if needed)
   - Voice input (nice-to-have)
   - Save & resume

10. **Quality & Polish** (Stories 13.38-13.40)
    - Analytics
    - Duplicate detection
    - Success celebration

11. **Research-Based** (Stories 13.41-13.43)
    - Enhanced system prompt (HIGH PRIORITY)
    - Vector database (if needed for scale)
    - Audit logging (for production)

---

## 🚀 Next Actions

### For This Session

**Option A: Fix Errors (Recommended)**
```bash
# Let Cursor fix TypeScript/ESLint errors using CURSOR_TASK.md
# Then verify:
npm run type-check
npm run lint
npm test
```

**Option B: Review Existing Work**
```bash
# Check what's actually implemented:
- Review lib/ai/summarization.ts
- Review lib/ai/contextSnapshot.ts
- Review lib/ai/sessionLifecycle.ts
- Run tests for each
```

**Option C: Start Next Story**
- Best candidate: **Story 13.11 - Glossary Service** (high visibility)
- Or: **Story 13.9 - Message Pagination** (performance)

### For User Decision

**Question for user:**
> "I've prepared this roadmap. What would you like to focus on?
>
> 1. **Let Cursor fix the errors first** (recommended - cleans up tech debt)
> 2. **Review and test existing implementations** (13.8, 13.10, 13.12)
> 3. **Start implementing next story** (13.9 or 13.11)
> 4. **Jump to Phase 4 quick wins** (13.27-13.29 - highly visible)
> 5. **Something else?**"

---

## 📊 Progress Tracking

### Stories Complete: 13 / 29 (45%)

**Phase Breakdown:**
- ✅ Phase 1 (Foundation): 7/7 (100%)
- ✅ Phase 2 (Case Creation): 5/5 (100%)
- 🟡 Phase 3 (Enhanced Experience): 3/6 (50%)
- ⬜ Phase 4 (Enhancements): 0/17 (0%)

**Estimated Remaining Time:**
- Phase 3: ~8-10 hours
- Phase 4: ~47 hours (can prioritize subset)
- **Total remaining:** ~55-57 hours

**With selective implementation (high-priority only):**
- Phase 3: ~8-10 hours
- Phase 4 (high-priority): ~25 hours
- **Total:** ~33-35 hours

---

## 🎬 Demo Readiness

### Currently Demo-Ready ✅
- Complete conversational case creation
- Intent detection with confirmation
- Seamless Copilot ↔ Form transitions
- Context passing (bidirectional)
- Auto-open Copilot from navigation
- Simplified UX (2 clear paths)

### Would Make Demo Better 💎
- Visual progress indicator (13.27)
- Quick action buttons (13.28)
- Smart follow-up questions (13.29)
- Document upload OCR (13.30) - **BIG WOW FACTOR**
- Enhanced system prompt (13.41)

### Nice-to-Have for Demo ✨
- Glossary integration (13.11)
- Message pagination (13.9)
- Multi-language support (13.35)

---

## 📝 Notes

### Technical Debt to Address
1. TypeScript/ESLint errors (CRITICAL)
2. Test coverage gaps (if any)
3. Mobile responsiveness testing needed
4. Performance benchmarking needed

### Documentation Status
- ✅ Epic 13 PRD complete
- ✅ All story documentation complete
- ✅ Implementation progress tracked
- ⬜ User documentation needed
- ⬜ API documentation needed

### Dependencies
- OpenAI API (existing)
- Firebase/Firestore (existing)
- Vercel Cron (configured for 13.12)
- Storage bucket (needed for 13.30 document upload)

---

**Prepared by:** Claude Code (Dev Agent)
**Date:** 2025-10-17
**Epic Owner:** Mary (BMAD AI)
**Status:** Ready for next implementation phase after bug fixes
