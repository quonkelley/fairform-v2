# TypeScript & ESLint Fixes Needed

**Context:** Epic 13 AI Copilot implementation has TypeScript/ESLint errors that need fixing before continuing with new features.

## Summary
- **TypeScript Errors:** 32 errors
- **ESLint Errors:** 11 issues
- **Priority:** HIGH - blocks clean development

---

## TypeScript Errors to Fix

### 1. Test Mock Issues (EventSource)
**Files:**
- `components/ai-copilot/ChatPanel.test.tsx:56,79`
- `lib/hooks/useAICopilot.test.ts:22,63`

**Issue:** Mock type doesn't include EventSource static properties (CONNECTING, OPEN, CLOSED)

**Fix:** Update mock type definition to include static properties

---

### 2. Missing Checkbox Component
**File:** `components/forms/FormFieldInput.tsx:5`

**Issue:** `Cannot find module '@/components/ui/checkbox'`

**Fix:** Create the missing checkbox component or update import path

---

### 3. Implicit Any Types
**Files:**
- `components/forms/FormFieldInput.tsx:92` - Parameter 'checked' implicitly has 'any' type
- `components/intake/ai-intake-form.tsx:68` - Argument of type 'string | undefined' not assignable to 'string'

**Fix:** Add explicit type annotations

---

### 4. AIMessage Type Mismatches
**File:** `lib/ai/contextBuilder.test.ts:116,435`

**Issue:** Test objects missing `id`, `sessionId`, `createdAt` properties

**Fix:** Add missing properties to test mock objects

---

### 5. Typo in Test
**File:** `lib/ai/glossary.test.ts:26`

**Issue:** `relatedTermms` should be `relatedTerms`

**Fix:** Fix typo

---

### 6. Boolean Type Mismatch
**File:** `lib/demo/demoConfig.ts:306`

**Issue:** Type 'number | boolean' not assignable to type 'boolean'

**Fix:** Ensure value is strictly boolean

---

### 7. Missing Type Exports
**Files:**
- `lib/demo/scenarios/eviction.ts:1`
- `lib/demo/scenarios/smallClaims.ts:1`

**Issue:** Module '"@/lib/db/types"' has no exported members 'CaseStep' and 'Reminder'

**Fix:** Add exports to `lib/db/types.ts` or update import paths

---

### 8. Case Properties Don't Exist (MAJOR)
**File:** `lib/forms/prefillData.ts` - Multiple errors (lines 26,27,35,36,43,44,51,52,59,60,75,76,89,91,98,99)

**Issue:** Accessing non-existent properties on Case type:
- `caseNumber`
- `nextHearingDate`
- `defendant`
- `plaintiff`
- `court`
- `filingDate`
- `propertyAddress`

**Fix Options:**
1. Add these properties to Case type in `lib/db/types.ts`
2. Update prefillData to use existing Case properties
3. Use case metadata/customFields pattern

**Recommended:** Check data model specification and update Case type if these are required fields

---

### 9. Test Type Mismatch
**File:** `tests/hooks/useFormSession.test.ts:58`

**Issue:** 'caseNumber' does not exist in type (same as #8)

**Fix:** Remove or update test to match actual Case type

---

## ESLint Errors to Fix

### 1. Explicit Any Types
**Files:**
- `app/api/ai/copilot/chat/route.ts:343` - 1 error
- `lib/forms/prefillData.ts:18,19,106,138,174` - 5 errors

**Fix:** Replace `any` with proper types

---

### 2. Unused Variables
**Files:**
- `lib/ai/glossary.ts:72` - 'words' assigned but never used
- `lib/ai/glossary.ts:156,157` - 'text', 'position' defined but never used
- `lib/ai/summarization.test.ts:7,14` - 'afterEach', 'summarizeConversation' defined but never used
- `lib/hooks/useAICopilot.ts:316` - 'isFirstChunk' assigned but never used

**Fix:** Remove unused variables or implement their usage

---

### 3. Variable Declaration Issues
**File:** `lib/hooks/useAICopilot.ts:316`

**Issue:** 'isFirstChunk' never reassigned. Use 'const' instead

**Fix:** Change `let` to `const`

---

### 4. React Hook Dependency Warning
**File:** `lib/hooks/useAICopilot.ts:270`

**Issue:** useEffect missing dependency 'createSessionMutation'

**Fix:** Add to dependency array or wrap in useCallback

---

## Priority Order

1. **HIGH:** Case type properties (#8, #9) - affects data model
2. **HIGH:** Missing exports (#7) - affects demo scenarios
3. **MEDIUM:** Unused variables (#2 in ESLint) - code cleanliness
4. **MEDIUM:** Explicit any types (#1 in ESLint) - type safety
5. **LOW:** Test mocks (#1, #4, #9 in TS) - test quality
6. **LOW:** Other minor issues

---

## Commands to Run After Fixes

```bash
npm run type-check
npm run lint
npm test
```

All should pass with zero errors.

---

## Notes

- Some errors may cascade (fixing Case type will fix multiple errors)
- Test carefully after fixing Case type changes
- Consider if Case type needs to be extended or if prefillData logic needs updating
- Check Epic 6.5 data model documentation for Case schema

---

**Prepared for:** Cursor IDE
**Date:** 2025-10-17
**Context:** Epic 13 AI Copilot - Mid-implementation cleanup
