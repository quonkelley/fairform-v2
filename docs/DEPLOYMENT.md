# FairForm Deployment Guide

## Overview

This guide covers deploying the FairForm Next.js application to Vercel with Firebase integration.

## Prerequisites

- ✅ Vercel account connected to your repository
- ✅ Firebase project with credentials ready
- ✅ Git repository pushed to GitHub/GitLab/Bitbucket

## Quick Start

### 1. Environment Variables Setup

Copy `env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual Firebase values.

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your `fairform-v2` repository

2. **Configure Environment Variables**
   - In Project Settings → Environment Variables
   - Add all variables from your `.env.local` file
   - Select "Preview" environment for initial deployment

3. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build completion

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET preview
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID preview
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID preview
vercel env add FIREBASE_PROJECT_ID preview
vercel env add FIREBASE_CLIENT_EMAIL preview
vercel env add FIREBASE_PRIVATE_KEY preview
```

### 3. Verify Deployment

Test your deployed application:

- [ ] Homepage loads correctly
- [ ] Authentication flow works (`/login`, `/signup`)
- [ ] Dashboard accessible after login
- [ ] API routes respond (e.g., `/api/health`)
- [ ] No console errors related to Firebase

## Environment Variables Reference

### Client-Side (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Server-Side (Private)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### Common Issues

**"Missing Firebase configuration"**
- Verify all `NEXT_PUBLIC_*` variables are set in Vercel
- Check variable names match exactly (case-sensitive)

**"Missing Firebase Admin SDK configuration"**
- Ensure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are set
- For `FIREBASE_PRIVATE_KEY`, include the full key with headers and `\n` characters

**Build failures**
- Run `npm run type-check` locally to catch TypeScript errors
- Check Vercel Function Logs for detailed error messages

**API routes returning 500 errors**
- Verify Firebase Admin credentials are correct
- Ensure Firebase project has Firestore enabled
- Check Vercel Function Logs for specific error details

### Debugging Steps

1. **Check Environment Variables**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Verify all variables are present and correctly formatted

2. **Review Build Logs**
   - Vercel Dashboard → Project → Deployments → View Function Logs
   - Look for Firebase initialization errors

3. **Test Locally**
   - Copy Vercel environment variables to `.env.local`
   - Run `npm run build` and `npm start` locally
   - Compare local behavior with deployed version

## Production Deployment

When ready to deploy to production:

1. **Add Production Environment Variables**
   - In Vercel Dashboard → Environment Variables
   - Add same variables but select "Production" environment
   - Use production Firebase credentials if different

2. **Deploy to Production**
   - Promote preview deployment, OR
   - Push to `main` branch (if auto-deploy enabled), OR
   - Run `vercel --prod`

3. **Custom Domain** (Optional)
   - Settings → Domains
   - Add your domain and configure DNS

## Project Structure

```
fairform-v2/
├── vercel.json              # Vercel configuration
├── env.example              # Environment variables template
├── docs/DEPLOYMENT.md       # This file
├── lib/firebase.ts          # Client-side Firebase config
├── lib/firebase-admin.ts    # Server-side Firebase config
└── app/api/                 # API routes using Firebase Admin
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
