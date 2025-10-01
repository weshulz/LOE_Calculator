Project Scope Estimator
=======================

Quick links
- Original Excel used to design the calculator: https://levelaccess-my.sharepoint.com/:x:/p/nell_k/EcqRE5riS3NKmVTkbZzTKUYBtACbURetw7V4FpNNMZGQ3A?email=wesley.hulsizer%40levelaccess.com&e=0vhmsU
- Rapid prototyping / demo: https://codepen.io/whulsizerlvl/full/MYYXKoG

Files of interest
- `index.html` — main UI
- `main.js` — calculation logic and UI wiring
- `main.css` — minimal styles
- `data/services.json` — service definitions (Services, ATTC, Buffer). This file is used to populate the Service Type select.

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

```bash
# macOS / Linux: serve on port 8000
python3 -m http.server 8000

# then open in your browser:
http://localhost:8000/index.html
```

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
- Improve styling of hints and layout in `main.css`.

If you want any of the above implemented, tell me which and I'll add it.
