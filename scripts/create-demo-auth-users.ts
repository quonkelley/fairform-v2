/**
 * Create Demo Firebase Auth Users
 *
 * Creates Firebase Authentication users for demo accounts
 * Run with: npm run create-demo-auth
 *
 * Prerequisites:
 * - Demo Firebase project must be created
 * - Environment variables must be configured for demo mode
 * - Firebase Admin SDK must be initialized
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAdminAuth } from '../lib/firebase-admin';

const DEMO_PASSWORD = 'demodemo'; // 8 characters minimum

const demoUsers = [
  {
    uid: 'demo-user-1',
    email: 'demo1@fairform.demo',
    displayName: 'Demo User 1',
    password: DEMO_PASSWORD,
  },
  {
    uid: 'demo-user-2',
    email: 'demo2@fairform.demo',
    displayName: 'Demo User 2',
    password: DEMO_PASSWORD,
  },
  {
    uid: 'demo-user-3',
    email: 'demo3@fairform.demo',
    displayName: 'Demo User 3',
    password: DEMO_PASSWORD,
  },
];

async function createDemoAuthUsers(): Promise<void> {
  try {
    console.log('==========================================');
    console.log('Creating Demo Firebase Auth Users');
    console.log('==========================================\n');

    // Verify we're in demo mode
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      throw new Error(
        'Demo mode is not enabled. Set NEXT_PUBLIC_DEMO_MODE=true in your environment variables.'
      );
    }

    const auth = getAdminAuth();

    for (const user of demoUsers) {
      try {
        // Try to create the user
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          emailVerified: true,
          password: user.password,
          displayName: user.displayName,
          disabled: false,
        });
        console.log(`✓ Created auth user: ${user.email} (${user.displayName})`);
      } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`⚠ User already exists: ${user.email} - updating password`);
          // Update the existing user's password
          await auth.updateUser(user.uid, {
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            emailVerified: true,
          });
          console.log(`✓ Updated auth user: ${user.email}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n==========================================');
    console.log('Demo Auth Users Created Successfully!');
    console.log('==========================================\n');
    console.log('Demo credentials:');
    demoUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${DEMO_PASSWORD}\n`);
    });
    console.log('You can now sign in with any of these accounts!');
  } catch (error) {
    console.error('Error creating demo auth users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createDemoAuthUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { createDemoAuthUsers };
