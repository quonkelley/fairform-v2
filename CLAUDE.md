# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Production build
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint with Next.js config
- `npm run type-check` - TypeScript type checking without emitting files
- `npm test` - Run Vitest test suite
- `npm test -- --coverage` - Run tests with coverage report

### Single Test Execution
- `npm test -- tests/path/to/specific.test.ts` - Run specific test file
- `npm test -- --watch` - Run tests in watch mode

## Architecture Overview

FairForm is a Next.js 14 application using App Router for a legal case management platform. Key architectural patterns:

### Repository Pattern
- **CRITICAL**: UI components never call Firestore directly
- All database operations go through repositories in `lib/db/` (casesRepo.ts, stepsRepo.ts, remindersRepo.ts)
- Repositories handle data mapping, validation, and error handling

### Authentication & Authorization
- Firebase Auth with email/password
- Auth context in `components/auth/auth-context.tsx`
- Protected routes via `components/auth/protected-route.tsx`
- Server-side auth utilities in `lib/auth/server-auth.ts`

### Data Layer
- Firestore collections: `users`, `cases`, `caseSteps`, `glossary`, `reminders`
- All API payloads validated with Zod schemas
- Error handling via Result patterns, not thrown exceptions

### UI Architecture
- shadcn/ui components with Tailwind CSS
- React Hook Form + Zod for form validation
- React Query for server state management
- Functional components with hooks only

## Key Directories

- `app/` - Next.js App Router (pages and API routes)
- `components/` - UI components organized by feature
- `lib/` - Core utilities, database repos, auth, validation
- `tests/` - Test files mirroring source structure
- `docs/` - Architecture, PRDs, and documentation

## Development Standards

### TypeScript
- Strict mode enabled - avoid `any` types
- All async functions must return typed promises
- Imports centralized through `lib/deps.ts` when needed

### Accessibility
- Must meet WCAG 2.1 AA standards
- All interactive elements keyboard accessible
- Visible focus rings required
- ARIA labels for complex interactions

### Testing Requirements
- Repositories: ≥80% coverage
- API routes: ≥70% coverage
- Critical UI flows: snapshot + interaction tests
- Use Vitest + React Testing Library

### Code Style
- Run `npm run lint` before commits
- Prettier handles formatting
- Follow repository pattern for data access
- Conventional commit messages (feat:, fix:, chore:)

## Firebase Configuration

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## BMAD Development Process

This project uses BMAD methodology with specialized AI agents in `.cursor/rules/bmad/`. When working on stories:

1. Stories contain complete requirements - avoid loading additional PRD/architecture files unless explicitly directed
2. Follow the develop-story workflow: Read task → Implement → Test → Validate → Update checkboxes
3. Only update Dev Agent Record sections in story files
4. Ensure all validations pass before marking tasks complete

## Common Patterns

### API Route Structure
```typescript
// app/api/cases/route.ts
export async function GET() {
  // Use casesRepo, not direct Firestore calls
  const result = await casesRepo.getUserCases(userId);
  return NextResponse.json(result);
}
```

### Component with Repository
```typescript
// components/dashboard/case-list.tsx
import { useUserCases } from '@/lib/hooks/useUserCases';

export function CaseList() {
  const { data: cases, isLoading } = useUserCases();
  // Render logic
}
```

### Error Handling
```typescript
// lib/db/casesRepo.ts
export async function createCase(data: CaseInput): Promise<Result<Case>> {
  try {
    // Firestore operations
    return { success: true, data: case };
  } catch (error) {
    return { success: false, error: 'Failed to create case' };
  }
}
```