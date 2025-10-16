# Epic 7: Demo Glossary & Explain-As-You-Go

## 🧭 Overview

- **Status:** Planned – Value-First Demo (Phase 1 sidecar)
- **Priority:** P1 (supports Case Demo “Explain” moment)
- **Timebox:** 1 sprint (can run parallel with Epic 13 polish)
- **Dependencies:** Epic 6.5 (Case Journey V2), Epic 13 (Copilot), Demo Architecture v2

## 🎯 Purpose

Deliver explain-as-you-go glossary support for the scripted eviction and small-claims demos without introducing production feature flags or Firestore integrations. The glossary must feel baked into the experience: every key term in the case journey, reminders, and Copilot responses includes instant plain-language guidance that keeps the demo story moving.

### Success Definition

- Demo presenter can hover/tap any highlighted legal term and read accurate, plain-language guidance.
- Copilot responses, timeline cards, reminders, and form sessions all share the same glossary dataset.
- No network calls or external dependencies are required; the feature relies entirely on demo scenario data.

## 💡 Why It Matters (Roadmap Alignment)

| Roadmap Moment | Glossary Contribution |
| -------------- | -------------------- |
| **Explain** (Phase 1) | Inline hints make AI and timeline guidance feel trustworthy. |
| **Act** (Phase 6) | Form filler pulls field descriptions from the same glossary keys for continuity. |
| **Remind** (Phase 4) | Reminder toasts reference glossary keys (“Answer” vs “Motion”) for clarity. |

## 🏗️ Architecture Guardrails

- **Data Source:** Glossary terms live inside `lib/demo/scenarios/*` and are exported via `scenarios/index.ts`. No Firestore collections (`glossary`) or server writes.
- **Component Surface:** `components/glossary/GlossaryHint.tsx` implements the popover behavior described in `DEMO-ARCHITECTURE-ROBUST.md`.
- **Hook API:** `lib/demo/useGlossary.ts` (new) exposes `getTerm(termId)` and caches lookups in-memory per session.
- **Styling:** Tailwind + shadcn/ui Popover; visually consistent with demo banner and timeline cards.
- **Accessibility:** Keyboard focusable, ESC to close, aria-describedby with definition content.

## ⚖️ Scope & Boundaries

### In Scope
- Highlighting key legal terms in:
  - Case dashboard timeline (`DeadlineList`, `StepDetail` drawers)
  - Copilot success messages & follow-ups
  - Reminder toast copy (“Default Judgment”, “Appearance Form”)
  - Form Session helper panel
- Authoring Marion County–specific definitions for eviction & small-claims demo scripts.
- Loading glossary metadata alongside scenario seeds (single import).
- Lightweight “Learn more” link that navigates to a glossary drawer with expanded context.

### Out of Scope (Future, production epics)
- Firestore-backed glossary administration.
- Multi-jurisdiction or user-generated glossary content.
- Analytics on glossary usage.

## 📦 Deliverables

1. `components/glossary/GlossaryHint.tsx` – tooltip/pill component with desktop/mobile parity.
2. `lib/demo/useGlossary.ts` – hook that hydrates glossary map from `currentScenario`.
3. Updated `lib/demo/scenarios/eviction.ts` & `smallClaims.ts` to ensure every critical step includes `glossaryKeys`.
4. Demo glue code:
   - `DeadlineList` + `CaseStepDetail` consuming `GlossaryHint`.
   - Copilot scripted responses referencing glossary keys (case confirmation & form filler intros).
5. Demo QA script covering hover/tap states and fallback copy.

## 📚 Stories

### Story 7.1 – Scenario Glossary Consolidation
- Move glossary term definitions into shared helper (`lib/demo/scenarios/glossary.ts`).
- Normalize term IDs, add metadata (`tone`, `demoNote`).
- Acceptance: eviction & small-claims scenarios export identical structure; Jest snapshot guard.

### Story 7.2 – GlossaryHint Component & Hook
- Build `GlossaryHint` per architecture spec with hover, focus, and tap support.
- Create `useGlossary()` hook with memoized map + error fallback (“Definition coming soon”).
- Acceptance: Vitest component tests + jest-axe, mobile tap verified via RTL pointer events.

### Story 7.3 – Experience Integration Pass
- Patch Copilot demo responses, dashboard deadlines, reminders UI, and form helper to use glossary keys.
- Add Playwright smoke test to traverse demo script and assert glossary tooltips render text.
- Acceptance: Demo walkthrough script (“Explain” moment) passes without console warnings.

## 🔗 Dependencies & Inputs

- `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md` – glossary is the “Explain” pillar.
- `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md` – demo-only data strategy, `GlossaryHint` guidance.
- `lib/demo/demoRepos.ts` – ensures glossary-backed steps stay in sync with reminder and timeline modules.

## 📊 Metrics

- Demo QA: 0 missing glossary keys in scripted case steps.
- Accessibility: 0 axe violations; keyboard nav validated.
- Latency: Tooltip loads instantly (no async call).
- Demo rehearsal feedback: glossary definitions align with presenter script.

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Missing glossary key causes crash | Hook returns safe fallback + console warning; QA checklist enumerates keys per scenario. |
| Definitions drift from legal review | Content doc appended to epic for stakeholder sign-off; glossary JSON supports `lastReviewed` timestamp. |
| Tooltip clutter on mobile | Switch to bottom sheet on ≤640px widths; follow demo architecture spec. |

## ✅ Definition of Done

- All glossary hints render across demo flow with consistent styling and accessible interactions.
- Copilot, reminders, form session, and case dashboard read from one glossary dataset.
- Demo rehearsal script updated to call out glossary beats.
- Documentation: README in `components/glossary/` explaining integration pattern.
- PM/UX sign-off after running Phase 1 demo checklist.
