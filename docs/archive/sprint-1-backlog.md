# **⚙️ FairForm – Sprint 1 Backlog**

### **Phase 1: Legal GPS MVP**

**Sprint Duration:** 2 weeks (10 working days)  
 **Owner:** Shaquon K.  
 **Product Analyst:** Mary  
 **Sprint Goal:** Build a secure, working foundation — authentication, dashboard, and case management.

---

## **1\. 🎯 Sprint Objective**

Establish the **core infrastructure and first usable experience** for FairForm:

* Users can securely sign up, log in, and create cases.

* The dashboard displays those cases clearly and links to the case detail view.

* Base design system is live and reusable.

This sprint sets the stage for all future features (Journey Map, Glossary, Notifications).

---

## **2\. 🧱 Sprint 1 Feature Scope**

| Epic | Description | Priority | Linked User Stories |
| ----- | ----- | ----- | ----- |
| **EPIC 1: Authentication System** | Firebase Auth \+ secure onboarding | ✅ Must-Have | Story \#1 |
| **EPIC 2: Case Dashboard \+ Case Creation** | Create, view, and manage cases | ✅ Must-Have | Story \#2 |
| **EPIC 3: Design System & Base Components** | Tailwind \+ shadcn/ui setup | ✅ Must-Have | All |
| **EPIC 4: Database Setup (User \+ Case)** | Firestore schema \+ API endpoints | ✅ Must-Have | All |
| **EPIC 5: Initial Layout & Navigation** | Top nav, layout wrappers, routing | ✅ Must-Have | All |

---

## **3\. 🗂️ Sprint 1 Backlog (Detailed Tasks)**

Each task includes: **ID, Description, Type, Owner, Priority, Acceptance Criteria**

---

### **🔐 EPIC 1: Authentication System**

| ID | Task | Type | Owner | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- | ----- | ----- |
| A1.1 | Setup Firebase project and environment variables | Dev | Eng Lead | High | Firebase keys configured securely |
| A1.2 | Create sign-up, login, and password reset pages | Dev | Frontend Dev | High | Forms functional and validated |
| A1.3 | Implement Firebase Auth integration | Dev | Eng Lead | High | User session persists across refresh |
| A1.4 | Add “Protected Routes” logic (Next.js middleware) | Dev | Eng Lead | High | Unauthenticated users redirected to login |
| A1.5 | Add toast notifications for login/signup success/failure | Dev | Frontend Dev | Medium | Feedback displayed appropriately |
| A1.6 | Design Sign-Up \+ Login screens (Figma) | Design | UX Lead | High | Matches FairForm brand, WCAG AA compliant |

✅ **Definition of Done:**  
 Users can create accounts, log in/out, and access their dashboard securely.

---

### **📁 EPIC 2: Case Dashboard \+ Case Creation**

| ID | Task | Type | Owner | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- | ----- | ----- |
| D2.1 | Define Firestore `Case` collection and schema | Dev | Eng Lead | High | Matches Sprint Zero model |
| D2.2 | Create `/dashboard` route and layout | Dev | Frontend Dev | High | Responsive \+ accessible |
| D2.3 | Build “Start New Case” button \+ modal form | Dev | Frontend Dev | High | Form submits case data to Firestore |
| D2.4 | List user’s existing cases (title, status, date) | Dev | Frontend Dev | High | Displays all `Case` docs for logged-in user |
| D2.5 | Case card component design | Design | UX Lead | Medium | Includes title, case type, progress indicator |
| D2.6 | Route to `/case/[id]` placeholder page | Dev | Frontend Dev | Medium | Clicking a case navigates correctly |
| D2.7 | Empty state design (“No cases yet”) | Design | UX Lead | Low | Friendly copy encouraging first case creation |

✅ **Definition of Done:**  
 Users can add new cases and see them appear immediately on their dashboard.

---

### **🎨 EPIC 3: Design System & Base Components**

| ID | Task | Type | Owner | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- | ----- | ----- |
| DS3.1 | Configure Tailwind CSS with FairForm color palette | Dev | Frontend Dev | High | Matches design spec |
| DS3.2 | Import and setup `shadcn/ui` library | Dev | Eng Lead | High | Buttons, Cards, Inputs available |
| DS3.3 | Build reusable `Button` component (primary, ghost, disabled) | Dev | Frontend Dev | High | Accessible states, keyboard focus |
| DS3.4 | Build `Card` and `FormField` components | Dev | Frontend Dev | High | Reusable for Case Dashboard |
| DS3.5 | Typography scale (heading, body, caption) | Design | UX Lead | Medium | Consistent across app |
| DS3.6 | Accessibility test (keyboard, contrast, focus) | QA | QA Lead | Medium | Passes WCAG 2.1 AA |

✅ **Definition of Done:**  
 Shared design components exist and are ready for reuse in all subsequent sprints.

---

### **🧱 EPIC 4: Database Setup & API Integration**

| ID | Task | Type | Owner | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- | ----- | ----- |
| DB4.1 | Setup Firestore collections: `User`, `Case`, `CaseStep` | Dev | Eng Lead | High | Matches data model spec |
| DB4.2 | Implement `/api/createCase` endpoint | Dev | Eng Lead | High | Creates case doc for user |
| DB4.3 | Implement `/api/getCases` endpoint | Dev | Eng Lead | High | Returns user’s case list |
| DB4.4 | Implement `/api/updateCaseStatus` endpoint | Dev | Eng Lead | Medium | Can mark case active/inactive |
| DB4.5 | Test all endpoints with Postman | QA | QA Lead | Medium | 100% response success |

✅ **Definition of Done:**  
 Database structure live and endpoints returning correct responses.

---

### **🧭 EPIC 5: Layout & Navigation**

| ID | Task | Type | Owner | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- | ----- | ----- |
| L5.1 | Create app layout (header, footer, main) | Dev | Frontend Dev | High | Responsive \+ consistent |
| L5.2 | Add navigation links: Dashboard, Settings, Logout | Dev | Frontend Dev | High | All routes functional |
| L5.3 | Implement active state highlighting | Dev | Frontend Dev | Medium | Visually clear current page |
| L5.4 | Accessibility QA for nav structure | QA | QA Lead | Medium | Screen reader friendly |

✅ **Definition of Done:**  
 Users can navigate easily through authenticated sections of the app.

---

## **4\. 🧠 Dependencies & Setup Tasks**

| Dependency | Description | Owner | Status |
| ----- | ----- | ----- | ----- |
| Firebase account | Create project \+ Firestore DB | Eng Lead | ☐ |
| Vercel deployment | Setup staging environment | Eng Lead | ☐ |
| Twilio \+ Resend keys | Provision sandbox credentials | PM | ☐ |
| Figma design file | Base components \+ page layouts | UX Lead | ☐ |
| GitHub repo | Initialize \+ branch protections | PM | ☐ |

---

## **5\. 🧩 Deliverables at End of Sprint 1**

✅ Firebase Auth & Firestore configured  
 ✅ Working login/signup/logout flow  
 ✅ User Dashboard with case creation  
 ✅ Deployed staging site on Vercel  
 ✅ Live design system components  
 ✅ Clickable Case Details placeholder

---

## **6\. 🧪 QA & Validation Plan**

| Test | Description | Owner | Criteria |
| ----- | ----- | ----- | ----- |
| Functional QA | Login, dashboard, case creation | QA | Pass all flows |
| Security QA | Auth flow, session persistence | Eng | Tokens secure |
| Accessibility QA | Keyboard nav, color contrast | Design | Meets WCAG 2.1 AA |
| Usability QA | 2–3 test users create case | PM | 90% success rate |

---

## **7\. ⚡ Sprint Review Goals**

At the end of Sprint 1, the team should be able to:

* Log in as a user and create/manage a case.

* See basic structure of the Case Journey page.

* Confirm Firestore integration works end-to-end.

* Review component library consistency.

---

## **8\. 🔜 What Comes Next (Sprint 2 Preview)**

**Focus:** Build the **Interactive Case Journey Map \+ Inline Glossary.**  
 **Core Epics:**

* Case Step creation and progress tracking

* Visual progress timeline

* Inline definitions and glossary pop-ups

* Data linking between `Case` and `CaseStep` collections

---

✅ **Outcome:**  
 This Sprint 1 Backlog is now *developer-ready*.  
 It’s a scoped, achievable 2-week sprint that results in a working core product — the FairForm foundation.

---

Would you like me to create the **Sprint 2 Backlog** next (focused on the Journey Map, Glossary integration, and procedural tracking)?  
 That sprint will deliver the heart of the “Legal GPS” user experience.

