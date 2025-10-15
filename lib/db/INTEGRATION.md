# Repository Integration - Demo Mode Support

This document explains the repository factory pattern that enables seamless switching between demo and production data.

## 📋 Overview

The repository factory pattern allows components and hooks to access data without knowing whether it's coming from demo repositories (in-memory) or production repositories (Firebase via API).

### Key Benefits

✅ **No component changes required** - Switch modes via environment variable  
✅ **Type-safe** - Same interfaces for demo and production  
✅ **Fast development** - Work without Firebase dependency  
✅ **Easy testing** - Structured, predictable demo data  
✅ **Demo presentations** - Reliable, realistic user experiences

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Components                │
│    (Dashboard, Case Detail, etc.)       │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│          React Hooks (v2)               │
│  useUserCases, useCaseDetails, etc.     │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│       isDemoMode() Decision             │
│   (checks NEXT_PUBLIC_DEMO_MODE)        │
└───────┬─────────────────────────────┬───┘
        │                             │
   DEMO │                             │ PRODUCTION
        ↓                             ↓
┌──────────────────┐     ┌────────────────────────┐
│  Demo Repos      │     │   API Repos            │
│  (in-memory)     │     │   (Next.js API)        │
├──────────────────┤     ├────────────────────────┤
│ demoCasesRepo    │     │ apiCasesRepo           │
│ demoStepsRepo    │     │ apiStepsRepo           │
│ demoRemindersRepo│     │ apiRemindersRepo       │
└──────────────────┘     └──────────┬─────────────┘
                                    │
                                    ↓
                          ┌──────────────────┐
                          │  Firebase        │
                          └──────────────────┘
```

## 📂 Files Created

### Core Infrastructure

1. **`lib/db/repoFactory.ts`** (160 lines)
   - Repository interfaces (CasesRepository, StepsRepository, RemindersRepository)
   - isDemoMode() detection function
   - enableDemoMode() / disableDemoMode() utilities
   - Factory functions that return appropriate repo implementation

2. **`lib/db/apiRepos.ts`** (420 lines)
   - Production repository implementations
   - HTTP calls to Next.js API routes
   - Date parsing and error handling
   - Matches Firebase production behavior

### Updated Hooks (V2)

3. **`lib/hooks/useUserCases.v2.ts`**
   - Fetches user cases with mode switching
   - Demo: Returns demo scenario cases
   - Production: Calls /api/cases with auth

4. **`lib/hooks/useCaseDetails.v2.ts`**
   - Fetches single case with mode switching
   - Demo: Returns demo case by ID
   - Production: Calls /api/cases/{id}

5. **`lib/hooks/useCaseSteps.v2.ts`**
   - Fetches case journey steps
   - Demo: Returns demo scenario steps
   - Production: Calls /api/cases/{id}/steps

## 🚀 Usage

### Enabling Demo Mode

**Option 1: Environment Variable (Recommended)**
```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

**Option 2: Programmatically**
```typescript
import { enableDemoMode } from '@/lib/db/repoFactory';

// Enable demo mode
enableDemoMode();

// Now all hooks will use demo repositories
```

### Using Updated Hooks

**1. In Components - Import V2 hooks:**
```typescript
// OLD (direct API calls)
import { useUserCases } from '@/lib/hooks/useUserCases';

// NEW (repo factory pattern)
import { useUserCases } from '@/lib/hooks/useUserCases.v2';

function Dashboard() {
  const { data: cases } = useUserCases('demo-user');
  // Automatically uses demo or production based on mode
}
```

**2. Works Identically in Both Modes:**
```typescript
function CaseDashboard({ caseId }: { caseId: string }) {
  const { data: caseData, isLoading } = useCaseDetails(caseId);
  const { data: steps } = useCaseSteps(caseId);

  // Mode switching is transparent
  // Demo: Returns DEMO-EVICTION-001 data
  // Production: Fetches from Firebase
}
```

### Checking Current Mode

```typescript
import { isDemoMode } from '@/lib/db/repoFactory';

if (isDemoMode()) {
  console.log('Running in demo mode');
  // Show demo banner, disable certain features, etc.
}
```

## 🔄 Migration Path

### Phase 1: Test V2 Hooks (Current)
- V2 hooks exist alongside original hooks
- Test with demo mode enabled
- Verify components work correctly

### Phase 2: Replace Hooks
```bash
# When ready, replace original hooks
mv lib/hooks/useUserCases.v2.ts lib/hooks/useUserCases.ts
mv lib/hooks/useCaseDetails.v2.ts lib/hooks/useCaseDetails.ts
mv lib/hooks/useCaseSteps.v2.ts lib/hooks/useCaseSteps.ts
```

### Phase 3: Update Components
- Change imports from `.v2` to original hook names
- No other component changes needed
- Everything works in both modes

## 🧪 Testing

### Test Demo Mode

```bash
# Enable demo mode
export NEXT_PUBLIC_DEMO_MODE=true

# Start app
npm run dev

# Navigate to dashboard
# Should see DEMO-EVICTION-001 case with 5 steps
```

### Test Production Mode

```bash
# Disable demo mode
unset NEXT_PUBLIC_DEMO_MODE

# Start app
npm run dev

# Sign in with Firebase
# Should see real user cases
```

## 🎯 Demo Mode Behavior

### What Works in Demo Mode

✅ **View demo case** - DEMO-EVICTION-001  
✅ **See journey steps** - 5 realistic steps with due dates  
✅ **View reminders** - Pre-configured deadline reminders  
✅ **Complete steps** - Progress updates in session  
✅ **Create reminders** - Stored in memory  
✅ **Fast performance** - No network latency

### What's Simulated

🔄 **Network delays** - 100-200ms for realistic UX  
🔄 **Case progress** - Automatically calculated  
🔄 **Data persistence** - Session-based (resets on refresh)

### What's Disabled

❌ **Authentication** - No Firebase login required  
❌ **Data persistence** - Changes don't survive page reload  
❌ **Multi-user** - Single demo user only

## 📊 Repository Interfaces

All repositories implement these interfaces:

### CasesRepository
```typescript
interface CasesRepository {
  getCase(caseId: string): Promise<Case | null>;
  getUserCases(userId: string): Promise<Case[]>;
  createCase(data: CreateCaseInput): Promise<Case>;
  updateCase(caseId: string, updates: Partial<Case>): Promise<Case>;
  deleteCase(caseId: string): Promise<void>;
}
```

### StepsRepository
```typescript
interface StepsRepository {
  getCaseSteps(caseId: string): Promise<CaseStep[]>;
  getStep(stepId: string): Promise<CaseStep | null>;
  createStep(data: CreateCaseStepInput): Promise<CaseStep>;
  updateStepCompletion(stepId: string, data: UpdateStepCompletionInput): Promise<CaseStep>;
  updateStep(stepId: string, updates: Partial<CaseStep>): Promise<CaseStep>;
  deleteStep(stepId: string): Promise<void>;
}
```

### RemindersRepository
```typescript
interface RemindersRepository {
  createReminder(data: ReminderInput): Promise<Reminder>;
  getCaseReminders(caseId: string): Promise<Reminder[]>;
  getUserReminders(userId: string): Promise<Reminder[]>;
  markReminderSent(reminderId: string): Promise<void>;
  deleteReminder(reminderId: string): Promise<void>;
}
```

## 🔍 Troubleshooting

### Demo mode not activating

**Check:**
1. Environment variable is set: `console.log(process.env.NEXT_PUBLIC_DEMO_MODE)`
2. Restart dev server after changing .env.local
3. Clear localStorage: `localStorage.clear()`

### Can't see demo data

**Check:**
1. Using V2 hooks (not original)
2. Demo mode is enabled
3. Console logs show "Using demo repository"
4. Case ID is 'DEMO-EVICTION-001'

### Components still calling Firebase

**Check:**
1. Components using V2 hooks
2. Hooks properly checking isDemoMode()
3. No direct Firebase imports in components
4. React Query cache cleared

## 🚀 Next Steps

### Immediate (This Sprint)
1. ✅ Test V2 hooks with dashboard components
2. Test case detail page in demo mode
3. Test step completion in demo mode
4. Verify all states (loading, error, empty, success)

### Short Term
1. Replace original hooks with V2 versions
2. Update all components to use repo pattern
3. Add demo mode indicator in UI
4. Create demo toggle button (dev only)

### Future Enhancements
1. Multiple demo scenarios
2. Demo mode persistence options
3. Demo data export/import
4. Performance comparison tool
5. Demo analytics tracking

## 📝 Code Examples

### Example 1: Dashboard Component
```typescript
'use client';

import { useUserCases } from '@/lib/hooks/useUserCases.v2';
import { isDemoMode } from '@/lib/db/repoFactory';

export function Dashboard() {
  const demoMode = isDemoMode();
  const userId = demoMode ? 'demo-user' : useAuth().user?.uid;
  const { data: cases, isLoading } = useUserCases(userId);

  if (demoMode) {
    return <DemoBanner />;
  }

  // Rest of component...
}
```

### Example 2: Case Detail
```typescript
import { useCaseDetails, useCaseSteps } from '@/lib/hooks/*.v2';

export function CaseDetail({ caseId }: { caseId: string }) {
  const { data: caseData } = useCaseDetails(caseId);
  const { data: steps } = useCaseSteps(caseId);

  // Works in both demo and production modes
  // No conditional logic needed
}
```

### Example 3: Creating Cases in Demo
```typescript
import { getCasesRepo } from '@/lib/db/repoFactory';

async function createCase() {
  const repo = await getCasesRepo();
  
  const newCase = await repo.createCase({
    userId: 'demo-user',
    caseType: 'eviction',
    jurisdiction: 'Marion County, IN',
    title: 'Test Case',
  });
  
  console.log('Case created:', newCase.id);
  // Demo: Returns DEMO-{timestamp}
  // Production: Returns Firebase document ID
}
```

## 📚 Related Documentation

- **Demo Scenarios**: `/lib/demo/README.md`
- **Architecture**: `/docs/architecture/DEMO-ARCHITECTURE-ROBUST.md`
- **Demo Configuration**: `/lib/demo/demoConfig.ts`
- **Test Coverage**: `/lib/demo/*.test.ts`

---

**Status**: ✅ Complete and ready for testing  
**Last Updated**: October 15, 2025  
**Author**: Dev Agent (James)

