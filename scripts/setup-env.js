#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps set up the required environment variables for the FairForm application.
 * It creates a .env.local file with placeholder values that need to be filled in.
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `# Firebase Client Configuration (Public - exposed to browser)
# Get these from Firebase Console → Project Settings → General → Your apps → Web app
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK Configuration (Private - server-side only)
# Get these from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour\\nMultiline\\nPrivate\\nKey\\nHere\\n-----END PRIVATE KEY-----\\n"

# OpenAI API Configuration (Private - server-side only)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
`;

const envPath = path.join(process.cwd(), '.env.local');

function setupEnvironment() {
  console.log('🔧 Setting up environment variables...\n');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  fs.writeFileSync(envPath, envTemplate);
  
  console.log('✅ Created .env.local file with template values');
  console.log('\n📝 Next steps:');
  console.log('1. Get your Firebase credentials from: https://console.firebase.google.com/');
  console.log('2. Get your OpenAI API key from: https://platform.openai.com/api-keys');
  console.log('3. Edit .env.local and replace the placeholder values with your actual credentials');
  console.log('4. Restart your development server (npm run dev)');
  console.log('\n🚀 After setup, the application should work without the OpenAI errors!');
}

if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };
