import { NextRequest, NextResponse } from "next/server";

import { createCaseWithJourney, listByUser } from "@/lib/db/casesRepo";
import { CreateCaseSchema, CreateCaseResponseSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth/server-auth";
import { 
  logCaseCreationSuccess, 
  logValidationError, 
  logAuthError, 
  logServerError 
} from "@/lib/monitoring/case-creation-monitor";

// GET /api/cases - List all cases for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const cases = await listByUser(user.uid);
    
    return NextResponse.json(cases, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to list cases", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to load cases" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  const userAgent = request.headers.get('user-agent') || undefined;
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  console.log(`[${requestId}] [POST /api/cases] Request received`);
  
  try {
    console.log(`[${requestId}] [POST /api/cases] Authenticating user...`);
    const user = await requireAuth(request);
    console.log(`[${requestId}] [POST /api/cases] User authenticated:`, user.uid);

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log(`[${requestId}] [POST /api/cases] Request body parsed successfully`);
    } catch (parseError) {
      console.error(`[${requestId}] [POST /api/cases] JSON parse error:`, parseError);
      return NextResponse.json(
        {
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
          requestId
        },
        { status: 400 }
      );
    }

    // Enhanced validation with detailed error messages
    const validationResult = CreateCaseSchema.safeParse(body);
    if (!validationResult.success) {
      console.error(`[${requestId}] [POST /api/cases] Validation failed:`, validationResult.error.issues);
      
      // Create user-friendly error messages
      const friendlyErrors = validationResult.error.issues.map(issue => {
        switch (issue.path[0]) {
          case 'caseType':
            return {
              field: 'caseType',
              message: 'Please select a case type (eviction, small claims, etc.)',
              code: 'MISSING_CASE_TYPE'
            };
          case 'jurisdiction':
            return {
              field: 'jurisdiction', 
              message: 'Please specify the court jurisdiction (e.g., "Marion County")',
              code: 'MISSING_JURISDICTION'
            };
          case 'title':
            return {
              field: 'title',
              message: 'Please provide a case title',
              code: 'MISSING_TITLE'
            };
          default:
            return {
              field: issue.path[0] as string,
              message: issue.message,
              code: 'VALIDATION_ERROR'
            };
        }
      });

      // Log validation error
      logValidationError(
        requestId,
        user.uid,
        "Validation failed",
        friendlyErrors,
        userAgent,
        ipAddress
      );

      return NextResponse.json(
        {
          error: "Validation error",
          message: "Please provide all required information to create your case",
          details: friendlyErrors,
          requestId
        },
        { status: 400 }
      );
    }

    const caseData = validationResult.data;
    console.log(`[${requestId}] [POST /api/cases] Validation passed, creating case with data:`, caseData);

    // Additional business logic validation
    if (!caseData.caseType || !caseData.jurisdiction) {
      console.error(`[${requestId}] [POST /api/cases] Missing required fields after validation:`, {
        caseType: caseData.caseType,
        jurisdiction: caseData.jurisdiction
      });
      return NextResponse.json(
        {
          error: "Missing required information",
          message: "Case type and jurisdiction are required to create a case",
          requestId
        },
        { status: 400 }
      );
    }

    // Create the case
    const newCase = await createCaseWithJourney({
      ...caseData,
      userId: user.uid,
    });

    console.log(`[${requestId}] [POST /api/cases] Case created successfully:`, newCase.id);

    // Validate response before sending
    const response = CreateCaseResponseSchema.parse({
      caseId: newCase.id,
    });

    console.log(`[${requestId}] [POST /api/cases] Sending success response:`, response);
    
    // Log successful case creation
    const responseTime = Date.now() - startTime;
    logCaseCreationSuccess(
      requestId,
      user.uid,
      responseTime,
      userAgent,
      ipAddress
    );
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      console.error(`[${requestId}] [POST /api/cases] Unauthorized request`);
      
      // Log auth error
      logAuthError(
        requestId,
        'anonymous',
        "Unauthorized request",
        userAgent,
        ipAddress
      );
      
      return NextResponse.json({ 
        error: "Unauthorized", 
        message: "You must be signed in to create cases",
        requestId 
      }, { status: 401 });
    }

    // Enhanced error logging with request context
    console.error(`[${requestId}] [POST /api/cases] Error creating case:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    });

    // Return more specific error messages based on error type
    let errorMessage = "Unable to create case";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = "You don't have permission to create cases";
        statusCode = 403;
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = "Case creation limit reached. Please try again later";
        statusCode = 429;
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = "Network error. Please check your connection and try again";
        statusCode = 503;
      }
    }

    // Log server error
    logServerError(
      requestId,
      'unknown',
      errorMessage,
      responseTime,
      userAgent,
      ipAddress
    );

    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: errorMessage,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
