# Story 13.14: Firestore Security Rules

## Status
Draft

## Story
**As a** FairForm security engineer,
**I want** comprehensive Firestore security rules for AI sessions and messages,
**so that** user data is protected, sessions are properly isolated, and demo mode is securely segregated.

## Acceptance Criteria

1. Security rules enforce session ownership verification for all operations
2. Demo sessions are blocked in production database (separate project required)
3. Message subcollection rules prevent unauthorized access and ensure immutability
4. Rules validate data structure and field constraints on write operations
5. Security rules include size limits to prevent abuse
6. Rules are deployed to both production and demo Firebase projects
7. Security rules are tested with automated test suite
8. Documentation includes rule rationale and examples

## Tasks / Subtasks

- [ ] Task 1: Create base security rules structure (AC: 1, 2)
  - [ ] Create `firestore.rules` file
  - [ ] Implement authentication helper functions
  - [ ] Add ownership verification functions
  - [ ] Add demo mode blocking for production
  - [ ] Document rule structure and helpers

- [ ] Task 2: Implement AI sessions collection rules (AC: 1, 2, 4)
  - [ ] Add read rules with ownership verification
  - [ ] Add create rules with data validation
  - [ ] Add update rules for session status changes
  - [ ] Add delete rules with ownership check
  - [ ] Block demo session creation in prod database

- [ ] Task 3: Implement messages subcollection rules (AC: 3, 4, 5)
  - [ ] Add read rules with parent session ownership check
  - [ ] Add create rules with author and content validation
  - [ ] Enforce message size limits (8KB max)
  - [ ] Make messages immutable (block updates/deletes)
  - [ ] Validate author enum values

- [ ] Task 4: Add data validation rules (AC: 4)
  - [ ] Validate required fields on session creation
  - [ ] Validate field types and enums
  - [ ] Enforce status enum values
  - [ ] Validate timestamp fields
  - [ ] Validate contextSnapshot structure

- [ ] Task 5: Add security rule tests (AC: 7)
  - [ ] Create `firestore.rules.test.ts`
  - [ ] Test session read/write permissions
  - [ ] Test message subcollection permissions
  - [ ] Test ownership verification
  - [ ] Test demo mode blocking
  - [ ] Test data validation rules
  - [ ] Test size limit enforcement

- [ ] Task 6: Deploy security rules (AC: 6)
  - [ ] Deploy rules to production Firebase project
  - [ ] Deploy rules to demo Firebase project
  - [ ] Verify deployment success
  - [ ] Test rules in deployed environments
  - [ ] Add deployment instructions to docs

- [ ] Task 7: Create documentation (AC: 8)
  - [ ] Document security model and principles
  - [ ] Add rule examples and use cases
  - [ ] Document ownership verification logic
  - [ ] Add troubleshooting guide
  - [ ] Document testing procedures

## Dev Notes

### Architecture Context
[Source: docs/epic-13-unified-architecture-specification.md, Section 4.3]

Security rules are **critical for data protection** - they enforce ownership verification, prevent unauthorized access, and ensure demo/prod isolation. The rules must be comprehensive yet performant, as they're evaluated on every database operation.

**Key Design Decisions:**
- Session ownership enforced via `userId` field matching `request.auth.uid`
- Messages subcollection inherits parent session ownership check
- Demo sessions blocked in production via explicit deny rule
- Messages are immutable after creation
- Size limits prevent abuse (8KB message content max)

### Security Rules Structure

**Complete Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================================
    // Helper Functions
    // ============================================================

    // Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Check if user owns the resource
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // Check if request data has valid structure
    function hasValidSessionData() {
      return request.resource.data.keys().hasAll(['userId', 'title', 'status', 'createdAt', 'updatedAt', 'lastMessageAt', 'contextSnapshot', 'demo'])
        && request.resource.data.userId is string
        && request.resource.data.title is string
        && request.resource.data.status in ['active', 'archived', 'ended']
        && request.resource.data.createdAt is number
        && request.resource.data.updatedAt is number
        && request.resource.data.lastMessageAt is number
        && request.resource.data.contextSnapshot is map
        && request.resource.data.demo is bool;
    }

    // Check if message has valid structure
    function hasValidMessageData() {
      return request.resource.data.keys().hasAll(['sessionId', 'author', 'content', 'createdAt'])
        && request.resource.data.sessionId is string
        && request.resource.data.author in ['user', 'assistant', 'system']
        && request.resource.data.content is string
        && request.resource.data.content.size() <= 8000 // 8KB limit
        && request.resource.data.createdAt is number;
    }

    // ============================================================
    // AI Sessions Collection
    // ============================================================

    match /aiSessions/{sessionId} {

      // READ: User can read their own sessions
      allow read: if isOwner(resource.data.userId);

      // CREATE: User can create sessions for themselves (non-demo only in prod)
      allow create: if isOwner(request.resource.data.userId)
                     && hasValidSessionData()
                     && request.resource.data.demo == false; // Force demo to separate project

      // UPDATE: User can update their own sessions (status, timestamps, context)
      allow update: if isOwner(resource.data.userId)
                     && isOwner(request.resource.data.userId) // userId cannot be changed
                     && request.resource.data.status in ['active', 'archived', 'ended'];

      // DELETE: User can delete their own sessions
      allow delete: if isOwner(resource.data.userId);

      // ============================================================
      // Messages Subcollection
      // ============================================================

      match /messages/{messageId} {

        // READ: User can read messages from their own sessions
        // Must check parent session ownership
        allow read: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        );

        // CREATE: User can create messages in their own sessions
        // Messages must have valid structure and respect size limits
        allow create: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        ) && hasValidMessageData();

        // UPDATE: Messages are immutable - no updates allowed
        allow update: if false;

        // DELETE: Messages are immutable - no deletes allowed
        allow delete: if false;
      }
    }

    // ============================================================
    // Existing Collections (Cases, Steps, etc.)
    // ============================================================

    // Cases collection - existing rules remain unchanged
    match /cases/{caseId} {
      allow read, write: if isOwner(resource.data.userId);
    }

    // Case steps subcollection - existing rules remain unchanged
    match /cases/{caseId}/steps/{stepId} {
      allow read, write: if isOwner(
        get(/databases/$(database)/documents/cases/$(caseId)).data.userId
      );
    }

    // Reminders collection - existing rules remain unchanged
    match /reminders/{reminderId} {
      allow read, write: if isOwner(resource.data.userId);
    }

    // Glossary collection - read-only for all authenticated users
    match /glossary/{termId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin only via server
    }

    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

### Demo Project Security Rules

**Separate Rules for Demo Firebase Project:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================================
    // Demo Project - More Permissive Rules
    // ============================================================

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    function hasValidSessionData() {
      return request.resource.data.keys().hasAll(['userId', 'title', 'status', 'createdAt', 'updatedAt', 'lastMessageAt', 'contextSnapshot', 'demo'])
        && request.resource.data.userId is string
        && request.resource.data.title is string
        && request.resource.data.status in ['active', 'archived', 'ended']
        && request.resource.data.demo == true; // Must be demo in demo project
    }

    function hasValidMessageData() {
      return request.resource.data.keys().hasAll(['sessionId', 'author', 'content', 'createdAt'])
        && request.resource.data.sessionId is string
        && request.resource.data.author in ['user', 'assistant', 'system']
        && request.resource.data.content is string
        && request.resource.data.content.size() <= 8000;
    }

    // AI Sessions - demo mode allowed
    match /aiSessions/{sessionId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId)
                     && hasValidSessionData()
                     && request.resource.data.demo == true; // Must be demo
      allow update: if isOwner(resource.data.userId)
                     && isOwner(request.resource.data.userId);
      allow delete: if isOwner(resource.data.userId);

      match /messages/{messageId} {
        allow read: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        );
        allow create: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        ) && hasValidMessageData();
        allow update, delete: if false; // Messages still immutable
      }
    }

    // Demo cases - same rules as prod
    match /cases/{caseId} {
      allow read, write: if isOwner(resource.data.userId);
    }

    // Other collections can be more restricted or removed in demo
  }
}
```

### Security Rule Testing

**Test Location:** `tests/firestore.rules.test.ts`

**Test Suite Structure:**
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'fairform-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('AI Sessions', () => {
    it('allows user to read their own session', async () => {
      const userId = 'user-123';
      const sessionId = 'session-abc';

      // Setup: Create session as admin
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(context.firestore().collection('aiSessions').doc(sessionId), {
          userId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });
      });

      // Test: User can read their own session
      const userContext = testEnv.authenticatedContext(userId);
      const sessionRef = userContext.firestore().collection('aiSessions').doc(sessionId);

      await assertSucceeds(getDoc(sessionRef));
    });

    it('denies user reading another users session', async () => {
      const ownerId = 'user-123';
      const otherId = 'user-456';
      const sessionId = 'session-xyz';

      // Setup: Create session as admin
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(context.firestore().collection('aiSessions').doc(sessionId), {
          userId: ownerId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });
      });

      // Test: Other user cannot read session
      const otherContext = testEnv.authenticatedContext(otherId);
      const sessionRef = otherContext.firestore().collection('aiSessions').doc(sessionId);

      await assertFails(getDoc(sessionRef));
    });

    it('allows user to create session for themselves', async () => {
      const userId = 'user-123';
      const sessionId = 'session-new';

      const userContext = testEnv.authenticatedContext(userId);
      const sessionRef = userContext.firestore().collection('aiSessions').doc(sessionId);

      await assertSucceeds(setDoc(sessionRef, {
        userId,
        title: 'New Session',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessageAt: Date.now(),
        contextSnapshot: { hash: 'def456' },
        demo: false
      }));
    });

    it('denies demo session creation in production', async () => {
      const userId = 'user-123';
      const sessionId = 'session-demo';

      const userContext = testEnv.authenticatedContext(userId);
      const sessionRef = userContext.firestore().collection('aiSessions').doc(sessionId);

      await assertFails(setDoc(sessionRef, {
        userId,
        title: 'Demo Session',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessageAt: Date.now(),
        contextSnapshot: { hash: 'demo123' },
        demo: true // Demo not allowed in prod
      }));
    });

    it('denies session creation with invalid status', async () => {
      const userId = 'user-123';
      const sessionId = 'session-invalid';

      const userContext = testEnv.authenticatedContext(userId);
      const sessionRef = userContext.firestore().collection('aiSessions').doc(sessionId);

      await assertFails(setDoc(sessionRef, {
        userId,
        title: 'Invalid Session',
        status: 'invalid-status', // Invalid enum value
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessageAt: Date.now(),
        contextSnapshot: { hash: 'xyz789' },
        demo: false
      }));
    });
  });

  describe('Messages Subcollection', () => {
    it('allows user to create message in their own session', async () => {
      const userId = 'user-123';
      const sessionId = 'session-abc';
      const messageId = 'msg-001';

      // Setup: Create session
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(context.firestore().collection('aiSessions').doc(sessionId), {
          userId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });
      });

      // Test: User can create message
      const userContext = testEnv.authenticatedContext(userId);
      const messageRef = userContext.firestore()
        .collection('aiSessions').doc(sessionId)
        .collection('messages').doc(messageId);

      await assertSucceeds(setDoc(messageRef, {
        sessionId,
        author: 'user',
        content: 'Test message',
        createdAt: Date.now()
      }));
    });

    it('denies message creation with oversized content', async () => {
      const userId = 'user-123';
      const sessionId = 'session-abc';
      const messageId = 'msg-002';

      // Setup: Create session
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(context.firestore().collection('aiSessions').doc(sessionId), {
          userId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });
      });

      // Test: Oversized message is rejected
      const userContext = testEnv.authenticatedContext(userId);
      const messageRef = userContext.firestore()
        .collection('aiSessions').doc(sessionId)
        .collection('messages').doc(messageId);

      const oversizedContent = 'x'.repeat(9000); // > 8KB limit

      await assertFails(setDoc(messageRef, {
        sessionId,
        author: 'user',
        content: oversizedContent,
        createdAt: Date.now()
      }));
    });

    it('denies message updates (immutability)', async () => {
      const userId = 'user-123';
      const sessionId = 'session-abc';
      const messageId = 'msg-003';

      // Setup: Create session and message
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(db.collection('aiSessions').doc(sessionId), {
          userId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });

        await setDoc(db.collection('aiSessions').doc(sessionId)
          .collection('messages').doc(messageId), {
          sessionId,
          author: 'user',
          content: 'Original message',
          createdAt: Date.now()
        });
      });

      // Test: User cannot update message
      const userContext = testEnv.authenticatedContext(userId);
      const messageRef = userContext.firestore()
        .collection('aiSessions').doc(sessionId)
        .collection('messages').doc(messageId);

      await assertFails(updateDoc(messageRef, {
        content: 'Updated message'
      }));
    });

    it('denies message deletes (immutability)', async () => {
      const userId = 'user-123';
      const sessionId = 'session-abc';
      const messageId = 'msg-004';

      // Setup: Create session and message
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(db.collection('aiSessions').doc(sessionId), {
          userId,
          title: 'Test Session',
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessageAt: Date.now(),
          contextSnapshot: { hash: 'abc123' },
          demo: false
        });

        await setDoc(db.collection('aiSessions').doc(sessionId)
          .collection('messages').doc(messageId), {
          sessionId,
          author: 'user',
          content: 'Test message',
          createdAt: Date.now()
        });
      });

      // Test: User cannot delete message
      const userContext = testEnv.authenticatedContext(userId);
      const messageRef = userContext.firestore()
        .collection('aiSessions').doc(sessionId)
        .collection('messages').doc(messageId);

      await assertFails(deleteDoc(messageRef));
    });
  });
});
```

### Deployment Instructions

**Deploy to Production:**
```bash
# Deploy Firestore rules to production
firebase deploy --only firestore:rules --project fairform-prod

# Verify deployment
firebase firestore:rules:get --project fairform-prod
```

**Deploy to Demo:**
```bash
# Deploy Firestore rules to demo project
firebase deploy --only firestore:rules --project fairform-demo

# Verify deployment
firebase firestore:rules:get --project fairform-demo
```

**CI/CD Integration:**
```yaml
# .github/workflows/deploy-firestore-rules.yml
name: Deploy Firestore Rules

on:
  push:
    branches: [main]
    paths:
      - 'firestore.rules'
      - 'firestore.demo.rules'

jobs:
  deploy-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Firebase CLI
        run: npm install -g firebase-tools

      - name: Test Security Rules
        run: npm run test:firestore-rules

      - name: Deploy to Production
        run: firebase deploy --only firestore:rules --project fairform-prod
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

      - name: Deploy to Demo
        run: firebase deploy --only firestore:rules --project fairform-demo
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Source Tree
```
firestore.rules            # NEW: Production security rules
firestore.demo.rules       # NEW: Demo project security rules
tests/
└── firestore.rules.test.ts # NEW: Security rules tests
.github/workflows/
└── deploy-firestore-rules.yml # NEW: CI/CD deployment
docs/
└── security-rules-guide.md # NEW: Documentation
```

### Testing

**Test Location:** `tests/firestore.rules.test.ts`

**Test Coverage:**
- Session ownership verification
- Demo mode blocking in production
- Message subcollection access control
- Data validation and size limits
- Message immutability enforcement
- Cross-user access prevention

**Run Tests:**
```bash
npm run test:firestore-rules
```

### Performance Considerations
- Keep rules simple and efficient
- Avoid complex nested get() calls when possible
- Use helper functions for reusability
- Cache rule evaluation results when appropriate
- Monitor rule evaluation performance

### Dependencies
- Firebase CLI for deployment
- @firebase/rules-unit-testing for testing
- Firebase Admin SDK for test setup

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-13 | 1.0 | Initial story creation | Bob (Scrum Master) |

## Dev Agent Record

### Agent Model Used
_To be populated by dev agent*

### Debug Log References
_To be populated by dev agent*

### Completion Notes List
_To be populated by dev agent*

### File List
_To be populated by dev agent*

## QA Results
_To be populated by QA agent*
