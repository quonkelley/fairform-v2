# Epic 13: AI Copilot - Unified Architecture Specification

**Document Version:** 2.0 (Unified)  
**Date:** January 2025  
**Status:** ✅ Approved - Definitive Specification  
**Reviewers:** Product Owner, Architect, Developer, PRD Team  

---

## Document Purpose

This is the **single source of truth** for Epic 13 (AI Copilot & Dynamic Intake Experience) architecture. It combines insights from multiple architecture reviews into one comprehensive, production-ready specification.

**Supersedes:**
- `epic-13-architecture-review-response.md`
- `architect_question_response_from_team.md`
- `architecture_review_request_for_epic_13_questions.md`

---

## Executive Summary

Epic 13 transforms FairForm's AI intake into a persistent, context-aware conversational system - the **AI Copilot**. This architecture has been validated by multiple teams and approved for implementation.

**Key Architectural Decisions:**
- ✅ Maintains FairForm's repository pattern
- ✅ Uses subcollection pattern for message storage
- ✅ Implements SSE streaming for real-time responses
- ✅ Separate Firebase project for demo isolation
- ✅ Context snapshots with fingerprinting for performance
- ✅ Comprehensive security and compliance framework

---

## 1. Architecture Overview

### High-Level Flow

```
User → Chat UI → React Hook → API Route → Context Builder → OpenAI API
                      ↓              ↓            ↓
                React Query    aiSessionsRepo   Firestore
                              (messages subcollection)
```

### Layer Breakdown

| Layer | Components | Responsibility |
|-------|-----------|----------------|
| **UI Layer** | `<AICopilotChat />`, floating bubble | Presentation, user interaction |
| **State Layer** | React Query hooks, context providers | Client-side state, caching |
| **API Layer** | `/api/ai/copilot/*` routes | Request handling, SSE streaming |
| **Business Logic** | Context builder, prompt templates | Context aggregation, AI orchestration |
| **Data Layer** | `aiSessionsRepo.ts`, Firestore | Persistence, session management |
| **AI Layer** | OpenAI API, moderation | AI processing, safety filters |

---

## 2. Data Model Design

### 2.1 TypeScript Interfaces

```typescript
// lib/ai/types.ts

export type Author = 'user' | 'assistant' | 'system';

export interface AISession {
  id: string;
  userId: string;                    // auth.uid
  caseId?: string | null;            // Optional case association
  title: string;                     // "Small Claims – Tenant Issue"
  status: 'active' | 'archived' | 'ended';
  createdAt: number;                 // epoch ms
  updatedAt: number;                 // epoch ms
  lastMessageAt: number;             // epoch ms for lifecycle
  contextSnapshot: ContextSnapshot;  // Small, structured context
  demo: boolean;                     // true for demo sandbox
}

export interface ContextSnapshot {
  caseType?: 'eviction' | 'small_claims' | 'family_law' | 'debt' | 'employment' | 'other_civil';
  jurisdiction?: string;
  currentStepOrder?: number;
  progressPct?: number;
  userPrefs?: {
    aiParticipation?: boolean;
    timeZone?: string;
    tone?: 'formal' | 'friendly' | 'helpful';
    complexity?: 'simple' | 'detailed';
  };
  hash: string;                      // For deduplication and caching
}

export interface AIMessage {
  id: string;
  sessionId: string;
  author: Author;
  content: string;                   // Plain text, PII-filtered
  meta?: {
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
    blocked?: boolean;               // Moderation result
    model?: string;                  // e.g., "gpt-4o-mini"
  };
  createdAt: number;                 // epoch ms
}

export interface AIPromptContext {
  user: {
    id: string;
    timeZone?: string;
  };
  case?: {
    id: string;
    caseType?: string;
    jurisdiction?: string;
    currentStepOrder?: number;
    progressPct?: number;
  };
  summary: string;                   // Concise narrative from allowlisted fields
  glossaryTerms?: Array<{
    term: string;
    definition: string;
  }>;
  fingerprint: string;               // SHA-256 for caching/ETag
}
```

### 2.2 Firestore Structure

**Critical Design Decision: Messages in Subcollection**

This avoids hot-document contention and enables efficient pagination.

```
aiSessions/{sessionId}                    // AISession document
├── id: string
├── userId: string (indexed)
├── caseId?: string (indexed)
├── title: string
├── status: 'active' | 'archived' | 'ended'
├── createdAt: timestamp
├── updatedAt: timestamp
├── lastMessageAt: timestamp
├── contextSnapshot: object
│   ├── caseType?: string
│   ├── jurisdiction?: string
│   ├── currentStepOrder?: number
│   ├── progressPct?: number
│   ├── userPrefs?: object
│   └── hash: string
└── demo: boolean

aiSessions/{sessionId}/messages/{messageId}   // AIMessage subcollection
├── id: string
├── sessionId: string
├── author: 'user' | 'assistant' | 'system'
├── content: string
├── meta?: object
│   ├── tokensIn?: number
│   ├── tokensOut?: number
│   ├── latencyMs?: number
│   ├── blocked?: boolean
│   └── model?: string
└── createdAt: timestamp
```

### 2.3 Session Lifecycle Management

**Creation:**
- Automatic on first chat message
- User can explicitly create via "Start Conversation"
- Context initialized from current page/case

**Archiving:**
- `lastMessageAt > 7 days` (prod) → `status = 'archived'`
- `lastMessageAt > 24 hours` (demo) → `status = 'archived'`

**Cleanup (Cloud Function/Vercel Cron):**
- Demo sessions > 14 days → DELETE
- Prod sessions > 90 days → DELETE (confirm with legal/compliance)
- Runs daily at 2 AM UTC

**Case Relationship:**
- `caseId` is optional; can be assigned mid-conversation
- When assigned, context builder includes case summary
- Multiple sessions can reference same case

---

## 3. API Contract Definitions

### 3.1 Send Message (Streaming)

**Endpoint:** `POST /api/ai/copilot/chat`

**Request:**
```typescript
interface SendMessageRequest {
  sessionId?: string;      // Create new if omitted
  caseId?: string;         // Optional; can attach later
  message: string;         // User text (max 2000 chars)
  demo?: boolean;          // Enable sandbox isolation
}
```

**Response: SSE Stream (text/event-stream)**
```
event: meta
data: {"sessionId":"sess_123","messageId":"msg_abc","model":"gpt-4o-mini","startedAt":1704067200000}

event: delta
data: {"chunk":"Hello, I'm your FairForm Copilot..."}

event: delta
data: {"chunk":" Let's review your case."}

event: done
data: {"tokensIn":453,"tokensOut":212,"latencyMs":1420}
```

**Response: JSON Fallback (application/json)**
```typescript
interface SendMessageResponse {
  sessionId: string;
  messageId: string;
  reply: string;
  meta: {
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
  };
}
```

### 3.2 List Messages (Pagination)

**Endpoint:** `GET /api/ai/copilot/messages?sessionId={id}&limit=20&after={timestamp}`

**Response:**
```typescript
interface ListMessagesResponse {
  items: AIMessage[];
  nextAfter?: number;      // Pass to fetch next page
  hasMore: boolean;
}
```

### 3.3 Create/Manage Session

**Endpoint:** `POST /api/ai/copilot/session`

**Request:**
```typescript
interface CreateSessionRequest {
  caseId?: string;
  demo?: boolean;
  title?: string;
}
```

**Response:**
```typescript
interface CreateSessionResponse {
  session: AISession;
}
```

### 3.4 Get Context Fingerprint

**Endpoint:** `GET /api/ai/copilot/context?caseId={id}`

**Response:**
```typescript
interface ContextResponse {
  snapshot: ContextSnapshot;
  fingerprint: string;
  updatedAt: number;
}
```

---

## 4. Security & Compliance

### 4.1 Authentication & Authorization

**API Security:**
- All endpoints require authentication (except demo with token)
- `requireAuth(request)` validates Firebase Auth token
- Session ownership verified before any operation

**Demo Mode Security:**
- **Preferred:** Separate Firebase project for demo
- **Alternative:** Strict namespace (`demo_*`) with Firestore rules blocking in prod
- Demo token required (env-configured)
- Never mix demo/prod data

### 4.2 PII Protection

**Context Builder Allowlist:**
```typescript
const ALLOWED_CASE_FIELDS = [
  'caseType',
  'jurisdiction',
  'currentStepOrder',
  'progressPct',
  'status'
];

// Never include free-text narratives by default
// Optional "Improve results" opt-in with in-line redaction
```

**PII Redaction:**
```typescript
function redactPII(text: string): string {
  return text
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
}
```

### 4.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() { 
      return request.auth != null; 
    }
    
    function isOwner(uid) { 
      return isSignedIn() && request.auth.uid == uid; 
    }
    
    // AI Sessions
    match /aiSessions/{sessionId} {
      allow read, update, delete: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId)
                     && request.resource.data.demo == false;
      
      // Demo sessions blocked in prod DB (use separate project)
      allow create: if false; // Force demo to separate project
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        );
        
        allow create: if isOwner(
          get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId
        ) && request.resource.data.author in ['user', 'assistant', 'system']
          && request.resource.data.content is string
          && request.resource.data.content.size() <= 8000; // Guard against oversized writes
        
        // Messages are immutable
        allow update, delete: if false;
      }
    }
    
    // Existing case rules remain unchanged
    match /cases/{caseId} {
      allow read, write: if isOwner(resource.data.userId);
    }
  }
}
```

### 4.4 Content Moderation

**Pre-call Moderation:**
```typescript
async function moderateUserInput(text: string): Promise<ModerationResult> {
  const response = await openai.moderations.create({ input: text });
  return {
    flagged: response.results[0].flagged,
    categories: response.results[0].categories
  };
}
```

**Post-call Moderation:**
```typescript
async function moderateAssistantOutput(text: string): Promise<boolean> {
  const moderation = await moderateUserInput(text);
  if (moderation.flagged) {
    // Do not store blocked output
    await logModerationEvent({ text, reason: moderation.categories });
    return false;
  }
  return true;
}
```

---

## 5. Performance & Scalability

### 5.1 Context Optimization

**Context Snapshot Strategy:**
```typescript
function buildContextSnapshot(caseData: Case): ContextSnapshot {
  const snapshot = {
    caseType: caseData.caseType,
    jurisdiction: caseData.jurisdiction,
    currentStepOrder: caseData.currentStep,
    progressPct: caseData.progressPct,
    userPrefs: {
      timeZone: caseData.user?.timeZone,
      tone: caseData.user?.settings?.aiTone || 'helpful'
    }
  };
  
  // Generate hash for caching
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(snapshot))
    .digest('hex');
  
  return { ...snapshot, hash };
}
```

**Sliding Window + Summarization:**
```typescript
async function buildPromptContext(
  sessionId: string,
  caseId?: string
): Promise<AIPromptContext> {
  const session = await getSession(sessionId);
  const messages = await getRecentMessages(sessionId, 6); // Last 6 messages
  
  // Get or create conversation summary
  let summary = session.conversationSummary;
  if (!summary && messages.length > 10) {
    summary = await summarizeConversation(messages.slice(0, -6));
  }
  
  return {
    user: { id: session.userId, timeZone: session.contextSnapshot.userPrefs?.timeZone },
    case: caseId ? await getCaseContext(caseId) : undefined,
    summary: summary || 'New conversation',
    fingerprint: session.contextSnapshot.hash
  };
}
```

### 5.2 Caching Strategy

**Multi-Level Caching:**
```typescript
// React Query cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min for context
      cacheTime: 30 * 60 * 1000,     // 30 min for sessions
    }
  }
});

// Server-side prompt cache
const promptCache = new Map<string, {
  prompt: string;
  timestamp: number;
}>();

function getCachedPrompt(fingerprint: string): string | null {
  const cached = promptCache.get(fingerprint);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.prompt;
  }
  return null;
}
```

### 5.3 Token Management

**Target: ≤ 3s Round Trip**

- Context snapshot: < 1KB JSON
- Sliding window: Last 6 messages only
- Conversation summary: Updated every 10 messages
- Model choice: `gpt-4o-mini` for speed
- Prompt caching by fingerprint

**Token Limits:**
```typescript
const TOKEN_LIMITS = {
  contextSnapshot: 500,
  conversationHistory: 1500,
  glossaryTerms: 300,
  userMessage: 500,
  maxTotal: 3000
};
```

---

## 6. Integration Patterns

### 6.1 Repository Layer

**New Repository: `lib/db/aiSessionsRepo.ts`**

```typescript
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { AISession, AIMessage } from '@/lib/ai/types';

export class AISessionsRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AISessionsRepositoryError';
  }
}

const SESSIONS_COLLECTION = 'aiSessions';
const MESSAGES_SUBCOLLECTION = 'messages';

export async function createSession(
  input: {
    userId: string;
    caseId?: string;
    demo?: boolean;
    title?: string;
  }
): Promise<AISession> {
  try {
    const db = getAdminFirestore();
    const now = Date.now();
    
    const docRef = await db.collection(SESSIONS_COLLECTION).add({
      userId: input.userId,
      caseId: input.caseId || null,
      title: input.title || 'New Conversation',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      contextSnapshot: {
        hash: '',
        userPrefs: {}
      },
      demo: input.demo || false
    });
    
    const snapshot = await docRef.get();
    return mapSessionDocument(snapshot);
  } catch (error) {
    throw new AISessionsRepositoryError('Failed to create session', { cause: error });
  }
}

export async function appendMessage(
  sessionId: string,
  message: {
    author: 'user' | 'assistant' | 'system';
    content: string;
    meta?: AIMessage['meta'];
  }
): Promise<AIMessage> {
  try {
    const db = getAdminFirestore();
    const now = Date.now();
    
    // Add message to subcollection
    const messageRef = await db
      .collection(SESSIONS_COLLECTION)
      .doc(sessionId)
      .collection(MESSAGES_SUBCOLLECTION)
      .add({
        sessionId,
        author: message.author,
        content: message.content,
        meta: message.meta || {},
        createdAt: now
      });
    
    // Update session lastMessageAt
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      lastMessageAt: now,
      updatedAt: now
    });
    
    const messageSnapshot = await messageRef.get();
    return mapMessageDocument(messageSnapshot);
  } catch (error) {
    throw new AISessionsRepositoryError('Failed to append message', { cause: error });
  }
}

export async function listMessages(
  sessionId: string,
  options: { after?: number; limit?: number } = {}
): Promise<{ items: AIMessage[]; hasMore: boolean }> {
  try {
    const db = getAdminFirestore();
    const limit = options.limit || 20;
    
    let query = db
      .collection(SESSIONS_COLLECTION)
      .doc(sessionId)
      .collection(MESSAGES_SUBCOLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(limit + 1); // Fetch one extra to check hasMore
    
    if (options.after) {
      query = query.where('createdAt', '<', options.after);
    }
    
    const snapshot = await query.get();
    const messages = snapshot.docs.slice(0, limit).map(mapMessageDocument);
    const hasMore = snapshot.docs.length > limit;
    
    return { items: messages, hasMore };
  } catch (error) {
    throw new AISessionsRepositoryError('Failed to list messages', { cause: error });
  }
}

export async function updateContextSnapshot(
  sessionId: string,
  snapshot: Partial<AISession['contextSnapshot']>
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      contextSnapshot: snapshot,
      updatedAt: Date.now()
    });
  } catch (error) {
    throw new AISessionsRepositoryError('Failed to update context', { cause: error });
  }
}

export async function archiveOldSessions(days: number): Promise<number> {
  try {
    const db = getAdminFirestore();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const snapshot = await db
      .collection(SESSIONS_COLLECTION)
      .where('lastMessageAt', '<', cutoff)
      .where('status', '==', 'active')
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'archived', updatedAt: Date.now() });
    });
    
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    throw new AISessionsRepositoryError('Failed to archive sessions', { cause: error });
  }
}

function mapSessionDocument(snapshot: any): AISession {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    caseId: data.caseId,
    title: data.title,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastMessageAt: data.lastMessageAt,
    contextSnapshot: data.contextSnapshot,
    demo: data.demo || false
  };
}

function mapMessageDocument(snapshot: any): AIMessage {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    sessionId: data.sessionId,
    author: data.author,
    content: data.content,
    meta: data.meta,
    createdAt: data.createdAt
  };
}
```

### 6.2 React Hooks

**Context Hook:**
```typescript
// lib/hooks/useAIContext.ts
export function useAIContext(caseId?: string) {
  return useQuery({
    queryKey: ['aiContext', caseId ?? 'none'],
    queryFn: async () => {
      if (!caseId) return null;
      const response = await fetch(`/api/ai/copilot/context?caseId=${caseId}`);
      if (!response.ok) throw new Error('Failed to fetch context');
      return response.json() as Promise<ContextResponse>;
    },
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000
  });
}
```

**Chat Hook:**
```typescript
// lib/hooks/useAICopilot.ts
export function useAICopilot(sessionId?: string) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      setIsStreaming(true);
      const response = await fetch('/api/ai/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message })
      });
      
      // Handle SSE streaming
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        return handleSSEStream(response);
      }
      
      // Fallback to JSON
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
      setIsStreaming(false);
    }
  });
  
  return {
    messages,
    sendMessage: sendMessage.mutate,
    isStreaming,
    error: sendMessage.error
  };
}
```

### 6.3 Context Builder

**Core Context Builder: `lib/ai/contextBuilder.ts`**

```typescript
import type { AIPromptContext, ContextSnapshot } from './types';
import { getCase } from '@/lib/db/casesRepo';
import { listStepsByCase } from '@/lib/db/stepsRepo';
import crypto from 'crypto';

export async function buildPromptContext(
  userId: string,
  caseId?: string,
  userPrefs?: ContextSnapshot['userPrefs']
): Promise<AIPromptContext> {
  const context: AIPromptContext = {
    user: {
      id: userId,
      timeZone: userPrefs?.timeZone
    },
    summary: '',
    fingerprint: ''
  };
  
  if (caseId) {
    const caseData = await getCase(caseId);
    const steps = await listStepsByCase(caseId);
    
    if (caseData) {
      context.case = {
        id: caseData.id,
        caseType: caseData.caseType,
        jurisdiction: caseData.jurisdiction,
        currentStepOrder: caseData.currentStep,
        progressPct: caseData.progressPct
      };
      
      // Build concise summary
      const incompleteSteps = steps.filter(s => !s.isComplete).slice(0, 3);
      context.summary = `User has a ${caseData.caseType} case in ${caseData.jurisdiction}. ` +
        `Progress: ${caseData.progressPct}%. ` +
        `Next steps: ${incompleteSteps.map(s => s.title).join(', ')}.`;
    }
  }
  
  // Generate fingerprint for caching
  const fingerprintData = JSON.stringify({
    caseType: context.case?.caseType,
    jurisdiction: context.case?.jurisdiction,
    currentStep: context.case?.currentStepOrder,
    userPrefs
  });
  
  context.fingerprint = crypto
    .createHash('sha256')
    .update(fingerprintData)
    .digest('hex');
  
  return context;
}
```

---

## 7. Error Handling & Resilience

### 7.1 OpenAI API Error Handling

```typescript
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'MODEL_ERROR' | 'NETWORK_ERROR' | 'MODERATION_BLOCKED',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  options: { timeout?: number; maxRetries?: number } = {}
): Promise<string> {
  const maxRetries = options.maxRetries || 2;
  const timeout = options.timeout || 30000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 1000
      }, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.choices[0]?.message?.content || FALLBACK_RESPONSE;
      
    } catch (error: any) {
      // Rate limit - exponential backoff
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] || Math.pow(2, attempt);
        if (attempt < maxRetries) {
          await sleep(retryAfter * 1000);
          continue;
        }
        throw new AIServiceError('Rate limit exceeded', 'RATE_LIMIT', retryAfter);
      }
      
      // Quota exceeded
      if (error.status === 429 && error.code === 'insufficient_quota') {
        throw new AIServiceError('API quota exceeded', 'QUOTA_EXCEEDED');
      }
      
      // Model error
      if (error.status >= 500) {
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 1000);
          continue;
        }
        throw new AIServiceError('AI service error', 'MODEL_ERROR');
      }
      
      // Network/timeout
      if (error.name === 'AbortError') {
        throw new AIServiceError('Request timeout', 'NETWORK_ERROR');
      }
      
      throw error;
    }
  }
  
  throw new AIServiceError('Max retries exceeded', 'NETWORK_ERROR');
}

const FALLBACK_RESPONSE = "I'm having trouble processing that right now. Please try rephrasing your question or try again in a moment.";

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 7.2 Graceful Degradation

```typescript
// Fallback responses by context
const FALLBACK_RESPONSES = {
  general: "I'm experiencing technical difficulties. Please try again in a moment.",
  caseSpecific: "I can see you're working on your case, but I'm having trouble connecting right now. Your progress is saved.",
  demo: "Demo mode is temporarily unavailable. Please try the manual case creation option."
};

function getFallbackResponse(context?: AIPromptContext): string {
  if (context?.case) return FALLBACK_RESPONSES.caseSpecific;
  if (context?.user.id.startsWith('demo')) return FALLBACK_RESPONSES.demo;
  return FALLBACK_RESPONSES.general;
}
```

---

## 8. Implementation Roadmap

### Week 1: Core Infrastructure

**Priority 1: Foundation**
- [ ] Create `lib/db/aiSessionsRepo.ts` with subcollection pattern
- [ ] Implement `POST /api/ai/copilot/chat` with SSE streaming
- [ ] Build `lib/ai/contextBuilder.ts` with fingerprinting
- [ ] Set up separate demo Firebase project

**Priority 2: Basic UI**
- [ ] Create `<AICopilotWidget />` floating button
- [ ] Build `<ChatPanel />` with message display
- [ ] Implement `useAICopilot()` hook

**Deliverable:** Working chat with context awareness

### Week 2: Advanced Features

**Priority 1: Context & Performance**
- [ ] Implement conversation summarization
- [ ] Add message pagination (`GET /api/ai/copilot/messages`)
- [ ] Build context snapshot system
- [ ] Integrate glossary system for inline definitions

**Priority 2: Session Management**
- [ ] Create session lifecycle management
- [ ] Implement `POST /api/ai/copilot/session`
- [ ] Add context fingerprint caching
- [ ] Build session archival system

**Deliverable:** Full-featured copilot with optimizations

### Week 3: Polish & Compliance

**Priority 1: Security & Compliance**
- [ ] Implement comprehensive Firestore rules
- [ ] Add pre/post content moderation
- [ ] Build disclaimer injection system
- [ ] Complete PII redaction

**Priority 2: Demo & Testing**
- [ ] Configure demo sandbox environment
- [ ] Performance testing (< 3s target)
- [ ] Accessibility testing
- [ ] End-to-end testing

**Deliverable:** Production-ready, demo-optimized copilot

---

## 9. Testing Strategy

### 9.1 Unit Tests

```typescript
// lib/db/aiSessionsRepo.test.ts
describe('aiSessionsRepo', () => {
  it('creates session with correct structure', async () => {
    const session = await createSession({
      userId: 'test-user',
      caseId: 'test-case'
    });
    
    expect(session.userId).toBe('test-user');
    expect(session.caseId).toBe('test-case');
    expect(session.status).toBe('active');
  });
  
  it('appends messages to subcollection', async () => {
    const message = await appendMessage('session-id', {
      author: 'user',
      content: 'Test message'
    });
    
    expect(message.author).toBe('user');
    expect(message.sessionId).toBe('session-id');
  });
});
```

### 9.2 Integration Tests

```typescript
// app/api/ai/copilot/chat/route.test.ts
describe('POST /api/ai/copilot/chat', () => {
  it('streams response with SSE', async () => {
    const response = await fetch('/api/ai/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        sessionId: 'test-session'
      })
    });
    
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    // Test SSE parsing
  });
});
```

### 9.3 Performance Tests

- Chat latency < 3s (p95)
- Context building < 100ms
- Message pagination < 200ms
- Session creation < 150ms

---

## 10. Monitoring & Observability

### 10.1 Key Metrics

```typescript
// Track these metrics
const METRICS = {
  chatLatency: 'ai.copilot.chat.latency',
  tokensUsed: 'ai.copilot.tokens.total',
  moderationBlocks: 'ai.copilot.moderation.blocked',
  errorRate: 'ai.copilot.errors.rate',
  sessionCreations: 'ai.copilot.sessions.created'
};
```

### 10.2 Logging

```typescript
// Structured logging for AI operations
function logAIOperation(operation: string, data: Record<string, any>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    operation: `ai.copilot.${operation}`,
    ...data
  }));
}
```

---

## 11. Risk Mitigation Summary

| Risk | Impact | Mitigation |
|------|--------|------------|
| **PII Leakage** | High | Allowlist fields, redact free text, opt-in for raw text |
| **Token Bloat** | Medium | Context snapshots, sliding window, summarization |
| **Hot Document Writes** | Medium | Messages subcollection, avoid array appends |
| **Demo/Prod Mix-up** | High | Separate Firebase projects, env guards, CI checks |
| **AI Overconfidence** | Medium | Persistent disclaimers, safe fallbacks |
| **SSE Compatibility** | Low | JSON fallback, proper headers, Vercel testing |

---

## 12. Success Criteria

### Demo Readiness
- ✅ Conversational case creation working
- ✅ Context-aware responses accurate
- ✅ Accessible anywhere in app
- ✅ No login/form gates for demo
- ✅ Zero compliance issues

### Performance
- ✅ Chat latency ≤ 3s (p95)
- ✅ Context accuracy 90%+
- ✅ Streaming works smoothly
- ✅ No hot-document issues

### Security
- ✅ All endpoints authenticated
- ✅ Demo isolation complete
- ✅ PII protection verified
- ✅ Firestore rules tested

---

## Appendix A: React Query Keys

```typescript
// lib/hooks/queryKeys.ts
export const aiQueryKeys = {
  session: (id: string) => ['aiSession', id] as const,
  messages: (id: string) => ['aiSession', id, 'messages'] as const,
  context: (caseId?: string) => ['aiContext', caseId ?? 'none'] as const,
  allSessions: (userId: string) => ['aiSessions', userId] as const
};
```

---

## Appendix B: Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1000

# Demo mode
DEMO_FIREBASE_PROJECT_ID=fairform-demo
DEMO_TOKEN=demo-secret-token

# Session lifecycle
SESSION_ARCHIVE_DAYS_PROD=7
SESSION_ARCHIVE_DAYS_DEMO=1
SESSION_DELETE_DAYS_PROD=90
SESSION_DELETE_DAYS_DEMO=14
```

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2025 | Initial architecture review | Dev Team |
| 1.5 | Jan 2025 | PRD team refinements | PRD Team |
| 2.0 | Jan 2025 | Unified specification | Combined Teams |

---

**Approved By:**
- ✅ Product Owner
- ✅ Architect
- ✅ Developer
- ✅ PRD Team

**Next Steps:** Begin Week 1 implementation with story creation based on this specification.
