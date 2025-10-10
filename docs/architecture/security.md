# Security and Compliance

## Authentication and Authorization

- Firebase Auth handles session management with secure cookies.
- Protected routes enforce auth in middleware (`app/(auth)/middleware.ts` planned).
- Repository functions validate ownership before mutating Firestore.
- No administrative UI in MVP; future roles will expand rules.

## Firestore Rules

- See `docs/architecture/data-model.md` for rule snapshot.
- Rules ensure users can only read/write their own documents.
- No deletes on `caseSteps` or `reminders` to preserve auditability.

## Secrets Management

- Store credentials in Vercel environment variables per environment.
- For local development, copy `.env.example` to `.env.local` and keep file out of git.
- GitHub Actions uses OIDC to fetch secrets securely (no long-lived tokens).

## Network and API Security

- All API routes validate payloads with Zod and sanitize outputs.
- Implement request body size limits for future file uploads (Phase 1.5).
- Add `/api/health` for uptime checks without exposing sensitive data.

## Compliance

- WCAG 2.1 AA accessibility compliance required.
- Unauthorized Practice of Law mitigated through disclaimers and educational tone.
- Data privacy handled by Firebase; no sensitive data stored client-side.
- Logging avoids PII; analytics aggregated via PostHog.

## Monitoring and Incident Response

- Vercel + Firebase logs monitored for errors.
- Configure alerts for Cloud Function failures and high error rates.
- Incident rollback via Vercel “Promote previous build” workflow.

## Roadmap Considerations

- Multi-factor auth for high-risk accounts (Phase 2+).
- Automated penetration testing before public launch.
- Supabase migration will require updated security review.
