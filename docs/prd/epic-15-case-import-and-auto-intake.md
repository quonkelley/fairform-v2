# Epic 15: Demo Case Import & Auto-Intake

## 🧭 Overview

- **Status:** Planned – Value-First Demo Phase 2 (“Photo → Case → Auto-Plan”)
- **Priority:** P1 (establishes the first “wow” moment after chat)
- **Timebox:** 1 sprint (feeds into Epic 16 deadlines + Epic 13 Copilot polish)
- **Dependencies:** Epic 13 (Copilot conversation + case creation), Demo Architecture v2, existing demo scenarios

## 🎯 Purpose

Showcase how FairForm can transform a photographed eviction notice into a structured case record in seconds. This epic adds the “Import” step to the demo narrative, proving that the platform understands real paperwork and can spin it into actionable data without touching external services.

### Success Definition

- Presenter drops the Marion County eviction notice (PNG/PDF) into the demo.
- System recognizes key details (case type, court, hearing date) and auto-creates the case using demo repositories.
- Copilot acknowledges the imported data and continues the scripted conversation without manual tweaks.
- Timeline and glossary hints immediately reflect the imported context.

## 💡 Roadmap Alignment

| Roadmap Phase | Contribution |
| ------------- | ------------ |
| **Phase 2 – Case Lookup & Auto-Intake** | Provides the “Photo → Case” flow promised in the roadmap (`docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:51`). |
| **Phase 3 – Deadline Engine (Epic 16)** | Supplies structured data the engine needs (notice date, court). |
| **Phase 4 – Smart Reminders (Epic 9)** | Seeds reminder copy and timing based on the imported hearing date. |
| **Phase 6 – Smart Form Filler (Epic 18)** | Prefills form fields (case number, jurisdiction) from the import payload. |

## 🏗️ Architecture Guardrails

- **Data Stays Local:** All parsing happens in the demo runtime (Node/Next.js). No external OCR APIs. We simulate OCR by reading JSON stubs tied to assets.
- **Demo Repository Integration:** Import results stored through `demoCasesRepo` & `demoStepsRepo` (in-memory Maps) described in `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md`.
- **Scenario Sync:** Imported case replaces the default eviction scenario via `resetDemoStorage()` then `applyScenario(importedCase)`.
- **Asset Packaging:** Demo includes notarized sample notice assets under `public/demo/import/`.
- **Resilience States:** Import flow implements loading, success, error (bad scan) with graceful recovery; mirrored in tests.

## ⚖️ Scope & Boundaries

### In Scope
- Notice upload UI (`components/demo/CaseImportCard`) with drag-and-drop & file picker.
- Simulated OCR pipeline:
  1. Upload notice → parse JSON stub (matching filename).
  2. Extract structured fields: `caseType`, `court`, `hearingDate`, `noticeDate`, `plaintiff`, `defendant`, `address`.
  3. Map to `CreateCaseInput` and optional `CreateCaseStepInput` seed.
- Dual entry points: manual entry fallback (quick form) and photo upload.
- Copilot integration: `generateDemoResponse` references imported data on follow-up.
- Experience instrumentation: console logs narrating “Case import complete → auto-plan ready.”

### Out of Scope
- Real OCR, production lookups, or third-party APIs.
- Multi-case management or retention beyond single demo run.
- Editing imported data after initial confirmation (handled by separate epic if needed).

## 📦 Deliverables

1. **Case Import UI:** `components/demo/CaseImportCard.tsx` with hover states, skeleton, and mobile layout.
2. **Import Pipeline:** `lib/demo/importNotice.ts` (parsing logic) + Marion County JSON fixtures (`lib/demo/imports/eviction.notice.json`).
3. **Scenario Adapter:** Utility to merge imported case into `demoCasesRepo` and regenerate steps/reminders.
4. **Copilot Hook:** Update `lib/demo/scenarios/eviction.ts` & conversation logic to respond to import events (“I’ll build your plan with the notice you uploaded.”).
5. **Tests + QA Script:** Vitest coverage for parser; Playwright flow from upload → dashboard; demo rehearsal checklist appendix.

## 📚 Stories

### Story 15.1 – Import Parser & Fixtures
- Create Marion County eviction notice JSON fixture with structured fields and glossary hooks.
- Implement `parseDemoNotice(fileName)` returning typed data or error.
- Acceptance: parser unit tests cover happy path + mismatch + corrupt file; fixtures store demo metadata references.

### Story 15.2 – Case Import Card & Pipeline
- Build upload UI with drag/drop, progress indicator, and error fallback.
- On success, call parser, convert to `CreateCaseInput`, inject into `demoCasesRepo`, and navigate to case dashboard.
- Acceptance: RTL tests simulate upload; Playwright script verifies navigation & success toast.

### Story 15.3 – Auto-Intake Conversation Bridge
- Update Copilot script to recognize import completion, summarize key data (“hearing on Nov 6”), and prompt next actions.
- Ensure glossary hints and timeline steps pick up imported values.
- Acceptance: Demo walkthrough script passes; Copilot message includes imported details; QA log shows correct mapping.

## 🔗 Inputs & References

- Roadmap phase table (Phase 2) – `docs/FAIRFORM_VALUE_FIRST_DEMO_ROADMAP.md:51`.
- Demo architecture guidelines on single-mode repos and timing – `docs/architecture/DEMO-ARCHITECTURE-ROBUST.md:200`.
- Existing scenario files – `lib/demo/scenarios/*.ts`.
- Demo repositories – `lib/demo/demoRepos.ts`.

## 📊 Metrics

- Import flow success rate: 100% for scripted asset (with fallback message when wrong asset used).
- Time from upload to case dashboard: ≤ 2.5s (simulated delay).
- Copilot acknowledgement rendered within 1s after dashboard load.
- Zero console errors during Phase 2 walkthrough.

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Presenter uploads unexpected file | Provide explicit instructions + guard rails (accept only known filenames, show guidance toast). |
| Imported data desyncs with steps/reminders | Regenerate steps immediately after storage update; add unit test covering merged data. |
| Simulated OCR feels fake | Use realistic loading state + console narration; supply textual summary matching actual notice copy. |
| Multiple imports in one session | Add “Replace case” confirmation and `resetDemoStorage()` before re-import. |

## ✅ Definition of Done

- Case import flow executes cleanly in the 15-minute demo script: upload → case → timeline.
- Copilot and reminders leverage imported fields without manual edits.
- Demo scenario reset brings system back to baseline in <5s.
- Accessibility and QA walkthrough checklists updated and passing.
- PM sign-off after live rehearsal covering Phase 2 narrative.
