# Data Model (MVP)

## Collections

### `users/{userId}`
- `email`: string  
- `displayName`: string | null  
- `createdAt`: timestamp  
- `role`: `"user"` (future expansion)

### `cases/{caseId}`
- `userId`: reference to owning `users` document  
- `caseType`: `"eviction" | "small_claims" | string`  
- `jurisdiction`: string (e.g., `marion_in`)  
- `status`: `"active" | "closed" | "archived"`  
- `progressPct`: number (computed)  
- `createdAt`: timestamp  
- `updatedAt`: timestamp

### `caseSteps/{stepId}`
- `caseId`: reference to parent case  
- `name`: string  
- `order`: number  
- `dueDate`: timestamp | null  
- `isComplete`: boolean  
- `completedAt`: timestamp | null

### `glossary/{termId}`
- `term`: string  
- `definition`: string (plain language)  
- `jurisdiction`: string | null  
- `lastReviewed`: timestamp

### `reminders/{reminderId}`
- `userId`: reference to `users`  
- `caseId`: reference to `cases`  
- `dueDate`: timestamp  
- `channel`: `"email" | "sms"`  
- `message`: string  
- `sent`: boolean  
- `createdAt`: timestamp

## Indexes

- `cases`: single-field index on `userId`.
- `caseSteps`: composite index on `caseId` (ASC) and `order` (ASC).
- `reminders`: composite index on `userId` (ASC) and `dueDate` (ASC) for scheduling.

## Firestore Rules Snapshot

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return request.auth != null && request.auth.uid == userId; }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    match /cases/{caseId} {
      allow create: if isSignedIn();
      allow read, update, delete: if isOwner(resource.data.userId);
    }

    match /caseSteps/{stepId} {
      allow read, update: if isSignedIn() &&
        get(/databases/$(database)/documents/cases/$(request.resource.data.caseId)).data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow delete: if false;
    }

    match /glossary/{termId} {
      allow read: if true;
      allow write: if false;
    }

    match /reminders/{reminderId} {
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

## Migration Notes

- Repository interfaces in `lib/db` abstract Firestore implementation.
- When migrating to Supabase (Phase 2), replace repository internals while retaining surface API.
- Keep timestamps in ISO format for eventual SQL migrations.
