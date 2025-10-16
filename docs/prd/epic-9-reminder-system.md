# Epic 9: Demo Smart Reminders Refresh

## 🧭 Overview

- **Status:** Planned – Value-First Demo Phase 4 (“Remind”)
- **Priority:** P1 (visible demo moment after Auto-Plan)
- **Timebox:** 1 sprint (sequenced after Epic 7 + 13 integration pass)
- **Dependencies:** Epic 6.5 (timeline steps), Epic 13 (Copilot case creation), Epic 7 (glossary hints), Demo Architecture v2

## 🎯 Purpose

Transform the reminder experience into a polished, demo-ready flow that proves FairForm keeps users on track—without relying on production notification vendors. The goal is to simulate adaptive reminders inside the single-mode demo architecture, showcasing timing logic, glossary-backed messaging, and UI polish while keeping implementation entirely in-repo.

### Success Definition

- Presenter walks through the eviction demo, schedules reminders for the “File Answer” step, and sees instant feedback (toast + badge) plus a refreshed reminders panel.
- Copilot follow-up highlights that the reminder is set, pulling glossary language from Epic 7.
- Demo data survives navigation resets during the run (in-memory store + optional localStorage persistence).

## 💡 Why It Matters (Roadmap Alignment)

| Roadmap Phase | Contribution |
| ------------- | ------------ |
| **Phase 3 – Deadline Engine** | Reminders feed from the auto-generated step timeline. |
| **Phase 4 – Smart Reminders** | Demonstrates “Stay on track automatically” moment in investor demo. |
| **Phase 6 – Smart Form Filler** | Adds follow-up reminder (“File Appearance Form”) as part of completion flow. |

## 🏗️ Architecture Guardrails

- **Data Layer:** Use `demoRemindersRepo` (in-memory Map) defined in `lib/demo/demoRepos.ts`. No Twilio, Resend, or Firestore writes.
- **Scheduling Model:** Leverage `demoConfig.timing` to simulate countdowns and “sent” state transitions (e.g., mark reminder as sent 5 seconds after creation).
- **UI Surfaces:** 
  - Reminder chip/button on each deadline card.
  - Global toast (`components/ui/toast`) with glossary definition link.
  - “Today” panel summarizing upcoming reminders (optional stage prop).
- **State Reset:** `resetDemoStorage()` resets reminders between demos; optional `persistInLocalStorage` flag for QA builds.
- **Accessibility:** Buttons are keyboard reachable; toast announces via aria-live; color contrast meets WCAG 2.1 AA.

## ⚖️ Scope & Boundaries

### In Scope
- Reminder creation from timeline cards and Copilot prompts.
- Toast, badge, and “Synced” microcopy updates (per roadmap).
- Demo scheduler that flips reminders from `pending` → `sent` with deterministic timing.
- Integration with glossary hints (“Answer”, “Continuance”) to reinforce shared language.
- Demo analytics hooks (console logs or PostHog events) to narrate the UX.

### Out of Scope
- Real SMS/email delivery, Twilio/Resend integrations, or consent management.
- User-configurable schedules or timezone handling.
- Production cron jobs or Firestore TTL cleanup.

## 📦 Deliverables

1. **Reminder Creation API** – Client-side helper `createReminderForStep(stepId, offset)` hooking into `demoRemindersRepo`.
2. **Reminder Controls** – UI updates to `DeadlineList` and `StepDetail` modal with “Remind Me” button + state badge (“Scheduled”, “Sent”).
3. **Feedback Layer** – Toast + confetti (optional) confirming reminder creation and linking glossary definition.
4. **Scheduler Loop** – `useDemoReminderScheduler` hook that monitors stored reminders and triggers “sent” animations.
5. **Copilot Integration** – Demo script updates so Copilot suggests reminders after case creation and acknowledges completion.
6. **QA Script & Tests** – Vitest unit tests for repo + scheduler, Playwright smoke test covering reminder flow.

## 📚 Stories

### Story 9.1 – Demo Reminder Foundations
- Extend `demoRemindersRepo` with helper methods (`getUpcoming`, `markSent`).
- Implement `useDemoReminderScheduler` hook that respects `demoConfig.timing.reminderCreatedDelay`.
- Acceptance: Unit tests assert pending→sent transition; reset path verified.

### Story 9.2 – Reminder UX Polish
- Update deadline and step views with “Remind Me” CTA, scheduled badge, and glossary tooltip.
- Implement toast via `useToast()` with copy: “Reminder set: File Answer by Thursday (Default Judgment definition).”
- Acceptance: RTL tests for button state changes; jest-axe on updated components.

### Story 9.3 – Copilot & Narrative Integration
- Script Copilot follow-up responses (`generateDemoResponse`) to reference reminder status.
- Add optional `TodayCard` summary component showing next reminder with countdown.
- Acceptance: Playwright demo script ensures toast appears, Copilot mentions scheduled reminder, and scheduler logs to console.

## 🔗 Inputs & References

- `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md` – Phase 4 scope (“W1 Reminder hook integration”, “W2 adaptive sync”, “W3 polish + logging”).
- `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md` – Demo repository pattern, reminder UX references, timing constants.
- `lib/demo/scenarios/*` – Step metadata (deadlines + glossary keys) that feed reminders.
- Epic 7 PRD – glossary alignment for reminder copy.

## 📊 Metrics

- Demo QA run: 100% of scripted reminder actions succeed without page refresh or manual fixes.
- Toast seen & aria-announced within <500ms of button click.
- Reminder badge flips to “Sent” within configured demo timing (default 5s).
- Zero console errors during Phase 4 walkthrough.

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Reminder state lost between views | Persist reminders in `demoConfig.behavior.persistInLocalStorage` when enabled; reset helper for presenters. |
| Toast spam during rapid clicks | Debounce reminder creation per step; disable button once scheduled. |
| Glossary definition missing | Fallback copy warns “Definition coming soon” and logs missing key for QA. |
| Demo timing feels artificial | Tune `demoConfig.timing` constants; provide script notes for presenter to call out simulation. |

## ✅ Definition of Done

- Reminder controls wired through demo repositories with deterministic behavior.
- Copilot, dashboard, and optional “Today” card stay in sync after scheduling.
- Accessibility and demo QA checklists pass (keyboard, screen reader, mobile tap).
- README in `lib/demo/` updated with reminder architecture notes.
- PM signs off after full Phase 2–4 rehearsal (Import → Auto-Plan → Remind).
