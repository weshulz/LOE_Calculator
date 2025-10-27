/*
  Minimal calculator (simplified / dumbed-down)
  - Uses ATTC + Buffer for all services except
    'Full Manual Evaluation' which adds pages-based days.
  - Shows the pages input only for 'Full Manual Evaluation'.
  - Computes Estimated Delivery Date by adding business days (skips weekends).
  - Keeps the script intentionally small and easy to read.
*/

// Simple manager-editable defaults (used if fetch fails)
const DEFAULT_SERVICES = [
  { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
  { Services: 'Evaluation', ATTC: 44, Buffer: 10 },
  { Services: 'Validation', ATTC: 12, Buffer: 10 },
  { Services: 'Live Consultation', ATTC: 15, Buffer: 10 }
];

// Days added per page for Full Manual Evaluation. Keep small and adjustable.
const PAGE_DAYS_PER_PAGE = 1; // 1 business day per page

// Minimal DOM helper
const $ = (id) => document.getElementById(id);

async function loadServices() {
  const select = $('serviceType');
  if (!select) return;
  let services = null;
  try {
    const resp = await fetch('data/services.json');
    if (resp.ok) {
      const data = await resp.json();
      services = data.services || data;
    }
  } catch (e) {
    // ignore fetch errors (file:// or CORS)
  }
  if (!services) services = DEFAULT_SERVICES;

  // Populate select
  select.innerHTML = '';
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.Services;
    opt.textContent = s.Services;
    opt.dataset.attc = s.ATTC;
    opt.dataset.buffer = s.Buffer;
    select.appendChild(opt);
  });

  // Default to Full Manual Evaluation if available
  if (select.querySelector('option[value="Full Manual Evaluation"]')) {
    select.value = 'Full Manual Evaluation';
  }

  select.addEventListener('change', () => {
    applyPagesVisibility();
    calculate();
  });
}

function applyPagesVisibility() {
  const select = $('serviceType');
  const pagesLabel = document.querySelector('label[for="pages"]');
  const pagesInput = $('pages');
  const show = select && select.value === 'Full Manual Evaluation';
  if (pagesLabel) pagesLabel.style.display = show ? '' : 'none';
  if (pagesInput) pagesInput.style.display = show ? '' : 'none';
}

function calculate() {
  const select = $('serviceType');
  const resultsList = $('resultsList');
  if (!resultsList || !select) return;
  resultsList.innerHTML = '';

  const opt = select.selectedOptions[0];
  const attc = parseFloat(opt?.dataset?.attc) || 0;
  const buffer = parseFloat(opt?.dataset?.buffer) || 0;

  let total = attc + buffer;
  if (select.value === 'Full Manual Evaluation') {
    const pages = parseFloat($('pages')?.value) || 0;
    total += pages * PAGE_DAYS_PER_PAGE;
  }

  // Delivery date (business days only, skip weekends)
  const startVal = $('startDate')?.value;
  if (startVal) {
    const start = new Date(startVal);
    const delivery = addBusinessDays(start, Math.round(total));
    const dt = document.createElement('dt');
    dt.textContent = 'Estimated Delivery Date:';
    const dd = document.createElement('dd');
    dd.textContent = delivery.toLocaleDateString();
    resultsList.appendChild(dt);
    resultsList.appendChild(dd);
  }

  const dt2 = document.createElement('dt');
  dt2.textContent = 'Estimated Total Timeline:';
  const dd2 = document.createElement('dd');
  dd2.textContent = `${total.toFixed(1)} Business Days`;
  resultsList.appendChild(dt2);
  resultsList.appendChild(dd2);
}

function addBusinessDays(date, days) {
  const result = new Date(date);
  if (!Number.isFinite(days) || days === 0) return result;
  const dir = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  while (remaining > 0) {
    result.setDate(result.getDate() + dir);
    const d = result.getDay();
    if (d === 0 || d === 6) continue; // skip weekends
    remaining--;
  }
  return result;
}

// Hook up inputs
['serviceType', 'pages', 'startDate'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', calculate);
});

// Default start date to today if empty
const startInputEl = $('startDate');
if (startInputEl && !startInputEl.value) startInputEl.value = new Date().toISOString().slice(0,10);

// Initialize
loadServices().then(() => {
  applyPagesVisibility();
  calculate();
});
/*
  Minimal calculator (simplified / dumbed-down)
  - Uses ATTC + Buffer for all services except
    'Full Manual Evaluation' which adds pages-based days.
  - Shows the pages input only for 'Full Manual Evaluation'.
  - Computes Estimated Delivery Date by adding business days (skips weekends).
  - Keeps the script intentionally small and easy to read.
*/

// Simple manager-editable defaults (used if fetch fails)
const DEFAULT_SERVICES = [
  { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
  { Services: 'Evaluation', ATTC: 44, Buffer: 10 },
  { Services: 'Validation', ATTC: 12, Buffer: 10 },
  { Services: 'Live Consultation', ATTC: 15, Buffer: 10 }
];

// Days added per page for Full Manual Evaluation. Keep small and adjustable.
const PAGE_DAYS_PER_PAGE = 1; // 1 business day per page

// Minimal DOM helper
const $ = (id) => document.getElementById(id);

async function loadServices() {
  const select = $('serviceType');
  if (!select) return;
  let services = null;
  try {
    const resp = await fetch('data/services.json');
    if (resp.ok) {
      const data = await resp.json();
      services = data.services || data;
    }
  } catch (e) {
    // ignore fetch errors (file:// or CORS)
  }
  if (!services) services = DEFAULT_SERVICES;

  // Populate select
  select.innerHTML = '';
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.Services;
    opt.textContent = s.Services;
    opt.dataset.attc = s.ATTC;
    opt.dataset.buffer = s.Buffer;
    select.appendChild(opt);
  });

  // Default to Full Manual Evaluation if available
  if (select.querySelector('option[value="Full Manual Evaluation"]')) {
    select.value = 'Full Manual Evaluation';
  }

  select.addEventListener('change', () => {
    applyPagesVisibility();
    calculate();
  });
}

function applyPagesVisibility() {
  const select = $('serviceType');
  const pagesLabel = document.querySelector('label[for="pages"]');
  const pagesInput = $('pages');
  const show = select && select.value === 'Full Manual Evaluation';
  if (pagesLabel) pagesLabel.style.display = show ? '' : 'none';
  if (pagesInput) pagesInput.style.display = show ? '' : 'none';
}

function calculate() {
  const select = $('serviceType');
  const resultsList = $('resultsList');
  if (!resultsList || !select) return;
  resultsList.innerHTML = '';

  const opt = select.selectedOptions[0];
  const attc = parseFloat(opt?.dataset?.attc) || 0;
  const buffer = parseFloat(opt?.dataset?.buffer) || 0;

  let total = attc + buffer;
  if (select.value === 'Full Manual Evaluation') {
    const pages = parseFloat($('pages')?.value) || 0;
    total += pages * PAGE_DAYS_PER_PAGE;
  }

  // Delivery date (business days only, skip weekends)
  const startVal = $('startDate')?.value;
  if (startVal) {
    const start = new Date(startVal);
    const delivery = addBusinessDays(start, Math.round(total));
    const dt = document.createElement('dt');
    dt.textContent = 'Estimated Delivery Date:';
    const dd = document.createElement('dd');
    dd.textContent = delivery.toLocaleDateString();
    resultsList.appendChild(dt);
    resultsList.appendChild(dd);
  }

  const dt2 = document.createElement('dt');
  dt2.textContent = 'Estimated Total Timeline:';
  const dd2 = document.createElement('dd');
  dd2.textContent = `${total.toFixed(1)} Business Days`;
  resultsList.appendChild(dt2);
  resultsList.appendChild(dd2);
}

function addBusinessDays(date, days) {
  const result = new Date(date);
  if (!Number.isFinite(days) || days === 0) return result;
  const dir = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  while (remaining > 0) {
    result.setDate(result.getDate() + dir);
    const d = result.getDay();
    if (d === 0 || d === 6) continue; // skip weekends
    remaining--;
  }
  return result;
}

// Hook up inputs
['serviceType', 'pages', 'startDate'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', calculate);
});

// Default start date to today if empty
const startInputEl = $('startDate');
if (startInputEl && !startInputEl.value) startInputEl.value = new Date().toISOString().slice(0,10);

// Initialize
loadServices().then(() => {
  applyPagesVisibility();
  calculate();
});
/*
  Minimal calculator (simplified / dumbed-down)
  - Uses ATTC + Buffer for all services except
    'Full Manual Evaluation' which adds pages-based days.
  - Shows the pages input only for 'Full Manual Evaluation'.
  - Computes Estimated Delivery Date by adding business days (skips weekends).
  - Keeps the script intentionally small and easy to read.
*/

// Simple manager-editable defaults (used if fetch fails)
const DEFAULT_SERVICES = [
  { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
  /*
    Minimal calculator (simplified / dumbed-down)
    - Uses ATTC + Buffer for all services except
      'Full Manual Evaluation' which adds pages-based days.
    - Shows the pages input only for 'Full Manual Evaluation'.
    - Computes Estimated Delivery Date by adding business days (skips weekends).
    - Keeps the script intentionally small and easy to read.
  */

  // Simple manager-editable defaults (used if fetch fails)
  const DEFAULT_SERVICES = [
    { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
    { Services: 'Evaluation', ATTC: 44, Buffer: 10 },
    { Services: 'Validation', ATTC: 12, Buffer: 10 },
    { Services: 'Live Consultation', ATTC: 15, Buffer: 10 }
  ];

  // Days added per page for Full Manual Evaluation. Keep small and adjustable.
  const PAGE_DAYS_PER_PAGE = 1; // 1 business day per page

  // Minimal DOM helpers
  const $ = (id) => document.getElementById(id);

  async function loadServices() {
    const select = $('serviceType');
    let services = null;
    try {
      const resp = await fetch('data/services.json');
      if (resp.ok) {
        const data = await resp.json();
        services = data.services || data;
      }
    } catch (e) {
      // ignore fetch errors (file:// or CORS)
    }
    if (!services) services = DEFAULT_SERVICES;

    // Populate select
    select.innerHTML = '';
    services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.Services;
      opt.textContent = s.Services;
      opt.dataset.attc = s.ATTC;
      opt.dataset.buffer = s.Buffer;
      select.appendChild(opt);
    });

    // Set a sensible default if present
    if (select.querySelector('option[value="Full Manual Evaluation"]')) {
      select.value = 'Full Manual Evaluation';
    }

    // Apply initial visibility and calculation
    select.addEventListener('change', () => {
      applyPagesVisibility();
      calculate();
    });
  }

  function applyPagesVisibility() {
    const select = $('serviceType');
    const pagesLabel = document.querySelector('label[for="pages"]');
    const pagesInput = $('pages');
    const show = select && select.value === 'Full Manual Evaluation';
    if (pagesLabel) pagesLabel.style.display = show ? '' : 'none';
    if (pagesInput) pagesInput.style.display = show ? '' : 'none';
  }

  function calculate() {
    const select = $('serviceType');
    const resultsList = $('resultsList');
    if (!resultsList) return;
    resultsList.innerHTML = '';
    if (!select) return;

    const opt = select.selectedOptions[0];
    const attc = parseFloat(opt?.dataset?.attc) || 0;
    const buffer = parseFloat(opt?.dataset?.buffer) || 0;

    let total = attc + buffer;
    if (select.value === 'Full Manual Evaluation') {
      const pages = parseFloat($('pages')?.value) || 0;
      total += pages * PAGE_DAYS_PER_PAGE;
    }

    // Delivery date (business days only, skip weekends)
    const startVal = $('startDate')?.value;
    if (startVal) {
      const start = new Date(startVal);
      const delivery = addBusinessDays(start, Math.round(total));
      const dt = document.createElement('dt');
      dt.textContent = 'Estimated Delivery Date:';
      const dd = document.createElement('dd');
      dd.textContent = delivery.toLocaleDateString();
      resultsList.appendChild(dt);
      resultsList.appendChild(dd);
    }

    const dt2 = document.createElement('dt');
    dt2.textContent = 'Estimated Total Timeline:';
    const dd2 = document.createElement('dd');
    dd2.textContent = `${total.toFixed(1)} Business Days`;
    resultsList.appendChild(dt2);
    resultsList.appendChild(dd2);
  }

  function addBusinessDays(date, days) {
    const result = new Date(date);
    if (!Number.isFinite(days) || days === 0) return result;
    const dir = days > 0 ? 1 : -1;
    let remaining = Math.abs(days);
    while (remaining > 0) {
      result.setDate(result.getDate() + dir);
      const d = result.getDay();
      if (d === 0 || d === 6) continue; // skip weekends
      remaining--;
    }
    return result;
  }

  // Hook up inputs
  ['serviceType', 'pages', 'startDate'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', calculate);
  });

  // Default start date to today if empty
  const startInputEl = $('startDate');
  if (startInputEl && !startInputEl.value) startInputEl.value = new Date().toISOString().slice(0,10);

  // Initialize
  loadServices().then(() => {
    applyPagesVisibility();
    calculate();
  });

        findingsInput.style.display = '';
      } else {
        findingsLabel.style.display = 'none';
        findingsInput.style.display = 'none';
      }
    }

    // Always hide advanced settings (kept in DOM)
    if (advanced) advanced.style.display = 'none';

    // Quick visibility debug
    console.log('Visibility -> startDate: shown, pages:', isManual, 'findings:', val === 'Validation');
    calculate();
  });
  // Run the change handler once so the default selection visibility is applied
  select.dispatchEvent(new Event('change'));
  // expose globals for other functions to use
  window.GLOBAL_SERVICES = services;
  window.GLOBAL_MULTIPLIERS = GLOBAL_MULTIPLIERS;
}


function calculate() {
  updateMultipliers();

  // If a service is selected, get its option and name
  const serviceSelect = document.getElementById('serviceType');
  const selectedOption = serviceSelect?.selectedOptions[0];
  const selectedService = selectedOption?.value;

  const pages = parseFloat(document.getElementById("pages").value) || 0;
  // Populate inputs from GLOBAL_MULTIPLIERS where available so hidden fields get proper values
  const mult = window.GLOBAL_MULTIPLIERS || {};
  const pageEffort = parseFloat(mult.pageEffort || document.getElementById("pageEffort").value);
  const scoping = parseFloat(mult.scoping || document.getElementById("scoping").value);
  const triage = parseFloat(mult.triage || document.getElementById("triage").value);
  const finalReview = parseFloat(mult.finalReview || document.getElementById("finalReview").value);
  const difficultyMultiplier = parseFloat(
    document.getElementById("difficultyMultiplier").value
  );
  const onshoreMultiplier = parseFloat(
    document.getElementById("onshoreMultiplier").value
  );

  const baseEffort =
    ((pages * pageEffort) / 8) * difficultyMultiplier * onshoreMultiplier;

  const reviewEffort =
    ((finalReview * pages) / 8) * difficultyMultiplier * onshoreMultiplier;

  console.log('Base Effort: ', baseEffort.toFixed(2), '| Review Effort: ', reviewEffort.toFixed(2));

  let testingTimeline = baseEffort + triage + reviewEffort;
  console.log('Testing Timeline: ', testingTimeline.toFixed(2));
  if (testingTimeline < 10) testingTimeline = 10;

  // Determine timeline by service type — configurable via PAGE_BASED_SERVICES
  const manualNames = PAGE_BASED_SERVICES;
  let totalTimeline = 0;

  if (selectedOption) {
    const svc = selectedOption.value;

     // Full Manual Evaluation: ATTC + Buffer + repSample + pages*finalReview + pages*pageEffort
     if (svc === 'Full Manual Evaluation') {
       // Components: ATTC + Buffer + Scoping + (pageEffort * pages) + triage + (finalReview * pages)
       const mult = window.GLOBAL_MULTIPLIERS || {};
       const attc = parseFloat(selectedOption.dataset.attc) || 0;
       const buffer = parseFloat(selectedOption.dataset.buffer) || 0;
       const pagesCount = parseFloat(document.getElementById('pages').value) || 0;
       const pageEff = parseFloat(mult.pageEffort ?? document.getElementById('pageEffort').value) || 0;
       const finalRev = parseFloat(mult.finalReview ?? document.getElementById('finalReview').value) || 0;
       const scopingVal = parseFloat(mult.scoping ?? document.getElementById('scoping').value) || 0;
       const triageVal = parseFloat(mult.triage ?? document.getElementById('triage').value) || 0;

       const pagesEffort = pagesCount * pageEff;
       const pagesReview = pagesCount * finalRev;

       console.log('Full Manual components -> attc:', attc, 'buffer:', buffer, 'scoping:', scopingVal, 'pageEffort*pages:', pagesEffort, 'triage:', triageVal, 'finalReview*pages:', pagesReview);

       totalTimeline = attc + buffer + scopingVal + pagesEffort + triageVal + pagesReview;
     } else if (manualNames.includes(svc)) {
       // Manual (Evaluation) uses the page-based calculation
       totalTimeline = scoping + testingTimeline;

    } else {
      // Non-manual services use ATTC + Buffer
      let attc = parseFloat(selectedOption.dataset.attc) || 0;
      const buffer = parseFloat(selectedOption.dataset.buffer) || 0;

      // If Validation, add findings-based days: 1 day per 20 findings
      if (svc === 'Validation') {
        const findings = parseInt(document.getElementById('findingsCount').value) || 0;
        const extra = Math.floor(findings / 20);
        attc += extra;
      }

      console.log('ATTC: ', attc, '| Buffer: ', buffer);
      totalTimeline = attc + buffer;
    }

  } else {
    // No service selected: default to manual page-based calculation
    totalTimeline = scoping + testingTimeline;
  }

  // Safety: ensure totalTimeline is a finite number
  if (!Number.isFinite(totalTimeline)) {
    console.log('%cComputed totalTimeline is not a finite number, defaulting to 0', 'color: #b45f00; font-weight: 600;', totalTimeline);
    totalTimeline = 0;
  }

  console.log('Service:', selectedOption ? selectedOption.value : 'none', '| totalTimeline:', totalTimeline);

  const resultsList = document.getElementById("resultsList");
  // Clear previous results
  resultsList.innerHTML = "";

  // Compute Estimated Delivery Date if a start date is provided — render delivery first
  const startDateValue = document.getElementById("startDate").value;
  let delivery = null;
  if (startDateValue) {
    const start = new Date(startDateValue);
    delivery = addBusinessDays(start, Math.round(totalTimeline));
    console.log('Start Date: ', start.toLocaleDateString(), '| Delivery Date: ', delivery.toLocaleDateString());
    const dtDelivery = document.createElement("dt");
    dtDelivery.textContent = "Estimated Delivery Date:";
    const ddDelivery = document.createElement("dd");
    ddDelivery.innerHTML = `<span>${delivery.toLocaleDateString()}</span>`;
    resultsList.appendChild(dtDelivery);
    resultsList.appendChild(ddDelivery);
  }

  // Estimated Total Timeline (always shown)
  const dtTimeline = document.createElement("dt");
  dtTimeline.textContent = "Estimated Total Timeline:";
  const ddTimeline = document.createElement("dd");
  ddTimeline.innerHTML = `<span>${totalTimeline.toFixed(1)} Business Days</span>`;
  resultsList.appendChild(dtTimeline);
  resultsList.appendChild(ddTimeline);

  console.log('Total timeline (days):', totalTimeline, delivery ? '| delivery: ' + delivery.toLocaleDateString() : '');
}

// Adds or subtracts n business days to a given date (skips weekends)
function addBusinessDays(date, days) {
  const result = new Date(date);
  if (days === 0) return result;

  const direction = Math.sign(days);
  let remaining = Math.abs(days);

  console.log('direction: ', direction, '| remaining days: ', remaining);
  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    // Skip weekends
    if (day === 0 || day === 6) continue;
    // Skip holidays (ISO date string in GLOBAL_HOLIDAYS)
    try {
      const iso = result.toISOString().slice(0,10);
      if (window.GLOBAL_HOLIDAYS && window.GLOBAL_HOLIDAYS.has(iso)) continue;
    } catch (e) {
      // ignore toISOString errors
    }
    remaining--;
  }

  return result;
}

// Watch for updates
["complexity", "onshore", "pages", "findingsCount"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculate);
});
document.getElementById("startDate").addEventListener("input", calculate);

// Also watch advanced fields when unlocked
["pageEffort", "scoping", "triage", "finalReview", "difficultyMultiplier", "onshoreMultiplier"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculate);
});

// If no start date is set, default it to today so we have a delivery calculation on load
const startInput = document.getElementById("startDate");
if (startInput && !startInput.value) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  startInput.value = today;
}

// Populate services then calculate
loadServices().then(() => {
  // Populate hidden inputs from GLOBAL_MULTIPLIERS so hidden fields have correct values
  const mult = window.GLOBAL_MULTIPLIERS || {};
  const setIfExists = (id, value) => {
    const el = document.getElementById(id);
    if (el && typeof value !== 'undefined') el.value = value;
  };
  setIfExists('pageEffort', mult.pageEffort);
  setIfExists('scoping', mult.scoping);
  setIfExists('triage', mult.triage);
  setIfExists('finalReview', mult.finalReview);
  setIfExists('difficultyMultiplier', mult.difficultyMultiplier);
  setIfExists('onshoreMultiplier', mult.onshoreMultiplier);

  calculate();
}); // Initial calculation after services load
