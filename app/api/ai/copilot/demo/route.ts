import { NextRequest, NextResponse } from "next/server";
import {
  analyzeConversationState,
  shouldRecheckReadiness,
  formatReadinessLog,
  type CaseCreationReadiness
} from "@/lib/ai/intentDetection";
import {
  generateConfirmationMessage
} from "@/lib/ai/confirmationMessages";
import {
  parseConfirmationResponse,
  generateUnclearResponse
} from "@/lib/ai/responseParser";
import {
  generateCaseTitle,
  generateSuccessMessage,
} from "@/lib/ai/caseCreation";

/**
 * Demo chat endpoint that works without OpenAI API key
 * For testing the UI without actual AI responses
 */

// In-memory conversation state for demo mode
interface ConversationState {
  stage: 'greeting' | 'intake' | 'details' | 'guidance' | 'awaiting_confirmation' | 'case_creation' | 'case_created';
  caseType?: string;
  context: string[];
  details: {
    location?: string;
    noticeType?: string;
    dateReceived?: string;
    [key: string]: string | undefined;
  };
  readiness?: CaseCreationReadiness;
  confirmationShown?: boolean;
  confirmed?: boolean;
  lastConfirmationTime?: number;
  caseId?: string;
  caseCreationAttempted?: boolean;
}

const demoConversationState = new Map<string, ConversationState>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    console.log('Demo endpoint received - sessionId:', sessionId, 'message:', message.substring(0, 50));

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const effectiveSessionId = sessionId || "demo-session-" + Date.now();
    console.log('Using sessionId:', effectiveSessionId);

    // Note: Conversation history is tracked in-memory via demoConversationState
    // Future enhancement: optionally load from aiSessionsRepo for persistent sessions

    // Generate a demo response based on the message and conversation state
    const demoResponse = generateDemoResponse(message, effectiveSessionId);

    // Check if response is a confirmation message object
    const responsePayload = typeof demoResponse === 'object'
      ? {
          sessionId: effectiveSessionId,
          messageId: "demo-msg-" + Date.now(),
          reply: demoResponse.content,
          type: demoResponse.type,
          meta: {
            tokensIn: 50,
            tokensOut: 100,
            latencyMs: 1000,
            model: "demo-mode",
            blocked: false,
            ...demoResponse.meta,
          },
        }
      : {
          sessionId: effectiveSessionId,
          messageId: "demo-msg-" + Date.now(),
          reply: demoResponse,
          meta: {
            tokensIn: 50,
            tokensOut: 100,
            latencyMs: 1000,
            model: "demo-mode",
            blocked: false,
          },
        };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error("Demo chat error:", error);
    return NextResponse.json(
      { error: "DemoError", message: "Demo mode failed" },
      { status: 500 }
    );
  }
}

function generateDemoResponse(
  userMessage: string,
  sessionId: string,
  // history: string[] // Reserved for future use - may enable history-based context
): string | { content: string; type: string; meta: Record<string, unknown> } {
  const message = userMessage.toLowerCase();
  
  // Get or create conversation state
  let state = demoConversationState.get(sessionId);
  if (!state) {
    console.log('Creating new conversation state for session:', sessionId);
    state = {
      stage: 'greeting',
      context: [],
      details: {},
    };
    demoConversationState.set(sessionId, state);
  } else {
    console.log('Retrieved existing state for session:', sessionId, 'Stage:', state.stage, 'CaseType:', state.caseType);
  }
  
  // Add current message to context
  state.context.push(message);

  // Extract and store key details from the message
  extractDetails(message, state);

  // Check if we should evaluate case creation readiness
  if (shouldRecheckReadiness(state.readiness || null, state)) {
    const readiness = analyzeConversationState(state);
    const wasReady = state.readiness?.isReady || false;
    const isNowReady = readiness.isReady;

    state.readiness = readiness;

    console.log('[Intent Detection] Readiness updated:', formatReadinessLog(readiness));

    // Log transition to ready state
    if (!wasReady && isNowReady) {
      console.log('[Intent Detection] 🎉 Case creation is now ready! User can be offered case creation.');
    }
  }

  // Detect case type mentions
  const previousStage = state.stage;
  const previousCaseType = state.caseType;
  
  if (message.includes('eviction') && !state.caseType) {
    state.caseType = 'eviction';
    state.stage = 'intake';
    console.log('Detected eviction case, moving to intake stage');
  } else if ((message.includes('small') && message.includes('claims')) && !state.caseType) {
    state.caseType = 'small_claims';
    state.stage = 'intake';
    console.log('Detected small claims case, moving to intake stage');
  }
  
  if (previousStage !== state.stage || previousCaseType !== state.caseType) {
    console.log('State changed - Stage:', previousStage, '→', state.stage, 'CaseType:', previousCaseType, '→', state.caseType);
  }

  // Handle case creation stage - create the case after confirmation
  if (state.stage === 'case_creation' && !state.caseId && !state.caseCreationAttempted) {
    // Mark as attempted to prevent duplicate calls
    state.caseCreationAttempted = true;

    // In demo mode, simulate successful case creation
    const demoCaseId = 'demo-case-' + Date.now();
    state.caseId = demoCaseId;
    state.stage = 'case_created';

    const caseTitle = generateCaseTitle(state.caseType, state.details);
    const successMsg = generateSuccessMessage(demoCaseId, caseTitle, state.caseType || 'other');

    console.log('[Case Creation] Demo case created:', demoCaseId, 'Title:', caseTitle);

    return `${successMsg}\n\n_Note: This is demo mode - your case details are not actually saved._`;
  }

  // Handle awaiting confirmation stage
  if (state.stage === 'awaiting_confirmation') {
    const response = parseConfirmationResponse(message);

    switch (response.type) {
      case 'confirm':
        state.confirmed = true;
        state.stage = 'case_creation';
        console.log('[Confirmation] User confirmed case creation, transitioning to case_creation stage');
        return "Perfect! I'm creating your case now. This will just take a moment...";

      case 'decline':
        state.stage = 'guidance';
        state.confirmationShown = false;
        state.lastConfirmationTime = Date.now();
        console.log('[Confirmation] User declined case creation');
        return "No problem at all! Take your time. I'm here whenever you're ready. " +
          "Feel free to ask me any other questions about your situation, or let me know " +
          "when you'd like to create your case.";

      case 'edit':
        // Update the detail
        state.details[response.field] = response.newValue;
        console.log(`[Confirmation] Updated ${response.field} to: ${response.newValue}`);

        // Re-check readiness
        const newReadiness = analyzeConversationState(state);
        state.readiness = newReadiness;

        // Show updated confirmation if still ready
        if (newReadiness.isReady) {
          const confirmMsg = generateConfirmationMessage(state);
          return `Got it! I've updated your ${response.field}.\n\n${confirmMsg.content}`;
        } else {
          state.stage = 'details';
          return `I've updated your ${response.field} to "${response.newValue}". ` +
            `Let me know when you're ready to create your case.`;
        }

      case 'unclear':
        return generateUnclearResponse();
    }
  }

  // Check if we should show confirmation
  if (
    state.readiness?.isReady &&
    !state.confirmationShown &&
    !state.confirmed &&
    state.stage !== 'awaiting_confirmation' &&
    shouldShowConfirmation(state)
  ) {
    state.confirmationShown = true;
    state.stage = 'awaiting_confirmation';

    const confirmMsg = generateConfirmationMessage(state);
    console.log('Showing confirmation message');

    // Return the full confirmation message object so the API can format it correctly
    return confirmMsg;
  }

  // Response logic based on conversation stage
  const lowerMessage = userMessage.toLowerCase();
  console.log('Processing in stage:', state.stage);
  
  // Handle based on conversation stage
  switch (state.stage) {
    case 'greeting':
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        return "Hello! I'm FairForm's AI Copilot. I'm here to help you navigate your legal case. What can I help you with today?";
      }
      // If they mention a case type right away
      if (state.caseType) {
        state.stage = 'intake';
        return getIntakeResponse(state.caseType);
      }
      return "Hi! I'm here to help you with your legal case. What type of legal issue are you dealing with? (For example: eviction, small claims, etc.)";
    
    case 'intake':
      // We know the case type, now gather details
      if (state.caseType === 'eviction') {
        state.stage = 'details';
        return "I understand you're dealing with an eviction. This can be a stressful situation, and I'm here to help you understand the process.\n\nTo provide you with the most relevant guidance:\n\n• When did you receive the eviction notice?\n• Do you know what type of notice it is (3-day, 30-day, 60-day, etc.)?\n• What state/county are you in?\n\nPlease share whatever details you're comfortable with, and remember - I can only provide general information, not legal advice.";
      } else if (state.caseType === 'small_claims') {
        state.stage = 'details';
        return "I can help you understand the small claims process. To give you the most relevant information:\n\n• What is the dispute about?\n• Approximately how much money is involved?\n• Have you tried to resolve this directly with the other party?\n\nPlease share what you're comfortable with, and I'll provide general guidance about the small claims process.";
      }
      return "Could you tell me more about your situation? What type of legal matter are you dealing with?";
    
    case 'details':
      // They're providing more details about their case
      if (state.caseType === 'eviction') {
        state.stage = 'guidance';
        
        // Build personalized response based on stored details
        let response = "Thank you for sharing that information. ";
        
        if (state.details.location) {
          response += `I see you're in ${state.details.location}. `;
        }
        
        if (state.details.noticeType) {
          const noticeTypeDisplay = state.details.noticeType.replace(/-/g, ' ');
          response += `With a ${noticeTypeDisplay} notice, `;
          if (state.details.noticeType.includes('30')) {
            response += "you typically have 30 days to either move out or respond. ";
          } else if (state.details.noticeType.includes('3')) {
            response += "you have a very short timeframe to respond - this is urgent. ";
          }
        }
        
        response += "Here's what you should know about the eviction process:\n\n**Immediate Steps:**\n1. Don't ignore the notice - response deadlines are critical\n2. Document everything (photos, receipts, correspondence)\n3. Look into local tenant rights organizations\n4. Consider consulting with a legal aid attorney\n\n**Important to Remember:**\n• You have the right to respond to the eviction notice\n• There may be defenses available to you\n• Free or low-cost legal help is often available\n• You have rights as a tenant\n\n**Next Steps:**\nI recommend:\n1. Contact a local legal aid organization immediately\n2. Gather all relevant documents (lease, notices, payment records)\n3. Look into tenant assistance programs in your area\n\nWould you like help finding legal resources in your area, or do you have other questions about the process?";
        
        return response;
      } else if (state.caseType === 'small_claims') {
        state.stage = 'guidance';
        return "Based on what you've shared, here's general guidance about small claims court:\n\n**Key Points:**\n1. Small claims limits vary by state (usually $5,000-$10,000)\n2. The process is designed to be simpler than regular court\n3. You typically don't need a lawyer (though you can consult one)\n4. Filing fees are usually modest ($30-$100)\n\n**Steps to Consider:**\n1. Send a demand letter first (required in some jurisdictions)\n2. Gather all evidence (receipts, contracts, photos, messages)\n3. File your claim at the appropriate courthouse\n4. Serve the defendant properly\n5. Prepare for your hearing\n\nWould you like more specific information about any of these steps?";
      }
      return "Thank you for sharing that. What else would you like to know about your situation?";
    
    case 'guidance':
      // Ongoing assistance - be context aware
      
      // Handle location/context awareness questions
      if (lowerMessage.includes("where") && (lowerMessage.includes("located") || lowerMessage.includes("location"))) {
        if (state.details.location) {
          return `Yes! You mentioned you're in ${state.details.location}. ${state.details.noticeType ? `And you have a ${state.details.noticeType.replace(/-/g, ' ')} notice. ` : ''}I can help you find resources specific to your area. Would you like me to suggest some local organizations?`;
        } else {
          return "I don't have your location on file yet. Could you tell me what city, county, or state you're in? That will help me provide more relevant local resources.";
        }
      }
      
      // Handle resource requests with location awareness
      if (lowerMessage.includes("resource") || lowerMessage.includes("help") || lowerMessage.includes("find")) {
        let response = "I can help you find resources! ";
        
        if (state.details.location) {
          response += `For ${state.details.location}, here are some starting points:\n\n`;
          
          // Provide location-specific guidance where possible
          if (state.details.location.toLowerCase().includes('indiana') || 
              state.details.location.toLowerCase().includes('indianapolis') ||
              state.details.location.toLowerCase().includes('marion')) {
            response += "**Indiana-Specific Resources:**\n";
            response += "• Indiana Legal Services - Free legal aid for low-income residents\n";
            response += "• Marion County Small Claims Court - Self-help resources\n";
            response += "• Indiana Bar Association - Lawyer referral service\n\n";
          }
        } else {
          response += "Here are some starting points:\n\n";
        }
        
        response += "**General Legal Aid:**\n• LawHelp.org - Find free legal help in your area\n• Legal Services Corporation - Federally funded legal aid\n• State Bar Association - Often has referral services\n\n";
        
        if (state.caseType === 'eviction') {
          response += "**Tenant Rights:**\n• HUD Housing Counseling - Free housing counseling\n• Local tenant unions or advocacy groups\n• Court self-help centers\n\n";
        }
        
        response += "Remember: These resources can provide specific legal advice that I cannot. Is there anything else I can help you understand about the process?";
        return response;
      } else if (lowerMessage.includes("court") || lowerMessage.includes("hearing")) {
        return "Court proceedings can be intimidating, but here are some general tips:\n\n**Preparation:**\n• Dress professionally\n• Arrive early\n• Bring all documents organized and labeled\n• Prepare what you want to say briefly\n\n**During Court:**\n• Be respectful to the judge and all parties\n• Speak clearly and truthfully\n• Only answer what is asked\n• Don't interrupt others\n\n**Important:**\n• Many courts have self-help centers\n• You can observe other hearings to see how they work\n• Consider getting legal representation if possible\n\nDo you have questions about a specific part of the court process?";
      }
      
      // General guidance response with context awareness
      let response = "I'm here to help! ";
      if (state.details.location) {
        response += `I remember you're in ${state.details.location} `;
        if (state.details.noticeType) {
          response += `with a ${state.details.noticeType.replace(/-/g, ' ')} notice. `;
        }
      }
      response += "What would you like to know more about? I can provide general information about legal processes, help you understand your rights, or guide you toward resources.";
      return response;
    
    default:
      return "I'm here to help you with your legal case. What can I assist you with today?";
  }
}

/**
 * Extract key details from user message and store in state
 */
function extractDetails(message: string, state: ConversationState): void {
  // const lowerMessage = message.toLowerCase(); // Uncomment if needed for future use
  
  // Extract location (city, state, county)
  const locationPatterns = [
    /in ([a-z\s]+),?\s*(in|indiana|ca|california|tx|texas|ny|new york)/i,
    /(indianapolis|los angeles|new york|houston|chicago)/i,
    /([a-z\s]+)\s+county/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const location = match[0].replace(/^in\s+/i, '').trim();
      if (!state.details.location) {
        state.details.location = location;
        console.log('Extracted location:', location);
      }
      break;
    }
  }
  
  // Extract notice type
  const noticePatterns = [
    /(\d+[-\s]day)\s+(notice|eviction)/i,
    /(3|30|60|90)[-\s]day/i,
  ];
  
  for (const pattern of noticePatterns) {
    const match = message.match(pattern);
    if (match) {
      const noticeType = match[1] || match[0];
      if (!state.details.noticeType) {
        state.details.noticeType = noticeType.toLowerCase().replace(/\s+/g, '-');
        console.log('Extracted notice type:', state.details.noticeType);
      }
      break;
    }
  }
  
  // Extract when received
  const timePatterns = [
    /received it (today|yesterday|this week|last week)/i,
    /(today|yesterday|this morning|last night)/i,
  ];
  
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match && !state.details.dateReceived) {
      state.details.dateReceived = match[1] || match[0];
      console.log('Extracted date received:', state.details.dateReceived);
      break;
    }
  }
}

function getIntakeResponse(caseType: string): string {
  if (caseType === 'eviction') {
    return "I understand you're dealing with an eviction. This is an important matter and I'm here to help guide you through the process. Could you tell me more about your situation? For example:\n\n• When did you receive the eviction notice?\n• Do you know what type of notice it is?\n• What state/county are you in?\n\nRemember, I can provide general information and guidance, but for specific legal advice about your case, you should consult with an attorney.";
  } else if (caseType === 'small_claims') {
    return "I can help you understand the small claims process. Could you tell me more about your situation?\n\n• What is the dispute about?\n• Approximately how much is involved?\n• Have you tried to resolve this with the other party?\n\nI'll provide general guidance, but remember to consult with an attorney for specific legal advice.";
  }
  return "I can help with that! Could you tell me more about your legal situation?";
}

/**
 * Determine if we should show confirmation based on cooldown
 */
function shouldShowConfirmation(state: ConversationState): boolean {
  // If never shown, always show
  if (!state.lastConfirmationTime) return true;

  // Check cooldown (5 minutes)
  const timeSinceLastConfirmation = Date.now() - state.lastConfirmationTime;
  const cooldownMs = 5 * 60 * 1000; // 5 minutes

  return timeSinceLastConfirmation > cooldownMs;
}
