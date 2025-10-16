# **Decisions**

## **1\) Initial greeting behavior**

**Pick: (a) Auto-send greeting when the panel opens.**  
 Reason: Copilot is the primary entry path; a proactive, single welcome message eliminates blank-state hesitation and steers users into the scripted flow.

**Copy (drop-in):**

**Hi\! I’m FairForm.** Tell me what happened or upload a photo of your court notice.  
 I’ll help create your case and show your next steps in under 2 minutes.

(Show two chips under the message: **“I got an eviction notice”** • **“I want to prepare for my hearing”**)

**Guardrails:** send once per session; no typing animation longer than \~600ms.

---

## **2\) Case creation guidance (demo vs real)**

**Pick: (a) Running in demo mode and want the demo to work properly.**  
 Per your latest direction, this repo is **single-mode demo**. So: wire the “create case” path to the **demo repos** and ensure it actually creates a case object and navigates to Case Detail.

**Minimal hook (illustrative):**

// onIntent("ready\_to\_create")  
const caseId \= await demoCasesRepo.createFromIntake(intakePayload); // returns "DEMO-123"  
router.push(\`/case/${caseId}\`);  
toast.success("Case created. Let’s plan next steps.");

If/when you later re-enable real API, you’ll swap the repo impl without changing the UI.

---

## **3\) Context / understanding improvements**

**Pick: (d) All of the above — but keep it lightweight.**  
 Do three small things; big impact, low code:

### **3.1 System prompt: add explicit priorities (drop-in)**

* Always ask for (or extract) **case number**, **case type**, **court/jurisdiction**, **hearing date** if visible.

* If the user uploads a notice, **confirm the extracted case number back** to the user.

* When you have enough to create a case, **explicitly propose creation**: “I can create your case now. Continue?”

* After creation, **suggest the next step**: “Generate plan” or “Fill Appearance form”.

*(Put these as numbered rules at the top of the system prompt.)*

### **3.2 Lightweight conversation stages (no heavy state machine)**

Stages: `GREET → GATHER_MIN → CONFIRM_CREATE → POST_CREATE_COACH`.  
 Implement as a simple enum in the chat controller; advance on clear events:

switch(stage){  
  case "GATHER\_MIN": if(has(caseNumber||photo)&\&has(caseType)) stage="CONFIRM\_CREATE";  
  case "CONFIRM\_CREATE": /\* show create card; on click → create \*/   
}

### **3.3 Prompt scaffolding**

When sending user input to the response generator, prepend a tiny status line:

\[app\_state\]  
stage=GATHER\_MIN  
has\_case\_number=false  
has\_hearing\_date=false  
jurisdiction\_guess="Marion County, IN"

\[user\]  
"I got an eviction notice…"

This keeps replies consistent without complex app logic.

---

# **Acceptance checkpoints (fast to verify)**

* **Greeting:** Appears instantly when chat opens; chips visible; no double-greet on reopen.

* **Create case:** After user describes situation or uploads sample, a **“Create My Case”** card appears; clicking it navigates to `/case/DEMO-123` within \~1s.

* **Post-create nudge:** On the case page, show a top banner: “Case created. Generate your plan now.” with a primary **Generate Plan** CTA.

* **Data minima captured:** Case type \+ jurisdiction \+ (case number OR hearing date). If missing, Copilot asks exactly one clarifying question, then proposes creation.

---

# **Why these choices**

* They reinforce the **AI-first, 2-minute to value** story.

* No feature flags, no extra flows — consistent with your single-mode demo architecture.

* Each change is a **one-file tweak** (greeting message, system prompt, tiny stage enum, create-case call).

If you want, I can paste ready-to-drop **prompt text** and a 25-line **stage controller snippet** tailored to your current chat component.

Here was my response before reading this. Let's align: 1\. The AI Copliot should proactively try to get details of the case and understand what's going on with the user. So we should definiely send a greeting that guides the users. We could also have prompt bubbles they could click on that give a few examples of what should or could be asked. 2\. There should be NO DEMO MODE. If there is a demo mode we need to remove those flags. We won't have separate modes everything should work without a sepearate mode switch. We do need a fix or to wire this up though. Let's look into the demo mode api mode and make sure that it's not gates behind a flag. We need to remove all code that's gating features. There is NO DEMO MODE ONLY ONE MODE. 3\. We need all of the above here. 

Absolutely aligned. Here’s a tight, do-now plan that matches your three points.

# **Decisions (locked)**

1. **Proactive greeting \+ prompt bubbles** — yes.

2. **ONE mode only** — remove all demo/flag gating; everything works without switches.

3. **All improvements** — system prompt, app-state scaffolding, and lightweight stages.

---

# **What to change (concrete, copy-paste friendly)**

## **1\) Chat greeting \+ examples**

**Where:** `ChatPanel.tsx` (on mount/open)

// show once per session  
useEffect(() \=\> {  
  if (\!sessionStorage.getItem("ff\_greeted")) {  
    addMessage({  
      role: "assistant",  
      text: "Hi\! I’m FairForm. Tell me what happened or upload a photo of your court notice. I’ll create your case and show next steps in under 2 minutes."  
    });  
    setSuggestionChips(\[  
      "I got an eviction notice",  
      "My hearing is next week",  
      "I need to file an appearance"  
    \]);  
    sessionStorage.setItem("ff\_greeted","1");  
  }  
}, \[\]);

## **2\) Remove “demo mode” gating (single mode)**

**Goal:** no flags, no branches. The app should “just work.”

* **Delete/replace** any checks like `if (DEMO_MODE) { … }`

* **Unify repos** to a single export that *auto-detects* capabilities (no flags):

  * If a real API/key is available → use it.

  * Else → fall back to deterministic local providers.

* This is **not** a “mode” — it’s *capability detection* inside one implementation.

**`repos/casesRepo.ts`**

import { realCasesRepo } from "./real/casesRepo";  
import { localCasesRepo } from "./local/casesRepo";

function canUseReal() {  
  return \!\!process.env.NEXT\_PUBLIC\_OPENAI\_KEY && \!\!process.env.NEXT\_PUBLIC\_API\_BASE;  
}

// Single export used everywhere  
export const casesRepo \= canUseReal() ? realCasesRepo : localCasesRepo;

Repeat this pattern for `remindersRepo`, `lookupRepo`, etc.  
 Remove any `features{}` or `DEMO_MODE` imports throughout.

**Routing note:** Keep all current routes; nothing redirects to a “demo” path.

## **3\) Case creation wiring (works in ONE implementation)**

**Where:** your Copilot intent handler (e.g., `onIntent("ready_to_create")`)

const id \= await casesRepo.createFromIntake(intakePayload); // works for both providers  
router.push(\`/case/${id}\`);  
toast.success("Case created. Let’s plan next steps.");

* `localCasesRepo.createFromIntake` returns a deterministic ID (e.g., `DEMO-123`) and stores to memory/localStorage.

* `realCasesRepo.createFromIntake` calls your real API.

No flags. Same UI path.

## **4\) System prompt upgrades (drop-in text)**

Add these as top rules in your system prompt:

* Always collect or confirm: **case number**, **case type**, **court/jurisdiction**, **hearing date**.

* When a notice image is provided, **echo back the parsed case number** for confirmation.

* When minimum info is present, **propose creation explicitly**: “I can create your case now. Continue?”

* After creation, **suggest the next step** based on context: “Generate your plan” or “Fill the Appearance form”.

## **5\) Lightweight conversation stages (no heavy state machine)**

**Where:** your chat controller

type Stage \= "GREET"|"GATHER\_MIN"|"CONFIRM\_CREATE"|"POST\_CREATE\_COACH";  
const \[stage, setStage\] \= useState\<Stage\>("GREET");

useEffect(() \=\> setStage("GATHER\_MIN"), \[\]);

// helper  
function hasMinimum(info){   
  return \!\!(info.caseType && (info.caseNumber || info.hearingDate) && info.jurisdiction);  
}

// after each assistant parse  
if (stage==="GATHER\_MIN" && hasMinimum(collected)) setStage("CONFIRM\_CREATE");

UI rule: in `CONFIRM_CREATE` show a **Create My Case** card; on click → create → `POST_CREATE_COACH` → show banner on case page: “Case created. Generate your plan now.”

---

# **Acceptance checkpoints (what QA should verify quickly)**

* **Greeting** appears once per session with 2–3 suggestion chips.

* **Create case** proposal appears after user provides a short description *or* uploads the sample notice.

* **Create case** button navigates to `/case/{id}` within \~1s (works with or without API keys present).

* **Post-create** banner on case page: primary **Generate Plan** CTA.

* **Minimum data captured** before creation: case type \+ jurisdiction \+ (case number **or** hearing date). If missing, Copilot asks exactly one clarifying question, then proposes creation.

---

# **Why this fits your priorities**

* **ONE mode**: no flags, no branches — the app auto-uses what’s available.

* **Guided, AI-first**: proactive greeting \+ chips reduce blank-page anxiety.

* **Real or fallback**: same UX; backends swapped behind a single repo export.

* **Low lift**: a few files touched, no architectural churn.

  

