# Epic 16: Demo Deadline Engine

## 🧭 Overview

- **Status:** Planned – Value-First Demo Phase 3 (“Auto-plan in seconds”)
- **Priority:** P1 (critical bridge between import and reminders)
- **Timebox:** 1 sprint (runs immediately after Epic 15 completion)
- **Dependencies:** Epic 15 (structured case import), Epic 7 (glossary hints), Demo Architecture v2

## 🎯 Purpose

Transform imported case facts into a guided legal plan with Marion County–specific deadlines. This epic powers the dramatic “Auto-Plan” reveal—showing investors that FairForm understands local court rules and can translate them into actionable steps without external APIs or manual math.

### Success Definition

- From the case dashboard, presenter clicks “Generate Plan.”
- System applies Marion County eviction rules to create a sequenced set of steps with due dates, urgency indicators, and glossary links.
- Deadline list animates in (per demo architecture) and remains consistent across refreshes.
- Copilot cross-references the newly generated plan in its follow-up guidance.

## 💡 Roadmap Alignment

| Roadmap Phase | Contribution |
| ------------- | ------------ |
| **Phase 3 – Deadline Engine** | Directly implements “Auto-plan in seconds” described in `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:64`. |
| **Phase 4 – Smart Reminders (Epic 9)** | Supplies due dates and step metadata for reminder scheduling. |
| **Phase 6 – Smart Form Filler (Epic 18)** | Identifies form-triggering steps (appearance filing) and due dates. |
| **Hearing Day Mode (Epic 17)** | Provides countdown context for “Show up ready” checklist. |

## 🏗️ Architecture Guardrails

- **Rule Templates:** Store deadline logic in versioned JSON files (`lib/demo/deadlines/marion.eviction.json`) with relative offsets (e.g., `noticeDate + 3 days`).
- **Engine Implementation:** `lib/demo/deadlineEngine.ts` interprets templates, injects Date objects, and outputs `CaseStep` entries.
- **In-Memory Storage:** Generated steps added to `demoStepsRepo` to keep demo single-mode; no Firestore writes.
- **Resilience:** Engine handles missing anchors (e.g., if hearing date absent, marks step as “TBD” with explanatory copy) to avoid demo stalls.
- **Diagnostics:** Console logs narrate rule applications (“Calculated Answer deadline: Nov 4 (3 days after notice)”).

## ⚖️ Scope & Boundaries

### In Scope
- JSON rule format supporting:
  - Anchor dates (`noticeDate`, `hearingDate`, `importedAt`).
  - Math operations (± days/weeks).
  - Urgency tags for UI (e.g., `urgent`, `ongoing`).
- Deadline generation action triggered from case dashboard + Copilot command.
- Animation + sorting logic per `DEMO-ARCHITECTURE-ROBUST.md` example (staggered entry, urgency color coding).
- Copilot and reminder integration (update conversation state + schedule default reminders).
- Unit + integration tests verifying rule math.

### Out of Scope
- Multi-jurisdiction rule libraries beyond Marion County eviction + small-claims expansion.
- Persisting edited deadlines or user-generated steps.
- Production-grade rule authoring tools.

## 📦 Deliverables

1. **Rule Library:** `lib/demo/deadlines/marion.eviction.json`, `.../marion.smallClaims.json` with metadata (`glossaryKeys`, `formsNeeded`).
2. **Deadline Engine:** `lib/demo/deadlineEngine.ts` + TypeScript types (`DeadlineRule`, `DeadlineOutput`).
3. **Dashboard Integration:** `components/dashboard/DeadlineList` updates to call engine, show urgency badges, and handle empty/error states.
4. **Copilot Hook:** Conversation logic that references generated plan (“Next deadlines: file answer by Nov 4.”).
5. **QA Assets:** Vitest tests for engine math; Playwright step verifying animation and glossary hints.

## 📚 Stories

### Story 16.1 – Rule Schema & Fixtures
- Design JSON schema for deadline rules (anchors, offsets, instructions, glossary keys).
- Populate eviction + small-claims fixtures with at least 4 steps each.
- Acceptance: Schema validated via Zod; fixtures pass lint and content review (legal SME sign-off).

### Story 16.2 – Deadline Engine Core
- Implement `generateDemoDeadlines(caseData, config)` applying rules to produce `CaseStep` objects.
- Handle missing data gracefully and tag steps with `isUrgent`/`isOptional`.
- Acceptance: Unit tests cover each rule, missing anchor, and multiple case types; output matches golden snapshots.

### Story 16.3 – Dashboard & Copilot Integration
- Wire “Generate Plan” action to engine, animate results, and persist to `demoStepsRepo`.
- Update Copilot script to summarize plan and offer reminder + form suggestions.
- Acceptance: Playwright run ensures button triggers plan, timeline renders with glossary hints, Copilot references plan in next message.

## 🔗 Inputs & References

- Roadmap Phase 3 description – `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:64`.
- Demo architecture deadline list example – `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md:556`.
- Demo repositories (steps + cases) – `lib/demo/demoRepos.ts`.
- Scenario data baseline – `lib/demo/scenarios/*.ts`.

## 📊 Metrics

- Deadline generation time: ≤ 1s perceived (with simulated 300ms delay).
- Rule coverage: 100% of required demo steps generated (no manual patches).
- QA run: zero console errors; jest-axe 0 violations on updated UI.
- Presenter script: timeline matches printed agenda sheet.

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Rule drift from legal guidance | Store fixtures in version control with `lastReviewed` metadata; include content review checklist. |
| Animation jank on slower machines | Provide reduced-motion fallback (no animation) when prefers-reduced-motion detected. |
| Copilot referencing stale data | Regenerate conversation summary after plan generation; add unit test ensuring conversation state updates. |
| Template errors break demo | Add try/catch with friendly toast explaining issue; provide backup hardcoded plan if template fails. |

## ✅ Definition of Done

- Timeline generation works during the scripted demo and after manual refresh.
- Copilot, reminders, and form filler read the same deadline outputs.
- Rule fixtures documented with explanation and review timestamp.
- Accessibility + performance baselines met (WCAG AA, animation fallback).
- Demo rehearsal script updated to include narration of rule logic.
