# Firebase Storage Structure

## Overview

Firebase Storage is used to store PDF templates and completed forms for the Smart Form Filler (Epic 18).

## Storage Paths

### Form Templates
```
forms/templates/{jurisdiction}/{formType}-template.pdf
```

**Example:**
- `forms/templates/marion/appearance-template.pdf`
- `forms/templates/marion/continuance-template.pdf`

**Access:** Read-only for authenticated users, write access admin-only

### Completed Forms
```
forms/completed/{userId}/{caseId}/{formId}_{timestamp}.pdf
```

**Example:**
- `forms/completed/abc123/xyz789/appearance_1729123456789.pdf`

**Access:** Read/write only for the user who owns the case

## Path Builder Functions

Located in `lib/db/storageRepo.ts`:

### `getTemplatePath(jurisdiction: string, formType: string): string`
Returns the storage path for a form template.

```typescript
const path = getTemplatePath('marion', 'appearance');
// Returns: "forms/templates/marion/appearance-template.pdf"
```

### `getCompletedFormPath(userId: string, caseId: string, formId: string): string`
Returns the storage path for a completed form with timestamp.

```typescript
const path = getCompletedFormPath('user123', 'case456', 'appearance');
// Returns: "forms/completed/user123/case456/appearance_1729123456789.pdf"
```

## Demo Mode

In demo mode, the application uses local files instead of Firebase Storage:

### Demo Template Path
```
/public/demo/forms/{formType}-template.pdf
```

**Example:**
- `/public/demo/forms/marion-appearance-template.pdf`

### Demo Completed Forms
Stored in-memory using `lib/demo/demoStorageAdapter.ts`
- No actual files created
- Cleared on page reload or demo reset

## Security

See `storage.rules` for Firebase Storage security rules.

Key principles:
- Templates are public (read-only) for authenticated users
- Completed forms are private to the user who created them
- Admin-only write access for templates
- User write access only to their own completed forms path

## File Size Limits

- Form templates: No strict limit (typically <1MB)
- Completed forms: 10MB client-side limit (enforced in UI)

## Storage Quotas

For demo/MVP:
- No enforced quotas
- Monitoring only (defer to post-MVP)

## Future Considerations

Items deferred to post-MVP:
- Storage usage tracking per user
- Quota enforcement
- Automatic cleanup of old forms
- CDN optimization
- File versioning
- Bulk operations

## Related Files

- `lib/db/storageRepo.ts` - Storage repository functions
- `lib/demo/demoStorageAdapter.ts` - Demo mode storage
- `storage.rules` - Firebase Storage security rules
- `public/demo/forms/` - Demo template files
