# Epic 2: Case Dashboard and Case Creation

## Summary

Enable users to create new cases and view their existing cases from a central dashboard with responsive, accessible UI components.

## Business Value

- Provides the first tangible experience of FairForm after authentication.
- Gives SRLs visibility into their active cases and the confidence that information is saved.
- Establishes routing patterns for future case detail experiences.

## Scope

**In Scope**

- `/dashboard` route and layout with responsive design.
- Case card list with title, case type, status, and created date.
- “Start New Case” CTA that opens a form modal.
- Firestore write to persist new case documents.
- Placeholder route for `/case/[id]` to confirm navigation.
- Empty-state design for first-time users.

**Out of Scope**

- Editing or deleting cases.
- Case timeline or steps (handled in later sprints).
- Sharing or exporting case data.

## Acceptance Criteria

1. Authenticated users see a dashboard listing all of their cases ordered by created date.
2. Clicking “Start New Case” launches a form, validates required fields, and persists to Firestore.
3. Newly created cases render immediately in the dashboard without hard refresh.
4. Each case card navigates to `/case/[id]` (placeholder acceptable in Sprint 1).
5. Empty state displays when the user has no cases, including call-to-action text.
6. Dashboard layout meets responsive breakpoints and WCAG 2.1 AA guidelines.

## Dependencies

- Authentication guards from Epic 1.
- Firestore schema from Epic 4.
- Design system components from Epic 3.

## Linked Stories

- Story 2.1 – Case dashboard and creation flow (planned).

## References

- `docs/prd.md` – Core features list.
- `docs/architecture/source-tree.md` – Route and component locations.
- `docs/architecture/coding-standards.md` – Frontend implementation guidelines.
