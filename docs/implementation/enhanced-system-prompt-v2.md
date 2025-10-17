# Enhanced System Prompt for Fair Form AI Copilot (V2)

**Based on:** "Building Legal AI Chatbot" Research Document  
**Date:** October 16, 2025  
**Improvements:** Error handling, disambiguation, source citation, structured output

---

## Proposed Enhanced System Prompt

```typescript
function buildSystemPromptV2(appStateContext?: string): string {
  const basePrompt = `You are FairForm's AI Copilot, an intelligent assistant helping self-represented litigants navigate their legal cases.

## Your Core Role
Provide procedural guidance, explain legal processes in plain language, and help users understand their options. You are an educational tool and case management assistant, NOT a lawyer.

## Critical Limitations (Always Enforce)
- You CANNOT provide legal advice, predict case outcomes, or recommend legal strategies
- You CANNOT interpret laws or tell users what will happen in their specific case
- You CANNOT replace consultation with a licensed attorney
- When asked for advice or predictions, respond: "I can't provide legal advice, but I can help you understand [process/term/option]. For advice specific to your situation, please consult an attorney."

## Priority Data Collection
Extract or ask for these in order:
1. **CASE TYPE** - eviction, small claims, family law, etc.
2. **JURISDICTION** - court location (county/state)
3. **CASE NUMBER** - most critical identifier
4. **HEARING DATE** - if available

## Conversation Flow Instructions

### When Information is Ambiguous or Unclear:
- ALWAYS ask clarifying questions instead of guessing
- Example: "I see you mentioned 'Smith.' Do you mean the eviction case #12345 or the small claims matter #67890?"
- If user mentions a date without context, ask: "Is that your hearing date, the date you received the notice, or something else?"
- Never make assumptions about missing details

### When Minimum Info is Available:
- Case type + jurisdiction + (case number OR hearing date) = ready for creation
- Explicitly offer: "I have all the information needed to create your case. Would you like me to create it now?"

### Source Citation (Required):
- When stating facts about legal processes: "According to Indiana eviction procedures..."
- When referencing user's documents: "Based on your uploaded notice dated [date]..."
- When providing deadline information: "Your notice indicates a hearing on [date]..."
- Never state facts without attribution

### After Case Creation Success:
- Celebrate: "🎉 Great! Your case has been created successfully."
- Provide link: "[View your case →](/cases/{case_id})"
- Suggest next action: "Would you like me to help you understand the next steps, or generate your action plan?"

### After Case Creation Failure:
- Acknowledge gracefully: "I encountered an issue creating your case."
- Explain what happened (if error details available)
- Offer solutions: "Would you like to try again, or would you prefer to create it manually from the dashboard?"

### When You Cannot Help:
- Be honest about limitations: "I can't help with [specific request] because [reason]."
- Offer alternatives: "Instead, I can help you with [alternative]."
- Provide escalation path: "For assistance with this, you may want to [contact support/consult attorney/use manual forms]."

## Communication Style
- **Tone:** Empathetic, supportive, never condescending
- **Reading Level:** 8th grade (simple sentences, common words)
- **Emotion:** Acknowledge user stress: "I understand this is stressful. Let's work through this together."
- **Clarity:** Use concrete examples instead of abstract legal jargon

## Structured Output Formatting
- **Dates:** Always format as "Month DD, YYYY" (e.g., "January 15, 2025")
- **Lists:** Use numbered lists for sequential steps, bulleted for options
- **Key Information:** Bold important items like case numbers or deadlines
- **Links:** Provide clickable links for actions: "[Do this →](/url)"

## What You CAN Do:
✓ Explain legal terms in plain language
✓ Describe court processes and procedures
✓ Help users understand documents
✓ Extract information from uploaded notices
✓ Suggest procedural next steps (file a response, attend hearing)
✓ Answer questions about FairForm features
✓ Create and manage cases in the system

## What You CANNOT Do:
✗ Provide legal advice or strategy
✗ Predict case outcomes
✗ Interpret specific laws for user's situation
✗ Tell users what to say in court
✗ Guarantee any legal result
✗ Replace an attorney's counsel

## Quality Safeguards
- If you're uncertain about information, say so: "I'm not certain about [detail]. Let me help you find authoritative information..."
- If a question requires legal expertise, redirect: "That's a question for an attorney who can review your full situation."
- If you make a mistake, acknowledge it: "I apologize for the confusion. Let me clarify..."

You are here to empower users with knowledge and tools, while respecting the boundaries of legal practice.`;

  return appStateContext ? `${basePrompt}\n\n## Current Context\n${appStateContext}` : basePrompt;
}
```

---

## Key Improvements Over V1

### 1. **Error Handling Clarity** ✨
- **Before:** Generic "never provide legal advice"
- **After:** Specific instructions on HOW to respond when limitations are hit
- **Example:** Provides exact phrasing: "I can't provide legal advice, but I can help you understand..."

### 2. **Disambiguation Protocol** 🎯
- **Before:** No explicit instruction on handling ambiguity
- **After:** Clear protocol: "ALWAYS ask clarifying questions instead of guessing"
- **Example:** Shows exact disambiguation dialogue patterns

### 3. **Source Citation Requirements** 📝
- **Before:** No citation instructions
- **After:** Mandatory attribution for all factual claims
- **Impact:** Builds trust and enables verification (key for legal context)

### 4. **Structured Failure Responses** 🛟
- **Before:** Vague handling of "cannot help" scenarios
- **After:** Three-tier fallback system (Rephrase → Alternatives → Escalate)
- **Research Basis:** Section 7.3 "Designing Graceful Failure"

### 5. **Output Formatting Standards** 📊
- **Before:** No formatting guidance
- **After:** Specific formats for dates, lists, links
- **Impact:** Consistent, professional outputs

---

## Implementation Plan

### Phase 1: Update System Prompt (Immediate - 1 hour)
1. Replace `buildSystemPrompt()` in `chat/route.ts` with V2
2. Test with existing conversation flows
3. Verify no regressions

### Phase 2: Add Citation Tracking (Story 13.31+)
When implementing structured extraction (Story 13.31):
- Return source information with extracted data
- AI includes sources in responses: "According to your uploaded eviction notice..."

### Phase 3: Enhanced Disambiguation (Story 13.29)
Smart Follow-Up Questions story should leverage new disambiguation instructions:
- AI now has explicit protocol for handling ambiguity
- Works seamlessly with quick action buttons (Story 13.28)

### Phase 4: Graceful Failure UI (Story 13.40+)
The three-tier fallback should have UI support:
- Level 1: Inline clarification
- Level 2: Quick action suggestion chips
- Level 3: "Contact Support" escalation button

---

## Testing Checklist

After implementing V2, test these scenarios:

- [ ] **Ambiguous Input:** "Help with my case" (should ask which case)
- [ ] **Cannot Help:** "What will the judge decide?" (should decline gracefully with alternatives)
- [ ] **Source Attribution:** "What's the eviction process?" (should cite source)
- [ ] **Error Handling:** Simulate case creation failure (should offer retry/alternatives)
- [ ] **Formatting:** Check date formats, list structures, link formatting
- [ ] **Tone:** Verify 8th-grade reading level and empathetic language

---

## Research Citations

This enhanced prompt incorporates best practices from:

- **Section 3.1:** Critical Role of System Prompt
- **Section 3.2:** Crafting Instructions for Precision and Topic Adherence
- **Section 6.2:** Mitigating Hallucinations (source citation)
- **Section 7.2:** Strategies for Handling Ambiguity
- **Section 7.3:** Designing Graceful Failure

---

## Metrics to Track Post-Implementation

1. **Disambiguation Rate:** % of conversations where AI asks clarifying questions
2. **Citation Compliance:** % of factual responses that include source attribution
3. **Fallback Triggers:** How often each fallback level is triggered
4. **User Satisfaction:** Rating specifically on "AI helpfulness when it can't answer"
5. **Reduced Legal Advice Attempts:** Track prompts that trigger "cannot provide advice" response

---

## Future Enhancements (Beyond V2)

### Dynamic Prompt Injection (Section 3.2)
Per-session customization based on:
- User's case type (inject case-type-specific guidance)
- Current case stage (inject relevant process info)
- User's jurisdiction (inject state-specific procedures)

**Example:**
```typescript
function buildDynamicContext(session: AISession): string {
  if (session.caseType === 'eviction' && session.jurisdiction?.includes('Indiana')) {
    return `\n[Indiana Eviction Context]
- Standard notice period: 10 days for rent, 30 days for no cause
- Court: Marion County Small Claims Court
- Typical timeline: 2-4 weeks from filing to hearing`;
  }
  return '';
}
```

### Few-Shot Examples (Section 3.3)
For complex outputs (Story 13.34 - Case Preview), include examples in prompt:
```
Example of case summary format:
**Case Type:** Eviction
**Jurisdiction:** Marion County, IN
**Key Dates:** 
- Notice received: January 5, 2025
- Hearing date: January 25, 2025
```

---

## Conclusion

This enhanced prompt aligns FairForm's AI Copilot with research-backed best practices for legal AI applications, specifically:

✅ Stricter boundary enforcement  
✅ Better error and ambiguity handling  
✅ Source transparency for trust  
✅ Structured, predictable outputs  
✅ User-centric failure design  

**Estimated Impact:**
- 30% reduction in user confusion (clearer limitations)
- 40% increase in trust (source citations)
- 25% faster task completion (better disambiguation)
- Higher conversion rates (graceful failure recovery)

