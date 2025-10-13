# Epic 13 Architecture Review Response

**Document Version:** 1.0  
**Date:** January 2025  
**Reviewers:** Product Owner, Architect, Developer  
**Status:** ⚠️ DEPRECATED - Superseded by Unified Specification

---

## DEPRECATION NOTICE

**This document has been superseded by the unified architecture specification.**

📄 **Current Document:** `docs/epic-13-unified-architecture-specification.md`

**Reason for Deprecation:**  
This document has been merged with the PRD team's architecture response to create a single, comprehensive specification that combines the best insights from both reviews.

**Date Deprecated:** January 2025

---

## Original Document (For Historical Reference)  

---

## Executive Summary

This document provides comprehensive answers to the architecture review questions for Epic 13: AI Copilot & Dynamic Intake Experience. The proposed architecture aligns well with FairForm's existing patterns while introducing necessary enhancements for context-aware AI capabilities.

---

## 1. Architecture Validation

### ✅ **Alignment with FairForm Repository Pattern**

The proposed architecture **fully aligns** with FairForm's existing patterns:

**Existing Patterns Maintained:**
- **Repository Pattern**: Extends existing `casesRepo.ts` and `stepsRepo.ts` patterns
- **React Query Integration**: Follows established caching and state management
- **API Route Structure**: Uses Next.js App Router pattern (`app/api/ai/chat/route.ts`)
- **TypeScript Strict Mode**: All new components follow existing type safety standards
- **Firebase Integration**: Leverages existing Firestore and Auth infrastructure

**Repository Extensions:**
```typescript
// New: lib/db/aiSessionsRepo.ts
export class AISessionsRepository {
  async createSession(userId: string, caseId?: string): Promise<AISession>
  async addMessage(sessionId: string, message: ChatMessage): Promise<void>
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]>
  async updateSessionContext(sessionId: string, context: CaseContext): Promise<void>
}
```

### ✅ **No Architectural Gaps Identified**

The proposed architecture addresses all necessary concerns:
- **Data Flow**: Clear separation between UI, middleware, data, and AI layers
- **Context Management**: Dedicated context broker handles case data aggregation
- **State Management**: React Query provides caching and synchronization
- **Error Handling**: Follows existing error handling patterns with custom error classes

### ✅ **aiSessions Collection Strategy**

**Recommended Schema:**
```typescript
interface AISession {
  id: string;
  userId: string;
  caseId?: string; // Optional - can be general chat
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // 30-day TTL for demo compliance
  context: {
    caseType?: string;
    jurisdiction?: string;
    currentStep?: number;
    userPreferences?: UserSettings;
  };
  messages: ChatMessage[];
  metadata: {
    totalTokens: number;
    lastActivity: Date;
    isActive: boolean;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: CaseContext; // Snapshot of context when message was sent
}
```

---

## 2. Data Model Design

### **aiSessions Schema Details**

**Collection Structure:**
```
aiSessions/{sessionId}
├── userId: string (indexed)
├── caseId?: string (indexed, optional)
├── createdAt: timestamp
├── updatedAt: timestamp
├── expiresAt: timestamp (30-day TTL)
├── context: object
│   ├── caseType?: string
│   ├── jurisdiction?: string
│   ├── currentStep?: number
│   └── userPreferences?: object
├── messages: array
│   ├── id: string
│   ├── role: 'user' | 'assistant'
│   ├── content: string
│   ├── timestamp: timestamp
│   └── context?: object
└── metadata: object
    ├── totalTokens: number
    ├── lastActivity: timestamp
    └── isActive: boolean
```

### **Session Lifecycle Management**

**Creation:**
- Automatic session creation on first chat message
- Default 30-day expiration for demo compliance
- Context initialization from current page/route

**Expiration:**
```typescript
// Firestore TTL rules
export const aiSessionsRules = {
  expiresAt: {
    // Auto-delete after 30 days
    deleteAfter: 30 * 24 * 60 * 60 * 1000
  }
};
```

**Cleanup:**
- Cloud Function scheduled job runs daily
- Removes expired sessions and associated data
- Maintains audit trail for compliance

### **Session-Case Relationship**

**Relationship Types:**
1. **Case-Specific Sessions**: `caseId` populated, full context available
2. **General Sessions**: `caseId` null, limited context (user preferences only)
3. **Demo Sessions**: Special `demo: true` flag, sandbox data only

**Context Injection:**
```typescript
async function buildContext(sessionId: string, caseId?: string): Promise<CaseContext> {
  const session = await getSession(sessionId);
  if (!caseId) return { userPreferences: session.context.userPreferences };
  
  const case = await getCase(caseId);
  const steps = await listStepsByCase(caseId);
  
  return {
    caseType: case.caseType,
    jurisdiction: case.jurisdiction,
    currentStep: case.currentStep,
    totalSteps: case.totalSteps,
    progressPct: case.progressPct,
    recentSteps: steps.slice(0, 3), // Last 3 steps for context
    userPreferences: session.context.userPreferences
  };
}
```

---

## 3. Security & Compliance

### **Context Broker API Security**

**Authentication:**
```typescript
// app/api/ai/contextBroker.ts
export async function GET(request: NextRequest) {
  const user = await requireAuth(request); // Existing auth pattern
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  
  // Verify session ownership
  const session = await getSession(sessionId);
  if (session.userId !== user.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Build and return context
  const context = await buildContext(sessionId, session.caseId);
  return NextResponse.json({ context });
}
```

**Rate Limiting:**
- 60 requests per minute per user
- Exponential backoff for AI API calls
- Circuit breaker pattern for OpenAI failures

### **Firestore Security Rules**

```javascript
// firestore.rules
match /aiSessions/{sessionId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.userId;
}

match /aiSessions/{sessionId}/messages/{messageId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId;
}
```

### **Demo Sandbox Mode**

**Safe Demo Implementation:**
```typescript
const DEMO_SANDBOX = {
  enabled: process.env.NODE_ENV === 'demo',
  caseData: {
    caseType: 'eviction',
    jurisdiction: 'Marion County, IN',
    currentStep: 3,
    totalSteps: 8,
    progressPct: 37
  },
  userData: {
    preferences: { tone: 'helpful', complexity: 'simple' }
  }
};

// Context builder respects demo mode
function buildContext(sessionId: string, caseId?: string): CaseContext {
  if (DEMO_SANDBOX.enabled) {
    return DEMO_SANDBOX.caseData;
  }
  // ... normal context building
}
```

### **PII Handling**

**Data Minimization:**
- Only necessary case fields sent to AI
- User emails/names anonymized in prompts
- No sensitive case details in conversation logs
- Automatic PII detection and redaction

---

## 4. Integration with Existing Systems

### **React Query Integration**

**New Hooks Following Existing Patterns:**
```typescript
// lib/hooks/useAISession.ts
export function useAISession(sessionId?: string) {
  return useQuery({
    queryKey: ['aiSession', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// lib/hooks/useAIChat.ts
export function useAIChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const sendMessage = useMutation({
    mutationFn: (message: string) => sendChatMessage(sessionId, message),
    onSuccess: (response) => {
      setMessages(prev => [...prev, response.message]);
      queryClient.invalidateQueries(['aiSession', sessionId]);
    }
  });
  
  return { messages, sendMessage, isLoading: sendMessage.isPending };
}
```

### **Repository Extensions**

**Extend Existing Repos:**
```typescript
// lib/db/casesRepo.ts - Add AI context methods
export async function getCaseForAI(caseId: string): Promise<CaseAIContext> {
  const case = await getCase(caseId);
  const steps = await listStepsByCase(caseId);
  
  return {
    id: case.id,
    title: case.title,
    caseType: case.caseType,
    jurisdiction: case.jurisdiction,
    currentStep: case.currentStep,
    progressPct: case.progressPct,
    nextSteps: steps.filter(s => !s.isComplete).slice(0, 3)
  };
}
```

### **Real-time Context Updates**

**Context Synchronization:**
```typescript
// lib/ai/contextManager.ts
export class ContextManager {
  private subscriptions = new Map<string, () => void>();
  
  subscribeToCase(caseId: string, callback: (context: CaseContext) => void) {
    const unsubscribe = onSnapshot(
      doc(db, 'cases', caseId),
      (doc) => {
        const caseData = doc.data();
        callback(this.buildContextFromCase(caseData));
      }
    );
    
    this.subscriptions.set(caseId, unsubscribe);
    return unsubscribe;
  }
}
```

---

## 5. Performance & Scalability

### **Context Size Optimization**

**Smart Context Trimming:**
```typescript
function optimizeContext(context: CaseContext): OptimizedContext {
  return {
    caseType: context.caseType,
    jurisdiction: context.jurisdiction,
    currentStep: context.currentStep,
    // Only include recent/relevant steps
    relevantSteps: context.recentSteps.slice(0, 2),
    // Truncate long descriptions
    stepDescription: context.stepDescription?.substring(0, 200) + '...',
    // Exclude completed steps from context
    upcomingSteps: context.upcomingSteps.slice(0, 3)
  };
}
```

**Token Management:**
- Context limited to 2000 tokens max
- Conversation history truncated to last 10 messages
- Automatic context summarization for long conversations

### **Caching Strategy**

**Multi-Level Caching:**
```typescript
// React Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes for case context
      cacheTime: 30 * 60 * 1000, // 30 minutes for AI sessions
    }
  }
});

// Context cache with invalidation
const contextCache = new Map<string, { context: CaseContext, timestamp: number }>();
const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### **Conversation History Pagination**

**Efficient Message Loading:**
```typescript
export async function getSessionMessages(
  sessionId: string, 
  page = 1, 
  limit = 20
): Promise<{ messages: ChatMessage[], hasMore: boolean }> {
  const session = await getSession(sessionId);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const messages = session.messages.slice(startIndex, endIndex);
  const hasMore = endIndex < session.messages.length;
  
  return { messages, hasMore };
}
```

---

## 6. Technology Selection

### **Additional Libraries Needed**

**Required Dependencies:**
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0", // Already in use
    "openai": "^4.0.0", // For OpenAI API integration
    "zod": "^3.22.0", // Already in use for validation
    "date-fns": "^2.30.0" // For date handling in sessions
  }
}
```

**No Additional Libraries Needed:**
- WebSockets: Not required for MVP (polling/session-based updates sufficient)
- Real-time: Firebase real-time listeners handle live updates
- Streaming: Standard HTTP responses adequate for demo

### **OpenAI API Error Handling**

**Robust Error Management:**
```typescript
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'MODEL_ERROR' | 'NETWORK_ERROR',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const maxRetries = 3;
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.2,
        max_tokens: 1000
      });
      
      return response.choices[0]?.message?.content || 'I apologize, but I cannot respond right now.';
    } catch (error) {
      lastError = error as Error;
      
      if (error.status === 429) { // Rate limit
        const retryAfter = error.headers?.['retry-after'] || Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      if (attempt === maxRetries) break;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new AIServiceError(
    'AI service temporarily unavailable',
    'NETWORK_ERROR'
  );
}
```

### **Streaming Response Consideration**

**Recommendation: Defer to Phase 2**
- Standard HTTP responses sufficient for demo
- Streaming adds complexity without significant UX benefit for MVP
- Can be implemented later with Server-Sent Events if needed

---

## 7. Detailed Data Model Schemas

### **TypeScript Interfaces**

```typescript
// lib/ai/types.ts
export interface AISession {
  id: string;
  userId: string;
  caseId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  context: SessionContext;
  messages: ChatMessage[];
  metadata: SessionMetadata;
}

export interface SessionContext {
  caseType?: string;
  jurisdiction?: string;
  currentStep?: number;
  totalSteps?: number;
  progressPct?: number;
  userPreferences?: UserPreferences;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: CaseContext; // Snapshot when message was sent
  tokens?: number;
}

export interface CaseContext {
  caseId: string;
  title: string;
  caseType: string;
  jurisdiction: string;
  currentStep: number;
  totalSteps: number;
  progressPct: number;
  nextSteps: CaseStep[];
  recentActivity: string[];
}

export interface UserPreferences {
  tone: 'formal' | 'friendly' | 'helpful';
  complexity: 'simple' | 'detailed';
  includeDisclaimers: boolean;
}

export interface SessionMetadata {
  totalTokens: number;
  lastActivity: Date;
  isActive: boolean;
  messageCount: number;
}
```

---

## 8. API Contract Definitions

### **Chat API Endpoints**

```typescript
// POST /api/ai/chat
interface ChatRequest {
  message: string;
  sessionId?: string;
  caseId?: string;
  includeContext?: boolean;
}

interface ChatResponse {
  message: string;
  sessionId: string;
  context?: CaseContext;
  disclaimer?: string;
  metadata: {
    tokens: number;
    processingTime: number;
  };
}

// GET /api/ai/context
interface ContextRequest {
  sessionId: string;
  caseId?: string;
}

interface ContextResponse {
  context: CaseContext;
  lastUpdated: Date;
}

// POST /api/ai/session
interface CreateSessionRequest {
  caseId?: string;
  initialContext?: Partial<SessionContext>;
}

interface CreateSessionResponse {
  sessionId: string;
  context: SessionContext;
}
```

---

## 9. Architectural Risks and Mitigation

### **Identified Risks**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **OpenAI API Failures** | High | Medium | Circuit breaker, fallback responses, retry logic |
| **Context Size Limits** | Medium | High | Context optimization, summarization, truncation |
| **Session Data Growth** | Medium | High | TTL policies, cleanup jobs, pagination |
| **PII Leakage** | High | Low | Data minimization, anonymization, audit logs |
| **Demo Performance** | Medium | Medium | Caching, optimized queries, pre-warmed data |

### **Mitigation Strategies**

**1. AI Service Reliability:**
```typescript
const FALLBACK_RESPONSES = {
  general: "I'm having trouble connecting right now. Please try again in a moment.",
  caseSpecific: "I can see you're working on your case. Let me get back to you with a proper response shortly."
};
```

**2. Performance Monitoring:**
```typescript
// Add performance tracking
const trackAIPerformance = (operation: string, duration: number, tokens: number) => {
  console.log(`AI ${operation}: ${duration}ms, ${tokens} tokens`);
  // Send to monitoring service
};
```

**3. Graceful Degradation:**
- Fallback to static help content if AI unavailable
- Context-aware error messages
- Progressive enhancement approach

---

## 10. Integration Patterns

### **Component Integration**

```typescript
// components/ai-chat/AICopilotChat.tsx
export function AICopilotChat({ caseId }: { caseId?: string }) {
  const { user } = useAuth();
  const { data: session } = useAISession();
  const { messages, sendMessage, isLoading } = useAIChat(session?.id);
  const { data: context } = useCaseContext(caseId);
  
  return (
    <ChatPanel
      messages={messages}
      onSendMessage={sendMessage}
      isLoading={isLoading}
      context={context}
    />
  );
}
```

### **Global Integration**

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
          <AICopilotWidget /> {/* Persistent chat widget */}
        </AppProviders>
      </body>
    </html>
  );
}
```

---

## 11. Recommendations

### **Implementation Priority**

1. **Week 1**: Core chat infrastructure, basic context
2. **Week 2**: Full context integration, session management
3. **Week 3**: Compliance layer, demo optimization, testing

### **Demo Configuration**

```typescript
// lib/demo/config.ts
export const DEMO_CONFIG = {
  enabled: process.env.NODE_ENV === 'demo',
  sandboxData: {
    case: MOCK_CASE_DATA,
    user: MOCK_USER_DATA,
    steps: MOCK_STEPS_DATA
  },
  features: {
    realTimeUpdates: false, // Simplified for demo
    advancedContext: true,
    sessionPersistence: true
  }
};
```

---

## 12. Conclusion

The proposed Epic 13 architecture is **well-designed, feasible, and aligned** with FairForm's existing patterns. Key strengths:

✅ **Maintains existing patterns** (repository, React Query, TypeScript)  
✅ **Addresses all security concerns** with proper authentication and data handling  
✅ **Provides clear performance optimization strategies**  
✅ **Includes comprehensive error handling and fallbacks**  
✅ **Supports demo requirements** with sandbox mode  

**Recommendation: APPROVE** for implementation with the following conditions:
- Implement monitoring and alerting for AI service health
- Conduct security review of context broker API
- Validate performance under load before demo
- Complete compliance testing of disclaimer system

---

**Review Completed By:**  
- Product Owner: ✅ Approved  
- Architect: ✅ Approved with recommendations  
- Developer: ✅ Approved, ready for implementation  

**Next Steps:** Proceed with story creation and implementation planning.
