\#\# 📡 \*\*Case Details API Specification \- V2\*\*

\---

\#\# \*\*Table of Contents\*\*  
1\. \[Overview\](\#overview)  
2\. \[Authentication\](\#authentication)  
3\. \[Base URL & Headers\](\#base-url--headers)  
4\. \[Core Endpoints\](\#core-endpoints)  
5\. \[Data Models\](\#data-models)  
6\. \[Error Handling\](\#error-handling)  
7\. \[Query Parameters & Filters\](\#query-parameters--filters)  
8\. \[Webhooks & Events\](\#webhooks--events)  
9\. \[Rate Limiting\](\#rate-limiting)  
10\. \[Implementation Examples\](\#implementation-examples)

\---

\#\# \*\*1. Overview\*\*

This API provides endpoints for managing legal cases and their associated journeys/steps. It supports CRUD operations on cases, real-time step tracking, and generates case-type-specific legal process journeys.

\*\*Version:\*\* 1.0    
\*\*Protocol:\*\* REST    
\*\*Data Format:\*\* JSON    
\*\*Character Encoding:\*\* UTF-8

\---

\#\# \*\*2. Authentication\*\*

\#\#\# \*\*Authentication Method: Bearer Token (JWT)\*\*

All API requests require authentication via JWT token in the Authorization header:

\`\`\`http  
Authorization: Bearer \<your\_jwt\_token\>  
\`\`\`

\#\#\# \*\*Token Acquisition\*\*

\`\`\`http  
POST /api/auth/login  
Content-Type: application/json

{  
  "email": "user@example.com",  
  "password": "securepassword"  
}  
\`\`\`

\*\*Response:\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "user": {  
      "id": "usr\_abc123",  
      "email": "user@example.com",  
      "name": "John Doe"  
    },  
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
    "expiresAt": "2024-12-31T23:59:59Z"  
  }  
}  
\`\`\`

\---

\#\# \*\*3. Base URL & Headers\*\*

\#\#\# \*\*Base URL\*\*  
\`\`\`  
Production: https://api.fairform.com/v1  
Staging: https://api-staging.fairform.com/v1  
Development: http://localhost:3000/api/v1  
\`\`\`

\#\#\# \*\*Standard Headers\*\*  
\`\`\`http  
Content-Type: application/json  
Authorization: Bearer \<token\>  
Accept: application/json  
X-API-Version: 1.0  
\`\`\`

\---

\#\# \*\*4. Core Endpoints\*\*

\#\#\# \*\*4.1 Cases\*\*

\#\#\#\# \*\*GET /api/cases\*\*  
Get all cases for the authenticated user.

\*\*Request:\*\*  
\`\`\`http  
GET /api/cases  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Query Parameters:\*\*  
| Parameter | Type | Required | Description |  
|-----------|------|----------|-------------|  
| \`status\` | string | No | Filter by status: \`draft\`, \`in\_progress\`, \`completed\`, \`archived\` |  
| \`caseType\` | string | No | Filter by case type: \`employment\`, \`housing\`, etc. |  
| \`page\` | number | No | Page number (default: 1\) |  
| \`limit\` | number | No | Results per page (default: 10, max: 100\) |  
| \`sort\` | string | No | Sort field: \`createdAt\`, \`updatedAt\`, \`title\` (prefix with \`-\` for descending) |

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "cases": \[  
      {  
        "id": "case\_abc123",  
        "userId": "usr\_abc123",  
        "title": "Employment Discrimination Case",  
        "description": "Workplace discrimination based on age and gender",  
        "status": "in\_progress",  
        "caseType": "employment",  
        "currentStep": 2,  
        "totalSteps": 5,  
        "progressPercentage": 40,  
        "isCompleted": false,  
        "createdAt": "2024-01-15T10:30:00Z",  
        "updatedAt": "2024-01-20T16:30:00Z"  
      }  
    \],  
    "pagination": {  
      "page": 1,  
      "limit": 10,  
      "total": 25,  
      "totalPages": 3  
    }  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*GET /api/cases/:id\*\*  
Get a specific case by ID.

\*\*Request:\*\*  
\`\`\`http  
GET /api/cases/case\_abc123  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "case": {  
      "id": "case\_abc123",  
      "userId": "usr\_abc123",  
      "title": "Employment Discrimination Case",  
      "description": "Workplace discrimination based on age and gender",  
      "status": "in\_progress",  
      "caseType": "employment",  
      "currentStep": 2,  
      "totalSteps": 5,  
      "progressPercentage": 40,  
      "isCompleted": false,  
      "createdAt": "2024-01-15T10:30:00Z",  
      "updatedAt": "2024-01-20T16:30:00Z",  
      "metadata": {  
        "lastViewedAt": "2024-01-20T16:30:00Z",  
        "completedSteps": 1,  
        "totalTimeSpent": 120  
      }  
    }  
  }  
}  
\`\`\`

\*\*Error Responses:\*\*  
\- \`404 Not Found\` \- Case not found  
\- \`403 Forbidden\` \- User doesn't have access to this case

\---

\#\#\#\# \*\*POST /api/cases\*\*  
Create a new case.

\*\*Request:\*\*  
\`\`\`http  
POST /api/cases  
Authorization: Bearer \<token\>  
Content-Type: application/json

{  
  "title": "Housing Security Deposit Dispute",  
  "description": "Landlord refusing to return security deposit",  
  "caseType": "housing"  
}  
\`\`\`

\*\*Request Body:\*\*  
| Field | Type | Required | Description |  
|-------|------|----------|-------------|  
| \`title\` | string | Yes | Case title (3-200 characters) |  
| \`description\` | string | No | Case description (max 2000 characters) |  
| \`caseType\` | string | Yes | One of: \`employment\`, \`housing\`, \`consumer\`, \`small\_claims\`, \`contract\`, \`discrimination\`, \`other\` |

\*\*Response (201 Created):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "case": {  
      "id": "case\_xyz789",  
      "userId": "usr\_abc123",  
      "title": "Housing Security Deposit Dispute",  
      "description": "Landlord refusing to return security deposit",  
      "status": "draft",  
      "caseType": "housing",  
      "currentStep": 1,  
      "totalSteps": 4,  
      "progressPercentage": 0,  
      "isCompleted": false,  
      "createdAt": "2024-01-21T10:00:00Z",  
      "updatedAt": "2024-01-21T10:00:00Z"  
    }  
  }  
}  
\`\`\`

\*\*Error Responses:\*\*  
\- \`400 Bad Request\` \- Invalid request data  
\- \`409 Conflict\` \- Duplicate case (if title matches existing case)

\---

\#\#\#\# \*\*PATCH /api/cases/:id\*\*  
Update an existing case.

\*\*Request:\*\*  
\`\`\`http  
PATCH /api/cases/case\_abc123  
Authorization: Bearer \<token\>  
Content-Type: application/json

{  
  "title": "Updated Employment Discrimination Case",  
  "description": "Updated description with more details",  
  "status": "in\_progress",  
  "currentStep": 3  
}  
\`\`\`

\*\*Request Body (All Optional):\*\*  
| Field | Type | Description |  
|-------|------|-------------|  
| \`title\` | string | Updated case title |  
| \`description\` | string | Updated description |  
| \`status\` | string | Updated status: \`draft\`, \`in\_progress\`, \`completed\`, \`archived\` |  
| \`currentStep\` | number | Updated current step (1 to totalSteps) |

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "case": {  
      "id": "case\_abc123",  
      "userId": "usr\_abc123",  
      "title": "Updated Employment Discrimination Case",  
      "description": "Updated description with more details",  
      "status": "in\_progress",  
      "caseType": "employment",  
      "currentStep": 3,  
      "totalSteps": 5,  
      "progressPercentage": 60,  
      "isCompleted": false,  
      "createdAt": "2024-01-15T10:30:00Z",  
      "updatedAt": "2024-01-21T11:00:00Z"  
    }  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*DELETE /api/cases/:id\*\*  
Delete a case (soft delete \- archives the case).

\*\*Request:\*\*  
\`\`\`http  
DELETE /api/cases/case\_abc123  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "message": "Case archived successfully",  
  "data": {  
    "caseId": "case\_abc123",  
    "status": "archived"  
  }  
}  
\`\`\`

\---

\#\#\# \*\*4.2 Case Steps / Journey\*\*

\#\#\#\# \*\*GET /api/cases/:id/steps\*\*  
Get all steps for a specific case (the journey).

\*\*Request:\*\*  
\`\`\`http  
GET /api/cases/case\_abc123/steps  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Query Parameters:\*\*  
| Parameter | Type | Required | Description |  
|-----------|------|----------|-------------|  
| \`status\` | string | No | Filter by status: \`pending\`, \`in\_progress\`, \`completed\`, \`skipped\` |  
| \`includeInstructions\` | boolean | No | Include detailed instructions (default: true) |

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "steps": \[  
      {  
        "id": "step\_001",  
        "caseId": "case\_abc123",  
        "stepNumber": 1,  
        "title": "File EEOC Complaint",  
        "description": "Submit discrimination complaint to EEOC",  
        "stepType": "form",  
        "status": "completed",  
        "isCurrent": false,  
        "isCompleted": true,  
        "isRequired": true,  
        "estimatedTime": 30,  
        "instructions": \[  
          "Complete EEOC intake questionnaire online or in person",  
          "Provide detailed description of discrimination incidents",  
          "Submit supporting documentation (emails, performance reviews)",  
          "File within 180 days of the discriminatory act"  
        \],  
        "nextStepId": "step\_002",  
        "previousStepId": null,  
        "completedAt": "2024-01-16T14:00:00Z",  
        "createdAt": "2024-01-15T10:30:00Z",  
        "updatedAt": "2024-01-16T14:00:00Z"  
      },  
      {  
        "id": "step\_002",  
        "caseId": "case\_abc123",  
        "stepNumber": 2,  
        "title": "Agency Investigation",  
        "description": "EEOC investigates your complaint and gathers evidence",  
        "stepType": "review",  
        "status": "in\_progress",  
        "isCurrent": true,  
        "isCompleted": false,  
        "isRequired": true,  
        "estimatedTime": 60,  
        "instructions": \[  
          "Cooperate with EEOC investigator",  
          "Provide additional evidence if requested",  
          "Respond to employer's position statement",  
          "Participate in fact-finding conference if scheduled"  
        \],  
        "nextStepId": "step\_003",  
        "previousStepId": "step\_001",  
        "completedAt": null,  
        "createdAt": "2024-01-15T10:30:00Z",  
        "updatedAt": "2024-01-20T16:30:00Z"  
      }  
    \],  
    "summary": {  
      "totalSteps": 5,  
      "completedSteps": 1,  
      "currentStep": 2,  
      "progressPercentage": 40  
    }  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*GET /api/cases/:id/steps/current\*\*  
Get the current step for a case.

\*\*Request:\*\*  
\`\`\`http  
GET /api/cases/case\_abc123/steps/current  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "currentStep": {  
      "id": "step\_002",  
      "caseId": "case\_abc123",  
      "stepNumber": 2,  
      "title": "Agency Investigation",  
      "description": "EEOC investigates your complaint and gathers evidence",  
      "stepType": "review",  
      "status": "in\_progress",  
      "isCurrent": true,  
      "isCompleted": false,  
      "isRequired": true,  
      "estimatedTime": 60,  
      "instructions": \[  
        "Cooperate with EEOC investigator",  
        "Provide additional evidence if requested",  
        "Respond to employer's position statement",  
        "Participate in fact-finding conference if scheduled"  
      \],  
      "createdAt": "2024-01-15T10:30:00Z",  
      "updatedAt": "2024-01-20T16:30:00Z"  
    }  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*GET /api/cases/:id/next-steps\*\*  
Get actionable next steps for the user (2-3 specific tasks).

\*\*Request:\*\*  
\`\`\`http  
GET /api/cases/case\_abc123/next-steps  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "nextSteps": \[  
      {  
        "id": "action\_001",  
        "caseId": "case\_abc123",  
        "stepNumber": 1,  
        "title": "Gather Employment Documents",  
        "description": "Collect pay stubs, performance reviews, and employment records",  
        "stepType": "document",  
        "status": "in\_progress",  
        "isCurrent": true,  
        "isCompleted": false,  
        "isRequired": true,  
        "estimatedTime": 30,  
        "instructions": \[  
          "Gather pay stubs for the last 6 months",  
          "Collect performance reviews and evaluations",  
          "Print employment contract and any amendments",  
          "Save emails and communications with HR"  
        \],  
        "priority": "high",  
        "dueDate": null,  
        "createdAt": "2024-01-20T16:30:00Z",  
        "updatedAt": "2024-01-20T16:30:00Z"  
      },  
      {  
        "id": "action\_002",  
        "caseId": "case\_abc123",  
        "stepNumber": 2,  
        "title": "Document Discrimination Incidents",  
        "description": "Record specific incidents with dates, witnesses, and details",  
        "stepType": "form",  
        "status": "pending",  
        "isCurrent": false,  
        "isCompleted": false,  
        "isRequired": true,  
        "estimatedTime": 45,  
        "instructions": \[  
          "Write detailed descriptions of each incident",  
          "Record dates, times, and locations",  
          "Identify witnesses and their contact information",  
          "Note the impact on your work and career"  
        \],  
        "priority": "high",  
        "dueDate": null,  
        "createdAt": "2024-01-20T16:30:00Z",  
        "updatedAt": "2024-01-20T16:30:00Z"  
      }  
    \],  
    "summary": {  
      "totalNextSteps": 2,  
      "estimatedTotalTime": 75,  
      "highPriority": 2,  
      "mediumPriority": 0,  
      "lowPriority": 0  
    }  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*PATCH /api/cases/:caseId/steps/:stepId\*\*  
Update a specific step (mark as complete, update status, etc.).

\*\*Request:\*\*  
\`\`\`http  
PATCH /api/cases/case\_abc123/steps/step\_002  
Authorization: Bearer \<token\>  
Content-Type: application/json

{  
  "status": "completed",  
  "isCompleted": true,  
  "isCurrent": false  
}  
\`\`\`

\*\*Request Body (All Optional):\*\*  
| Field | Type | Description |  
|-------|------|-------------|  
| \`status\` | string | Updated status: \`pending\`, \`in\_progress\`, \`completed\`, \`skipped\` |  
| \`isCompleted\` | boolean | Mark step as completed |  
| \`isCurrent\` | boolean | Mark step as current |

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "step": {  
      "id": "step\_002",  
      "caseId": "case\_abc123",  
      "stepNumber": 2,  
      "status": "completed",  
      "isCompleted": true,  
      "isCurrent": false,  
      "completedAt": "2024-01-21T12:00:00Z",  
      "updatedAt": "2024-01-21T12:00:00Z"  
    },  
    "caseProgress": {  
      "currentStep": 3,  
      "progressPercentage": 60,  
      "completedSteps": 2  
    }  
  }  
}  
\`\`\`

\---

\#\#\# \*\*4.3 Case Templates\*\*

\#\#\#\# \*\*GET /api/case-templates\*\*  
Get available case type templates.

\*\*Request:\*\*  
\`\`\`http  
GET /api/case-templates  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "templates": \[  
      {  
        "caseType": "employment",  
        "label": "Employment Discrimination",  
        "description": "Workplace discrimination based on protected characteristics",  
        "totalSteps": 5,  
        "estimatedTotalTime": 210,  
        "averageCompletionDays": 180,  
        "icon": "briefcase",  
        "color": "\#3B82F6"  
      },  
      {  
        "caseType": "housing",  
        "label": "Housing Dispute",  
        "description": "Landlord-tenant disputes, security deposits, repairs",  
        "totalSteps": 4,  
        "estimatedTotalTime": 165,  
        "averageCompletionDays": 90,  
        "icon": "home",  
        "color": "\#10B981"  
      }  
    \]  
  }  
}  
\`\`\`

\---

\#\#\#\# \*\*GET /api/case-templates/:caseType\*\*  
Get detailed template for a specific case type.

\*\*Request:\*\*  
\`\`\`http  
GET /api/case-templates/employment  
Authorization: Bearer \<token\>  
\`\`\`

\*\*Response (200 OK):\*\*  
\`\`\`json  
{  
  "success": true,  
  "data": {  
    "template": {  
      "caseType": "employment",  
      "label": "Employment Discrimination",  
      "description": "Workplace discrimination based on protected characteristics",  
      "totalSteps": 5,  
      "estimatedTotalTime": 210,  
      "steps": \[  
        {  
          "stepNumber": 1,  
          "title": "File EEOC Complaint",  
          "description": "Submit discrimination complaint to EEOC",  
          "stepType": "form",  
          "estimatedTime": 30,  
          "instructions": \[  
            "Complete EEOC intake questionnaire online or in person",  
            "Provide detailed description of discrimination incidents",  
            "Submit supporting documentation",  
            "File within 180 days of the discriminatory act"  
          \]  
        }  
      \]  
    }  
  }  
}  
\`\`\`

\---

\#\# \*\*5. Data Models\*\*

\#\#\# \*\*5.1 Case Model\*\*

\`\`\`typescript  
interface Case {  
  id: string;                    // Unique identifier (e.g., "case\_abc123")  
  userId: string;                // Owner user ID  
  title: string;                 // Case title (3-200 chars)  
  description?: string;          // Optional description (max 2000 chars)  
  status: CaseStatus;            // Current status  
  caseType: CaseType;            // Type of legal case  
  currentStep: number;           // Current step number (1-based)  
  totalSteps: number;            // Total steps in journey  
  progressPercentage: number;    // Calculated: (currentStep / totalSteps) \* 100  
  isCompleted: boolean;          // True if status \=== 'completed'  
  createdAt: string;             // ISO 8601 timestamp  
  updatedAt: string;             // ISO 8601 timestamp  
  metadata?: CaseMetadata;       // Optional metadata  
}

type CaseStatus \= 'draft' | 'in\_progress' | 'completed' | 'archived';

type CaseType \=   
  | 'employment'      // Employment discrimination  
  | 'housing'         // Housing disputes  
  | 'consumer'        // Consumer rights  
  | 'small\_claims'    // Small claims court  
  | 'contract'        // Contract disputes  
  | 'discrimination'  // General discrimination  
  | 'other';          // Other legal matters

interface CaseMetadata {  
  lastViewedAt?: string;  
  completedSteps?: number;  
  totalTimeSpent?: number;  // in minutes  
  tags?: string\[\];  
  notes?: string;  
}  
\`\`\`

\---

\#\#\# \*\*5.2 Case Step Model\*\*

\`\`\`typescript  
interface CaseStep {  
  id: string;                    // Unique identifier  
  caseId: string;                // Parent case ID  
  stepNumber: number;            // Step number (1-based)  
  title: string;                 // Step title  
  description: string;           // Step description  
  stepType: StepType;            // Type of step  
  status: StepStatus;            // Current status  
  isCurrent: boolean;            // Is this the current step?  
  isCompleted: boolean;          // Has this step been completed?  
  isRequired: boolean;           // Is this step required?  
  estimatedTime?: number;        // Estimated time in minutes  
  instructions?: string\[\];       // List of instructions  
  nextStepId?: string;           // ID of next step  
  previousStepId?: string;       // ID of previous step  
  completedAt?: string;          // When completed (ISO 8601\)  
  createdAt: string;             // ISO 8601 timestamp  
  updatedAt: string;             // ISO 8601 timestamp  
}

type StepStatus \= 'pending' | 'in\_progress' | 'completed' | 'skipped';

type StepType \=   
  | 'form'           // Fill out a form  
  | 'document'       // Upload/gather documents  
  | 'review'         // Review/wait for review  
  | 'submit'         // Submit to court/agency  
  | 'wait'           // Wait for response  
  | 'meeting'        // Attend meeting/hearing  
  | 'communication'; // Contact someone  
\`\`\`

\---

\#\# \*\*6. Error Handling\*\*

\#\#\# \*\*Error Response Format\*\*

All errors follow a consistent format:

\`\`\`json  
{  
  "success": false,  
  "error": {  
    "code": "ERROR\_CODE",  
    "message": "Human-readable error message",  
    "details": {  
      "field": "fieldName",  
      "reason": "Specific reason for error"  
    },  
    "timestamp": "2024-01-21T12:00:00Z",  
    "requestId": "req\_xyz789"  
  }  
}  
\`\`\`

\#\#\# \*\*Common Error Codes\*\*

| HTTP Status | Error Code | Description |  
|-------------|------------|-------------|  
| 400 | \`INVALID\_REQUEST\` | Invalid request data |  
| 401 | \`UNAUTHORIZED\` | Missing or invalid authentication |  
| 403 | \`FORBIDDEN\` | User doesn't have permission |  
| 404 | \`NOT\_FOUND\` | Resource not found |  
| 409 | \`CONFLICT\` | Resource conflict (duplicate) |  
| 422 | \`VALIDATION\_ERROR\` | Request validation failed |  
| 429 | \`RATE\_LIMIT\_EXCEEDED\` | Too many requests |  
| 500 | \`INTERNAL\_ERROR\` | Server error |  
| 503 | \`SERVICE\_UNAVAILABLE\` | Service temporarily unavailable |

\#\#\# \*\*Validation Error Example\*\*

\`\`\`json  
{  
  "success": false,  
  "error": {  
    "code": "VALIDATION\_ERROR",  
    "message": "Validation failed",  
    "details": {  
      "errors": \[  
        {  
          "field": "title",  
          "message": "Title must be between 3 and 200 characters"  
        },  
        {  
          "field": "caseType",  
          "message": "Invalid case type. Must be one of: employment, housing, consumer, small\_claims, contract, discrimination, other"  
        }  
      \]  
    },  
    "timestamp": "2024-01-21T12:00:00Z",  
    "requestId": "req\_xyz789"  
  }  
}  
\`\`\`

\---

\#\# \*\*7. Query Parameters & Filters\*\*

\#\#\# \*\*Pagination\*\*

\`\`\`http  
GET /api/cases?page=2\&limit=20  
\`\`\`

\*\*Response includes:\*\*  
\`\`\`json  
{  
  "pagination": {  
    "page": 2,  
    "limit": 20,  
    "total": 125,  
    "totalPages": 7,  
    "hasNext": true,  
    "hasPrevious": true  
  }  
}  
\`\`\`

\#\#\# \*\*Sorting\*\*

\`\`\`http  
GET /api/cases?sort=-createdAt,title  
\`\`\`

\- Prefix with \`-\` for descending order  
\- Multiple fields separated by comma

\#\#\# \*\*Filtering\*\*

\`\`\`http  
GET /api/cases?status=in\_progress\&caseType=employment  
\`\`\`

\#\#\# \*\*Field Selection\*\*

\`\`\`http  
GET /api/cases?fields=id,title,status,progressPercentage  
\`\`\`

Only returns specified fields to reduce payload size.

\---

\#\# \*\*8. Webhooks & Events\*\*

\#\#\# \*\*Webhook Events\*\*

Subscribe to case events:

| Event | Description |  
|-------|-------------|  
| \`case.created\` | New case created |  
| \`case.updated\` | Case updated |  
| \`case.deleted\` | Case deleted/archived |  
| \`case.completed\` | Case marked as completed |  
| \`step.completed\` | Step marked as completed |  
| \`step.started\` | Step started (became current) |

\#\#\# \*\*Webhook Payload Example\*\*

\`\`\`json  
{  
  "event": "case.updated",  
  "timestamp": "2024-01-21T12:00:00Z",  
  "data": {  
    "caseId": "case\_abc123",  
    "userId": "usr\_abc123",  
    "changes": {  
      "currentStep": {  
        "from": 2,  
        "to": 3  
      },  
      "progressPercentage": {  
        "from": 40,  
        "to": 60  
      }  
    }  
  }  
}  
\`\`\`

\---

\#\# \*\*9. Rate Limiting\*\*

\#\#\# \*\*Rate Limits\*\*

| Tier | Requests per Hour | Burst Limit |  
|------|-------------------|-------------|  
| Free | 100 | 10/minute |  
| Pro | 1,000 | 50/minute |  
| Enterprise | 10,000 | 200/minute |

\#\#\# \*\*Rate Limit Headers\*\*

\`\`\`http  
X-RateLimit-Limit: 1000  
X-RateLimit-Remaining: 950  
X-RateLimit-Reset: 1642780800  
\`\`\`

\#\#\# \*\*Rate Limit Exceeded Response\*\*

\`\`\`json  
{  
  "success": false,  
  "error": {  
    "code": "RATE\_LIMIT\_EXCEEDED",  
    "message": "Rate limit exceeded. Try again in 30 seconds",  
    "details": {  
      "retryAfter": 30,  
      "limit": 1000,  
      "remaining": 0,  
      "resetAt": "2024-01-21T13:00:00Z"  
    }  
  }  
}  
\`\`\`

\---

\#\# \*\*10. Implementation Examples\*\*

\#\#\# \*\*Example 1: Fetching Case Details with Steps\*\*

\`\`\`typescript  
// TypeScript/JavaScript example  
async function fetchCaseDetails(caseId: string) {  
  const token \= getAuthToken();  
    
  // Fetch case and steps in parallel  
  const \[caseResponse, stepsResponse\] \= await Promise.all(\[  
    fetch(\`https://api.fairform.com/v1/cases/${caseId}\`, {  
      headers: {  
        'Authorization': \`Bearer ${token}\`,  
        'Content-Type': 'application/json'  
      }  
    }),  
    fetch(\`https://api.fairform.com/v1/cases/${caseId}/steps\`, {  
      headers: {  
        'Authorization': \`Bearer ${token}\`,  
        'Content-Type': 'application/json'  
      }  
    })  
  \]);  
    
  const caseData \= await caseResponse.json();  
  const stepsData \= await stepsResponse.json();  
    
  return {  
    case: caseData.data.case,  
    steps: stepsData.data.steps  
  };  
}  
\`\`\`

\#\#\# \*\*Example 2: Creating a New Case\*\*

\`\`\`typescript  
async function createCase(caseData: CreateCaseRequest) {  
  const token \= getAuthToken();  
    
  const response \= await fetch('https://api.fairform.com/v1/cases', {  
    method: 'POST',  
    headers: {  
      'Authorization': \`Bearer ${token}\`,  
      'Content-Type': 'application/json'  
    },  
    body: JSON.stringify({  
      title: caseData.title,  
      description: caseData.description,  
      caseType: caseData.caseType  
    })  
  });  
    
  if (\!response.ok) {  
    const error \= await response.json();  
    throw new Error(error.error.message);  
  }  
    
  const result \= await response.json();  
  return result.data.case;  
}  
\`\`\`

\#\#\# \*\*Example 3: Marking a Step as Complete\*\*

\`\`\`typescript  
async function completeStep(caseId: string, stepId: string) {  
  const token \= getAuthToken();  
    
  const response \= await fetch(  
    \`https://api.fairform.com/v1/cases/${caseId}/steps/${stepId}\`,  
    {  
      method: 'PATCH',  
      headers: {  
        'Authorization': \`Bearer ${token}\`,  
        'Content-Type': 'application/json'  
      },  
      body: JSON.stringify({  
        status: 'completed',  
        isCompleted: true,  
        isCurrent: false  
      })  
    }  
  );  
    
  const result \= await response.json();  
  return result.data;  
}  
\`\`\`

\#\#\# \*\*Example 4: React Query Hook\*\*

\`\`\`typescript  
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch case details  
export function useCaseDetails(caseId: string) {  
  return useQuery({  
    queryKey: \['case', caseId\],  
    queryFn: () \=\> fetchCaseDetails(caseId),  
    enabled: \!\!caseId  
  });  
}

// Fetch case steps  
export function useCaseSteps(caseId: string) {  
  return useQuery({  
    queryKey: \['caseSteps', caseId\],  
    queryFn: () \=\> fetchCaseSteps(caseId),  
    enabled: \!\!caseId  
  });  
}

// Update step mutation  
export function useUpdateStep(caseId: string) {  
  const queryClient \= useQueryClient();  
    
  return useMutation({  
    mutationFn: (data: { stepId: string; updates: UpdateStepRequest }) \=\>  
      updateStep(caseId, data.stepId, data.updates),  
    onSuccess: () \=\> {  
      // Invalidate and refetch  
      queryClient.invalidateQueries({ queryKey: \['case', caseId\] });  
      queryClient.invalidateQueries({ queryKey: \['caseSteps', caseId\] });  
    }  
  });  
}  
\`\`\`

\---

\#\# \*\*Summary\*\*

This API specification provides:  
\- ✅ Complete CRUD operations for cases  
\- ✅ Case journey/step management  
\- ✅ Case-type-specific templates  
\- ✅ Actionable next steps generation  
\- ✅ Comprehensive error handling  
\- ✅ Pagination, filtering, and sorting  
\- ✅ Rate limiting and authentication  
\- ✅ Real-world implementation examples

\*\*Ready to implement\!\*\* Let me know if you need:  
1\. Additional endpoints  
2\. Webhook implementation details  
3\. Database schema recommendations  
4\. More code examples in specific languages  
