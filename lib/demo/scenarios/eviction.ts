import type { Case, CaseStep, Reminder } from '@/lib/db/types';
import type { GlossaryTerm } from '@/lib/validation';

/**
 * Complete eviction defense scenario for demo
 * 
 * Supports the 15-minute demo script with realistic Marion County eviction data
 */
export const evictionScenario = {
  case: {
    id: 'DEMO-EVICTION-001',
    userId: 'demo-user',
    caseType: 'eviction',
    jurisdiction: 'Marion County, IN',
    status: 'active' as const,
    title: 'Eviction Defense - Indianapolis',
    notes: `Case created through AI Copilot conversation.

**Eviction Details:**
- Notice Type: 30-day notice
- Date Received: October 10, 2025
- Location: Indianapolis, IN Marion County

**Initial User Concern:**
"I received a 30-day eviction notice and need help understanding my rights and next steps."`,
    progressPct: 20,
    totalSteps: 5,
    completedSteps: 1,
    currentStep: 2,
    createdAt: new Date('2025-10-01T09:00:00Z'),
    updatedAt: new Date('2025-10-15T14:30:00Z'),
  } satisfies Case,

  steps: [
    {
      id: 'demo-step-1',
      caseId: 'DEMO-EVICTION-001',
      name: 'Review Eviction Notice',
      order: 1,
      dueDate: new Date(Date.now() - 2 * 86400000), // 2 days ago (completed)
      isComplete: true,
      completedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      id: 'demo-step-2',
      caseId: 'DEMO-EVICTION-001',
      name: 'File Answer or Response',
      order: 2,
      dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now (urgent)
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-step-3',
      caseId: 'DEMO-EVICTION-001',
      name: 'Prepare for Court Hearing',
      order: 3,
      dueDate: new Date(Date.now() + 5 * 86400000), // 5 days from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-step-4',
      caseId: 'DEMO-EVICTION-001',
      name: 'Attend Court Hearing',
      order: 4,
      dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-step-5',
      caseId: 'DEMO-EVICTION-001',
      name: 'Follow Up on Court Decision',
      order: 5,
      dueDate: new Date(Date.now() + 10 * 86400000), // 10 days from now
      isComplete: false,
      completedAt: null,
    },
  ] satisfies CaseStep[],

  glossaryTerms: {
    'eviction-notice': {
      id: 'eviction-notice',
      term: 'Eviction Notice',
      definition: 'A formal written notice from your landlord stating their intent to terminate your tenancy. In Indiana, landlords must provide proper notice (typically 30 days for month-to-month tenancies) before filing an eviction lawsuit.',
      jurisdiction: 'Marion County, IN',
      lastReviewed: new Date('2025-10-01'),
    },
    'answer': {
      id: 'answer',
      term: 'Answer (Eviction)',
      definition: 'Your written response to an eviction lawsuit, filed with the court. In Indiana, you typically have 3-10 days to file an answer after being served. Filing an answer prevents a default judgment and allows you to present your defense in court.',
      jurisdiction: 'Marion County, IN',
      lastReviewed: new Date('2025-10-01'),
    },
    'default-judgment': {
      id: 'default-judgment',
      term: 'Default Judgment',
      definition: 'When you don\'t respond to an eviction lawsuit or appear in court, the judge can rule against you automatically. This means you lose the case without getting a chance to tell your side of the story.',
      jurisdiction: null,
      lastReviewed: new Date('2025-10-01'),
    },
    'habitability': {
      id: 'habitability',
      term: 'Habitability',
      definition: 'The legal requirement that rental properties must be safe and fit to live in. In Indiana, landlords must provide working plumbing, heating, and maintain the property in good repair. Habitability issues can be a valid defense against eviction.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
    'retaliation': {
      id: 'retaliation',
      term: 'Retaliatory Eviction',
      definition: 'An illegal eviction that happens because you complained about housing conditions, contacted authorities, or exercised your tenant rights. Indiana law protects tenants from retaliatory evictions in certain circumstances.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
    'stay-of-execution': {
      id: 'stay-of-execution',
      term: 'Stay of Execution',
      definition: 'A court order that temporarily delays an eviction, giving you more time to move out or resolve the situation. You can request this from the court, typically for 10-30 days, but must show good cause.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
  } satisfies Record<string, GlossaryTerm>,

  reminders: [
    {
      id: 'demo-reminder-1',
      userId: 'demo-user',
      caseId: 'DEMO-EVICTION-001',
      dueDate: new Date(Date.now() + 1 * 86400000), // 1 day before step 2 due
      channel: 'email' as const,
      message: 'Reminder: File your answer or response by tomorrow to avoid default judgment.',
      sent: false,
      createdAt: new Date(),
    },
    {
      id: 'demo-reminder-2',
      userId: 'demo-user',
      caseId: 'DEMO-EVICTION-001',
      dueDate: new Date(Date.now() + 4 * 86400000), // 1 day before step 3 due
      channel: 'email' as const,
      message: 'Reminder: Start preparing for your court hearing by gathering evidence and organizing documents.',
      sent: false,
      createdAt: new Date(),
    },
  ] satisfies Reminder[],

  // Forms data for Epic 18 (Smart Form Filler)
  forms: {
    appearance: {
      id: 'marion-appearance',
      title: 'Appearance (Marion County)',
      description: 'Tell the court you\'re participating in this eviction case',
      fields: [
        {
          id: 'full_name',
          label: 'Your full legal name',
          type: 'text',
          required: true,
          helpText: 'Use the name exactly as it appears on the court summons',
          prefill: 'Alex Rodriguez',
        },
        {
          id: 'case_number',
          label: 'Case number',
          type: 'text',
          required: true,
          prefill: '49C01-2510-SC-001234',
          helpText: 'Found at the top of your eviction notice',
        },
        {
          id: 'mailing_address',
          label: 'Your mailing address',
          type: 'text',
          required: true,
          helpText: 'Where the court should send you documents',
          prefill: '123 Main St, Indianapolis, IN 46204',
        },
        {
          id: 'phone',
          label: 'Phone number',
          type: 'tel',
          required: false,
          helpText: 'Optional but recommended for court updates',
          prefill: '(317) 555-0123',
        },
        {
          id: 'email',
          label: 'Email address',
          type: 'email',
          required: false,
          helpText: 'Optional - for electronic court notifications',
        },
      ],
      // Note: PDF template path would be used for actual PDF generation
      // For demo, we show HTML fallback or simulated PDF
      pdfTemplate: '/pdf/templates/marion/appearance.pdf',
      pdfFieldMap: {
        full_name: 'DefendantName',
        case_number: 'CaseNumber',
        mailing_address: 'MailingAddress',
        phone: 'PhoneNumber',
        email: 'EmailAddress',
      },
    },
  },
};

export type EvictionScenario = typeof evictionScenario;

