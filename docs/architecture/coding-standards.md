# Coding Standards

## General

- TypeScript `strict` mode must stay enabled; avoid `any` unless justified in comments.
- Keep imports centralized: shared third-party and internal modules are re-exported via `lib/deps.ts` (create if missing).
- Follow repository pattern: UI components never call Firestore directly. Interact through `lib/db/*` repositories.
- All asynchronous functions return typed promises (`Promise<Result>`).
- Use functional components with hooks; avoid legacy class components.

## Formatting and Linting

- Run `pnpm lint` before commits; fix all warnings.
- Prettier handles formatting—do not disable formatting checks.
- Enforce ESLint rules configured in the project (React hooks, accessibility, testing-library).

## Accessibility

- Meet WCAG 2.1 AA: focus order, visible focus rings, semantic HTML.
- Every interactive element must be reachable via keyboard and have ARIA labels or descriptive text.
- Use shadcn/ui primitives that support accessibility out of the box; extend carefully.
- Run manual keyboard walkthrough of new flows; log gaps in story Dev Notes.

## UI Components

- Keep components presentational; complex logic belongs in hooks (`useCaseDashboard`, etc).
- Co-locate styles with components; prefer Tailwind utility classes.
- Provide Storybook-like examples when feasible (future enhancement).

## API and Data Layer

- Validate all incoming payloads with Zod before hitting Firestore.
- Repository files (`lib/db/*.ts`) encapsulate Firestore queries and mapping.
- Surface errors via discriminated unions or `Result` patterns; do not throw raw Firestore errors into UI.
- Follow Firestore security assumptions—enforce ownership checks in code and rules.

## Testing

- Place unit/component tests under `tests/` mirroring source paths.
- Minimum coverage targets: repositories ≥80%, API routes ≥70%, critical UI flows snapshot + interaction coverage.
- Use Vitest with React Testing Library; no Enzyme or custom DOM utilities.
- For hooks, use `renderHook` utilities provided by RTL.

## Notifications and Background Jobs

- All reminder logic is orchestrated through Firebase Cloud Functions.
- Use configurable lead time constants; store in `lib/notifications/constants.ts`.

## Commit and Review Practices

- Follow Conventional Commit messages (`feat:`, `fix:`, `chore:`, etc).
- PR checklist: typecheck, lint, tests, accessibility (keyboard, focus, contrast).
- Include Loom or screenshots for meaningful UI changes.

## References

- `docs/architecture/tech-stack.md`
- `docs/architecture/source-tree.md`
- `docs/prd.md` and associated epics
