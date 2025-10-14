/**
 * Demo Data Seeding Script
 *
 * Seeds the demo Firebase project with sample data for demonstrations.
 * Run with: npm run seed:demo
 *
 * Prerequisites:
 * - Demo Firebase project must be created
 * - Environment variables must be configured for demo mode
 * - Firebase Admin SDK must be initialized
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminFirestore } from '../lib/firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

// Demo user IDs (these will be created with anonymous authentication)
const DEMO_USER_IDS = [
  'demo-user-1',
  'demo-user-2',
  'demo-user-3',
];

// Seed demo users
async function seedDemoUsers(db: Firestore): Promise<void> {
  console.log('Seeding demo users...');

  const demoUsers = [
    {
      uid: 'demo-user-1',
      email: 'demo1@fairform.demo',
      displayName: 'Demo User 1',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      preferences: {
        aiParticipation: true,
        timeZone: 'America/Los_Angeles',
        tone: 'friendly',
        complexity: 'simple',
      },
    },
    {
      uid: 'demo-user-2',
      email: 'demo2@fairform.demo',
      displayName: 'Demo User 2',
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      preferences: {
        aiParticipation: true,
        timeZone: 'America/New_York',
        tone: 'professional',
        complexity: 'detailed',
      },
    },
    {
      uid: 'demo-user-3',
      email: 'demo3@fairform.demo',
      displayName: 'Demo User 3',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      preferences: {
        aiParticipation: false,
        timeZone: 'America/Chicago',
        tone: 'casual',
        complexity: 'simple',
      },
    },
  ];

  for (const user of demoUsers) {
    await db.collection('users').doc(user.uid).set(user);
    console.log(`  ✓ Created user: ${user.displayName}`);
  }

  console.log(`Seeded ${demoUsers.length} demo users\n`);
}

// Seed demo cases
async function seedDemoCases(db: Firestore): Promise<void> {
  console.log('Seeding demo cases...');

  const demoCases = [
    {
      id: 'demo-case-eviction-1',
      userId: 'demo-user-1',
      caseType: 'eviction',
      jurisdiction: 'Los Angeles County',
      status: 'active',
      currentStep: 'respond_to_eviction',
      currentStepOrder: 2,
      progressPct: 40,
      title: 'Eviction Defense Case',
      description: 'Responding to unlawful detainer',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      demo: true,
    },
    {
      id: 'demo-case-small-claims-1',
      userId: 'demo-user-1',
      caseType: 'small_claims',
      jurisdiction: 'Orange County',
      status: 'active',
      currentStep: 'file_claim',
      currentStepOrder: 1,
      progressPct: 20,
      title: 'Small Claims - Unpaid Wages',
      description: 'Filing claim for unpaid wages',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      demo: true,
    },
    {
      id: 'demo-case-family-1',
      userId: 'demo-user-2',
      caseType: 'family_law',
      jurisdiction: 'San Diego County',
      status: 'active',
      currentStep: 'custody_paperwork',
      currentStepOrder: 3,
      progressPct: 60,
      title: 'Child Custody Modification',
      description: 'Modifying custody arrangement',
      createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      demo: true,
    },
    {
      id: 'demo-case-completed-1',
      userId: 'demo-user-2',
      caseType: 'small_claims',
      jurisdiction: 'Los Angeles County',
      status: 'completed',
      currentStep: 'case_closed',
      currentStepOrder: 10,
      progressPct: 100,
      title: 'Small Claims - Security Deposit',
      description: 'Recovered security deposit',
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      demo: true,
    },
  ];

  for (const caseData of demoCases) {
    const { id, ...data } = caseData;
    await db.collection('cases').doc(id).set(data);
    console.log(`  ✓ Created case: ${data.title}`);
  }

  console.log(`Seeded ${demoCases.length} demo cases\n`);
}

// Seed demo case steps
async function seedDemoCaseSteps(db: Firestore): Promise<void> {
  console.log('Seeding demo case steps...');

  const demoCaseSteps = [
    // Eviction case steps
    {
      caseId: 'demo-case-eviction-1',
      stepId: 'eviction-step-1',
      order: 1,
      status: 'completed',
      title: 'Receive Eviction Notice',
      description: 'You received an eviction notice from your landlord',
      completedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    },
    {
      caseId: 'demo-case-eviction-1',
      stepId: 'eviction-step-2',
      order: 2,
      status: 'in_progress',
      title: 'Respond to Eviction',
      description: 'File your response to the eviction notice',
      dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
    },

    // Small claims case steps
    {
      caseId: 'demo-case-small-claims-1',
      stepId: 'small-claims-step-1',
      order: 1,
      status: 'in_progress',
      title: 'File Small Claims Complaint',
      description: 'Complete and file SC-100 form',
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    },

    // Family law case steps
    {
      caseId: 'demo-case-family-1',
      stepId: 'family-step-1',
      order: 1,
      status: 'completed',
      title: 'File Custody Modification Request',
      description: 'Filed FL-300 form',
      completedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
    {
      caseId: 'demo-case-family-1',
      stepId: 'family-step-2',
      order: 2,
      status: 'completed',
      title: 'Serve Other Parent',
      description: 'Served custody modification papers',
      completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
      caseId: 'demo-case-family-1',
      stepId: 'family-step-3',
      order: 3,
      status: 'in_progress',
      title: 'Attend Mediation',
      description: 'Scheduled mediation session',
      dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
    },
  ];

  for (const step of demoCaseSteps) {
    const { stepId, ...data } = step;
    await db.collection('caseSteps').doc(stepId).set(data);
    console.log(`  ✓ Created step: ${data.title}`);
  }

  console.log(`Seeded ${demoCaseSteps.length} demo case steps\n`);
}

// Seed demo AI sessions
async function seedDemoAISessions(db: Firestore): Promise<void> {
  console.log('Seeding demo AI sessions...');

  const demoAISessions = [
    {
      id: 'demo-session-1',
      userId: 'demo-user-1',
      caseId: 'demo-case-eviction-1',
      title: 'Eviction Defense Questions',
      status: 'active',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      lastMessageAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      contextSnapshot: {
        caseType: 'eviction',
        jurisdiction: 'Los Angeles County',
        currentStep: 'respond_to_eviction',
        currentStepOrder: 2,
        progressPct: 40,
        hash: 'demo-hash-eviction-1',
      },
      messageCount: 5,
      demo: true,
    },
    {
      id: 'demo-session-2',
      userId: 'demo-user-1',
      caseId: 'demo-case-small-claims-1',
      title: 'Small Claims Filing Help',
      status: 'active',
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      lastMessageAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      contextSnapshot: {
        caseType: 'small_claims',
        jurisdiction: 'Orange County',
        currentStep: 'file_claim',
        currentStepOrder: 1,
        progressPct: 20,
        hash: 'demo-hash-small-claims-1',
      },
      messageCount: 3,
      demo: true,
    },
    {
      id: 'demo-session-3',
      userId: 'demo-user-2',
      caseId: 'demo-case-family-1',
      title: 'Custody Mediation Preparation',
      status: 'active',
      createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
      lastMessageAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      contextSnapshot: {
        caseType: 'family_law',
        jurisdiction: 'San Diego County',
        currentStep: 'custody_paperwork',
        currentStepOrder: 3,
        progressPct: 60,
        hash: 'demo-hash-family-1',
      },
      messageCount: 8,
      demo: true,
    },
  ];

  for (const session of demoAISessions) {
    const { id, ...data } = session;
    await db.collection('aiSessions').doc(id).set(data);
    console.log(`  ✓ Created AI session: ${data.title}`);
  }

  console.log(`Seeded ${demoAISessions.length} demo AI sessions\n`);
}

// Seed demo AI messages
async function seedDemoAIMessages(db: Firestore): Promise<void> {
  console.log('Seeding demo AI messages...');

  const demoMessages = [
    // Session 1 messages (Eviction)
    {
      sessionId: 'demo-session-1',
      messageId: 'demo-msg-1-1',
      role: 'user',
      content: 'I just received an eviction notice. What should I do first?',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
      sessionId: 'demo-session-1',
      messageId: 'demo-msg-1-2',
      role: 'assistant',
      content:
        "First, don't panic. You typically have 5 days to respond to an eviction notice in California. Read the notice carefully to understand the reason for eviction and the deadline to respond. Would you like help understanding your notice?",
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000,
    },
    {
      sessionId: 'demo-session-1',
      messageId: 'demo-msg-1-3',
      role: 'user',
      content: 'Yes, it says I have unpaid rent. But I already paid it!',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 + 2000,
    },

    // Session 2 messages (Small Claims)
    {
      sessionId: 'demo-session-2',
      messageId: 'demo-msg-2-1',
      role: 'user',
      content: 'How do I file a small claims case for unpaid wages?',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
      sessionId: 'demo-session-2',
      messageId: 'demo-msg-2-2',
      role: 'assistant',
      content:
        "To file a small claims case in Orange County, you'll need to complete form SC-100 (Plaintiff's Claim). You'll need: 1) Details about the defendant (employer), 2) Amount owed, 3) Description of why they owe you. The filing fee is typically $30-75 depending on the amount. Would you like help filling out the form?",
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 + 1000,
    },

    // Session 3 messages (Family Law)
    {
      sessionId: 'demo-session-3',
      messageId: 'demo-msg-3-1',
      role: 'user',
      content: 'What should I prepare for the custody mediation?',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    },
    {
      sessionId: 'demo-session-3',
      messageId: 'demo-msg-3-2',
      role: 'assistant',
      content:
        'For custody mediation, prepare: 1) A proposed parenting schedule, 2) Documentation of your involvement in your child\'s life, 3) Any concerns about the other parent, 4) Your availability for parenting time. Focus on what\'s best for your child. Be ready to compromise.',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 + 1000,
    },
  ];

  for (const message of demoMessages) {
    const { sessionId, messageId, ...data } = message;
    await db
      .collection('aiSessions')
      .doc(sessionId)
      .collection('messages')
      .doc(messageId)
      .set(data);
  }

  console.log(`Seeded ${demoMessages.length} demo AI messages\n`);
}

// Main seeding function
async function seedDemoData(): Promise<void> {
  try {
    console.log('==========================================');
    console.log('Starting Demo Data Seeding');
    console.log('==========================================\n');

    // Verify we're in demo mode
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      throw new Error(
        'Demo mode is not enabled. Set NEXT_PUBLIC_DEMO_MODE=true in your environment variables.'
      );
    }

    const db = getAdminFirestore();

    // Seed all demo data
    await seedDemoUsers(db);
    await seedDemoCases(db);
    await seedDemoCaseSteps(db);
    await seedDemoAISessions(db);
    await seedDemoAIMessages(db);

    console.log('==========================================');
    console.log('Demo Data Seeding Complete!');
    console.log('==========================================\n');
    console.log('Demo users created:', DEMO_USER_IDS.length);
    console.log('Demo project is ready for demonstrations.');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedDemoData };
