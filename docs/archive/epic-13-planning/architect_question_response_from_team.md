# Epic 13 Architecture Response from PRD Team

**Status:** ⚠️ DEPRECATED - Superseded by Unified Specification

---

## DEPRECATION NOTICE

**This document has been superseded by the unified architecture specification.**

📄 **Current Document:** `docs/epic-13-unified-architecture-specification.md`

**Reason for Deprecation:**  
This document has been merged with the initial architecture review to create a single, comprehensive specification that combines the best insights from both reviews.

**Date Deprecated:** January 2025

---

## Original Document (For Historical Reference)

**✅ 1\) Architecture Validation**

**Verdict:** **Approve with 5 surgical modifications** (below). Overall the layering aligns with FairForm’s repository pattern and Sprint 2/3 stack.

**What aligns:**

* **UI**: `<AICopilotChat/>` \+ floating bubble is fine; keep presentation components dumb and delegate all data/IO to hooks.

* **Middleware**: `api/ai/contextBroker.ts` \+ `lib/ai/contextBuilder.ts` \+ `lib/ai/promptTemplates.ts` fit the existing “UI → Hook → API route → Repo” pattern.

* **Data layer**: Firestore \+ React Query unchanged. Add **`aiSessions` repo**.

* **AI layer**: OpenAI \+ moderation \+ logging behind the API route (never from the client).

**Modifications to adopt:**

1. **Introduce an `aiSessionsRepo.ts`** (repository pattern parity):

   * No direct Firestore usage in API handlers; handlers call repo functions only.

2. **Split session storage:** `aiSessions/{sessionId}` \+ **subcollection** `messages/{messageId}` to allow pagination and avoid hot-doc contention.

3. **Add “context snapshots”**: `aiSessions/{sessionId}.contextSnapshot` (small, structured, hashable) to keep prompts short and fast.

4. **Adopt SSE/streaming from the API route** for better UX and lower TTFB (with a non-streaming fallback).

5. **Demo mode isolation**: use **separate Firebase project** (preferred) or a strict namespace (`demo_*`) \+ rules block; never mix with prod sessions.

---

# **🧱 2\) Data Model Design**

### **TypeScript interfaces (server-side shapes)**

// lib/ai/types.ts  
export type Author \= 'user' | 'assistant' | 'system';

export interface AISession {  
  id: string;  
  userId: string;        // auth.uid  
  caseId?: string | null;  
  title: string;         // "Small Claims – Tenant Issue"  
  status: 'active' | 'archived' | 'ended';  
  createdAt: number;     // epoch ms  
  updatedAt: number;     // epoch ms  
  lastMessageAt: number; // epoch ms  
  // Small, structured, allowlisted context (never full PII text)  
  contextSnapshot: {  
    caseType?: 'eviction'|'small\_claims'|'family'|'debt'|'employment'|'other';  
    jurisdiction?: string;  
    currentStepOrder?: number;  
    progressPct?: number;  
    userPrefs?: { aiParticipation?: boolean; timeZone?: string };  
    // hash to dedupe prompts quickly  
    hash: string;  
  };  
  demo: boolean;         // true when in demo sandbox  
}

export interface AIMessage {  
  id: string;  
  sessionId: string;  
  author: Author;  
  content: string;       // plain text; never store raw PII from inputs if policy forbids  
  // optional structured fields for tool/command results  
  meta?: {  
    tokensIn?: number;  
    tokensOut?: number;  
    latencyMs?: number;  
    blocked?: boolean;   // moderation result  
    model?: string;  
  };  
  createdAt: number;     // epoch ms  
}

export interface AIPromptContext {  
  user: { id: string; timeZone?: string };  
  case?: {  
    id: string;  
    caseType?: string;  
    jurisdiction?: string;  
    currentStepOrder?: number;  
    progressPct?: number;  
  };  
  // concise narrative compiled from allowlisted fields only  
  summary: string;  
  glossaryTerms?: Array\<{ term: string; definition: string }\>;  
  // used for caching/ETag  
  fingerprint: string; // e.g., sha256 of the serialized context  
}

### **Firestore structure**

aiSessions/{sessionId}               // AISession  
  \- id  
  \- userId  
  \- caseId  
  \- status  
  \- createdAt, updatedAt, lastMessageAt  
  \- contextSnapshot { caseType, jurisdiction, ... , hash }  
  \- demo: boolean

aiSessions/{sessionId}/messages/{messageId}   // AIMessage  
  \- author: 'user'|'assistant'|'system'  
  \- content: string  
  \- meta { tokensIn, tokensOut, latencyMs, blocked, model }  
  \- createdAt

### **Session lifecycle**

* **Creation**: on first chat open or when “Ask Copilot” is clicked.

* **Expiration**: if `lastMessageAt` \> **7 days** (prod) or **24 hours** (demo), mark `status='archived'`.

* **Cleanup**: scheduled job (Cloud Function / Vercel Cron) purges:

  * demo sessions \> 14 days

  * prod sessions \> 90 days (configurable, confirm with legal/compliance)

* **Case relationship**:

  * `AISession.caseId` optional; can be assigned mid-conversation when Copilot recognizes intent (“Start small claims”).

  * If assigned, the context builder includes case summary for future turns.

---

# **🔌 3\) API Contract Definitions**

### **3.1 Send a message (streaming)**

`POST /api/ai/copilot/chat` → **SSE stream** (fallback: JSON)

**Request (JSON)**

interface SendMessageRequest {  
  sessionId?: string;   // new if omitted  
  caseId?: string;      // optional; Copilot can attach later  
  message: string;      // user text  
  demo?: boolean;       // enable sandbox isolation  
}

**SSE Response (text/event-stream)**

event: meta  
data: {"sessionId":"sess\_123","messageId":"msg\_abc","model":"gpt-4o-mini","startedAt":...}

event: delta  
data: {"chunk":"Hello, I'm your FairForm Copilot..."}

event: delta  
data: {"chunk":" Let's review your case."}

event: done  
data: {"tokensIn":453,"tokensOut":212,"latencyMs":1420}

**Non-streaming fallback (JSON)**

{  
  "sessionId": "sess\_123",  
  "messageId": "msg\_abc",  
  "reply": "Hello, I'm your FairForm Copilot... Let's review your case.",  
  "meta": { "tokensIn": 453, "tokensOut": 212, "latencyMs": 1420 }  
}

### **3.2 List messages (pagination)**

`GET /api/ai/copilot/messages?sessionId=sess_123&limit=20&after=1696880000000`

**Response**

interface ListMessagesResponse {  
  items: AIMessage\[\];  
  nextAfter?: number; // pass to fetch next page  
}

### **3.3 Create/attach session**

`POST /api/ai/copilot/session`

interface CreateSessionRequest {  
  caseId?: string;  
  demo?: boolean;  
  title?: string;  
}  
interface CreateSessionResponse {  
  session: AISession;  
}

### **3.4 Health/context fingerprint (optional)**

`GET /api/ai/copilot/context?caseId=...`

interface ContextResponse {  
  snapshot: AISession\['contextSnapshot'\];  
  fingerprint: string;  
  updatedAt: number;  
}

---

# **🔒 4\) Security Recommendations & Firestore Rules**

### **API security**

* **Auth required** for all non-demo endpoints.

* **Demo endpoints** require a **demo token** (env-configured) or are routed to a **demo Firebase project**.

* All AI calls go **server-side**. Never expose OpenAI keys to the client.

### **PII & context safety**

* `contextBuilder` uses an **allowlist** of case fields (caseType, jurisdiction, step orders). **Never include free-text narratives** by default.

* Add an optional “Improve results” **opt-in** to include user-supplied text with in-line redaction of phone/emails/addresses.

### **Firestore security rules (sketch)**

rules\_version \= '2';  
service cloud.firestore {  
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth \!= null; }  
    function isOwner(uid) { return isSignedIn() && request.auth.uid \== uid; }

    // Sessions  
    match /aiSessions/{sessionId} {  
      allow read, update, delete: if isOwner(resource.data.userId);  
      allow create: if isOwner(request.resource.data.userId)  
                     && request.resource.data.demo \== false;

      // Demo sessions blocked in prod DB  
      allow create: if false; // in prod; use demo project instead

      // Messages subcollection  
      match /messages/{messageId} {  
        allow read: if isOwner(get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId);  
        allow create: if isOwner(get(/databases/$(database)/documents/aiSessions/$(sessionId)).data.userId)  
                       && request.resource.data.author in \['user','assistant','system'\]  
                       && request.resource.data.content is string  
                       && request.resource.data.content.size() \<= 8000; // guard against oversized writes  
        allow update, delete: if false; // messages are immutable  
      }  
    }

    // Cases (existing rules remain)  
    match /cases/{caseId} {  
      allow read, write: if isOwner(resource.data.userId);  
    }  
  }  
}

**Demo mode (safer):** use a **separate Firebase project** (firestore \+ auth) with fully synthetic users/data. If you must share a project, prefix collections (`demo_aiSessions`) and set rules `allow read,write: if false;` in prod.

---

# **🔗 5\) Integration Patterns with Existing Codebase**

**Hooks**

* `useAICopilot(sessionId?: string)`:

  * `useMutation(sendMessage)` → `POST /api/ai/copilot/chat` (SSE-aware)

  * `useInfiniteQuery(listMessages)` paginated by `createdAt`

  * Expose `{ messages, send, isStreaming, error }`

* `useAIContext(caseId?: string)`:

  * calls `/api/ai/copilot/context` (or builds client-side using cached case data)

  * returns `{ snapshot, fingerprint }`

**Repositories**

* `lib/db/aiSessionsRepo.ts`:

  * `createSession({ userId, caseId, demo })`

  * `appendMessage({ sessionId, author, content, meta })`

  * `listMessages({ sessionId, after, limit })`

  * `archiveOldSessions({ days })`

**React Query Keys**

const qk \= {  
  session: (id: string) \=\> \['aiSession', id\],  
  messages: (id: string) \=\> \['aiSession', id, 'messages'\],  
  context: (caseId?: string) \=\> \['aiContext', caseId ?? 'none'\],  
};

**Real-time updates**

* Because we write messages server-side, you can **onSnapshot** `messages/` to see assistant tokens arriving if you also write stream chunks (optional). Simpler path: **SSE to client** \+ append to local cache; **final** message is persisted server-side on completion.

**Glossary system (Epic 7\)**

* `contextBuilder` detects glossary-worthy terms in instructions/steps and includes **short definitions** inline in AI output (from `legalTerms` dictionary).

---

# **⚡ 6\) Performance & Scalability**

**Latency ≤ 3s** strategies:

* **Context Snapshot**: structured, \<1KB JSON; no full history in prompt.

* **Sliding window** of last N messages (e.g., 6), plus a **running conversation summary** (update every 10 messages).

* **Model choice**: default `gpt-4o-mini` for speed; elevate to larger model only when needed.

* **Prompt caching**: memoize by `fingerprint` (case \+ prefs); if unchanged, reuse prepared system+context preamble.

**Token/size control**

* Summarize older turns into a single “system memory” note.

* Strip PII with regex/heuristics before send.

* Keep definitions short; link to glossary instead of inlining long text.

**Caching**

* React Query cache: 5–10 min for `context`; `messages` via infinite query windowing.

* Server cache: in-memory (per-VM) or Redis (if added later) for `context fingerprint → prepared prompt`.

**History pagination**

* `GET /messages` with `after`\=epoch ms \+ `limit`\=20.

* UI implements “Load previous” when scrolling up.

---

# **🧰 7\) Technology Selection Notes**

**Streaming**: Use **SSE** from Next.js Route Handlers (stable, simple). WebSockets are optional; SSE covers 99% of chat UX needs.

**OpenAI errors & retries**

* Wrap calls with:

  * **Timeout** (8–10s connect, 30s total)

  * **Exponential backoff** (max 2 retries on 429/5xx)

  * **Categorized errors** (moderation, quota, transient)

* Always return a graceful assistant message on failure (“I couldn’t complete that—try rephrasing”), plus a telemetry event.

**Moderation**

* **Pre-call** moderation of user text; **post-call** moderation of assistant text.

* If blocked: do not store blocked assistant output; store `{blocked:true}` meta with reason.

---

# **⚠️ 8\) Architectural Risks & Mitigations**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| PII leakage in prompts | High | Allowlist fields; redact free text; opt-in needed for raw text; log hashes not raw. |
| Token bloat / latency | Med | Context snapshot \+ sliding window \+ summaries; glossary link not dump. |
| Hot document writes | Med | Use `messages/` subcollection; avoid appending arrays to session doc. |
| Demo/prod data mix-up | High | Separate Firebase projects; env guards; CI check forbidding `demo:true` in prod. |
| Over-reliance on AI answers | Med | Persistent disclaimers; answer classifiers; safe fallbacks (“I can’t advise, here’s a resource”). |
| SSE compatibility behind proxies | Low | Keep JSON fallback; test on Vercel; set proper headers (`Cache-Control: no-store`). |

---

## **TL;DR next steps (engineering checklist)**

* Add `lib/db/aiSessionsRepo.ts` \+ tests.

* Create `app/api/ai/copilot/chat/route.ts` (SSE) \+ JSON fallback.

* Implement `lib/ai/contextBuilder.ts` with **allowlist** \+ fingerprint.

* Add `useAICopilot()` \+ `useAIContext()` hooks (React Query).

* Firestore rules for `aiSessions` \+ `messages` (and demo isolation).

* Session lifecycle job (archive & purge).

* Wire moderation pre/post; add disclaimers injection.

* Add conversation **summary** compactor every N messages.

