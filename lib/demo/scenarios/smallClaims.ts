import type { Case, CaseStep, Reminder } from '@/lib/db/types';
import type { GlossaryTerm } from '@/lib/validation';

/**
 * Complete small claims scenario for demo
 * 
 * Alternate demo scenario for variety in testing and presentations
 */
export const smallClaimsScenario = {
  case: {
    id: 'DEMO-SMALLCLAIMS-001',
    userId: 'demo-user',
    caseType: 'small_claims',
    jurisdiction: 'Marion County, IN',
    status: 'active' as const,
    title: 'Small Claims Matter - Indianapolis',
    notes: `Case created through AI Copilot conversation.

**Small Claims Details:**
- Dispute Type: Property damage
- Amount: $2,500
- Location: Indianapolis, IN Marion County

**Initial User Concern:**
"My landlord is refusing to return my security deposit after I moved out, even though I left the apartment in good condition. They're claiming damages that weren't my fault."`,
    progressPct: 0,
    totalSteps: 5,
    completedSteps: 0,
    currentStep: 1,
    createdAt: new Date('2025-10-10T10:00:00Z'),
    updatedAt: new Date('2025-10-15T14:30:00Z'),
  } satisfies Case,

  steps: [
    {
      id: 'demo-sc-step-1',
      caseId: 'DEMO-SMALLCLAIMS-001',
      name: 'File Your Claim',
      order: 1,
      dueDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-sc-step-2',
      caseId: 'DEMO-SMALLCLAIMS-001',
      name: 'Serve the Defendant',
      order: 2,
      dueDate: new Date(Date.now() + 10 * 86400000), // 10 days from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-sc-step-3',
      caseId: 'DEMO-SMALLCLAIMS-001',
      name: 'Prepare for Hearing',
      order: 3,
      dueDate: new Date(Date.now() + 25 * 86400000), // ~3.5 weeks from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-sc-step-4',
      caseId: 'DEMO-SMALLCLAIMS-001',
      name: 'Attend Court Hearing',
      order: 4,
      dueDate: new Date(Date.now() + 30 * 86400000), // ~1 month from now
      isComplete: false,
      completedAt: null,
    },
    {
      id: 'demo-sc-step-5',
      caseId: 'DEMO-SMALLCLAIMS-001',
      name: 'Collect Judgment',
      order: 5,
      dueDate: new Date(Date.now() + 45 * 86400000), // ~6 weeks from now
      isComplete: false,
      completedAt: null,
    },
  ] satisfies CaseStep[],

  glossaryTerms: {
    'small-claims': {
      id: 'small-claims',
      term: 'Small Claims Court',
      definition: 'A simplified court process for disputes involving smaller amounts of money (up to $6,000 in Indiana). The process is faster, less formal, and doesn\'t require an attorney, making it more accessible for self-represented litigants.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
    'plaintiff': {
      id: 'plaintiff',
      term: 'Plaintiff',
      definition: 'The person who files the small claims case. This is you - the person seeking money or other relief from the defendant. The plaintiff has the burden of proving their case.',
      jurisdiction: null,
      lastReviewed: new Date('2025-10-01'),
    },
    'defendant': {
      id: 'defendant',
      term: 'Defendant',
      definition: 'The person being sued in a small claims case. This is the person you believe owes you money or needs to remedy a situation. The defendant has the right to present a defense.',
      jurisdiction: null,
      lastReviewed: new Date('2025-10-01'),
    },
    'service-of-process': {
      id: 'service-of-process',
      term: 'Service of Process',
      definition: 'The legal requirement to officially notify the defendant about your lawsuit. In Indiana, you cannot serve the papers yourself - you must have someone over 18 who isn\'t involved in the case deliver them, or use certified mail or a process server.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
    'proof-of-service': {
      id: 'proof-of-service',
      term: 'Proof of Service',
      definition: 'A document that proves the defendant was properly notified about your lawsuit. The person who served the papers must complete this form and file it with the court. Without proper proof of service, your case may be delayed.',
      jurisdiction: null,
      lastReviewed: new Date('2025-10-01'),
    },
    'judgment': {
      id: 'judgment',
      term: 'Judgment',
      definition: 'The court\'s final decision in your case. If you win, the judgment will specify how much the defendant owes you. The defendant typically has 30 days to pay. If they don\'t pay voluntarily, you may need to take additional steps to collect.',
      jurisdiction: null,
      lastReviewed: new Date('2025-10-01'),
    },
    'security-deposit': {
      id: 'security-deposit',
      term: 'Security Deposit',
      definition: 'Money a tenant pays to a landlord at the start of a lease, held to cover potential damages or unpaid rent. In Indiana, landlords must return the deposit within 45 days after move-out, with an itemized list of any deductions. Failure to do so may entitle you to damages.',
      jurisdiction: 'Indiana',
      lastReviewed: new Date('2025-10-01'),
    },
  } satisfies Record<string, GlossaryTerm>,

  reminders: [
    {
      id: 'demo-sc-reminder-1',
      userId: 'demo-user',
      caseId: 'DEMO-SMALLCLAIMS-001',
      dueDate: new Date(Date.now() + 2 * 86400000), // 1 day before step 1 due
      channel: 'email' as const,
      message: 'Reminder: File your small claims form tomorrow to get your case started.',
      sent: false,
      createdAt: new Date(),
    },
  ] satisfies Reminder[],

  forms: {
    claim: {
      id: 'marion-small-claims',
      title: 'Small Claims Complaint (Marion County)',
      description: 'File your small claims case to recover money owed',
      fields: [
        {
          id: 'plaintiff_name',
          label: 'Your name (plaintiff)',
          type: 'text',
          required: true,
          helpText: 'Your full legal name',
          prefill: 'Alex Rodriguez',
        },
        {
          id: 'plaintiff_address',
          label: 'Your address',
          type: 'text',
          required: true,
          prefill: '123 Main St, Indianapolis, IN 46204',
        },
        {
          id: 'defendant_name',
          label: 'Defendant name',
          type: 'text',
          required: true,
          helpText: 'Full name of person or business you\'re suing',
          prefill: 'Riverside Property Management LLC',
        },
        {
          id: 'defendant_address',
          label: 'Defendant address',
          type: 'text',
          required: true,
          helpText: 'Where they can be served legal papers',
        },
        {
          id: 'amount_claimed',
          label: 'Amount claimed',
          type: 'number',
          required: true,
          helpText: 'Dollar amount you\'re seeking (up to $6,000)',
          prefill: '2500',
        },
        {
          id: 'claim_description',
          label: 'Description of claim',
          type: 'textarea',
          required: true,
          helpText: 'Brief explanation of why they owe you money',
          prefill: 'Defendant failed to return my $2,500 security deposit within 45 days of move-out, despite the apartment being left in good condition with no damages.',
        },
      ],
      pdfTemplate: '/pdf/templates/marion/small-claims.pdf',
      pdfFieldMap: {
        plaintiff_name: 'PlaintiffName',
        plaintiff_address: 'PlaintiffAddress',
        defendant_name: 'DefendantName',
        defendant_address: 'DefendantAddress',
        amount_claimed: 'AmountClaimed',
        claim_description: 'ClaimDescription',
      },
    },
  },
};

export type SmallClaimsScenario = typeof smallClaimsScenario;

