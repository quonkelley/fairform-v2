# **🧱 Demo-Only Architecture (trash it after the pitch)**

## **TL;DR**

* **All client-side** Next.js/React app

* **Mock “APIs”** \= local JSON files \+ `setTimeout` to fake latency

* **Single-user, single-path** scripted flow

* **Hardcode everything** that isn’t visible in the demo

* **Zero OCR**: pretend to OCR (fake progress), parse from known sample

* **PDFs**: pre-baked templates \+ tiny fill function using `pdf-lib`

* **State**: `useState`/`useRef`; use `localStorage` for “persistence”

* **No tests, no docs, no i18n, no auth** (show a fake “Signed in as …” chip)

---

## **Minimal Stack**

* **Next.js (pages or app router)** \+ React

* **UI**: Tailwind \+ Headless UI (or shadcn if you already have it)

* **Icons**: lucide-react

* **PDF**: `pdf-lib` (client-side fill) \+ `file-saver`

* **“AI”**: one in-file function that returns canned responses from JSON with a bit of templating

* **Data**: `/public/demo/*.json` (cases, deadlines, glossary, forms)

* **Routing**: 3 routes total:

  * `/demo` (Copilot chat)

  * `/case/:id` (dashboard)

  * `/form/:formId` (conversational form)

Red flag check: anything beyond these libraries/paths is over-engineering for this demo.

---

## **Fake Backends (all client)**

Create a tiny `lib/demoApi.ts` with timeouts:

export const demoApi \= {  
  copilotChat: (msg:string)=\> wait(600).then(()=\> cannedCopilot(msg)),  
  createCase: (input)=\> wait(700).then(()=\> ({ id:"demo-123", ...input })),  
  lookupCase: (photo|name|num)=\> wait(800).then(()=\> demoCase),  
  generateDeadlines: (caseId)=\> wait(400).then(()=\> demoDeadlines),  
  sendReminder: ()=\> wait(300).then(()=\> ({ok:true})),  
  fillPdf: (formId, answers)=\> wait(700).then(()=\> buildPdfBlob(formId, answers)),  
};  
const wait \= (ms)=\> new Promise(r=\>setTimeout(r,ms));

* Responses come from `public/demo/*.json`.

* **No error handling** except happy path.

---

## **Data Fixtures (put in `/public/demo/`)**

* `case.eviction.json` – one golden path case

* `deadlines.eviction.json` – 3–5 deadlines w/ “due in X days”

* `glossary.json` – 10 terms tops

* `forms.marion.json` – **two forms** (`appearance`, `continuance`) with 6–10 fields each

* `copilot.replies.json` – map of intent → canned message templates

---

## **Feature Shortcuts by Epic**

### **Epic 13 – Copilot (Talk → Case)**

* **Do:** A chat box that “understands” via keyword match; when “eviction” and “notice” appear → show **Create Case** card.

* **Skip:** Real LLM calls, streaming, session mgmt.

* **Visible win:** Animated case card slides in with “Created case DEMO-123”.

### **Epic 15 – Case Lookup (Import)**

* **Do:** File upload UI with fake OCR progress; after 1.2s show parsed fields pulled from the **same** eviction fixture.

* **Skip:** Real OCR. (If pressed, use a regex on a known demo string.)

* **Visible win:** “We found your case” summary fills instantly.

### **Epic 16 – Deadline Engine (Auto-Plan)**

* **Do:** Load `deadlines.eviction.json` and animate into a timeline list; compute dates with `Date.now()+offsetDays`.

* **Skip:** Rule engine; holidays; timezones. Hardcode Marion offsets in JSON.

* **Visible win:** “Due Friday” chip \+ “Explain” button.

### **Epic 7 – Explain-As-You-Go (Explain)**

* **Do:** Tooltip shows text from `glossary.json`.

* **Skip:** Term detection. Hardwire 4 term highlights in the UI.

### **Epic 9 – Smart Reminders (Remind)**

* **Do:** Clicking “Remind me” sets a `localStorage` flag and shows “1 reminder scheduled”.

* **Skip:** Twilio/Resend. Add a fake toast: “SMS scheduled.”

* **Visible win:** A green “Synced” badge appears on the deadline row.

### **Epic 18 – Smart Form Filler (Act)**

* **Do:** Conversational Q\&A (one card at a time), 8 fields max. Populate from case fixture where possible.

* **PDF:** Use `pdf-lib` with a pre-baked template; map 6–8 fields; download via `FileSaver`.

* **Skip:** Signature, e-filing, conditional logic beyond 1 simple toggle.

* **Visible win:** Confetti \+ “Download Appearance.pdf” button.

### **Epic 17 – Hearing Day Mode (Show Up Confident)**

* **Do:** One full-screen view with 5 checklist items and a map link to the courthouse (just a `https://maps.google…`).

* **Skip:** Real directions, live status.

* **Visible win:** All items check off, big “You’re ready” banner.

---

## **Single “Demo Script” Path (what you present live)**

1. **/demo**: “I got an eviction notice.” → AI suggests creating a case → Click **Create**.

2. **Auto-nav to /case/demo-123**: Upload notice → fake OCR → Case summary animates in.

3. Click **Generate Plan** → deadlines list appears → click “What does Default Judgment mean?” tooltip.

4. Hit **Remind me** on “File Appearance” → green “1 reminder set” badge.

5. Click **Fill Appearance Form** → conversational Q\&A → **Download PDF**.

6. Toggle **Hearing Day Mode** → checklist → “You’re ready”.

Anything outside this path is **not necessary** and should be cut.

---

## **Components (only what we need)**

* `ChatPanel.tsx` (includes intent rules inline)

* `CaseSummaryCard.tsx`

* `DeadlineList.tsx` (dumb list \+ tiny stagger animation)

* `GlossaryHint.tsx`

* `ReminderButton.tsx` (sets `localStorage`)

* `FormSession.tsx` (state machine inline; no context)

* `PdfDownloadButton.tsx`

* `HearingMode.tsx`

Red flag: If someone proposes global state, reducers, or a design-system refactor — **do we actually need this for the demo?** No.

---

## **Hardcoded Config (keep it simple)**

export const DEMO \= {  
  CASE\_ID: "demo-123",  
  COUNTY: "Marion, IN",  
  FORM\_IDS: \["appearance","continuance"\],  
  DEADLINE\_OFFSETS: { appearance\_due\_days: 2, hearing\_prepare\_days: 3 },  
};

---

## **Visual Polish (cheap & effective)**

* Enter/exit animations: Tailwind `transition` \+ `opacity/translate` classes

* Confetti: `canvas-confetti` (one call)

* Toaster: `react-hot-toast`

---

## **Guardrails (basic only)**

* File type check: accept `.jpg/.png/.pdf` else toast “Use our sample notice.”

* “Signed in” chip with a static name; no auth flow

* Mobile: one-column stack; no edge-case layouts

---

## **What I’m Pushing Back On (architect stance)**

* **Real OCR / AI calls**: not needed; adds latency and failure modes.

* **Generic rule engine** for deadlines: hardcode 3 offsets in JSON.

* **Reminders integration**: don’t wire Twilio; fake it with a toast \+ badge.

* **Form templating system**: 2 forms only; flat JSON; minimal mapping.

* **Global store & abstraction layers**: inline module state is faster.

If a shortcut saves **≥ 30 minutes**, we take it.

---

## **Day-Of Demo Safety**

* **Demo switch**: `?demo=true` forces the golden path (auto-load fixtures).

* **Preload assets**: load JSON \+ font \+ PDF template on `/demo` mount.

* **Retry**: if anything fails, show a “Try again” button that just replays the timeout.

---

## **Rough Time Estimate (hands-on keyboard)**

* Shell app \+ basic styling: **2–3 hrs**

* Copilot happy path: **1.5 hr**

* Import fake OCR: **1 hr**

* Deadlines list \+ explain: **1 hr**

* Reminders fake: **30 min**

* Form session \+ PDF: **2–3 hrs**

* Hearing mode screen: **1 hr**

* Polish (confetti, toasts): **45 min**

Total ≈ **10–12 hrs** of focused build time.

