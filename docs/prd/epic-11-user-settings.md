# **⚙️ Epic 11 – User Settings**

**Epic Owner:** Shaquon K.  
 **Analyst:** Mary (BMAD AI)  
 **Product Owner:** Sarah (PM)  
 **Sprint:** 3 – Smart Intake & Prep  
 **Last Updated:** October 2025

---

## **🎯 Summary**

Enable users to control key FairForm preferences — including notification methods, AI feature participation, and time zone settings — within a clean, accessible **User Settings page**.

This feature empowers users to manage privacy, customize their experience, and build trust in the platform, especially as AI features become available.

---

## **💡 Business Value**

* **User Trust & Transparency:** Clear control over AI participation and privacy preferences builds confidence in FairForm’s ethical stance.

* **Personalization:** Enhances user experience by letting them tailor notifications and scheduling.

* **Scalability:** Establishes foundation for future features like email/SMS reminders and account preferences.

---

## **🧭 Goals & Outcomes**

| Goal | Outcome |
| ----- | ----- |
| Provide centralized control over personal settings | ✅ Dedicated `/settings` page |
| Enable users to toggle AI intake participation | ✅ Clear opt-in/out mechanism |
| Ensure accessibility and transparency | ✅ WCAG 2.1 AA compliance |
| Prepare for reminders & notifications | ✅ Schema support for contact methods |

**Success Metrics**

| Metric | Target |
| ----- | ----- |
| Settings saved successfully | 100 % |
| Accessibility violations | 0 |
| Opt-in conversion for AI intake | ≥ 60 % of users |
| Page performance | ≤ 1.2 s load time on 3G mobile |

---

## **📦 Scope**

### **In Scope**

* **User Settings Page:** `/settings` route accessible from nav.

* **Profile Preferences:** Display \+ update user data (time zone, notification opt-ins).

* **AI Intake Participation:** User toggle for AI features.

* **Local Persistence:** Firestore-backed settings, cached client-side.

* **Accessibility & Responsiveness:** WCAG 2.1 AA, mobile-first design.

### **Out of Scope (MVP)**

* Password reset or authentication changes (handled by Auth).

* Deep notification scheduling (coming Sprint 4).

* Multi-user roles or admin-level settings.

---

## **🧱 Functional Requirements**

| ID | Requirement | Type |
| ----- | ----- | ----- |
| 11.1 | Render User Settings page (`/settings`) accessible from nav | Functional |
| 11.2 | Display current user info (email, time zone) | Functional |
| 11.3 | Allow editing of time zone via dropdown | Functional |
| 11.4 | Toggle notification preferences (email/SMS placeholders) | Functional |
| 11.5 | Toggle AI Intake participation (opt-in/out) | Functional |
| 11.6 | Save preferences to Firestore `users` document | Functional |
| 11.7 | Confirm save success with inline “Saved” feedback | UI/UX |
| 11.8 | Display AI disclaimer link | Compliance |
| 11.9 | Accessibility: keyboard navigation, screen-reader labels | Accessibility |

---

## **🎨 Design & UX Guidelines**

* **Page Layout:** Card-style sections using shadcn/ui `Card`, `Label`, `Switch`, `Select`.

* **Tone:** Trustworthy and transparent — informational copy for AI participation.

* **Mobile-First:** Stack vertically, use generous touch targets.

* **Status Feedback:** Inline success toast (“✅ Settings Saved”).

**Wireframe Example**

\+------------------------------------------------+  
| ⚙️  User Settings                              |  
\+------------------------------------------------+  
| Time Zone             \[ America/Los\_Angeles ▼ \]|  
|------------------------------------------------|  
| Notifications                                  |  
|   \[ \] Email Updates                            |  
|   \[ \] SMS Reminders (coming soon)              |  
|------------------------------------------------|  
| AI Participation                              |  
|   \[ON/OFF Switch\] Enable AI-assisted Intake    |  
|   "AI features provide educational guidance..." |  
|   (Learn More)                                 |  
\+------------------------------------------------+  
| \[Save Changes\]                                 |

---

## **🧩 Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | Save action ≤ 300ms response time |
| **Accessibility** | jest-axe: 0 violations |
| **Reliability** | Offline-safe; local cache if Firestore write fails |
| **Test Coverage** | ≥ 80 % unit/integration |
| **Security** | Only authenticated users can access `/settings` |
| **Compliance** | AI disclaimer link visible on toggle section |

---

## **🔐 Dependencies**

| Dependency | Status |
| ----- | ----- |
| Firebase Auth & Firestore `users` collection | ✅ Available |
| shadcn/ui components (`Card`, `Label`, `Switch`, `Button`, `Select`) | ✅ Installed |
| Notification system (placeholders for Sprint 4\) | 🔜 Future integration |
| AI Intake flag from `/lib/flags.ts` | ✅ Implemented in Spike |

---

## **🧪 Acceptance Criteria**

* Settings page accessible via navigation menu.

* Current preferences load successfully from Firestore.

* User can change and save preferences (time zone, AI opt-in).

* “Settings saved” toast or inline confirmation shown.

* 0 accessibility violations.

* Tested on mobile viewport (≤ 400px).

* Data persists on refresh and reload.

* Unauthorized users redirected to sign-in.

---

## **🧪 Testing Plan**

| Test Type | Scenario | Expected Outcome |
| ----- | ----- | ----- |
| **Unit** | Load & save preferences hook | Preferences correctly fetched/saved |
| **Integration** | Toggle AI participation | Firestore updates, UI reflects |
| **Accessibility** | Keyboard nav \+ screen reader | All labels and states read correctly |
| **Performance** | Lighthouse | ≥ 95 mobile |
| **Security** | Unauthorized access attempt | Redirects to `/login` |

---

## **📁 Deliverables**

| File | Purpose |
| ----- | ----- |
| `app/settings/page.tsx` | Main Settings page |
| `components/settings/SettingsCard.tsx` | Modular section component |
| `lib/hooks/useUserSettings.ts` | Firestore fetch/save logic |
| `tests/settings/` | Unit \+ integration test suite |
| `docs/qa/gates/11.user-settings.yml` | QA acceptance file |

---

## **🧩 Firestore Schema (users)**

// Collection: users  
{  
  uid: string,  
  email: string,  
  timeZone: string,  
  notifications: {  
    email: boolean,  
    sms: boolean,  
  },  
  aiParticipation: boolean,  
  updatedAt: Timestamp  
}

---

## **🔍 Compliance Notes**

* Include AI disclaimer text near toggle:

   “AI features are experimental and provide educational guidance only — not legal advice.”

* Link to `/docs/06_Compliance.md` for full terms.

* All personal data changes must be user-initiated and stored securely in Firestore under their UID.

---

## **🧩 Future Enhancements**

* Connect notification toggles to actual delivery system (Twilio/Resend).

* Add profile image \+ basic user info editing.

* Integrate “Account Delete” compliance flow (GDPR-style).

* Localization of time zone labels and UI copy.

---

## **✅ Epic Complete When**

* All acceptance criteria met.

* User settings save and reload correctly.

* Accessibility and compliance checks pass.

* QA sign-off documented and demo-ready.

