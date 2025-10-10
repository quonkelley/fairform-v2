# FairForm Product Requirements

**Phase:** 1 MVP – “Legal GPS”  
**Version:** 1.1 (October 2025)  
**Owner:** Shaquon K.  
**Analyst:** Mary

---

## Product Vision

FairForm enables self-represented litigants to navigate civil legal procedures through a guided, conversational web app. The MVP delivers an educational, action-oriented experience without providing legal advice.

## Problem Statement

- 92% of civil litigants in US courts appear without counsel.  
- They struggle to interpret forms, deadlines, and procedural steps.  
- Available resources are fragmented, outdated, and written for lawyers.

## Objectives and Success Metrics

| Objective | KPI / Success Metric |
| --- | --- |
| Improve comprehension of legal process | ≥ 80% of users can state their next required action after onboarding |
| Build procedural reliability | ≥ 70% of users complete at least one case step |
| Establish user trust | ≥ 4.5 / 5 trust score on pilot survey |
| Ensure performance and accessibility | ≤ 2 s page load, WCAG 2.1 AA compliance |
| Demonstrate reusability | Modular codebase ready for Smart Intake (Phase 1.5) |

## Target Users

| Segment | Description | Key Needs |
| --- | --- | --- |
| Primary: Self-represented litigants (SRLs) | Individuals filing or defending small civil cases | Simple guidance, confidence, deadline tracking |
| Secondary: Legal aid orgs and courts | Partners who recommend or embed FairForm | Reliable workflow, compliance, reporting |
| Tertiary: Policy stakeholders | Funders and researchers | Aggregated impact metrics |

Mobile-first experience, ages 25–55, low-to-moderate income, primarily smartphone usage.

## Core Features (Sprint 1 Scope)

1. User authentication with secure onboarding.  
2. Case dashboard with case creation workflow.  
3. Foundational design system components.  
4. Firestore database and API endpoints.  
5. Layout and navigation for authenticated experience.

Detailed requirements for each feature live in the epic files:

- [Epic 1 – Authentication System](./prd/epic-1-authentication-system.md)
- [Epic 2 – Case Dashboard and Case Creation](./prd/epic-2-case-dashboard.md)
- [Epic 3 – Design System Foundations](./prd/epic-3-design-system.md)
- [Epic 4 – Database and API Layer](./prd/epic-4-database-and-apis.md)
- [Epic 5 – Layout and Navigation](./prd/epic-5-layout-navigation.md)

## Out of Scope (Phase 1 Deferrals)

- AI Smart Intake (Phase 1.5)  
- Document Readiness Assistant  
- Evidence Checklist Manager  
- Court Preparation Simulator  
- Human Helpdesk integration  
- Open APIs / Justice OS infrastructure

## Compliance and Ethics Principles

| Area | Key Policy |
| --- | --- |
| Unauthorized Practice of Law | Educational framing only; clear disclaimers |
| Data Privacy | Firebase Auth controls PII, no sensitive client-side storage |
| AI Usage | No front-facing AI in MVP, transparency commitments for later phases |
| Accessibility | WCAG 2.1 AA compliance is mandatory |
| Transparency | Terms and disclaimers presented at onboarding and footer |

## Dependencies and Integrations

- Firebase (Auth, Firestore)  
- Vercel hosting and CI/CD  
- Twilio (SMS) and Resend (Email) for reminders  
- PostHog analytics  
- Google Fonts (Inter)  
- Domain and SSL certificate

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Unauthorized practice of law concerns | Prominent disclaimers and educational positioning |
| Trust and data security | Firebase Auth, clear privacy policy |
| Accessibility gaps | Automated + manual WCAG testing in QA |
| Scope creep | Strict adherence to Sprint 1 backlog |
| Performance issues | Optimize SSR and Firestore queries |

## Milestones

| Milestone | Target Date | Deliverable |
| --- | --- | --- |
| Sprint 0 | Oct 2025 | Environment and schema ready |
| Sprint 1 | Nov 2025 | Auth, dashboard, case management |
| Sprint 2 | Dec 2025 | Journey map, glossary |
| Sprint 3 | Jan 2026 | Notifications |
| Beta Launch | Feb 2026 | Pilot with 5–8 SRLs and 1 legal aid partner |

## Post-MVP Roadmap

| Phase | Key Additions | Outcome |
| --- | --- | --- |
| 1.5 – Guided Empowerment | Smart Intake, Document Readiness, Evidence Checklist | Personalized preparation |
| 2 – Civic Companion | Conversational AI, Court Prep Simulator, Helpdesk | Interactive support |
| 3 – Justice OS | Jurisdiction APIs, Open Form Schemas | Platform for partners and courts |

