# Epic 18: Smart Form Filler - Implementation Plan

## Overview

This document outlines the recommended implementation sequence for Epic 18 to ensure successful integration with Epic 13 (AI Copilot).

**Created:** 2025-10-16
**Status:** Ready for Implementation
**Total Stories:** 6 (previously 5, added integration story)

---

## Story Sequence & Dependencies

### Phase 1: Foundation (Week 1)
**Goal:** Build storage and PDF generation core

#### ✅ Story 18.1: PDF Template Storage & Basic Upload
**Status:** COMPLETE
**Duration:** 2 days
**What:** Firebase Storage setup, storage repo, demo adapter

**Deliverables:**
- `lib/db/storageRepo.ts` ✅
- `lib/demo/demoStorageAdapter.ts` ✅
- `storage.rules` ✅
- 23 passing tests ✅

**Next Story Dependencies:** None - ready for 18.2

---

#### Story 18.2: PDF Generation Engine with pdf-lib
**Status:** Planned (NEXT)
**Duration:** 3 days
**Dependencies:** 18.1 (storage for loading templates)

**What:**
- Install and integrate pdf-lib
- Generate filled PDFs from templates
- HTML fallback for reliability
- Form validation

**Critical for:**
- 18.4 (needs PDF generation)
- Demo flow (needs working PDF output)

**Recommendation:** Start immediately after 18.1 review

---

### Phase 2: User Experience (Week 2)
**Goal:** Build conversational form filling UI

#### Story 18.3: Form Field Collection in Chat
**Status:** Planned
**Duration:** 3 days
**Dependencies:** 18.2 (needs form templates defined)

**What:**
- Copilot intent detection for forms
- FormSession component (conversational Q&A)
- One field at a time with progress
- Pre-fill from case context

**Critical for:**
- 18.6 (needs FormSession component)
- User experience (the "wow" factor)

**Integration Point:** First story that touches Epic 13 code

---

#### Story 18.4: Download & Basic Actions
**Status:** Planned
**Duration:** 2 days
**Dependencies:** 18.2 (PDF generation), 18.3 (FormSession)

**What:**
- Success card with download button
- Generate & upload API
- Save metadata to Firestore
- Display in dashboard

**Critical for:**
- Complete user flow
- Demo completion

---

### Phase 3: Polish & Integration (Week 3)
**Goal:** Demo mode and seamless integration

#### Story 18.5: Demo Mode Form Filler Integration
**Status:** Planned
**Duration:** 2 days
**Dependencies:** 18.1-18.4 (all core features)

**What:**
- Auto-filled demo scenarios
- Auto-advance through fields
- Fast PDF generation from `/public`
- 2-3 minute demo flow

**Critical for:**
- Investor demos
- Stakeholder presentations

---

#### ⭐ Story 18.6: AI Copilot & Form Filler Integration (NEW)
**Status:** Planned
**Duration:** 2-3 days
**Dependencies:** 18.2-18.5 (all form filler features)

**What:**
- ChatPanel mode switching (chat ↔ form)
- Form suggestion detection
- Context flow (Copilot → Form)
- Completion tracking (Form → Copilot)
- Shared TypeScript types

**Critical for:**
- Unified user experience
- Production readiness
- Epic 13 ↔ Epic 18 integration

**Why Added:**
This story ensures Epic 13 and Epic 18 work together seamlessly. Without it, you'd have two separate features instead of one unified experience.

---

## Implementation Timeline

```
Week 1: Foundation
├─ Day 1-2: Story 18.1 ✅ DONE
├─ Day 3-5: Story 18.2 (PDF generation)
└─ Review & test foundation

Week 2: User Experience
├─ Day 1-3: Story 18.3 (Form collection UI)
├─ Day 4-5: Story 18.4 (Download & actions)
└─ Review & test user flow

Week 3: Polish & Integration
├─ Day 1-2: Story 18.5 (Demo mode)
├─ Day 3-4: Story 18.6 (Copilot integration) ⭐ NEW
├─ Day 5: E2E testing & demo rehearsal
└─ Stakeholder review
```

---

## Integration Checkpoints

### Checkpoint 1: After Story 18.2
**Verify:**
- [ ] PDF generation works with sample data
- [ ] Templates load from storage
- [ ] HTML fallback renders correctly

**Risk:** If PDF generation doesn't work, it blocks everything else.
**Mitigation:** Test with real Marion County PDF early.

---

### Checkpoint 2: After Story 18.3
**Verify:**
- [ ] FormSession renders in isolation
- [ ] Pre-fill logic works with case data
- [ ] Form validation prevents bad data

**Risk:** If pre-fill doesn't work, integration with Epic 13 will fail.
**Mitigation:** Test with actual Epic 13 case context early.

---

### Checkpoint 3: After Story 18.6 ⭐
**Verify:**
- [ ] Chat → Form → Chat flow works end-to-end
- [ ] Context preserved during mode switch
- [ ] Form completion tracked in conversation
- [ ] Demo mode auto-advances smoothly

**Risk:** If integration is broken, Epic 18 is isolated from Epic 13.
**Mitigation:** Integration tests covering full flow.

---

## Critical Integration Points

### 1. ChatPanel State Management (Story 18.6)
**Epic 13 Component:** `components/ai-copilot/ChatPanel.tsx`
**Epic 18 Component:** `components/ai-copilot/FormSession.tsx`

**Integration:**
```typescript
const [mode, setMode] = useState<'chat' | 'form'>('chat');

{mode === 'chat' ? (
  <ChatThread messages={messages} />
) : (
  <FormSession
    formId={activeFormId}
    caseId={caseId}
    onComplete={handleFormComplete}
    onCancel={() => setMode('chat')}
  />
)}
```

**Test:** User can switch between chat and form without losing data.

---

### 2. Form Intent Detection (Story 18.3 + 18.6)
**Epic 13 API:** `app/api/ai/copilot/chat/route.ts`
**Epic 18 Trigger:** Parse form suggestions from Copilot response

**Integration:**
```typescript
// Copilot response includes:
"I can help you file an Appearance form..."
FORM_SUGGESTION: formId=marion-appearance, reason=...

// ChatPanel detects and shows form UI
```

**Test:** Copilot message with form keywords triggers FormSession.

---

### 3. Context Pre-filling (Story 18.3 + 18.6)
**Epic 13 Data:** Case context from `aiSessions/{sessionId}/contextSnapshot`
**Epic 18 Usage:** Pre-fill form fields

**Integration:**
```typescript
// Load from Epic 13
const context = loadIntakeContext(); // sessionStorage
const caseData = await getCaseData(caseId); // Firestore

// Use in Epic 18
const prefilled = prefillFromCase(caseData, formTemplate);
```

**Test:** Form fields auto-populate with case number, hearing date, etc.

---

### 4. Completion Tracking (Story 18.4 + 18.6)
**Epic 18 Event:** Form completed with download URL
**Epic 13 Update:** Add success message to chat

**Integration:**
```typescript
// FormSession calls onComplete
onComplete(formData, downloadUrl);

// ChatPanel sends to Copilot
await sendMessage("[System: Form completed]");

// Copilot responds
"🎉 Great! Your form is ready. [Download]"
```

**Test:** Form completion shows success message in chat.

---

## Shared Dependencies

### TypeScript Types
**Location:** `lib/types/integration.ts` (NEW)

**Shared Between Epic 13 & 18:**
```typescript
export interface FormSuggestion {
  formId: string;
  reason: string;
}

export interface FormContext {
  formId: string;
  caseId?: string;
  caseData?: Case;
}
```

**Why:** Prevents type conflicts and ensures consistency.

---

### Demo Configuration
**Location:** `lib/demo/demoConfig.ts`

**Shared Settings:**
```typescript
export const demoConfig = {
  enabled: process.env.DEMO_MODE === 'true',

  copilot: {
    scriptedResponses: true,
  },

  formFiller: {
    autoStart: true,
    autoAdvanceDelay: 1500,
  }
};
```

**Why:** Coordinates demo timing between Copilot and Form Filler.

---

## Testing Strategy

### Unit Tests (Each Story)
- Story 18.1: 23 tests ✅
- Story 18.2: PDF generation (≥10 tests)
- Story 18.3: Form collection (≥15 tests)
- Story 18.4: Download & actions (≥10 tests)
- Story 18.5: Demo mode (≥8 tests)
- Story 18.6: Integration (≥12 tests)

**Total:** ~78 tests for Epic 18

---

### Integration Tests (Story 18.6)
```typescript
describe('Epic 13 ↔ Epic 18 Integration', () => {
  it('completes full flow: chat → form → download', async () => {
    // 1. Start in ChatPanel
    // 2. Send message triggering form
    // 3. Verify FormSession renders
    // 4. Complete form
    // 5. Verify return to chat
    // 6. Verify success message
  });

  it('preserves context during mode switch', async () => {
    // 1. Have conversation in chat
    // 2. Switch to form
    // 3. Cancel form
    // 4. Verify chat history intact
  });

  it('pre-fills form from case context', async () => {
    // 1. Create case with data
    // 2. Start form
    // 3. Verify fields pre-filled
  });
});
```

---

### E2E Tests (Demo Flow)
```typescript
describe('Demo Mode Complete Flow', () => {
  it('runs 3-minute demo from conversation to PDF', async () => {
    // 1. Open ChatPanel in demo mode
    // 2. Copilot suggests form (auto)
    // 3. Form auto-starts
    // 4. Fields auto-advance (1.5s each)
    // 5. PDF generates
    // 6. Success message appears
    // 7. Total time ≤ 3 minutes
  });
});
```

---

## Risk Mitigation

### Risk 1: Epic 13 Changes Break Epic 18
**Probability:** Medium
**Impact:** High

**Mitigation:**
1. Create Story 18.6 for explicit integration
2. Use shared TypeScript types
3. Integration tests catch breaking changes
4. Lock Epic 13 API during Epic 18 development

---

### Risk 2: Context Not Flowing Correctly
**Probability:** Medium
**Impact:** High (form won't pre-fill)

**Mitigation:**
1. Test pre-fill logic in isolation (Story 18.3)
2. Test with real Epic 13 session data (Story 18.6)
3. Add debug logging for context flow
4. Fallback to manual entry if pre-fill fails

---

### Risk 3: Mode Switching Loses Data
**Probability:** Low
**Impact:** High (poor UX)

**Mitigation:**
1. Preserve message state during mode switch
2. Test cancellation scenarios
3. Auto-save form drafts (defer to post-MVP)
4. Clear error messages on failure

---

### Risk 4: Demo Mode Timing Off
**Probability:** Medium
**Impact:** Medium (bad investor demo)

**Mitigation:**
1. Configurable delays in `demoConfig`
2. Rehearse demo flow multiple times
3. Add manual pause/resume controls
4. Record demo video as backup

---

## Success Criteria

### Epic 18 is complete when:

#### Technical
- [ ] All 6 stories pass acceptance criteria
- [ ] ≥80% test coverage across all stories
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings

#### Integration
- [ ] ChatPanel → FormSession → ChatPanel flow works
- [ ] Form suggestions detected from Copilot
- [ ] Case context pre-fills form fields
- [ ] Form completion tracked in conversation

#### Demo
- [ ] Full demo runs in 2-3 minutes
- [ ] Auto-advance timing feels natural
- [ ] PDF downloads successfully
- [ ] Success confetti animation works

#### User Experience
- [ ] Users can complete a form in ≤5 minutes
- [ ] Pre-fill accuracy ≥95%
- [ ] PDF generation success ≥98%
- [ ] No dead ends or error states

---

## Recommended Story Implementation Order

1. **Story 18.1** ✅ COMPLETE
2. **Story 18.2** ← START HERE (PDF generation)
3. **Story 18.3** (Form collection UI)
4. **Story 18.4** (Download & actions)
5. **Story 18.5** (Demo mode)
6. **Story 18.6** ⭐ (Integration - CRITICAL)

**Total Time:** 3 weeks (aligned with Epic 18 PRD)

---

## Next Steps

1. **Review Story 18.1** ✅ (Complete - 23 tests passing)
2. **Start Story 18.2** (Install pdf-lib, create generator)
3. **Create Marion County PDF template** (blank with form fields)
4. **Schedule integration checkpoint** (After 18.3)
5. **Plan demo rehearsal** (After 18.6)

---

## Questions for Team

1. Do we have access to Marion County Appearance PDF with fillable fields?
2. Should we support both PDF templates AND HTML-only fallback?
3. What's the file size limit for completed forms? (Suggested: 10MB)
4. Should form completion create a reminder automatically?
5. Do we want form editing after completion? (Suggested: Defer)

---

**Created by:** Dev Team
**Date:** October 16, 2025
**Next Review:** After Story 18.2 completion
