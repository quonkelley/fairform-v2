# API Contracts (Next.js Route Handlers)

## `POST /api/cases`

- **Purpose:** Create a new case for the authenticated user.  
- **Auth:** Required (Firebase session cookie).  
- **Request Body:**
  ```json
  {
    "caseType": "eviction",
    "jurisdiction": "marion_in"
  }
  ```
- **Response:** `201 Created`
  ```json
  { "caseId": "abc123" }
  ```
- **Errors:** `400` (validation), `401` (unauthenticated), `500` (server).

## `GET /api/cases`

- **Purpose:** List all cases for the authenticated user.  
- **Response:** `200 OK`
  ```json
  [
    {
      "caseId": "abc123",
      "caseType": "eviction",
      "status": "active",
      "progressPct": 20,
      "createdAt": "2025-10-01T00:00:00.000Z"
    }
  ]
  ```

## `GET /api/cases/:id/steps`

- **Purpose:** Retrieve ordered steps for a case.  
- **Response:** `200 OK`
  ```json
  [
    {
      "stepId": "step1",
      "name": "File appearance",
      "order": 1,
      "isComplete": false,
      "dueDate": "2025-10-15T00:00:00.000Z"
    }
  ]
  ```

## `PATCH /api/steps/:id/complete`

- **Purpose:** Mark a case step as complete or incomplete.  
- **Request Body:**
  ```json
  { "isComplete": true }
  ```
- **Response:** `200 OK`
  ```json
  { "success": true }
  ```

## `POST /api/reminders`

- **Purpose:** Schedule an email or SMS reminder.  
- **Request Body:**
  ```json
  {
    "caseId": "abc123",
    "dueDate": "2025-12-10",
    "channel": "sms"
  }
  ```
- **Response:** `201 Created`
  ```json
  { "reminderId": "rem-456" }
  ```

## `GET /api/health`

- **Purpose:** Simple heartbeat for monitoring.  
- **Response:** `200 OK`
  ```json
  { "ok": true }
  ```

## Testing Notes

- Use Postman collections (or REST Client requests) to verify all endpoints.
- Mock Firebase Auth context in integration tests.
- Ensure rate limits and error cases are covered by automated tests.
