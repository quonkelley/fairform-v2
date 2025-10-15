# Demo Architecture Implementation Patches

These patches implement the team-approved robust demo architecture. Apply in order.

---

## Patch 1: Remove Feature Flags from demoConfig.ts

**File**: `lib/demo/demoConfig.ts`

**Rationale**: "One mode" means no conditional branching. Remove feature flags entirely.

```diff
import { evictionScenario } from './scenarios/eviction';
-// import { smallClaimsScenario } from './scenarios/smallClaims';

-// Single place to swap demo scenarios
+/**
+ * LOCKED FOR PUBLIC DEMO - DO NOT CHANGE
+ *
+ * For internal testing only, uncomment alternative scenarios:
+ * export const currentScenario = smallClaimsScenario;
+ */
export const currentScenario = evictionScenario;

+/**
+ * Demo configuration
+ *
+ * NOTE: No feature flags - this is single-mode demo code.
+ * All features (PDF, OCR simulation, reminders) are always enabled
+ * with their appropriate implementations (real PDF gen, simulated OCR, visual reminders).
+ */
export const demoConfig = {
  userId: 'demo-user',
  userName: 'Alex Rodriguez',
  userEmail: 'demo@fairform.app',

-  // Feature flags for graceful degradation
-  features: {
-    aiCopilot: true,
-    pdfGeneration: true,
-    ocrScan: false, // Simulate only
-    smsReminders: false, // Visual feedback only
-  },
-
-  // Timing for animations (ms)
+  // Timing for animations and simulated delays (ms)
  timing: {
-    scanDelay: 1500,
-    aiResponseDelay: 800,
-    pdfGenerationDelay: 1200,
+    scanDelay: 1500,        // Simulated OCR processing
+    aiResponseDelay: 800,   // Copilot typing indicator
+    pdfGenerationDelay: 1200, // PDF processing indicator
  }
};
```

**Impact**: Eliminates all `if (config.features.X)` checks throughout the codebase.

---

## Patch 2: Rename mockRepos.ts → demoRepos.ts

**Files**:
- `lib/demo/mockRepos.ts` → `lib/demo/demoRepos.ts`
- Update all imports

**Rationale**: Better naming signals this is production demo code, not temporary mocks.

### Step 1: Rename file and update exports

```diff
-// lib/demo/mockRepos.ts
+// lib/demo/demoRepos.ts

import { Case, CaseStep, Reminder } from '@/lib/db/types';
import { currentScenario } from './demoConfig';

// In-memory storage (persists during session)
const storage = {
  cases: new Map<string, Case>(),
  steps: new Map<string, CaseStep>(),
  reminders: new Map<string, Reminder>(),
};

// Initialize with scenario data
storage.cases.set(currentScenario.case.id, currentScenario.case);
currentScenario.steps.forEach(step => storage.steps.set(step.id, step));

/**
- * Mock implementation matching production casesRepo interface
+ * Demo implementation matching production casesRepo interface.
+ * Components import this directly - no switching logic needed.
 */
-export const mockCasesRepo = {
+export const demoCasesRepo = {
  async getCase(caseId: string): Promise<Case | null> {
    await simulateDelay(100);
    return storage.cases.get(caseId) || null;
  },
  // ... rest of methods
};

-export const mockStepsRepo = {
+export const demoStepsRepo = {
  async getCaseSteps(caseId: string): Promise<CaseStep[]> {
    await simulateDelay(100);
    return Array.from(storage.steps.values())
      .filter(s => s.caseId === caseId)
      .sort((a, b) => a.order - b.order);
  },
  // ... rest of methods
};

-export const mockRemindersRepo = {
+export const demoRemindersRepo = {
  async createReminder(data: Omit<Reminder, 'id'>): Promise<Reminder> {
    await simulateDelay(150);
    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    storage.reminders.set(reminder.id, reminder);
    return reminder;
  },
  // ... rest of methods
};

// Simulate network delay
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Step 2: Update imports in components

**Example**: `components/dashboard/DeadlineList.tsx`

```diff
import { useQuery } from '@tanstack/react-query';
-import { mockStepsRepo } from '@/lib/demo/mockRepos';
+import { demoStepsRepo } from '@/lib/demo/demoRepos';
import { CaseStep } from '@/lib/db/types';

export function DeadlineList({ caseId }: DeadlineListProps) {
  const { data: steps, isLoading, error } = useQuery({
    queryKey: ['caseSteps', caseId],
-    queryFn: () => mockStepsRepo.getCaseSteps(caseId),
+    queryFn: () => demoStepsRepo.getCaseSteps(caseId),
  });
  // ...
}
```

**Find/Replace**: Run globally across codebase:
- `mockCasesRepo` → `demoCasesRepo`
- `mockStepsRepo` → `demoStepsRepo`
- `mockRemindersRepo` → `demoRemindersRepo`
- `lib/demo/mockRepos` → `lib/demo/demoRepos`

---

## Patch 3: Add PDF Template Preflight Validation

**File**: `lib/pdf/generator.ts`

**Rationale**: Catch template mismatches before attempting PDF generation, fail gracefully to HTML.

```diff
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';

export interface FormData {
  [fieldId: string]: string | boolean;
}

export interface PdfTemplate {
  path: string;
  fieldMap: Record<string, string>; // formFieldId -> pdfFieldName
}

+/**
+ * Validate PDF template has all required field mappings
+ */
+function validateTemplate(template: PdfTemplate, formData: FormData): boolean {
+  const requiredFields = Object.keys(formData);
+  const missingMappings = requiredFields.filter(field => !template.fieldMap[field]);
+
+  if (missingMappings.length > 0) {
+    console.warn('PDF template missing mappings for fields:', missingMappings);
+    return false;
+  }
+  return true;
+}
+
/**
 * Generate filled PDF with graceful error handling
+ *
+ * Returns Blob on success, null on failure (caller handles fallback to HTML)
 */
export async function generateFilledPdf(
  template: PdfTemplate,
  formData: FormData
): Promise<Blob | null> {
+  // Preflight check: validate template has all required mappings
+  if (!validateTemplate(template, formData)) {
+    console.warn('Template validation failed, will use HTML fallback');
+    return null;
+  }
+
  try {
    // Load template
    const templateBytes = await fetch(template.path).then(r => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);

    const form = pdfDoc.getForm();

    // Fill fields using mapping
    for (const [formFieldId, value] of Object.entries(formData)) {
      const pdfFieldName = template.fieldMap[formFieldId];
      if (!pdfFieldName) continue;

      try {
        const field = form.getField(pdfFieldName);

        if (field instanceof PDFTextField) {
          field.setText(String(value));
        } else if (field instanceof PDFCheckBox) {
          if (value) field.check();
          else field.uncheck();
        }
      } catch (fieldError) {
        console.warn(`Failed to fill field ${pdfFieldName}:`, fieldError);
        // Continue with other fields
      }
    }

    // Flatten form (make it non-editable)
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });

  } catch (error) {
    console.error('PDF generation failed:', error);
    return null; // Caller will handle fallback
  }
}

// ... rest of file (generateHtmlFallback, etc.)
```

---

## Patch 4: Update PDF Download Button UX

**File**: `components/forms/PdfDownloadButton.tsx` (or wherever PDF download is triggered)

**Rationale**: Make fallback transparent to user, don't show "error" messaging.

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { generateFilledPdf, generateHtmlFallback } from '@/lib/pdf/generator';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

interface PdfDownloadButtonProps {
  formTitle: string;
  template: PdfTemplate;
  formData: FormData;
}

export function PdfDownloadButton({ formTitle, template, formData }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'fallback'>('idle');

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Try PDF generation first
      const pdfBlob = await generateFilledPdf(template, formData);

      if (pdfBlob) {
        // Success - download PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formTitle}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        setStatus('success');
        toast.success('PDF ready for download!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // PDF failed - use HTML fallback
        const html = generateHtmlFallback(formTitle, formData);
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);

        // Open in new tab
        window.open(url, '_blank');

        setStatus('fallback');
        toast('Form ready to view and print', {
          icon: '📄',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Unable to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isGenerating ? (
        <>
          <FileText className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : status === 'success' ? (
        <>
          <Download className="mr-2 h-4 w-4" />
          ✓ PDF Ready - Download
        </>
      ) : status === 'fallback' ? (
        <>
          <FileText className="mr-2 h-4 w-4" />
          View Completed Form
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}
```

---

## Patch 5: Update Test Imports

**File**: `tests/demo/critical-paths.test.tsx`

**Rationale**: Update imports to use new `demoRepos` naming.

```diff
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
-import { mockStepsRepo } from '@/lib/demo/mockRepos';
+import { demoStepsRepo } from '@/lib/demo/demoRepos';

describe('Demo Critical Paths', () => {
  // ... other tests

  it('handles errors without crashing', async () => {
    // Mock API failure
-    vi.spyOn(mockStepsRepo, 'getCaseSteps').mockRejectedValue(new Error('API Error'));
+    vi.spyOn(demoStepsRepo, 'getCaseSteps').mockRejectedValue(new Error('API Error'));

    render(<DeadlineList caseId="ERROR-CASE" />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
    });
  });
});
```

---

## Summary of Changes

| Patch | Time to Apply | Risk | Benefit |
|-------|--------------|------|---------|
| 1. Remove feature flags | 5 min | Low | Eliminates branching, simplifies code |
| 2. Rename repos | 10 min | Low | Clearer naming, better intent |
| 3. PDF preflight | 5 min | Low | Catches errors before generation |
| 4. PDF button UX | 10 min | Low | Transparent fallback, better UX |
| 5. Test imports | 2 min | Low | Keeps tests working |

**Total time**: ~32 minutes
**Total risk reduction**: Prevents PDF demo failures, simplifies codebase

---

## Verification Checklist

After applying all patches:

- [ ] No `if (config.features.X)` checks remain in codebase
- [ ] All imports use `demoRepos`, not `mockRepos`
- [ ] PDF generation has preflight validation
- [ ] PDF button shows appropriate states (generating, success, fallback)
- [ ] Tests pass with updated imports
- [ ] TypeScript compiles with no errors
- [ ] ESLint shows no new warnings

---

## Next Steps

1. Apply patches 1-5 in order
2. Run `npm run type-check` to verify TypeScript
3. Run `npm run lint` to check for issues
4. Run smoke tests: `npm test tests/demo/critical-paths.test.tsx`
5. Test PDF generation with real template file
6. Test demo script end-to-end 3 times

If any patch fails, revert and consult architecture doc before proceeding.
