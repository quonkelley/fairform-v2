<!-- e9e2590a-4cf2-498b-8ba0-987c6c135d99 9b6efeaf-3668-41f4-91b0-1ff72ba78a89 -->
# Remove Quick Form Intake - Simplify to Copilot + Manual

## Overview

Eliminate the "Quick Form Intake" zombie feature that duplicates Copilot functionality without adding value. Simplify to two clear paths: **AI-guided (Copilot)** for everyone needing help, and **Manual creation** for users who already have their details.

## Why This Change

**Current Problem:**

- "Quick Form Intake" is AI intake without conversation - same as Copilot but worse UX
- Adds confusion: "Which one should I use?"
- Page even suggests switching to Copilot - admits it's inferior
- Not actually "quick" or "form-like" - just a text area analyzed by AI
- Clutters the demo narrative and adds cognitive load

**Solution:**

- **One AI path**: Copilot (conversational, guided, contextual)
- **One manual path**: Direct case creation dialog (for experts)
- Clear mental model: Guided vs Manual, not Chat vs No-Chat

## Implementation Plan

### 1. Redirect /intake to Dashboard with Copilot

**File: `app/intake/page.tsx`**

Replace the entire intake page with a simple redirect:

```tsx
import { redirect } from "next/navigation";

export default function IntakeRedirect() {
  redirect("/dashboard?openCopilot=true");
}
```

**Why:**

- Preserves any existing links (no 404s)
- Auto-opens Copilot when users navigate to /intake
- Maintains the "start AI conversation" intent

### 2. Update Empty State - Remove "Quick Form" Link

**File: `components/dashboard/empty-state.tsx`**

Current secondary option:

```tsx
// Lines 47-57: "Prefer to fill out a form instead?" → /intake
```

Change to:

```tsx
// "Already have your details?" → onClick={onCreateCase}
// Opens the manual case creation dialog directly
```

**New structure:**

- Primary CTA: "Talk to FairForm" (opens Copilot)
- Secondary CTA: "Already have your details?" (opens manual dialog)
- Remove: All references to /intake or "Quick Form"

### 3. Clean Up References to Quick Form

**Files to check and update:**

1. **`app/intake/page.tsx`**

   - Replace entire page with redirect (already covered)
   - Remove unused components: `AIIntakeForm`, `AISummaryCard`, `InfoBanner`
   - Note: Keep these components for now in case they're used elsewhere, just stop importing them

2. **Remove unused intake components (future cleanup)**

   - `components/intake/ai-intake-form.tsx` - May still be used by Copilot context
   - `components/intake/ai-summary-card.tsx` - May still be needed
   - `components/intake/InfoBanner.tsx` - Likely can be removed
   - **Action:** Mark for removal only after confirming Copilot doesn't use them

3. **Update navigation/links if any exist**

   - Search codebase for links to `/intake`
   - Update any that exist to point to dashboard with Copilot

### 4. Update Empty State Copy

**File: `components/dashboard/empty-state.tsx`**

Update the secondary section (lines 59-67):

**Current:**

```tsx
{/* Power User Option */}
<div className="pt-4 border-t border-border/50">
  <p className="text-xs text-muted-foreground mb-2">
    Already have your case details ready?
  </p>
  <Button variant="ghost" size="sm" onClick={onCreateCase} className="text-xs">
    Create case manually
  </Button>
</div>
```

**Change to:**

```tsx
{/* Manual Creation Option */}
<div className="pt-4 border-t border-border/50">
  <p className="text-xs text-muted-foreground mb-2">
    Already have all your case details?
  </p>
  <Button variant="ghost" size="sm" onClick={onCreateCase} className="text-xs">
    Create case manually
  </Button>
</div>
```

**And remove the "Prefer a form" section** (lines 46-57):

```tsx
{/* Secondary Option */}
<div className="pt-2">
  <p className="text-sm text-muted-foreground mb-2">
    Prefer to fill out a form instead?
  </p>
  <Link href="/intake">
    <Button variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Quick Form Intake
    </Button>
  </Link>
</div>
```

### 5. Verify Copilot Context Storage

**Check: `lib/ai/contextStorage.ts`**

The intake page had context storage functionality. Verify that Copilot still has access to these utilities:

- `loadIntakeContext()`
- `clearIntakeContext()`
- `updateIntakeContext()`

**Action:** If these are only used by the intake page, they should be refactored to be Copilot-centric.

## Updated User Flows

### New User (Empty Dashboard)

1. Sees "Talk to FairForm" as hero CTA
2. Clicks → Copilot opens
3. Describes situation
4. Copilot creates case automatically
5. User sees case detail page

### Returning User (Has Cases)

1. Sees case cards
2. Optional dismissible banner: "Need help? Talk to FairForm"
3. Can click "Create case manually" if they want direct entry

### Expert User (Knows What They Want)

1. Clicks "Already have your details?" 
2. Manual creation dialog opens
3. Fills form fields directly
4. Case created, goes to case detail

## Mental Model Clarity

**Before (Confusing):**

```
"Should I use Copilot or Quick Form?"
"What's the difference?"
"The form says to use Copilot instead... why does it exist?"
```

**After (Clear):**

```
"Need help? → Talk to FairForm (AI)"
"Know what you want? → Create manually"
```

## Demo Impact

**Previous flow:**

- Dashboard → "Start case" or "Quick Form" or "Copilot"
- Three options, two AI paths, confusing

**New flow:**

- Dashboard → "Talk to FairForm" 
- Clean narrative: "You describe it, we understand it, we plan it"
- No cognitive friction, single hero action

## Files to Modify

1. ✅ `app/intake/page.tsx` - Replace with redirect
2. ✅ `components/dashboard/empty-state.tsx` - Remove Quick Form link, simplify secondary CTA
3. 🔍 Search codebase for any other references to `/intake` route
4. 📝 Update any documentation that mentions "Quick Form Intake"

## Testing Checklist

- [ ] Navigating to `/intake` redirects to dashboard and opens Copilot
- [ ] Empty state shows two clear options: AI (primary) and Manual (secondary)
- [ ] No "Quick Form" references remain in UI
- [ ] Copilot opens smoothly from primary CTA
- [ ] Manual creation dialog opens from secondary CTA
- [ ] No broken links or 404s
- [ ] Copilot context storage still works correctly

## Cleanup for Later (Not Blocking)

- [ ] Review if `AIIntakeForm` component is still needed
- [ ] Review if `AISummaryCard` component is still needed  
- [ ] Remove unused intake-related code if confirmed safe
- [ ] Update any internal documentation

## Success Criteria

✅ One AI entry point (Copilot)

✅ One manual entry point (Dialog)

✅ Zero confusion about which to use

✅ Clean demo narrative

✅ Faster user decision-making

✅ Reduced code maintenance surface

### To-dos

- [ ] Replace /intake page with redirect to dashboard?openCopilot=true
- [ ] Remove 'Quick Form Intake' link and simplify to just AI vs Manual options
- [ ] Search codebase for any other references to /intake route and update them
- [ ] Test all user flows: new user, returning user, expert user
- [ ] Verify no 404s or broken navigation after changes