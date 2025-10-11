# **🧾 Epic 10 – Day-in-Court Checklist**

**Epic Owner:** Shaquon K.  
 **Analyst:** Mary (BMAD AI)  
 **Product Owner:** Sarah (PM)  
 **Sprint:** 3 – Smart Intake & Prep  
 **Last Updated:** October 2025

---

## **🎯 Summary**

Empower self-represented litigants (SRLs) to **feel ready and organized** before their court date by giving them an interactive, easy-to-follow **Day-in-Court Checklist**.

The checklist helps users:

* Know what to bring, what to expect, and how to behave in court.

* Track their preparation progress visually.

* Reduce anxiety by turning the unknown into a clear, guided plan.

---

## **💡 Business Value**

* **Confidence through clarity:** SRLs often lose cases for procedural, not substantive, reasons. A clear checklist mitigates this.

* **Engagement retention:** Encourages return visits and app stickiness pre-hearing.

* **Foundation for coaching features:** This checklist becomes a base for future personalized prep (AI co-pilot, reminders, or learning modules).

---

## **🧭 Goals & Outcomes**

* ✅ Provide users with a clear set of court-day preparation tasks.

* ✅ Allow users to mark tasks as complete (local storage).

* ✅ Ensure accessibility and mobile usability.

* ✅ Maintain zero backend dependencies for MVP (offline-safe).

**Success Metrics**

| Metric | Target |
| ----- | ----- |
| Checklist completion rate | ≥ 70 % of users who open the page mark ≥ 1 item complete |
| Accessibility violations | 0 (WCAG 2.1 AA) |
| Performance (Lighthouse) | ≥ 95 mobile score |
| User confidence rating | ≥ 85 % “felt more prepared” feedback |

---

## **📦 Scope**

### **In Scope**

* Static checklist templates for **Small Claims** and **Family Law** cases.

* Local storage persistence of checklist progress.

* Mobile-first UX with shadcn/ui components.

* Checklist link from Case Dashboard and Journey Map.

* Basic analytics event (`checklist_item_completed`).

### **Out of Scope (for MVP)**

* AI-generated checklists (custom per user).

* Notifications or reminders (Sprint 4 scope).

* Court integration / jurisdiction-specific automation.

---

## **🧱 Functional Requirements**

| ID | Requirement | Type |
| ----- | ----- | ----- |
| 10.1 | Display Day-in-Court Checklist with categorized items (e.g., “Before You Go”, “Bring These Items”) | Functional |
| 10.2 | Allow users to check off items as complete (checkbox interaction) | Functional |
| 10.3 | Persist progress locally using `localStorage` keyed to case ID | Functional |
| 10.4 | Sync progress visually to a progress bar component | UI/UX |
| 10.5 | Accessible keyboard navigation \+ screen-reader labels | Accessibility |
| 10.6 | “Reset Checklist” button clears progress storage | Functional |
| 10.7 | Checklist accessible via `/cases/[id]/checklist` | Routing |
| 10.8 | Lightweight analytics event tracking (optional) | Non-Functional |

---

## **🎨 Design & UX Guidelines**

* Uses existing **Card**, **Checkbox**, and **Progress** components from shadcn/ui.

* Typography: Readable serif for instructional tone.

* Category headings with sub-lists of tasks.

* Progress bar at top shows completion percentage.

* “Reset” button (bottom) with confirmation modal.

* Mobile-first layout (≤ 400 px width).

**Example Structure**

\<ChecklistPage\>  
  \<ProgressBar percent={60}/\>  
  \<ChecklistCategory title="Before You Go"\>  
    \<ChecklistItem text="Review your case file" /\>  
    \<ChecklistItem text="Print extra copies of forms" /\>  
  \</ChecklistCategory\>  
  \<ChecklistCategory title="Bring These Items"\>  
    \<ChecklistItem text="Photo ID" /\>  
    \<ChecklistItem text="Court notice" /\>  
  \</ChecklistCategory\>  
\</ChecklistPage\>

---

## **🧩 Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Page load ≤ 1.0 s on 3G mobile |
| Accessibility | WCAG 2.1 AA compliant; jest-axe 0 violations |
| Reliability | LocalStorage operations must gracefully handle quota limits |
| Security | No user PII stored in localStorage |
| Test Coverage | ≥ 80 % unit test coverage for checklist logic |

---

## **🔐 Dependencies**

* Case Journey Map (Epic 6\) → Checklist link entry point ✅

* shadcn/ui Progress & Checkbox components ✅

* React Query (not required here) ✅

---

## **🧪 Acceptance Criteria**

* Checklist renders with categories and items based on case type.

* User can toggle items complete / incomplete.

* Progress bar updates as items are checked.

* Checklist state persists after refresh.

* “Reset” button clears progress after confirmation.

* 0 accessibility violations.

* All tests pass.

---

## **🧪 Testing Plan**

* **Unit Tests:** Checklist progress calculation, localStorage logic.

* **Integration Tests:** User flow (check → refresh → progress persists).

* **Accessibility Tests:** jest-axe and keyboard tab navigation.

* **Performance Tests:** Lighthouse audit on mobile.

---

## **📁 Deliverables**

| File | Purpose |
| ----- | ----- |
| `components/checklist/checklist-page.tsx` | Main Checklist container |
| `components/checklist/checklist-item.tsx` | Individual item component |
| `components/checklist/checklist-category.tsx` | Category wrapper |
| `lib/hooks/useChecklistProgress.ts` | Local storage \+ progress logic |
| `tests/checklist/` | Full test suite |
| `docs/qa/gates/10.checklist.yml` | QA criteria file |

---

## **🧩 Future Enhancements**

* Integration with Reminders system (Sprint 4).

* AI-generated custom checklists per case type.

* Offline caching (PWA support).

* “Confidence Meter” progress metric for user self-reporting.

---

**✅ Epic Complete When**

* All acceptance criteria are met.

* Checklist is accessible and tested.

* Users can complete tasks and see progress persist.

* QA sign-off approved and demo ready.

