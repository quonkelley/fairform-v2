# FairForm Demo Environment Setup Guide

This guide provides step-by-step instructions for setting up and maintaining the FairForm demo environment.

## Overview

The demo environment is a completely isolated Firebase project that allows for safe demonstrations without affecting production data. It features:

- Separate Firebase project with isolated data
- Anonymous authentication for easy access
- Pre-seeded sample data (cases, users, AI sessions)
- Relaxed security rules for demo purposes
- Automated CI/CD deployment pipeline

## Prerequisites

Before setting up the demo environment, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Firebase CLI installed (`npm install -g firebase-tools`)
- Access to Firebase Console (firebase.google.com)
- Access to Vercel for deployment (optional)

## Step 1: Create Demo Firebase Project

### 1.1 Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `fairform-demo` (or your preferred name)
4. Disable Google Analytics (optional for demo)
5. Click "Create project"

### 1.2 Enable Firestore Database

1. In Firebase Console, navigate to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (we'll apply custom rules later)
4. Choose a location (preferably close to your users)
5. Click "Enable"

### 1.3 Enable Authentication

1. Navigate to **Build > Authentication**
2. Click "Get started"
3. Enable **Anonymous** authentication:
   - Click on "Anonymous" provider
   - Toggle "Enable" switch
   - Click "Save"

### 1.4 Get Firebase Configuration

1. Navigate to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Web app" icon (</>)
4. Register app with nickname: "FairForm Demo"
5. Copy the Firebase configuration object (you'll need these values)

### 1.5 Generate Service Account Key

1. Navigate to **Project Settings > Service accounts**
2. Click "Generate new private key"
3. Save the JSON file securely (contains sensitive credentials)
4. Extract these values:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 2: Configure Environment Variables

### 2.1 Copy Demo Environment Template

```bash
cp .env.demo .env.local
```

### 2.2 Update Environment Variables

Edit `.env.local` with your actual Firebase demo credentials:

```bash
# Demo mode flag
NEXT_PUBLIC_DEMO_MODE=true

# Demo Firebase Client Configuration (from Step 1.4)
NEXT_PUBLIC_FIREBASE_DEMO_PROJECT_ID=your-demo-project-id
NEXT_PUBLIC_FIREBASE_DEMO_API_KEY=your-demo-api-key
NEXT_PUBLIC_FIREBASE_DEMO_AUTH_DOMAIN=your-demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DEMO_STORAGE_BUCKET=your-demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_DEMO_MESSAGING_SENDER_ID=your-demo-sender-id
NEXT_PUBLIC_FIREBASE_DEMO_APP_ID=your-demo-app-id

# Demo Firebase Admin Configuration (from Step 1.5)
FIREBASE_DEMO_PROJECT_ID=your-demo-project-id
FIREBASE_DEMO_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-demo-project.iam.gserviceaccount.com
FIREBASE_DEMO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the `\n` characters in the private key
- The private key must be wrapped in double quotes
- Never commit `.env.local` to version control

### 2.3 Verify Configuration

```bash
# Test that environment variables are loaded
npm run dev

# Check health endpoint
curl http://localhost:3000/api/health
# Should return: {"ok":true,"demo":true,"timestamp":"..."}
```

## Step 3: Deploy Firestore Security Rules

### 3.1 Login to Firebase CLI

```bash
firebase login
```

### 3.2 Select Demo Project

```bash
firebase use your-demo-project-id
```

### 3.3 Deploy Demo Rules

```bash
firebase deploy --only firestore:rules --config firestore.demo.rules
```

### 3.4 Verify Rules Deployment

1. Go to Firebase Console > Firestore Database > Rules
2. Verify the demo rules are active
3. Rules should allow authenticated access to demo collections

## Step 4: Seed Demo Data

### 4.1 Run Seeding Script

```bash
npm run seed:demo
```

This will create:
- 3 demo users
- 4 demo cases (eviction, small claims, family law)
- 6 demo case steps
- 3 demo AI sessions
- 8 demo AI messages

### 4.2 Verify Data in Firestore

1. Go to Firebase Console > Firestore Database > Data
2. Verify these collections exist:
   - `users` (3 documents)
   - `cases` (4 documents)
   - `caseSteps` (6 documents)
   - `aiSessions` (3 documents)
3. Check that each AI session has a `messages` subcollection

### 4.3 Re-run Seeding (if needed)

The seeding script is idempotent. To refresh demo data:

```bash
# Delete all demo data in Firestore Console first, then:
npm run seed:demo
```

## Step 5: Local Testing

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Test Demo Features

1. **Health Check**: Visit `http://localhost:3000/api/health`
   - Should show `demo: true`

2. **Anonymous Authentication**: Open the app
   - Should allow anonymous login automatically

3. **Demo Data**: Navigate through the app
   - Cases should be visible
   - AI sessions should load
   - Demo data should be accessible

### 5.3 Test Demo Isolation

1. Temporarily disable demo mode: `NEXT_PUBLIC_DEMO_MODE=false`
2. Restart dev server
3. Verify production Firebase is used
4. Re-enable demo mode for continued testing

## Step 6: Deploy to Production (Optional)

### 6.1 Configure GitHub Secrets

If using GitHub Actions for deployment, add these secrets:

Navigate to: **GitHub Repository > Settings > Secrets and variables > Actions**

Add the following secrets:

**Demo Firebase Secrets:**
- `DEMO_FIREBASE_PROJECT_ID`
- `DEMO_FIREBASE_API_KEY`
- `DEMO_FIREBASE_AUTH_DOMAIN`
- `DEMO_FIREBASE_STORAGE_BUCKET`
- `DEMO_FIREBASE_MESSAGING_SENDER_ID`
- `DEMO_FIREBASE_APP_ID`
- `DEMO_FIREBASE_CLIENT_EMAIL`
- `DEMO_FIREBASE_PRIVATE_KEY`

**Vercel Secrets:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_DEMO_PROJECT_ID`
- `DEMO_URL` (e.g., `https://demo.fairform.com`)

### 6.2 Create Demo Branch

```bash
git checkout -b demo
git push origin demo
```

### 6.3 Trigger Deployment

Push to the `demo` branch to trigger automatic deployment:

```bash
git push origin demo
```

Or manually trigger via GitHub Actions:
1. Go to **Actions** tab in GitHub
2. Select "Deploy Demo Environment"
3. Click "Run workflow"
4. Select `demo` branch
5. Click "Run workflow"

### 6.4 Verify Deployment

```bash
# Check deployment health
curl https://demo.fairform.com/api/health

# Should return:
# {"ok":true,"demo":true,"timestamp":"..."}
```

## Maintenance

### Refreshing Demo Data

To refresh demo data periodically:

```bash
# 1. Delete all demo data in Firestore Console
# 2. Re-run seeding script
npm run seed:demo
```

### Updating Security Rules

When updating demo security rules:

```bash
# 1. Edit firestore.demo.rules
# 2. Deploy updated rules
firebase deploy --only firestore:rules --config firestore.demo.rules
```

### Monitoring Demo Usage

1. Go to Firebase Console > Analytics (if enabled)
2. Monitor Firestore usage in **Usage and billing**
3. Check Authentication users in **Build > Authentication**

### Cleaning Up Demo Data

To remove old demo data:

```bash
# Option 1: Manual deletion in Firestore Console
# Navigate to each collection and delete documents

# Option 2: Use Firebase CLI
firebase firestore:delete --all-collections --yes
```

## Troubleshooting

### Issue: "Missing Firebase configuration"

**Solution:** Verify environment variables are set correctly in `.env.local`

```bash
# Check if variables are loaded
echo $NEXT_PUBLIC_DEMO_MODE
```

### Issue: "Permission denied" in Firestore

**Solution:**
1. Verify demo security rules are deployed
2. Check that anonymous authentication is enabled
3. Ensure user is authenticated (check browser console)

### Issue: Demo data not appearing

**Solution:**
1. Run seeding script: `npm run seed:demo`
2. Verify in Firestore Console that data exists
3. Check that `NEXT_PUBLIC_DEMO_MODE=true`

### Issue: Production data showing in demo

**Solution:** This should NEVER happen due to project isolation, but if it does:
1. Verify `NEXT_PUBLIC_DEMO_MODE=true`
2. Check `NEXT_PUBLIC_FIREBASE_DEMO_PROJECT_ID` matches demo project
3. Restart the dev server

### Issue: Health check failing

**Solution:**
1. Check that the app is running
2. Verify `/api/health` route exists
3. Check server logs for errors

## Security Considerations

### Demo Security Best Practices

1. **Never use production data in demo**
   - Demo project is completely isolated
   - No cross-contamination possible

2. **Demo credentials**
   - Use separate Firebase project
   - Use anonymous authentication only
   - Never expose production credentials

3. **Access control**
   - Demo should be publicly accessible
   - No sensitive data in demo environment
   - Regular cleanup of demo data

4. **Monitoring**
   - Monitor demo Firebase usage
   - Set up billing alerts
   - Review authentication logs

## Support

For issues or questions about the demo environment:

1. Check this documentation first
2. Review Firebase Console logs
3. Check GitHub Issues for known problems
4. Contact the development team

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [FairForm Architecture Documentation](./docs/epic-13-unified-architecture-specification.md)
