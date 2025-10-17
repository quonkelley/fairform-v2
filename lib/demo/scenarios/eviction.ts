import type { Case, CaseStep, Reminder } from '@/lib/db/types';
import type { GlossaryTerm } from '@/lib/validation';
import { createEnhancedStep } from '@/lib/journeys/stepMapper';

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
    jurisdiction: 'Marion County, IN - Center Township Small Claims Court',
    caseNumber: '49K01-2510-EV-001234',
    status: 'active' as const,
    title: 'Eviction Defense - Indianapolis',
    notes: `Case created through AI Copilot conversation.

**Eviction Details:**
- Notice Type: 10-day notice to pay or quit
- Date Received: October 10, 2025
- Location: Indianapolis, IN Marion County - Center Township
- Court: Center Township Small Claims Court
- Case Number: 49K01-2510-EV-001234

**Initial User Concern:**
"I received a 10-day eviction notice and need help understanding my rights and next steps."`,
    progressPct: 20,
    totalSteps: 5,
    completedSteps: 1,
    currentStep: 2,
    createdAt: new Date('2025-10-01T09:00:00Z'),
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    court: 'Center Township Small Claims Court'
  } satisfies Case,

  steps: [
    createEnhancedStep('DEMO-EVICTION-001', 1, 'Review Eviction Notice', 'review', {
      description: 'Understand the eviction notice and your rights',
      instructions: [
        'Carefully read the eviction notice to understand the reason and timeline',
        'In most jurisdictions, you have a specific number of days to respond or move out',
        'You can contest the eviction if you believe it\'s wrongful or if proper procedures weren\'t followed',
        'Keep copies of all documents and correspondence related to the eviction',
        'Note: Eviction laws vary significantly by state - check your local tenant rights',
      ],
      estimatedTime: 30,
      disclaimer: 'This is general information, not legal advice. Consult a tenant rights organization or attorney for specific guidance.',
      dueDateOffset: 2, // 2 days after notice
      isComplete: true,
      completedAt: new Date('2025-10-12T09:00:00Z'),
    }),
    createEnhancedStep('DEMO-EVICTION-001', 2, 'File Answer or Response', 'form', {
      description: 'Respond to the eviction notice within the required timeframe',
      instructions: [
        'You must file an answer with the court within the specified timeframe (usually 3-7 days)',
        'You can file a general denial or specific defenses to the eviction',
        'You\'ll need to pay a filing fee unless you qualify for a fee waiver',
        'Keep proof of filing and any court dates scheduled',
        'Note: Missing the deadline usually results in automatic eviction - contact legal aid immediately if you\'re past due',
      ],
      estimatedTime: 60,
      disclaimer: 'This is general information, not legal advice. Time limits are critical - seek immediate legal help if needed.',
      dueDateOffset: 10, // 10 days after notice (urgent)
      isComplete: false,
      completedAt: null,
    }),
    createEnhancedStep('DEMO-EVICTION-001', 3, 'Prepare for Court Hearing', 'review', {
      description: 'Gather evidence and prepare your defense',
      instructions: [
        'Organize all evidence including lease, rent receipts, repair requests, and photos',
        'You can present defenses like habitability issues, retaliation, or improper notice',
        'Prepare a timeline of events and gather witness statements if applicable',
        'Practice explaining your case clearly and bring multiple copies of all documents',
        'Note: Court procedures vary - consider consulting with legal aid for case preparation',
      ],
      estimatedTime: 120,
      disclaimer: 'This is general information, not legal advice. Consider seeking legal representation for court proceedings.',
      dueDateOffset: 20, // 2 weeks after notice
      isComplete: false,
      completedAt: null,
    }),
    createEnhancedStep('DEMO-EVICTION-001', 4, 'Attend Court Hearing', 'meeting', {
      description: 'Present your case to the judge',
      instructions: [
        'Arrive early and dress professionally for court',
        'The judge will hear both sides and may ask questions about your case',
        'Present your evidence clearly and answer questions honestly',
        'Be respectful to the judge and other parties',
        'Bring all relevant documents and any witnesses you have',
      ],
      estimatedTime: 90,
      disclaimer: 'This is general information, not legal advice. Court procedures can be complex - consider legal representation.',
      dueDateOffset: 27, // 3+ weeks after notice (hearing date)
      isComplete: false,
      completedAt: null,
    }),
    createEnhancedStep('DEMO-EVICTION-001', 5, 'Follow Up on Court Decision', 'communication', {
      description: 'Understand the court\'s decision and next steps',
      instructions: [
        'Review the court\'s written decision carefully',
        'If you won, ensure the landlord complies with the court order',
        'If you lost, understand your options for appeal or moving out',
        'Keep copies of all court documents and orders',
        'Contact legal aid if you need help understanding the decision',
      ],
      estimatedTime: 45,
      disclaimer: 'This is general information, not legal advice. Court decisions can be complex - seek legal help if needed.',
      dueDateOffset: 34, // 1 week after hearing
      isComplete: false,
      completedAt: null,
    }),
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
          prefill: '49K01-2510-EV-001234',
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

