# Architecture Review Request for Epic 13: AI Copilot

**Status:** ✅ COMPLETED - See Unified Specification

---

## COMPLETION NOTICE

**This review request has been completed and answered.**

📄 **Final Specification:** `docs/epic-13-unified-architecture-specification.md`

**Review Status:**  
All questions have been thoroughly addressed by multiple teams and consolidated into a single, comprehensive architecture specification.

**Date Completed:** January 2025

---

## Original Review Request (For Historical Reference)

  Task: Review the technical architecture for Epic
   13 and validate the design before story
  creation.

  Context Documents:
  - Epic 13 PRD: /docs/prd/epic-13-ai-copilot.md
  - Alignment Guide:
  /docs/epic-13-documentation-alignment-guide.md
  - Leadership Memo: /docs/leadership_decision_mem
  o_ai_gating_removal_and_copilot_launch.md

  Key Areas for Review:

  1. Architecture Validation

  Review the proposed architecture in Epic 13:
  User Interface Layer
  ├── <AICopilotChat /> (React component)
  └── Floating chat bubble (persistent across app)
             ↓
  Middleware Layer
  ├── api/ai/contextBroker.ts (context
  aggregation)
  ├── lib/ai/contextBuilder.ts (data preparation)
  └── lib/ai/promptTemplates.ts (system prompts)
             ↓
  Data Layer
  ├── Firestore (cases, caseSteps, users)
  ├── aiSessions collection (conversation history)
  └── React Query (caching & sync)
             ↓
  AI Layer
  ├── OpenAI API (GPT-5)
  ├── Content moderation endpoints
  └── Safety filters & logging

  Questions:
  - Does this align with FairForm's repository
  pattern?
  - Are there any architectural gaps or risks?
  - How should we handle the new aiSessions
  collection?

  2. Data Model Design

  The PRD mentions:
  - New Firestore collection:
  aiSessions/{sessionId}
  - Context injection from existing collections
  (cases, caseSteps, users)
  - Conversation persistence

  Questions:
  - What should the aiSessions schema look like?
  - How do we handle session lifecycle (creation,
  expiration, cleanup)?
  - What's the relationship between sessions and
  cases?

  3. Security & Compliance

  - Context broker will aggregate sensitive case
  data
  - AI responses need content moderation
  - Demo mode needs data isolation
  - PII handling for AI prompts

  Questions:
  - How do we secure the context broker API?
  - What Firestore security rules are needed for
  aiSessions?
  - How do we implement demo sandbox mode safely?

  4. Integration with Existing Systems

  Epic 13 needs to integrate with:
  - Auth context
  (components/auth/auth-context.tsx)
  - Case repositories (lib/db/casesRepo.ts)
  - Journey templates (lib/journeys/templates/)
  - Glossary system (Epic 7)

  Questions:
  - How should the copilot hook into existing
  React Query patterns?
  - Should we extend existing repos or create new
  ones?
  - How do we handle real-time context updates?

  5. Performance & Scalability

  - Chat latency target: ≤ 3s round trip
  - Context-heavy prompts may hit token limits
  - Conversation history grows over time

  Questions:
  - How do we optimize context size for AI
  prompts?
  - What caching strategy should we use?
  - How do we handle conversation history
  pagination?

  6. Technology Selection

  PRD mentions:
  - OpenAI API (GPT-5)
  - React Query for state management
  - Firestore for persistence

  Questions:
  - Do we need any additional libraries (WebSocket
   for real-time, etc.)?
  - How do we handle OpenAI API errors and
  retries?
  - Should we consider streaming responses?

  ---
  Deliverable Requested:
  Please provide:
  1. Architecture validation (approve or suggest
  modifications)
  2. Detailed data model schemas (TypeScript
  interfaces)
  3. API contract definitions (request/response
  types)
  4. Security recommendations and Firestore rules
  5. Integration patterns with existing codebase
  6. Any architectural risks and mitigation
  strategies

  This review will inform the PM agent when
  creating user stories.

  Use Command: *design-architecture or
  *review-design as appropriate.