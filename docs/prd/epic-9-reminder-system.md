## **🕒 Epic 9 – Reminder System (Smart Notifications)**

**Phase:** 1.2 → Deferred to 1.3  
 **Owner:** Mary (BMAD AI)  
 **Status:** 🟡 Planned / Deferred  
 **Dependencies:** Epic 8 (Step Details), Epic 11 (Settings & Preferences)

---

### **🎯 Goal**

Automatically notify users about key case deadlines, hearings, and filing tasks so they never miss critical actions.

### **💡 Problem Statement**

Self-represented litigants routinely miss deadlines because they rely on paper notices and lack organized reminders. Missing a date can invalidate their entire case.

---

### **🧠 Solution Concept**

A background reminder system that sends SMS or email notifications for upcoming deadlines and court events. Users can opt in, configure delivery preferences, and pause reminders via Settings.

---

### **⚙️ Functional Requirements**

| ID | Requirement | Acceptance Criteria |
| ----- | ----- | ----- |
| 9.1 | Reminder Creation | When case or step with due date is created, a reminder record is queued. |
| 9.2 | Notification Delivery | Messages sent via Twilio (SMS) and Resend (Email). |
| 9.3 | Opt-In Consent | User must explicitly enable SMS or email in Settings. |
| 9.4 | Scheduling | Serverless cron or queue checks upcoming `sendAt` timestamps. |
| 9.5 | UI Management | Settings screen lists active reminders and toggle controls. |
| 9.6 | Error Handling | Retries on failure; logs status to Firestore. |
| 9.7 | Compliance | Unsubscribe links for email; STOP for SMS. Privacy policy ack required. |

---

### **🔩 Technical Implementation**

**Backend:** Firebase Functions / Vercel Cron Jobs  
 **Data Model:**

{  
  "caseId": "case123",  
  "stepId": "step4",  
  "type": "due\_date",  
  "sendAt": "2025-10-30T12:00:00Z",  
  "method": "sms",  
  "status": "pending"  
}

**APIs:**

* `POST /api/reminders` – create reminder

* `PATCH /api/reminders/:id` – update status

* `GET /api/reminders?caseId=` – list reminders

**Libraries:** Twilio, Resend, date-fns, Firebase Admin SDK

---

### **🧪 Testing Criteria**

* Unit tests for scheduler logic.

* Integration test with sandbox Twilio/Resend keys.

* Load test (max 500 reminders/day).

* Compliance test: consent and unsubscribe flow.

---

### **⚖️ Compliance / Ethics**

* Requires explicit opt-in from user.

* Stores minimal PII (contact info only).

* Must support opt-out at any time.

* Logs delivery events for audit.

---

### **🚀 Deliverables**

1. `reminders` collection and API routes

2. Cloud Function scheduler (Cron or Pub/Sub)

3. Settings UI for notification preferences

---

### **✅ Definition of Done**

* Reminder queue creates and sends on schedule.

* Users can toggle reminders in Settings.

* Logs reflect delivery success/failure.

* Compliance and privacy review approved.