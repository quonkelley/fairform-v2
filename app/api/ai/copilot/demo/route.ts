import { NextRequest, NextResponse } from "next/server";

/**
 * Demo chat endpoint that works without OpenAI API key
 * For testing the UI without actual AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a demo response based on the message
    const demoResponse = generateDemoResponse(message);

    return NextResponse.json({
      sessionId: sessionId || "demo-session-" + Date.now(),
      messageId: "demo-msg-" + Date.now(),
      reply: demoResponse,
      meta: {
        tokensIn: 50,
        tokensOut: 100,
        latencyMs: 1000,
        model: "demo-mode",
        blocked: false,
      },
    });

  } catch (error) {
    console.error("Demo chat error:", error);
    return NextResponse.json(
      { error: "DemoError", message: "Demo mode failed" },
      { status: 500 }
    );
  }
}

function generateDemoResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes("hello") || message.includes("hi")) {
    return "Hello! I'm FairForm's AI Copilot. I'm here to help you navigate your legal case. What can I help you with today?";
  }
  
  if (message.includes("help") || message.includes("assistance")) {
    return "I can help you with:\n\n• Understanding legal procedures\n• Explaining legal terms\n• Suggesting next steps for your case\n• Providing general legal information\n\nWhat specific area would you like help with?";
  }
  
  if (message.includes("case") || message.includes("legal")) {
    return "I'd be happy to help with your legal case! However, I should mention that I can only provide general information and procedural guidance. For specific legal advice about your situation, you should consult with an attorney.\n\nWhat type of legal issue are you dealing with?";
  }
  
  if (message.includes("court") || message.includes("filing")) {
    return "Court procedures can be complex, but I can help explain the general process. The specific steps depend on your jurisdiction and case type.\n\n• Check your local court's website for forms and requirements\n• Review filing deadlines carefully\n• Consider consulting with a legal aid organization\n\nWhat specific court procedure are you asking about?";
  }
  
  if (message.includes("document") || message.includes("paperwork")) {
    return "Legal documents can be overwhelming! Here are some general tips:\n\n• Read everything carefully before signing\n• Keep copies of all documents\n• Note important dates and deadlines\n• Don't hesitate to ask for clarification\n\nWhat type of document are you working with?";
  }
  
  // Default response
  return "Thank you for your message! I'm here to help you understand legal processes and procedures. While I can provide general information and guidance, please remember that I cannot provide specific legal advice. For legal advice about your particular situation, please consult with an attorney.\n\nHow can I assist you today?";
}
