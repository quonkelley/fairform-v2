# Epic 4: Database and API Layer

## Summary

Configure Firestore collections, security rules, and Next.js API routes to persist and retrieve FairForm data securely.

## Business Value

- Provides reliable persistence for user, case, and reminder data.
- Enables the dashboard and future journey map features to fetch real-time information.
- Establishes a pattern for server-side validation and data access.

## Scope

**In Scope**

- Firestore collections: `users`, `cases`, `caseSteps`, `glossary`, `reminders`.
- Security rules aligned with MVP needs and ownership enforcement.
- API route handlers for creating and listing cases, retrieving steps, marking completion, and scheduling reminders.
- Postman or equivalent tests verifying API responses.

**Out of Scope**

- Supabase migration (planned for later phases).
- Admin dashboards or analytics exports.
- Webhooks for third-party integrations.

## Acceptance Criteria

1. Firestore collections and indexes exist as defined in the data model.
2. Security rules restrict access to authenticated owners and prevent unauthorized writes.
3. `POST /api/cases` creates a case for the authenticated user and returns the new ID.
4. `GET /api/cases` returns all cases for the authenticated user with required fields.
5. `GET /api/cases/:id/steps` returns ordered steps for a case.
6. `PATCH /api/steps/:id/complete` toggles completion with validation.
7. `POST /api/reminders` stores reminder requests for future notification processing.
8. API endpoints return expected HTTP status codes and pass Postman smoke tests.

## Dependencies

- Authentication scaffolding from Epic 1.
- Repository interfaces defined in `lib/db`.
- Environment variables for Firebase, Twilio, and Resend.

## Linked Stories

- Story 4.1 – Database schema and API endpoints (planned).

## References

- `docs/prd.md` – Data model summary.
- `docs/architecture/overview.md` – System diagram and future migration path.
- `docs/architecture/coding-standards.md` – API and security guidelines.
