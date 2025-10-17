/**
 * Step-specific knowledge base for AI copilot
 * Provides general court procedure guidance for different step types
 */

export interface StepKnowledge {
  stepType: string;
  title: string;
  description: string;
  generalGuidance: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
  courtRules: string[];
  tips: string[];
}

/**
 * Knowledge base for different step types
 * Focuses on general court procedures and what users can expect
 */
export const STEP_KNOWLEDGE_BASE: Record<string, StepKnowledge> = {
  form: {
    stepType: 'form',
    title: 'Form Completion Steps',
    description: 'Steps that involve filling out official court forms or applications',
    generalGuidance: [
      'Forms are official court documents that must be completed accurately',
      'Read all instructions carefully before starting to fill out any form',
      'Use black or blue ink and write legibly',
      'If you make a mistake, don\'t use white-out - start over with a new form',
      'Keep copies of all completed forms for your records'
    ],
    commonQuestions: [
      {
        question: 'What if I don\'t understand a question on the form?',
        answer: 'Look for instructions or definitions on the form itself. If still unclear, you can ask the court clerk for clarification, but they cannot provide legal advice.'
      },
      {
        question: 'Can I fill out the form on my computer?',
        answer: 'Many courts now accept electronic forms. Check your court\'s website or ask the clerk about e-filing options.'
      },
      {
        question: 'What if I make a mistake?',
        answer: 'Don\'t use correction fluid. Get a new form and start over. Accuracy is important for legal documents.'
      }
    ],
    courtRules: [
      'Forms must be completed truthfully and accurately',
      'False information on court forms can result in penalties',
      'Some forms require notarization - check if this applies to yours',
      'Filing fees may be required with certain forms'
    ],
    tips: [
      'Gather all required information before starting',
      'Read the entire form first to understand what\'s needed',
      'Take your time - rushing can lead to errors',
      'Consider having someone else review your completed form'
    ]
  },

  document: {
    stepType: 'document',
    title: 'Document Preparation Steps',
    description: 'Steps that involve creating, reviewing, or gathering legal documents',
    generalGuidance: [
      'Legal documents serve as evidence or official submissions in your case',
      'All documents should be relevant to your case and properly formatted',
      'Keep original documents safe and make copies for court',
      'Documents should be organized and clearly labeled',
      'Some documents may need to be notarized or witnessed'
    ],
    commonQuestions: [
      {
        question: 'What documents do I need for my case?',
        answer: 'This depends on your case type. Common documents include notices, contracts, receipts, photos, and correspondence. Check your court\'s website or ask the clerk for a checklist.'
      },
      {
        question: 'How should I organize my documents?',
        answer: 'Use a logical system - chronological order, by topic, or by importance. Number pages and create a table of contents for large document sets.'
      },
      {
        question: 'Do I need to get documents notarized?',
        answer: 'Some documents require notarization. Check the specific requirements for your document type. Notaries are often available at banks, libraries, or courthouses.'
      }
    ],
    courtRules: [
      'Documents must be relevant to the case',
      'Original documents are preferred over copies when possible',
      'Some documents may be subject to authentication requirements',
      'Privileged communications (like attorney-client) have special rules'
    ],
    tips: [
      'Start gathering documents early in your case',
      'Make multiple copies of important documents',
      'Keep documents in a safe, organized place',
      'Consider scanning important documents for backup'
    ]
  },

  review: {
    stepType: 'review',
    title: 'Review and Preparation Steps',
    description: 'Steps that involve carefully examining information, documents, or case progress',
    generalGuidance: [
      'Review steps help ensure everything is in order before taking action',
      'Look for inconsistencies, errors, or missing information',
      'Compare documents against requirements or previous submissions',
      'Take notes on important points or questions that arise',
      'Consider getting a second opinion on complex matters'
    ],
    commonQuestions: [
      {
        question: 'What should I look for when reviewing documents?',
        answer: 'Check for accuracy, completeness, proper formatting, and consistency with other case materials. Look for any missing information or unclear sections.'
      },
      {
        question: 'How long should I spend reviewing?',
        answer: 'Take as much time as you need to feel confident. Rushing through review can lead to costly mistakes later.'
      },
      {
        question: 'What if I find errors or problems?',
        answer: 'Document any issues you find. You may need to correct them, request clarification, or seek help from court staff or legal aid.'
      }
    ],
    courtRules: [
      'You have a duty to review documents for accuracy',
      'Filing inaccurate information can have legal consequences',
      'Deadlines for corrections may apply',
      'Some review processes have specific time limits'
    ],
    tips: [
      'Review in a quiet place where you can concentrate',
      'Use a checklist to ensure you don\'t miss anything',
      'Take breaks if reviewing for long periods',
      'Consider having someone else review as well'
    ]
  },

  submit: {
    stepType: 'submit',
    title: 'Document Submission Steps',
    description: 'Steps that involve officially filing or sending forms and documents to the court',
    generalGuidance: [
      'Submission makes your documents part of the official court record',
      'Follow the court\'s specific submission requirements exactly',
      'Keep proof of submission (receipts, confirmation numbers, etc.)',
      'Be aware of filing deadlines and fees',
      'Understand what happens after you submit'
    ],
    commonQuestions: [
      {
        question: 'How do I submit documents to the court?',
        answer: 'Methods vary by court. Common options include in-person filing, mail, or electronic filing. Check your court\'s website or call the clerk for specific instructions.'
      },
      {
        question: 'What if I miss a filing deadline?',
        answer: 'Contact the court immediately. Some courts may accept late filings with good cause, but this is not guaranteed. Prevention is better than trying to fix missed deadlines.'
      },
      {
        question: 'How do I know if my submission was accepted?',
        answer: 'You should receive confirmation. For e-filing, you\'ll get an email. For in-person filing, you\'ll get a stamped copy. Keep all confirmations.'
      }
    ],
    courtRules: [
      'Documents must be submitted by the deadline',
      'Filing fees must be paid unless waived',
      'Some documents require specific formatting or copies',
      'Late submissions may require court permission'
    ],
    tips: [
      'Submit documents well before deadlines when possible',
      'Get confirmation of receipt for all submissions',
      'Keep copies of everything you submit',
      'Understand the court\'s submission methods and requirements'
    ]
  },

  wait: {
    stepType: 'wait',
    title: 'Waiting Period Steps',
    description: 'Steps that involve waiting for the court or other parties to process information or respond',
    generalGuidance: [
      'Waiting periods are normal parts of legal proceedings',
      'Use this time to prepare for upcoming steps',
      'Avoid unnecessary contact with the court during waiting periods',
      'Check online portals or case status systems for updates',
      'Be patient but stay informed about your case'
    ],
    commonQuestions: [
      {
        question: 'How long do I have to wait?',
        answer: 'This varies by case type and court. Check your case documents for specific timelines, or contact the court clerk for general timeframes.'
      },
      {
        question: 'What should I do while waiting?',
        answer: 'Prepare for upcoming steps, gather additional evidence if needed, and stay informed about your case status. Avoid making major decisions without legal advice.'
      },
      {
        question: 'What if the waiting period is longer than expected?',
        answer: 'Some delays are normal. If significantly longer than expected, you can contact the court clerk to check on your case status.'
      }
    ],
    courtRules: [
      'Waiting periods are set by court rules and cannot be shortened without court order',
      'You must respond within any deadlines that arise during waiting periods',
      'Some waiting periods have specific requirements (like not contacting other parties)',
      'Court delays do not extend your response deadlines'
    ],
    tips: [
      'Use waiting time productively to prepare',
      'Set reminders for important upcoming dates',
      'Don\'t assume delays mean your case is forgotten',
      'Stay organized and ready to act when needed'
    ]
  },

  meeting: {
    stepType: 'meeting',
    title: 'Court Meetings and Hearings',
    description: 'Steps that involve attending scheduled court events like hearings, mediations, or conferences',
    generalGuidance: [
      'Court meetings are formal proceedings with specific rules and procedures',
      'Arrive early and dress appropriately for court',
      'Bring all relevant documents and evidence',
      'Be respectful and follow the judge\'s or mediator\'s instructions',
      'Take notes during the proceeding'
    ],
    commonQuestions: [
      {
        question: 'What should I wear to court?',
        answer: 'Dress professionally and conservatively. Business attire is appropriate. Avoid casual clothing, hats, or distracting accessories.'
      },
      {
        question: 'What should I bring to a hearing?',
        answer: 'Bring copies of all relevant documents, evidence, a notepad, and any forms you need to file. Check your court notice for specific requirements.'
      },
      {
        question: 'What if I can\'t attend a scheduled hearing?',
        answer: 'Contact the court immediately to request a continuance. You may need to file a motion explaining why you cannot attend. Don\'t just not show up.'
      }
    ],
    courtRules: [
      'You must appear at scheduled hearings unless excused by the court',
      'Follow all courtroom rules and procedures',
      'Address the judge as "Your Honor" or "Judge"',
      'Stand when the judge enters or leaves the courtroom',
      'Turn off cell phones and electronic devices'
    ],
    tips: [
      'Arrive at least 15 minutes early',
      'Practice what you want to say beforehand',
      'Be concise and stick to relevant points',
      'Listen carefully to all instructions',
      'Ask for clarification if you don\'t understand something'
    ]
  },

  communication: {
    stepType: 'communication',
    title: 'Legal Communication Steps',
    description: 'Steps that involve communicating with other parties, legal professionals, or the court',
    generalGuidance: [
      'All legal communications should be professional and respectful',
      'Keep records of all communications (dates, times, content)',
      'Be clear and concise in your messages',
      'Understand who you\'re communicating with and their role',
      'Follow any court orders regarding communication'
    ],
    commonQuestions: [
      {
        question: 'How should I communicate with the other party?',
        answer: 'Follow any court orders about communication. Generally, be professional, stick to case-related matters, and keep records of all communications.'
      },
      {
        question: 'What if the other party won\'t respond?',
        answer: 'Document your attempts to communicate. You may need to file a motion with the court or seek other legal remedies.'
      },
      {
        question: 'Can I record phone conversations?',
        answer: 'Recording laws vary by state. Check your local laws before recording any conversations. Some states require consent from all parties.'
      }
    ],
    courtRules: [
      'Some communications may be subject to court orders or restrictions',
      'Threatening or harassing communications are prohibited',
      'Certain communications may be privileged and confidential',
      'Written communications should be properly addressed and served'
    ],
    tips: [
      'Keep all communications professional and factual',
      'Document everything in writing when possible',
      'Don\'t discuss your case strategy in communications',
      'Follow up important communications in writing',
      'Respect boundaries and court orders about communication'
    ]
  }
};

/**
 * Get knowledge for a specific step type
 */
export function getStepKnowledge(stepType: string): StepKnowledge | undefined {
  return STEP_KNOWLEDGE_BASE[stepType];
}

/**
 * Get all available step types
 */
export function getAvailableStepTypes(): string[] {
  return Object.keys(STEP_KNOWLEDGE_BASE);
}

/**
 * Generate AI-friendly guidance text for a step type
 */
export function generateStepGuidance(stepType: string, stepName?: string): string {
  const knowledge = getStepKnowledge(stepType);
  if (!knowledge) {
    return `I can help you with general questions about this step, but I don't have specific information about "${stepType}" steps. Please ask me about what you need to know, and I'll do my best to help with general court procedure guidance.`;
  }

  let guidance = `## ${knowledge.title}\n\n`;
  guidance += `${knowledge.description}\n\n`;
  
  if (stepName) {
    guidance += `You're asking about: **${stepName}**\n\n`;
  }
  
  guidance += `### General Guidance:\n`;
  knowledge.generalGuidance.forEach(item => {
    guidance += `• ${item}\n`;
  });
  
  guidance += `\n### Important Court Rules:\n`;
  knowledge.courtRules.forEach(rule => {
    guidance += `• ${rule}\n`;
  });
  
  guidance += `\n### Helpful Tips:\n`;
  knowledge.tips.forEach(tip => {
    guidance += `• ${tip}\n`;
  });
  
  return guidance;
}
