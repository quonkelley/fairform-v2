# Demo Architecture: Robust & Production-Ready Patterns

**Philosophy**: Build demo features using production-quality patterns with demo data. This ensures the demo won't break under pressure while keeping development focused and fast.

---

## 🎯 Core Principles

1. **Demo data, production patterns**: Use real interfaces, dependency injection, error handling
2. **Resilient by default**: Every UI state (loading, empty, error) must be implemented
3. **Testable & swappable**: 5 critical smoke tests + ability to swap scenarios easily
4. **Graceful degradation**: Fallbacks for complex features (PDF, AI)
5. **One mode**: Everything in this repo is demo code (no prod/demo separation)

---

## 🏗️ Architecture Overview

### Data Layer Strategy

**Problem with naive hardcoding**: Components importing constants directly = brittle, untestable, hard to swap.

**Solution**: Demo repositories that match production interfaces.

```
lib/
  db/
    types.ts              # Shared types (Case, Step, Reminder, etc.)
    casesRepo.ts          # Production interface (currently Firestore)

  demo/
    scenarios/
      eviction.ts         # Complete eviction case scenario
      smallClaims.ts      # Complete small claims scenario
      index.ts            # Export current scenario
    demoRepos.ts          # Implements same interfaces as real repos
    demoConfig.ts         # Scenario selection + timing constants

  copilot/
    intents.ts            # Intent classification (reusable)
    responses.ts          # Response generation

  pdf/
    generator.ts          # PDF generation with preflight + fallback
    templates.ts          # Template metadata
```

**Key benefit**: Components call `casesRepo.getCase(id)` whether using mock or real data.

---

## 📦 Demo Scenarios (Structured Data)

### `/lib/demo/scenarios/eviction.ts`

```typescript
import { Case, CaseStep, Reminder, GlossaryEntry } from '@/lib/db/types';

export const evictionScenario = {
  case: {
    id: 'DEMO-EVICTION-001',
    userId: 'demo-user',
    caseType: 'Eviction',
    court: 'Marion County Small Claims Court',
    caseNumber: '49C01-2509-SC-001234',
    status: 'active',
    createdAt: new Date('2025-10-01'),
    hearingDate: new Date('2025-11-06'),
    parties: {
      plaintiff: 'Property Management LLC',
      defendant: 'Alex Rodriguez (Demo)'
    },
    jurisdiction: 'Marion County, IN',
    currentStep: 'file-appearance'
  } satisfies Case,

  steps: [
    {
      id: 'step-1',
      caseId: 'DEMO-EVICTION-001',
      title: 'File Notice of Appearance',
      description: 'Submit your appearance form to avoid default judgment',
      dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now
      status: 'pending',
      order: 1,
      isOptional: false,
      glossaryKeys: ['appearance', 'default-judgment']
    },
    {
      id: 'step-2',
      caseId: 'DEMO-EVICTION-001',
      title: 'Gather Evidence',
      description: 'Collect rent receipts, repair requests, photos of conditions',
      dueDate: new Date(Date.now() + 5 * 86400000),
      status: 'pending',
      order: 2,
      isOptional: false,
      glossaryKeys: ['evidence', 'discovery']
    },
    {
      id: 'step-3',
      caseId: 'DEMO-EVICTION-001',
      title: 'Prepare Your Defense',
      description: 'Organize your timeline and key arguments',
      dueDate: new Date(Date.now() + 6 * 86400000),
      status: 'pending',
      order: 3,
      isOptional: false,
      glossaryKeys: ['defense', 'burden-of-proof']
    },
    {
      id: 'step-4',
      caseId: 'DEMO-EVICTION-001',
      title: 'Court Hearing',
      description: 'Attend your scheduled hearing at Marion County Court',
      dueDate: new Date(Date.now() + 7 * 86400000),
      status: 'pending',
      order: 4,
      isOptional: false,
      glossaryKeys: ['hearing', 'small-claims-procedure']
    }
  ] satisfies CaseStep[],

  glossary: {
    'appearance': {
      term: 'Notice of Appearance',
      definition: 'A form that tells the court you\'re participating in the case. Filing this prevents you from losing by default.',
      context: 'eviction',
      relatedTerms: ['default-judgment', 'pro-se']
    },
    'default-judgment': {
      term: 'Default Judgment',
      definition: 'When you don\'t respond or appear, the court can rule against you automatically.',
      context: 'general',
      relatedTerms: ['appearance', 'motion-to-set-aside']
    },
    'evidence': {
      term: 'Evidence',
      definition: 'Documents, photos, messages, or other materials that support your side of the story.',
      context: 'general',
      relatedTerms: ['discovery', 'exhibits']
    },
    'hearing': {
      term: 'Court Hearing',
      definition: 'Your scheduled time to present your case to the judge. In small claims, this is usually informal.',
      context: 'small-claims',
      relatedTerms: ['trial', 'testimony']
    }
  } satisfies Record<string, GlossaryEntry>,

  forms: {
    appearance: {
      id: 'marion-appearance',
      title: 'Appearance (Marion County)',
      description: 'Tell the court you\'re participating in this case',
      fields: [
        {
          id: 'full_name',
          label: 'Your full legal name',
          type: 'text',
          required: true,
          helpText: 'Use the name exactly as it appears on the court summons'
        },
        {
          id: 'case_number',
          label: 'Case number',
          type: 'text',
          required: true,
          prefill: '49C01-2509-SC-001234', // From case
          helpText: 'Found at the top of your court notice'
        },
        {
          id: 'mailing_address',
          label: 'Your mailing address',
          type: 'text',
          required: true,
          helpText: 'Where the court should send you documents'
        },
        {
          id: 'phone',
          label: 'Phone number',
          type: 'tel',
          required: false,
          helpText: 'Optional but recommended for court updates'
        }
      ],
      pdfTemplate: '/pdf/templates/marion/appearance.pdf',
      pdfFieldMap: {
        full_name: 'DefendantName',
        case_number: 'CaseNumber',
        mailing_address: 'MailingAddress',
        phone: 'PhoneNumber'
      }
    }
  }
};
```

### `/lib/demo/demoConfig.ts`

```typescript
import { evictionScenario } from './scenarios/eviction';
// import { smallClaimsScenario } from './scenarios/smallClaims';

/**
 * LOCKED FOR PUBLIC DEMO - DO NOT CHANGE
 *
 * For internal testing only, uncomment alternative scenarios:
 * export const currentScenario = smallClaimsScenario;
 */
export const currentScenario = evictionScenario;

/**
 * Demo configuration
 *
 * NOTE: No feature flags - this is single-mode demo code.
 * All features (PDF, OCR simulation, reminders) are always enabled
 * with their appropriate implementations (real PDF gen, simulated OCR, visual reminders).
 */
export const demoConfig = {
  userId: 'demo-user',
  userName: 'Alex Rodriguez',
  userEmail: 'demo@fairform.app',

  // Timing for animations and simulated delays (ms)
  timing: {
    scanDelay: 1500,        // Simulated OCR processing
    aiResponseDelay: 800,   // Copilot typing indicator
    pdfGenerationDelay: 1200, // PDF processing indicator
  }
};
```

---

## 🔌 Demo Repositories

### `/lib/demo/demoRepos.ts`

**Naming**: Using `demoCasesRepo` instead of `mockCasesRepo` to signal this is the real implementation for demo mode, not temporary/test code.

```typescript
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
 * Demo implementation matching production casesRepo interface.
 * Components import this directly - no switching logic needed.
 */
export const demoCasesRepo = {
  async getCase(caseId: string): Promise<Case | null> {
    await simulateDelay(100);
    return storage.cases.get(caseId) || null;
  },

  async getUserCases(userId: string): Promise<Case[]> {
    await simulateDelay(150);
    return Array.from(storage.cases.values())
      .filter(c => c.userId === userId);
  },

  async createCase(data: Partial<Case>): Promise<Case> {
    await simulateDelay(200);
    const newCase: Case = {
      id: `DEMO-${Date.now()}`,
      userId: data.userId || 'demo-user',
      ...data as Case,
      createdAt: new Date(),
    };
    storage.cases.set(newCase.id, newCase);
    return newCase;
  },

  async updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
    await simulateDelay(150);
    const existing = storage.cases.get(caseId);
    if (!existing) throw new Error('Case not found');

    const updated = { ...existing, ...updates };
    storage.cases.set(caseId, updated);
    return updated;
  }
};

export const demoStepsRepo = {
  async getCaseSteps(caseId: string): Promise<CaseStep[]> {
    await simulateDelay(100);
    return Array.from(storage.steps.values())
      .filter(s => s.caseId === caseId)
      .sort((a, b) => a.order - b.order);
  },

  async updateStep(stepId: string, updates: Partial<CaseStep>): Promise<CaseStep> {
    await simulateDelay(100);
    const existing = storage.steps.get(stepId);
    if (!existing) throw new Error('Step not found');

    const updated = { ...existing, ...updates };
    storage.steps.set(stepId, updated);
    return updated;
  }
};

export const demoRemindersRepo = {
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

  async getStepReminders(stepId: string): Promise<Reminder[]> {
    await simulateDelay(100);
    return Array.from(storage.reminders.values())
      .filter(r => r.stepId === stepId);
  }
};

// Simulate network delay
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 🤖 AI Copilot (Robust Intent Classification)

### `/lib/copilot/intents.ts`

```typescript
import OpenAI from 'openai';

// Fallback to keyword matching if API fails
const KEYWORD_PATTERNS = {
  CREATE_CASE: [
    /eviction.*notice/i,
    /small.*claims/i,
    /court.*summons/i,
    /lawsuit/i
  ],
  ASK_DEADLINE: [
    /when.*due/i,
    /deadline/i,
    /how.*long/i
  ],
  REQUEST_FORM: [
    /fill.*form/i,
    /need.*form/i,
    /paperwork/i
  ]
};

export type Intent =
  | { type: 'CREATE_CASE'; confidence: number; caseType?: string }
  | { type: 'ASK_QUESTION'; confidence: number; topic?: string }
  | { type: 'REQUEST_FORM'; confidence: number; formType?: string }
  | { type: 'SET_REMINDER'; confidence: number; context?: string }
  | { type: 'UNKNOWN'; confidence: number };

/**
 * Classify user intent using LLM with keyword fallback
 */
export async function classifyIntent(message: string): Promise<Intent> {
  try {
    // Try LLM classification first (robust)
    return await classifyWithLLM(message);
  } catch (error) {
    console.warn('LLM classification failed, using keyword fallback:', error);
    // Fallback to keyword matching (safe demo degradation)
    return classifyWithKeywords(message);
  }
}

async function classifyWithLLM(message: string): Promise<Intent> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Classify the user's intent from this message:

"${message}"

Available intents:
- CREATE_CASE: User wants to start a new legal case
- ASK_QUESTION: User has a question about process/terms
- REQUEST_FORM: User wants to fill out a form
- SET_REMINDER: User wants a reminder for something
- UNKNOWN: None of the above

Return JSON only:
{
  "intent": "CREATE_CASE|ASK_QUESTION|REQUEST_FORM|SET_REMINDER|UNKNOWN",
  "confidence": 0.0-1.0,
  "metadata": { /* optional context */ }
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 150,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from LLM');

  const parsed = JSON.parse(content);
  return {
    type: parsed.intent,
    confidence: parsed.confidence,
    ...parsed.metadata
  };
}

function classifyWithKeywords(message: string): Intent {
  for (const [intent, patterns] of Object.entries(KEYWORD_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        return {
          type: intent as any,
          confidence: 0.6, // Lower confidence for keyword matching
        };
      }
    }
  }

  return { type: 'UNKNOWN', confidence: 0.3 };
}
```

---

## 📄 PDF Generation (With Fallback)

### `/lib/pdf/generator.ts`

```typescript
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';

export interface FormData {
  [fieldId: string]: string | boolean;
}

export interface PdfTemplate {
  path: string;
  fieldMap: Record<string, string>; // formFieldId -> pdfFieldName
}

/**
 * Validate PDF template has all required field mappings
 */
function validateTemplate(template: PdfTemplate, formData: FormData): boolean {
  const requiredFields = Object.keys(formData);
  const missingMappings = requiredFields.filter(field => !template.fieldMap[field]);

  if (missingMappings.length > 0) {
    console.warn('PDF template missing mappings for fields:', missingMappings);
    return false;
  }
  return true;
}

/**
 * Generate filled PDF with graceful error handling
 *
 * Returns Blob on success, null on failure (caller handles fallback to HTML)
 */
export async function generateFilledPdf(
  template: PdfTemplate,
  formData: FormData
): Promise<Blob | null> {
  // Preflight check: validate template has all required mappings
  if (!validateTemplate(template, formData)) {
    console.warn('Template validation failed, will use HTML fallback');
    return null;
  }

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

/**
 * Fallback: Generate HTML preview if PDF fails
 */
export function generateHtmlFallback(
  formTitle: string,
  formData: FormData
): string {
  const entries = Object.entries(formData)
    .map(([key, value]) => `
      <div class="field">
        <label>${formatFieldLabel(key)}</label>
        <div class="value">${value}</div>
      </div>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${formTitle}</title>
      <style>
        body { font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 1rem; }
        .field { margin: 1rem 0; padding: 0.5rem; border: 1px solid #ddd; }
        label { font-weight: bold; display: block; margin-bottom: 0.25rem; }
        .value { color: #333; }
      </style>
    </head>
    <body>
      <h1>${formTitle}</h1>
      <p><em>Note: PDF generation unavailable. Please print this page or save as PDF.</em></p>
      ${entries}
    </body>
    </html>
  `;
}

function formatFieldLabel(fieldId: string): string {
  return fieldId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## 🎨 UI Components (Resilient States)

### Example: `/components/dashboard/DeadlineList.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { demoStepsRepo } from '@/lib/demo/demoRepos';
import { CaseStep } from '@/lib/db/types';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlossaryHint } from '@/components/glossary/GlossaryHint';
import { formatDistanceToNow } from 'date-fns';

interface DeadlineListProps {
  caseId: string;
}

export function DeadlineList({ caseId }: DeadlineListProps) {
  const { data: steps, isLoading, error } = useQuery({
    queryKey: ['caseSteps', caseId],
    queryFn: () => demoStepsRepo.getCaseSteps(caseId),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>Unable to load deadlines. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!steps || steps.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-300 rounded-lg">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No deadlines yet</p>
        <p className="text-sm text-gray-500 mt-1">
          They'll appear here once your case plan is generated
        </p>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <DeadlineCard
          key={step.id}
          step={step}
          index={index}
        />
      ))}
    </div>
  );
}

function DeadlineCard({ step, index }: { step: CaseStep; index: number }) {
  const daysUntilDue = Math.ceil(
    (step.dueDate.getTime() - Date.now()) / 86400000
  );
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0;

  return (
    <div
      className="p-4 border rounded-lg transition-all hover:shadow-md"
      style={{
        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{step.title}</h3>
            {step.glossaryKeys?.map(key => (
              <GlossaryHint key={key} term={key} />
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {step.description}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {step.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : isOverdue ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Clock className="h-4 w-4 text-gray-400" />
            )}

            <span
              className={`text-sm ${
                isOverdue
                  ? 'text-red-600 font-semibold'
                  : isUrgent
                  ? 'text-orange-600 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              {step.status === 'completed'
                ? 'Completed'
                : `Due ${formatDistanceToNow(step.dueDate, { addSuffix: true })}`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Strategy

### Smoke Tests (5 critical paths)

**File**: `/tests/demo/critical-paths.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Demo Critical Paths', () => {
  it('copilot creates case from conversation', async () => {
    const user = userEvent.setup();
    render(<DemoPage />);

    // Type message
    const input = screen.getByRole('textbox');
    await user.type(input, 'I got an eviction notice for next week');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Wait for case creation suggestion
    await waitFor(() => {
      expect(screen.getByText(/create case/i)).toBeInTheDocument();
    });

    // Create case
    await user.click(screen.getByRole('button', { name: /create case/i }));

    // Verify redirect to case page
    await waitFor(() => {
      expect(screen.getByText(/eviction/i)).toBeInTheDocument();
    });
  });

  it('PDF generation completes successfully', async () => {
    const user = userEvent.setup();
    render(<FormPage formId="appearance" caseId="DEMO-EVICTION-001" />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), 'Alex Rodriguez');
    await user.type(screen.getByLabelText(/case number/i), '49C01-2509-SC-001234');

    // Download PDF
    await user.click(screen.getByRole('button', { name: /download pdf/i }));

    // Verify PDF generated (check for download or success message)
    await waitFor(() => {
      expect(screen.getByText(/pdf ready/i)).toBeInTheDocument();
    });
  });

  it('reminder creation shows feedback', async () => {
    const user = userEvent.setup();
    render(<CaseDashboard caseId="DEMO-EVICTION-001" />);

    await waitFor(() => {
      expect(screen.getByText(/file appearance/i)).toBeInTheDocument();
    });

    // Click remind button
    await user.click(screen.getByRole('button', { name: /remind me/i }));

    // Verify feedback
    await waitFor(() => {
      expect(screen.getByText(/reminder set/i)).toBeInTheDocument();
    });
  });

  it('handles empty states gracefully', async () => {
    render(<DeadlineList caseId="EMPTY-CASE" />);

    await waitFor(() => {
      expect(screen.getByText(/no deadlines yet/i)).toBeInTheDocument();
    });
  });

  it('handles errors without crashing', async () => {
    // Mock API failure
    vi.spyOn(demoStepsRepo, 'getCaseSteps').mockRejectedValue(new Error('API Error'));

    render(<DeadlineList caseId="ERROR-CASE" />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
    });
  });
});
```

### Visual Regression Tests

Use Chromatic or Percy to snapshot key screens:

```typescript
// tests/visual/demo-screens.stories.tsx
import { DeadlineList } from '@/components/dashboard/DeadlineList';

export default {
  title: 'Demo/Screens',
  parameters: { chromatic: { viewports: [375, 1200] } }
};

export const CaseDashboardLoaded = () => <CaseDashboard caseId="DEMO-EVICTION-001" />;
export const CaseDashboardEmpty = () => <CaseDashboard caseId="EMPTY-CASE" />;
export const CaseDashboardError = () => <CaseDashboard caseId="ERROR-CASE" />;
```

---

## 🚀 Implementation Checklist

### Phase 1: Foundation (Day 1)
- [ ] Create demo scenario files (`eviction.ts`, `smallClaims.ts`)
- [ ] Implement demo repositories with delay simulation
- [ ] Add config file with timing constants (NO feature flags)
- [ ] Set up error boundaries at app level

### Phase 2: Core Features (Days 2-3)
- [ ] Implement AI copilot with LLM + keyword fallback
- [ ] Build deadline list with all states (loading, empty, error, success)
- [ ] Implement reminder creation with visual feedback
- [ ] Add glossary hints component

### Phase 3: Form & PDF (Day 4)
- [ ] Build conversational form component
- [ ] Implement PDF generation with fallback to HTML
- [ ] Add confetti/toast polish
- [ ] Test PDF field mapping with real template

### Phase 4: Testing & Polish (Day 5)
- [ ] Write 5 smoke tests for critical paths
- [ ] Set up visual regression tests (Chromatic/Percy)
- [ ] Test demo script end-to-end 3 times
- [ ] Add loading skeletons and transitions

---

## 📊 Risk Mitigation

| Risk | Mitigation | Fallback |
|------|-----------|----------|
| **PDF generation fails** | Tested generator with error handling | HTML preview page |
| **AI API down** | Keyword classification fallback | Canned responses |
| **User goes off-script** | All UI states implemented | Graceful empty/error states |
| **Network issues** | Simulate delays in mock repos | Works offline (demo data) |
| **Last-minute changes** | Scenario swapping in one config file | Quick data updates |

---

## ✅ Acceptance Criteria (Must-Pass Checks)

Before the public demo, these scenarios must work flawlessly:

### 1. Chat → Case Creation (0-2 min)
- ✅ User types "I got an eviction notice for next week"
- ✅ Copilot response appears in <0.8s
- ✅ "Create Case" button visible and clickable
- ✅ Navigation to `/case/DEMO-EVICTION-001` succeeds
- ✅ No console errors

### 2. Auto-Plan Generation (2-4 min)
- ✅ "Generate Plan" button triggers action
- ✅ 4 deadlines appear with staggered animation (100ms delay each)
- ✅ Each deadline shows due date relative to today
- ✅ Hover "Default Judgment" → glossary tooltip appears
- ✅ Tooltip text is readable and accurate

### 3. Reminder Setting (4-5 min)
- ✅ "Remind Me" button clickable on first deadline
- ✅ Toast notification appears: "Reminder scheduled"
- ✅ Badge updates to "Synced" or similar indicator
- ✅ State persists if user navigates away and back

### 4. Form Filling & PDF (5-10 min)
- ✅ "Fill Appearance Form" navigates to form page
- ✅ 2 fields pre-filled (case number, defendant name)
- ✅ User can answer 2-3 additional questions
- ✅ "Download PDF" button triggers generation
- ✅ PDF downloads successfully OR HTML fallback opens
- ✅ No visible error state to audience
- ✅ Confetti animation plays on success
- ✅ Form data visible in PDF/HTML output

### 5. Hearing Day Mode (10-13 min)
- ✅ "Hearing Day Mode" link/button accessible
- ✅ Full-screen checklist with 5 items appears
- ✅ Each item can be checked off
- ✅ "You're Ready" banner animates in after all checked
- ✅ Visual polish (transitions, icons) works

### 6. Resilience Test (13-15 min)
- ✅ Navigate back to case dashboard
- ✅ All data still correct (no state loss)
- ✅ No console errors
- ✅ No broken layouts on different screen sizes
- ✅ Loading states appear for any async actions
- ✅ Empty states work if navigating to fresh data
- ✅ Error boundaries catch any unexpected failures

### Blocking Issues (Demo Killers)
These issues MUST be fixed before going live:
- ❌ PDF generation crashes the app
- ❌ Navigation breaks between pages
- ❌ Data doesn't load (stuck in loading state)
- ❌ Console errors visible during happy path
- ❌ Layout breaks on projected screen resolution
- ❌ Copilot doesn't respond to demo script input

---

## 🎬 15-Minute Demo Script

1. **Chat → Case** (2 min)
   - Type: "I got an eviction notice for next week"
   - Click **Create Case** suggestion
   - Arrive at case dashboard

2. **Auto-Plan** (2 min)
   - Click **Generate Plan**
   - Show deadlines with staggered animation
   - Hover glossary hint on "Default Judgment"

3. **Remind Me** (1 min)
   - Click **Remind Me** on first deadline
   - Show toast confirmation
   - Badge updates to "Synced"

4. **Fill Form** (5 min)
   - Click **Fill Appearance Form**
   - Answer 3-4 questions (pre-filled visible)
   - Click **Download PDF**
   - Confetti + PDF downloads

5. **Hearing Prep** (3 min)
   - Click **Hearing Day Mode**
   - Check off 5 items
   - "You're Ready" banner appears

6. **Q&A** (2 min)
   - Navigate back to any screen
   - Show robustness (no crashes)

---

## 💡 Why This Approach Works

✅ **Demo won't break**: Error handling + fallbacks everywhere
✅ **Easy to swap scenarios**: One config file change
✅ **Testable**: Mock repos match production interfaces
✅ **Fast to build**: Structured data + clear patterns
✅ **Production-ready patterns**: Can evolve to real app
✅ **Handles pressure**: Works offline, degrades gracefully

---

## 🔄 Future: Moving to Production

When ready to build the real app:

1. Replace mock repos with real Firestore repos (same interface)
2. Add authentication layer
3. Replace demo scenarios with user input forms
4. Add real OCR/AI integrations
5. Implement persistent storage

**Components don't change** because they use the same interfaces.

---

## Questions?

This architecture balances **speed** (demo-focused) with **robustness** (won't break on stage). The key insight: use production patterns with demo data, not hacky code that only works under perfect conditions.
