Project Scope Estimator
=======================

Setup Quick Link for Users
--------------------------

1. Go to https://levelaccess.sharepoint.com/sites/CX_Delivery/Shared%20Documents/Forms/AllItems.asp[…]ols&viewid=3dd6cd31%2Db51e%2D4af1%2Dbe23%2D0d4268717489
2. Click on "Add shortcut to OneDrive".
3. Go to your desktop (not the OneDrive web app) and open that folder.
4. Open the `index.html` file in Google Chrome (or your preferred browser).
5. Add this tab to your bookmarks for quick access.

Some of the below may be outdated, if you wish to contribute, reach out to wesley hulsizer for access to the repo

Quick links
- Original Excel used to design the calculator: https://levelaccess-my.sharepoint.com/:x:/p/nell_k/EcqRE5riS3NKmVTkbZzTKUYBtACbURetw7V4FpNNMZGQ3A?email=wesley.hulsizer%40levelaccess.com&e=0vhmsU
- Rapid prototyping / demo: https://codepen.io/whulsizerlvl/full/MYYXKoG

Files of interest
- `index.html` — main UI
- `main.js` — calculation logic and UI wiring
- `main.css` — minimal styles
- `data/services.json` — service values (Services, ATTC, Buffer). This file is used to populate the Service Type select. If changing the values does not have an effect, you need to edit them in main.js. The json file calls may fail depending on user setup. 

Overview
--------
This small web app estimates testing project timelines. Key behavior:
- Service Type: choose a service at the top of the form. "Full Manual Evaluation" is the default and uses the existing page-based calculation.
- Non-manual services: timeline is taken from the service's ATTC + Buffer values (see `data/services.json`). When a non-manual service is selected, the page inputs (complexity, onshore, vpat, pages) and advanced inputs are hidden, but the Service Type select and Service Ticket Created Date remain visible.
- Service Ticket Created Date: formerly "Project Start Date"; defaults to today and is used to compute an Estimated Delivery Date. Delivery computation skips weekends (Saturday/Sunday). Holidays are not accounted for.
- Results are shown as a definition list (`<dl>`) with separate lines for the estimated timeline and the estimated delivery date.

Why you may not see services listed locally
-------------------------------------------------
If you open `index.html` directly in the browser (file:// URL), modern browsers block fetch requests for local files (CORS/origin null). To make the app fetch `data/services.json` correctly, serve the folder over HTTP. Example (from the project root):

The app includes a safe embedded fallback containing the same service data. If the fetch fails (for example, when opened via file://), the UI will still populate from the embedded data and function normally. When served over HTTP, the app will use the JSON file in `data/services.json`.

Development notes
-----------------
- The service data shape is an array of objects with keys: `Services` (string), `ATTC` (number), `Buffer` (number).
- Non-manual services use `ATTC + Buffer` as the timeline (in business days).
- Manual calculations use page count, page effort, multipliers, triage, and review times (see `main.js` for the exact formula).
- Accessibility: inputs use visible `<label>` elements. Hints are provided via `aria-describedby` for the Service Type and Service Ticket Created Date.

Next improvements (ideas)
- Add holiday calendar support for delivery date calculations.
- Show service ATTC and Buffer in the results area.

ATTC = Average time to completion

Updating ATTC, Buffer, and the calculation math
-----------------------------------------------
If you need to update service ATTC values or the buffer used for each service, edit `data/services.json`. Each entry has this shape:

```json
{
	"Services": "Validation",
	"ATTC": 12,
	"Buffer": 10
}
```

Steps to update:
- Edit `data/services.json` and change the `ATTC` or `Buffer` numbers for the service you want to update.
- If you open the page directly via `file://` the browser may block fetching that JSON (CORS). The app contains an embedded fallback inside `main.js` (the `defaultServices` array). If you want the app to use updated values when opening the file locally, either:
	- Serve the project over HTTP (recommended) so the app fetches `data/services.json` (see the local server example above), or
	- Also update the `defaultServices` array in `main.js` to match your edited JSON.

Exact math used by the calculator
---------------------------------
There are two ways the app computes an Estimated Total Timeline depending on the selected service type:

1) Manual services ("Full Manual Evaluation", "Evaluation") — page-based calculation

- Inputs used: `pages`, `pageEffort`, `difficultyMultiplier`, `onshoreMultiplier`, `triage`, `finalReview`, `scoping`, and optionally `vpatTime`.



- Computation steps (mirrors `main.js`):
	- baseEffort = ((pages * pageEffort) / 8) * difficultyMultiplier * onshoreMultiplier
	- reviewEffort = ((finalReview * pages) / 8) * difficultyMultiplier * onshoreMultiplier
	- testingTimeline = baseEffort + triage + reviewEffort
	- if testingTimeline < 10 then testingTimeline = 10 (minimum testing timeline)
	- totalTimeline = scoping + testingTimeline + vpatTime

Example: pages=10, pageEffort=4.5, difficultyMultiplier=1, onshoreMultiplier=1, triage=2, finalReview=0.5, scoping=10, vpatTime=0
	- baseEffort = ((10*4.5)/8)*1*1 = 5.625 days
	- reviewEffort = ((0.5*10)/8)*1*1 = 0.625 days
	- testingTimeline = 5.625 + 2 + 0.625 = 8.25 → min 10 (so testingTimeline = 10)
	- totalTimeline = 10 (scoping) + 10 (testing minimum) + 0 = 20 business days

2) Non-manual services — ATTC + Buffer (and optional findings adjustment for Validation)

- For services other than the two manual names above, the app uses the service's ATTC and Buffer:
	- totalTimeline = ATTC + Buffer
- Special case: Validation — the app adds extra days based on the Findings Count input:
	- extraDays = floor(findingsCount / 20) (1 extra day for every full 20 findings)
	- totalTimeline = (ATTC + extraDays) + Buffer

Where extraDays is intentionally rounded down (a partial block of findings under 20 does not add an extra day). If you'd prefer to round up or use a different ratio, update the logic in `main.js` here:

 - The list `manualNames = ['Full Manual Evaluation', 'Evaluation']` controls which services use manual calculation.
 - The findings rule lives in `main.js` where it does `Math.floor(findings / 20)`; change to `Math.ceil(findings / 20)` to round up instead.

How the Estimated Delivery Date is calculated
-------------------------------------------
- The app takes the Service Ticket Created Date (date input). If blank, it defaults to today.
- It adds the computed `totalTimeline` as business days using the helper `addBusinessDays()` in `main.js`.
	- The helper increments the date one calendar day at a time and only counts days where `getDay()` is not 0 (Sunday) and not 6 (Saturday).
	- Therefore weekends are skipped. Public holidays are not considered.

If you want holiday awareness, you can:
- Add a `holidays.json` (or similar) with an array of ISO dates and update `addBusinessDays()` to skip those dates, or
- Integrate a holiday API (requires network access and likely an API key).

Where to change behavior in code
--------------------------------
- `data/services.json` — change the ATTC/Buffer values.
- `main.js` —
	- `defaultServices` — embedded fallback values (update if you want local file behavior to match immediately).
	- `manualNames` — list of services which use the manual, page-based calculation.
	- Findings computation (the `Math.floor(findings / 20)` line) — change rounding or divisor to alter the findings→days mapping.
	- `addBusinessDays()` — change weekend/holiday logic for delivery date calculation.

Questions or next steps
----------------------
If you want I can:
- Add an admin UI to edit `data/services.json` from the browser and persist changes (requires saving to disk or a server endpoint).
- Add holiday support (local JSON or integrate an API).
- Change the findings rule to round up or use a different per-findings ratio.

Tell me which of the above you'd like and I'll implement it.
