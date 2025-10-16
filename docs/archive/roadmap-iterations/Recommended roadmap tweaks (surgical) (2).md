# **Recommended roadmap tweaks (surgical)**

## **Global (applies to all epics)**

* Remove any references to **feature flags / demo vs prod**. It’s one mode.

* Note that repos are **`demoRepos`** in this demo branch (prod-shaped interfaces, demo data sources).

* Add a short **“Hardening Gate”** before the demo: *scenario lock confirmed • canned data preloaded • routes smoke-checked • screen timing within targets*.

## **Epic 13 — Copilot**

* Acceptance: “Suggests **Create Case** in ≤ 0.8s on script input; navigates to case view with context.”

* Note: Responses come from **canned intents**; no live LLM in the demo.

## **Epic 15 — Case Lookup & Auto-Intake**

* Acceptance: “Upload → ‘scan’ animation (≈1s) → case summary populated from scenario fixture.”

* Explicitly call out: **no real OCR**; it’s a deterministic parse for the script.

## **Epic 16 — Deadline Engine**

* Acceptance: “Renders 3–4 deadlines with staggered animation; due dates computed from scenario base date.”

* Note: Offsets are **JSON template values** (no rules engine).

## **Epic 9 — Smart Reminders**

* Acceptance: “Click **Remind me** → visible ‘Synced’ badge \+ toast; no external send.”

* Note: In-memory/demo store only.

## **Epic 17 — Hearing Day Mode**

* Acceptance: “Checklist completes; **You’re ready** banner shown; map link opens.”

* Keep it fully local.

## **Epic 18 — Smart Form Filler**

* **Add the two new safeguards to acceptance:**

  * **PDF preflight passes** (required fields present in template map).

  * **Transparent fallback** available (“Download PDF (or View HTML)”), so the user never sees an “error” state.

* Scope: 1 form (Appearance) with 2–3 prefilled answers from case context; completion in ≤ 5 minutes, confetti on success.

# **Timeline notes**

* Keep the same order (13 → 15 → 16 → 9 → 17 → 18).

* Add a **30–45 min “patch window”** at the start of the sprint to apply the five implementation patches (already prepared), then proceed with screen wiring.

# **Risks & simple mitigations (updated)**

* **Scenario drift** → Scenario locked; add a pre-demo checklist item to verify it.

* **PDF mismatch** → Preflight runs on route entry; fallback always visible.

* **Timing slip in live demo** → Preload canned data on `/demo` mount.

