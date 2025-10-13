\#\# \*\*📊 Epic & Story Flow Assessment \- PO (Sarah) & SM (Bob)\*\*

\#\#\# \*\*Current State Analysis\*\*

\#\#\#\# ✅ \*\*Completed Foundation (Sprint 1-2)\*\*  
\- Epic 1-5: Complete & QA Passed  
\- Epic 6: Stories 6.1-6.4 Complete (Case Journey Timeline foundation)  
\- \*\*Status\*\*: Strong foundation ✓

\#\#\#\# 🔄 \*\*Case Detail Realignment (NEW \- Between Sprint 2 & 3)\*\*  
\- \*\*Not Yet Formalized as Epic/Stories\*\*  
\- Identified as critical bridge work  
\- \*\*Gap Found\*\*: This work needs proper epic structure

\#\#\#\# 📋 \*\*Sprint 3 Planned Epics\*\*  
\- Epic 8: Maintenance (Sprint 3 Backlog document)  
\- Epic 10: Day-in-Court Checklist (PRD exists, no stories)  
\- Epic 11: User Settings (3 stories drafted)  
\- Epic 12: AI Intake (5 stories drafted)

\---

\#\# \*\*🚨 Critical Gaps Identified\*\*

\#\#\# \*\*Gap 1: Case Detail V2 Realignment Not Formalized\*\*

\*\*Issue\*\*: The Case Detail realignment work (from case\_detail\_realignment.md and API spec) doesn't exist as an epic or stories.

\*\*Impact\*\*:   
\- This work is foundational for Epic 12 (AI Intake needs caseType)  
\- It enhances Epic 6 deliverables significantly  
\- Currently exists only as a plan document, not tracked work

\*\*Recommendation\*\*: Create \*\*Epic 6.5: Case Detail Enhancement\*\* with proper stories

\---

\#\#\# \*\*Gap 2: Epic 8 Scope Confusion\*\*

\*\*Issue\*\*: Epic 8 PRD mentions work that might overlap with:  
\- Story 6.3 (Step Detail Modal)  
\- Case Detail Realignment work  
\- "Dynamic Instruction Template Refactor" (8.2)

\*\*Impact\*\*: Risk of duplicate work or missed work

\*\*Recommendation\*\*: Clarify Epic 8 as pure maintenance/polish work AFTER Epic 6.5

\---

\#\#\# \*\*Gap 3: Epic 10 Has No Stories\*\*

\*\*Issue\*\*: Epic 10 (Day-in-Court Checklist) has a complete PRD but zero stories drafted

\*\*Impact\*\*: Can't start development without stories

\*\*Recommendation\*\*: Draft Epic 10 stories before Sprint 3 starts

\---

\#\#\# \*\*Gap 4: Epic Sequencing Conflict\*\*

\*\*Issue\*\*: Current documents show conflicting epic sequences:  
\- EPIC-SEQUENCING-GUIDE.md: Defers Epic 12 to Sprint 4  
\- sprint-3-epic-11-12-story-summary.md: Includes Epic 12 in Sprint 3  
\- Sprint3\_Backlog.md: Shows Epic 8 for Sprint 3

\*\*Impact\*\*: Unclear what Sprint 3 actually includes

\*\*Recommendation\*\*: Formalize Sprint 3 scope with clear epic list

\---

\#\# \*\*✅ Recommended Epic Structure & Flow\*\*

\#\#\# \*\*NEW Epic Structure Needed\*\*

\#\#\#\# \*\*Epic 6.5: Case Detail V2 Enhancement\*\* (NEW)  
\*\*When\*\*: Before Sprint 3 starts (Week 1\)    
\*\*Dependencies\*\*: Epic 6 complete    
\*\*Blocks\*\*: Epic 12 (needs caseType infrastructure)

\*\*Proposed Stories\*\*:  
1\. \*\*Story 6.5.1: Case Type & Template Infrastructure\*\* (2 days)  
   \- Add \`caseType\` field to cases  
   \- Create journey template registry (all 6 types)  
   \- Build step status adapter  
   \- Extend casesRepo with \`updateCaseProgress()\`  
   \- Unit tests  
   \- \*\*AC\*\*: Template registry returns correct steps for each case type

2\. \*\*Story 6.5.2: Progress Overview & Layout Update\*\* (1.5 days)  
   \- Build ProgressOverview component  
   \- Update Case Detail page to two-column layout  
   \- Mobile-responsive stacking  
   \- Integrate progress data display  
   \- Component tests  
   \- \*\*AC\*\*: Progress displays correctly, layout adapts mobile/desktop

3\. \*\*Story 6.5.3: Next Steps Panel\*\* (2 days)  
   \- Build Next Steps generator (rule-based)  
   \- Create NextStepsCard component  
   \- API endpoint: GET /api/cases/:id/next-steps  
   \- Integration with case detail page  
   \- Tests (unit, component, integration)  
   \- \*\*AC\*\*: Next steps panel shows 2-3 actionable tasks based on current step

4\. \*\*Story 6.5.4: Template API & Integration Testing\*\* (1 day)  
   \- Create case templates API endpoint  
   \- Full regression testing (Epic 6.1-6.4 still works)  
   \- Accessibility audit (zero violations)  
   \- Performance testing  
   \- \*\*AC\*\*: All Epic 6 functionality preserved, new features pass QA

\*\*Total Effort\*\*: \~6.5 days    
\*\*Priority\*\*: 🟢 Must-Have (blocks Epic 12\)

\---

\#\#\#\# \*\*Epic 8: Case Journey Polish & Maintenance\*\* (CLARIFIED)  
\*\*When\*\*: After Epic 6.5 complete    
\*\*Dependencies\*\*: Epic 6.5    
\*\*Type\*\*: Maintenance & refinement

\*\*Existing Stories from Sprint3\_Backlog.md\*\*:  
1\. Story 8.1: Regression QA & Accessibility Audit  
2\. Story 8.2: Dynamic Instruction Template Refactor (move to Firestore)  
3\. Story 8.3: Reminder Hook Scaffold (prep for Epic 9\)  
4\. Story 8.4: AI Context Bridge (prep for Epic 12\)  
5\. Story 8.5: Mobile Modal Polish  
6\. Story 8.6: Documentation & Handoff

\*\*Recommendation\*\*: Keep as polish/bridge work, make it optional for Sprint 3

\---

\#\#\#\# \*\*Epic 10: Day-in-Court Checklist\*\* (NEEDS STORIES)  
\*\*When\*\*: Sprint 3    
\*\*Dependencies\*\*: None (self-contained)    
\*\*Status\*\*: PRD complete, stories needed

\*\*Proposed Stories\*\* (to be drafted):  
1\. \*\*Story 10.1: Checklist Page Scaffold & Routing\*\* (0.5 day)  
   \- Create /cases/\[id\]/checklist route  
   \- ChecklistPage component shell  
   \- Link from case dashboard  
   \- Protected route wrapper

2\. \*\*Story 10.2: Checklist UI Components\*\* (1 day)  
   \- ChecklistCategory component  
   \- ChecklistItem component with checkbox  
   \- Progress bar integration  
   \- Mobile-first responsive design

3\. \*\*Story 10.3: LocalStorage Persistence\*\* (1 day)  
   \- useChecklistProgress hook  
   \- Save/load checklist state by caseId  
   \- Handle storage quota limits  
   \- Reset functionality

4\. \*\*Story 10.4: Checklist Templates & Content\*\* (1 day)  
   \- Small Claims checklist template  
   \- Housing checklist template (if time allows)  
   \- Category organization  
   \- Copy review & legal compliance

5\. \*\*Story 10.5: Testing & Accessibility\*\* (0.5 day)  
   \- Unit tests (progress calculation, localStorage)  
   \- Component tests (all states)  
   \- Accessibility audit (jest-axe)  
   \- Integration tests (check → refresh → persists)

\*\*Total Effort\*\*: \~4 days    
\*\*Priority\*\*: 🟢 Must-Have for Sprint 3

\---

\#\#\#\# \*\*Epic 11: User Settings\*\* (STORIES EXIST)  
\*\*Status\*\*: ✅ 3 stories drafted    
\*\*Effort\*\*: \~1.5 days    
\*\*Priority\*\*: 🟢 Must-Have (blocks Epic 12\)

\*\*Existing Stories\*\*:  
\- 11.1: Settings Page Scaffold (0.5 day)  
\- 11.2: Update Profile Preferences (0.5 day)  
\- 11.3: Toggle AI Intake Participation (0.5 day)

\---

\#\#\#\# \*\*Epic 12: AI Intake\*\* (STORIES EXIST)  
\*\*Status\*\*: ✅ 5 stories drafted    
\*\*Effort\*\*: \~5.5 days (12.1-12.4 \= 4.5 days, 12.5 optional)    
\*\*Priority\*\*: 🟡 Should-Have (high complexity)

\*\*Existing Stories\*\*:  
\- 12.1: Free-Text Problem Description (1 day)  
\- 12.2: API Integration & Classification (1.5 days)  
\- 12.3: Display AI Summary & Confirmation (1 day)  
\- 12.4: Edit & Submit to Firestore (1 day)  
\- 12.5: Admin Logs & Analytics (1 day) \- OPTIONAL

\*\*Dependency\*\*: Epic 6.5 Story 1 (case type infrastructure) \+ Epic 11 complete

\---

\#\# \*\*📅 Recommended Sprint 3 Plan\*\*

\#\#\# \*\*Option A: Conservative (Recommended)\*\*

\*\*Week 1 (Pre-Sprint 3):\*\*  
\- Epic 6.5: Stories 6.5.1-6.5.4 (6.5 days)  
\- Completes Case Detail V2 realignment  
\- Sets foundation for Epic 12

\*\*Week 2-3 (Sprint 3 Proper):\*\*  
\- Epic 11: Stories 11.1-11.3 (1.5 days)  
\- Epic 10: Stories 10.1-10.5 (4 days)  
\- Epic 8: Selected stories (2-3 days) \- polish work  
\- \*\*Total\*\*: \~7.5-8.5 days

\*\*Week 4 (Sprint 3 continued or Sprint 3.5):\*\*  
\- Epic 12: Stories 12.1-12.4 (4.5 days) if Epic 6.5 complete  
\- OR defer Epic 12 to Sprint 4

\*\*Sprint 3 Deliverables\*\*:  
\- ✅ Enhanced Case Detail page with Progress \+ Next Steps  
\- ✅ User Settings with AI opt-in  
\- ✅ Day-in-Court Checklist  
\- ✅ Polish and maintenance work  
\- 🟡 AI Intake (if time allows, otherwise Sprint 4\)

\---

\#\#\# \*\*Option B: Aggressive (Higher Risk)\*\*

\*\*Week 1:\*\*  
\- Epic 6.5 \+ Epic 11 in parallel (if two devs)

\*\*Week 2-3:\*\*  
\- Epic 10 \+ Epic 12.1-12.4  
\- Epic 8 polish work as time allows

\*\*Risk\*\*: Tight timeline, potential quality compromise

\---

\#\# \*\*🎯 Action Items\*\*

\#\#\# \*\*Immediate (This Week)\*\*

1\. ✅ \*\*Create Epic 6.5: Case Detail V2 Enhancement\*\*  
   \- Formalize the 4 stories listed above  
   \- Assign to current sprint preparation  
   \- Update Epic Sequencing Guide

2\. ✅ \*\*Draft Epic 10 Stories\*\*  
   \- Create 5 stories (10.1-10.5) based on PRD  
   \- Add to docs/stories/  
   \- Estimate and size stories

3\. ✅ \*\*Clarify Epic 8 Scope\*\*  
   \- Update Epic 8 PRD to remove overlap with Epic 6.5  
   \- Mark as "maintenance & polish" work  
   \- Make stories 8.3-8.6 optional based on capacity

4\. ✅ \*\*Finalize Sprint 3 Scope\*\*  
   \- Update sprint-3 plan document with:  
     \- Epic 6.5 (must-have, pre-sprint work)  
     \- Epic 11 (must-have)  
     \- Epic 10 (must-have)  
     \- Epic 8 (optional polish)  
     \- Epic 12 (conditional on Epic 6.5 completion)

5\. ✅ \*\*Update Epic Sequencing Guide\*\*  
   \- Add Epic 6.5 to sequence  
   \- Clarify Epic 8 positioning  
   \- Document Epic 12 prerequisites

\#\#\# \*\*Before Sprint 3 Starts\*\*

6\. \*\*Review & Approve All Stories\*\*  
   \- PO review of Epic 6.5 stories  
   \- PO review of Epic 10 stories  
   \- Confirm Epic 11 & 12 stories are still accurate

7\. \*\*Update Documentation\*\*  
   \- Sprint 3 backlog reflects correct epics  
   \- Case detail realignment becomes Epic 6.5  
   \- All story files exist in docs/stories/

\---

\#\# \*\*📊 Updated Epic Status\*\*

| Epic | Status | Stories | Effort | Sprint | Priority |  
|------|--------|---------|--------|--------|----------|  
| 1-5 | ✅ Complete | Various | \- | 1 | Complete |  
| 6 | ✅ Complete | 6.1-6.4 | \- | 2 | Complete |  
| \*\*6.5\*\* | 📝 \*\*NEW \- Draft\*\* | \*\*4 stories\*\* | \*\*6.5 days\*\* | \*\*Pre-3\*\* | \*\*🟢 Must-Have\*\* |  
| 7 | ⏸️ Deferred | TBD | TBD | TBD | Low priority |  
| 8 | 📋 Clarified | 6 stories | 3-6 days | 3 | 🟡 Should-Have |  
| 10 | 📝 \*\*Needs Stories\*\* | \*\*5 stories\*\* | \*\*4 days\*\* | \*\*3\*\* | \*\*🟢 Must-Have\*\* |  
| 11 | ✅ Ready | 3 stories | 1.5 days | 3 | 🟢 Must-Have |  
| 12 | ✅ Ready | 5 stories | 5.5 days | 3/4 | 🟡 Should-Have |

\---

\#\# \*\*✅ Bottom Line\*\*

\#\#\# \*\*Gaps Found & Fixed\*\*:  
1\. ✅ Case Detail V2 work → Now Epic 6.5 with 4 stories  
2\. ✅ Epic 8 scope confusion → Clarified as polish/maintenance  
3\. ✅ Epic 10 missing stories → Need to draft 5 stories  
4\. ✅ Sprint 3 scope unclear → Recommended clear sequence

\#\#\# \*\*What We Need to Do Before Coding\*\*:  
1\. \*\*Formalize Epic 6.5\*\* with 4 stories  
2\. \*\*Draft Epic 10\*\* with 5 stories    
3\. \*\*Update Sprint 3 plan\*\* to reflect Epic 6.5 \+ 11 \+ 10 (+ optional 8 & 12\)  
4\. \*\*PO approval\*\* on all new/updated stories

\#\#\# \*\*Recommended Flow\*\*:  
\`\`\`  
Pre-Sprint 3: Epic 6.5 (Case Detail V2) → Sets up templates & caseType  
Sprint 3 Week 1: Epic 11 (Settings \- AI opt-in ready)  
Sprint 3 Week 2: Epic 10 (Checklist \- high value, low risk)  
Sprint 3 Week 3: Epic 8 (Polish) OR Epic 12.1-12.4 (if ready)  
\`\`\`  
