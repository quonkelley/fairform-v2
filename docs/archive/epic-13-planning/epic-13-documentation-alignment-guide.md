# Epic 13 Documentation Alignment Guide

**Document Version:** 1.0
**Date:** October 2025
**Owner:** Mary (BMAD AI) - Product & Strategy
**Status:** Current & Authoritative

---

## Purpose

This document serves as the single source of truth for understanding Epic 13: AI Copilot & Dynamic Intake Experience and how it relates to all associated planning documents.

---

## Document Hierarchy

### Primary Documents (Active)

1. **Epic 13 PRD** (`docs/prd/epic-13-ai-copilot.md`)
   - **Status:** 🟢 Active - Authoritative technical specification
   - **Purpose:** Complete product requirements and implementation details
   - **Audience:** Development team, QA, stakeholders
   - **Use for:** Implementation planning, feature specifications, acceptance criteria

2. **Leadership Decision Memo** (`docs/leadership_decision_memo_ai_gating_removal_and_copilot_launch.md`)
   - **Status:** 🟢 Active - Strategic guidance
   - **Purpose:** Executive summary and strategic rationale
   - **Audience:** Leadership, product strategy
   - **Use for:** Understanding business value, compliance considerations, decision points

3. **Updated Product Roadmap Summary** (`docs/updated_product_roadmap_summary .md`)
   - **Status:** 🟢 Active - Strategic context
   - **Purpose:** Shows Epic 13 in context of overall product evolution
   - **Audience:** All teams, stakeholders
   - **Use for:** Understanding dependencies, sequencing, and strategic positioning

### Deprecated Documents

4. **AI Chat and Intake Enhancement Plan** (`docs/AI_Chat_and_Intake_Enhancement_Plan.md`)
   - **Status:** 🔴 DEPRECATED (January 2025 draft, superseded October 2025)
   - **Purpose:** Historical reference only
   - **Reason:** Evolved into more comprehensive Epic 13 specification
   - **Note:** Retained for historical context and evolution tracking

---

## Key Terminology Alignment

### Standardized Terms (Use These)

| Term | Definition | Where Used |
|------|------------|------------|
| **AI Copilot** | The persistent, context-aware conversational assistant that guides users throughout FairForm | Epic 13, Leadership Memo, Roadmap |
| **Dynamic Intake Experience** | Conversational, ungated case creation flow via AI | Epic 13, Leadership Memo |
| **Context Broker** | Middleware that merges user, case, and session context for AI prompts | Epic 13 PRD |
| **Gating Removal** | Elimination of "Start Case" buttons and authentication barriers to AI access | All active documents |
| **Demo-Ready** | Fully functional experience suitable for investor/stakeholder demonstrations | Leadership Memo, Epic 13 |

### Deprecated Terms (Do Not Use)

| Old Term | Why Deprecated | Use Instead |
|----------|----------------|-------------|
| AI Chat Assistant | Too generic, doesn't convey persistent/intelligent nature | AI Copilot |
| AI Intake | Implies one-time interaction | Dynamic Intake Experience |
| Chat widget | Too simplistic for the sophistication of the feature | AI Copilot interface |

---

## Timeline Alignment

**All dates align to October 2025 planning cycle**

### Implementation Timeline (3-Week Sprint)

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| **Week 1** | Foundation & Infrastructure | - Chat shell UI component<br>- Context broker middleware<br>- Demo sandbox mode<br>- Basic Firestore integration |
| **Week 2** | Context Integration | - Case + user context injection<br>- Prompt template system<br>- Conversation persistence<br>- Dynamic case creation flow |
| **Week 3** | Polish & Compliance | - Disclaimer system<br>- Content moderation<br>- Demo configuration<br>- QA validation<br>- Performance optimization |

**Target Completion:** End of October 2025 (Demo-ready)

---

## Technical Architecture Alignment

### Unified Architecture Overview

```
User Interface Layer
├── <AICopilotChat /> (React component)
└── Floating chat bubble (persistent across app)
           ↓
Middleware Layer
├── api/ai/contextBroker.ts (context aggregation)
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
```

### Key Components

| Component | File Location | Purpose |
|-----------|---------------|---------|
| **Copilot UI** | `components/ai-copilot/copilot-chat.tsx` | Main chat interface |
| **Context Broker** | `app/api/ai/contextBroker.ts` | Merges context data |
| **Context Builder** | `lib/ai/contextBuilder.ts` | Structures context JSON |
| **Prompt Templates** | `lib/ai/promptTemplates.ts` | System prompt management |
| **Session Store** | Firestore `aiSessions/{sessionId}` | Conversation persistence |
| **Chat Hook** | `lib/hooks/useAICopilot.ts` | State management |

---

## Compliance Framework Alignment

All documents agree on these compliance requirements:

### Core Principles

1. **Educational Guidance Only**
   - No legal advice
   - No case outcome predictions
   - No strategic recommendations
   - Clear boundaries in system prompts

2. **Data Protection**
   - No PII sent outside Firestore
   - Anonymization for analytics
   - Secure context handling
   - Audit logging enabled

3. **Responsible AI Safeguards**

| Safeguard | Implementation | Document Reference |
|-----------|----------------|-------------------|
| Legal Disclaimer | Auto-injected at chat start | Epic 13 §5, Leadership Memo §4 |
| Content Filter | Pre/post moderation wrapper | Epic 13 PRD |
| Session Logging | Full conversation audit trail | All documents |
| Demo Sandbox | Isolated test environment | Leadership Memo §3 |

### Disclaimers

**Standard Disclaimer (appears at chat start):**
> "This AI assistant provides educational information about legal processes. It does not provide legal advice and cannot predict case outcomes. Always consult with a qualified attorney for advice specific to your situation."

---

## Success Metrics Alignment

### Demo Readiness Criteria (from Leadership Memo)

- ✅ Conversational case creation (no forms)
- ✅ Context-aware chat memory across sessions
- ✅ Accessible anywhere in app (floating widget)
- ✅ No login or form gates
- ✅ Zero flagged compliance issues

### Performance Targets (from Epic 13 PRD)

| Metric | Target | Test Method |
|--------|--------|-------------|
| Chat latency | ≤ 3s round trip | Load testing |
| Context accuracy | 90%+ correct references | Manual QA validation |
| Compliance | Zero flagged outputs | Moderation review |
| Availability | 99.9% uptime | Monitoring |

---

## Decision Points for Leadership

These questions appear across documents and require leadership input:

### 1. Demo Scope
**Question:** Should the demo Copilot connect to live Firestore data or a sandbox dataset?
**Context:** Sandbox provides safety; live data shows real capabilities
**Recommendation:** Start with sandbox, enable live data toggle for advanced demos

### 2. Form Integration
**Question:** Can AI reference real court forms (e.g., SC-100)?
**Context:** Real forms increase utility but require compliance validation
**Recommendation:** Phase 1 uses placeholder templates; Phase 2 adds real forms post-legal review

### 3. Disclaimer Strategy
**Question:** Persistent (every message) or contextual (on risky responses)?
**Context:** Balance between safety and user experience
**Recommendation:** Persistent header + contextual warnings for sensitive topics

### 4. Telemetry
**Question:** Should AI chat analytics be logged during demos?
**Context:** Useful for optimization but may expose sensitive data
**Recommendation:** Anonymized logging enabled; full audit mode for internal testing only

### 5. Access Control
**Question:** Public vs internal testing - is Copilot ready for external users?
**Context:** Demo-ready ≠ production-ready
**Recommendation:** Internal demo only for October; external beta in Phase 1.4

---

## Dependencies & Integration Points

### Epic Dependencies (from Roadmap)

| Epic | Relationship | Impact |
|------|--------------|--------|
| **Epic 12** | Provides foundational AI intake Q&A engine | Copilot extends this into persistent assistant |
| **Epic 7** | Glossary system for inline definitions | Copilot can inject definitions during conversation |
| **Epic 8** | Step detail modals | Copilot can explain/summarize steps |
| **Epic 10** | Day-in-Court checklist | Future: Copilot manages checklist conversationally |
| **Epic 11** | Settings & preferences | Personalizes Copilot tone and delivery |

### System Integration Points

- **Authentication:** `components/auth/auth-context.tsx` (user context)
- **Case Data:** `lib/db/casesRepo.ts` (case context)
- **Steps:** `lib/db/stepsRepo.ts` (progress context)
- **Journey:** Case journey templates (template-based responses)
- **Forms:** Future integration with court form library

---

## Migration Path (Epic 12 → Epic 13)

### What Changes

| Area | Epic 12 (Old) | Epic 13 (New) |
|------|---------------|---------------|
| **Access** | Gated behind "Start Case" button | Floating bubble accessible everywhere |
| **Scope** | One-time intake conversation | Persistent assistant throughout journey |
| **Context** | Single case creation session | Continuous context across all app interactions |
| **Data Model** | Writes case doc after completion | Dynamically syncs during conversation |
| **UI Pattern** | Modal/full-screen form | Floating widget + expandable panel |

### What Stays the Same

- Core AI infrastructure (OpenAI API integration)
- Firestore data models (cases, caseSteps)
- Repository pattern for data access
- Compliance framework and disclaimers
- Testing and QA standards

---

## Implementation Checklist

Use this checklist to ensure alignment across all workstreams:

### Week 1: Foundation
- [ ] Create `<AICopilotChat />` component
- [ ] Build context broker API (`api/ai/contextBroker.ts`)
- [ ] Set up demo sandbox mode
- [ ] Configure Firestore `aiSessions` collection
- [ ] Implement basic prompt templates

### Week 2: Integration
- [ ] Connect case context (`useCaseDetails` hook integration)
- [ ] Connect user context (auth + preferences)
- [ ] Build conversation persistence
- [ ] Implement dynamic case creation flow
- [ ] Add glossary inline integration

### Week 3: Polish
- [ ] Implement disclaimer system
- [ ] Add content moderation layer
- [ ] Create demo configuration
- [ ] Run compliance review
- [ ] Performance testing & optimization
- [ ] Accessibility validation (WCAG 2.1 AA)
- [ ] Generate QA gate documentation

---

## Testing Strategy Alignment

### Test Coverage Requirements

| Layer | Coverage Target | Test Types |
|-------|----------------|------------|
| **API Routes** | ≥ 70% | Unit, integration |
| **React Components** | Snapshot + interaction | Component tests |
| **Context Broker** | ≥ 80% | Unit, mock data |
| **Compliance** | 100% manual review | QA validation |
| **Performance** | Load testing | Synthetic traffic |
| **Accessibility** | WCAG 2.1 AA | Automated + manual |

### Key Test Scenarios

1. **Conversational Case Creation**
   - User starts chat without authentication
   - AI recognizes case creation intent
   - Case is created and associated with user
   - Chat continues with case context

2. **Context Awareness**
   - User navigates to case detail page
   - Opens copilot
   - AI references current case automatically
   - Responses are case-specific

3. **Compliance Boundaries**
   - User asks for legal advice
   - AI deflects appropriately
   - Disclaimer is shown
   - User is encouraged to seek attorney

4. **Demo Flow**
   - Stakeholder accesses demo link
   - No login required
   - Sample data pre-loaded
   - Full conversational experience available

---

## Cross-Reference Guide

When implementing features, reference documents in this order:

1. **For detailed specifications:** Epic 13 PRD
2. **For strategic context:** Leadership Decision Memo
3. **For roadmap positioning:** Updated Product Roadmap Summary
4. **For historical context only:** AI Chat Enhancement Plan (deprecated)

### Quick Links

- Epic 13 PRD: `/docs/prd/epic-13-ai-copilot.md`
- Leadership Memo: `/docs/leadership_decision_memo_ai_gating_removal_and_copilot_launch.md`
- Roadmap: `/docs/updated_product_roadmap_summary .md`
- BMAD Process: `/.cursor/rules/bmad/`
- Architecture Docs: `/docs/architecture/`

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | October 2025 | Initial alignment document created | Mary (BMAD AI) |

---

## Questions or Conflicts?

If you encounter conflicting information across documents:

1. **Epic 13 PRD is authoritative** for implementation details
2. **Leadership Memo is authoritative** for strategic decisions
3. **This alignment guide is authoritative** for terminology and process

For clarifications, contact: Product & Strategy Team

---

**Last Updated:** October 2025
**Next Review:** Post-Epic 13 completion
