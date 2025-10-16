# Epic 17: Demo Hearing Day Mode

## 🧭 Overview

- **Status:** Planned – Value-First Demo Phase 5 (“Show up ready”)
- **Priority:** P1 (final confidence crescendo before form filler)
- **Timebox:** 1 short sprint (can overlap with Epic 18 ramp-up)
- **Dependencies:** Epic 16 (deadline engine outputs), Epic 7 (glossary hints), Epic 9 (reminders), Demo Architecture v2

## 🎯 Purpose

Deliver a stage-ready “Hearing Day Mode” that flips the case dashboard into an immersive preparation experience. It should reuse the generated plan, surface last-minute coaching, and present a tactile checklist that proves FairForm walks users into court with confidence—without bolting on new data sources.

### Success Definition

- Presenter taps the Hearing Day CTA from the case dashboard.
- A full-screen module appears with curated tasks, documents, and day-of guidance tied to the demo scenario.
- Completing items triggers immediate visual feedback (confetti banner) and Copilot acknowledgement.
- Exiting returns to the dashboard with state preserved.

## 💡 Roadmap Alignment

| Roadmap Phase | Contribution |
| ------------- | ------------ |
| **Phase 5 – Hearing Day Mode** | Implements “Court-day confidence” moment (`docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:90`). |
| **Phase 3 & 4 outputs** | Consumes deadline engine + reminder data to highlight urgent tasks. |
| **Phase 6 (Epic 18)** | Surfaces completed forms generated in Smart Form Filler. |

## 🏗️ Architecture Guardrails

- **Single-Mode Demo:** Hearing day data sourced from scenario definitions (`lib/demo/scenarios/*`) enriched with deadline engine outputs—no Firestore.
- **Component Suite:** Introduce `components/demo/HearingPrep` (wrapper), `HearingChecklist`, `DayOfTips`, and `CaseFilesPanel`.
- **Animation Guidance:** Follow demo architecture for smooth transitions; provide reduced-motion fallback.
- **State Persistence:** Use `demoConfig.behavior.persistInLocalStorage` flag to optionally persist checklist between screens; default session-based for live demos.
- **Accessibility:** Modal/trap focus, keyboard toggles for checklist, screen reader descriptions for each task.

## ⚖️ Scope & Boundaries

### In Scope
- CTA entry on case dashboard + Copilot hook (“Switch to Hearing Day Mode” command).
- Checklist items drawn from scenario metadata (`hearingPrep` array) referencing glossary keys where useful.
- Integration with reminders: highlight if a reminder is pending or completed.
- Document panel referencing files created by Epic 18 (appearance form).
- Success banner with animation + optional confetti.

### Out of Scope
- Scheduling actual hearings or syncing with court calendars.
- User-generated checklist items.
- Multi-case preparation flows.

## 📦 Deliverables

1. **Hearing Day Module:** Components under `components/demo/hearing-day/` with responsive design, focus trap, and exit handling.
2. **Scenario Enrichment:** Extend demo scenarios with `hearingPrep` tasks, tips, and doc references (eviction + small claims).
3. **Copilot Script Update:** Add conversation path that invites the user to open Hearing Day Mode and references completed checklist items.
4. **Analytics Hooks:** Console narration + optional PostHog events capturing checklist progress.
5. **QA Materials:** Playwright script for the Phase 5 walkthrough; accessibility audit notes.

## 📚 Stories

### Story 17.1 – Scenario Data & Checklist Model
- Add `hearingPrep` metadata to demo scenarios (sections: “Bring These”, “Before Court”, “Mindset”).
- Provide Zod schema ensuring tasks include id, copy, glossary keys, and optional reminder linkage.
- Acceptance: Jest snapshot verifying data integrity; content reviewed by legal/UX.

### Story 17.2 – Hearing Day UI Shell
- Build full-screen module with header, sections, progress bar, and exit button.
- Implement keyboard navigation, aria roles, and reduced-motion fallbacks.
- Acceptance: RTL + jest-axe tests confirm accessibility; design review with UX.

### Story 17.3 – Demo Integration & Copilot Loop
- Hook module to case dashboard CTA and Copilot command.
- Sync checklist progress with reminders (show “Reminder sent” badge when applicable) and display generated forms.
- Acceptance: Playwright script completes checklist, triggers success banner, and sees Copilot acknowledgement; state resets via demo reset utility.

## 🔗 Inputs & References

- Roadmap Phase 5 entry – `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:90`.
- Demo architecture acceptance criteria for Hearing Day – `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md:901`.
- Existing demo components (`DeadlineList`, `DemoBanner`) for styling alignment.
- Scenario base files – `lib/demo/scenarios/*.ts`.

## 📊 Metrics

- Checklist completion animation triggered within <200ms after final item.
- Accessibility audit: 0 violations; focus trap verified on keyboard-only run.
- Demo rehearsal: Hearing Day flow executed without breaks in ≤ 3 minutes.
- Presenter feedback: “Felt confident” note captured in rehearsal log.

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Module feels disconnected from main UI | Use shared layout components + mirrored typography; animate entry from dashboard card. |
| Too much text on screen | Group tasks into collapsible sections; supply rehearsal notes for pacing. |
| Checklist state lost on accidental exit | Prompt confirmation before closing if progress <100%; optional persistence. |
| Copilot script drift | Add automated test asserting Copilot response references checklist completion. |

## ✅ Definition of Done

- Hearing Day Mode demo matches roadmap narrative: CTA → immersive prep → celebratory finish.
- Checklist, reminders, deadlines, and form outputs stay in sync.
- Accessibility, performance, and demo QA scripts pass.
- Demo reset returns checklist to baseline quickly for the next run.
- PM + UX sign-off after full Phase 5 rehearsal.
