function toggleAdvancedInputs() {
  const fields = [
    "pageEffort",
    "scoping",
    "triage",
    "finalReview",
    "difficultyMultiplier",
    "onshoreMultiplier"
  ];

  const button = document.querySelector(
    'button[onclick="toggleAdvancedInputs()"]'
  );
  const isEnabling = button.innerText === "Enable Editing";

  // Toggle fields
  fields.forEach((id) => {
    const el = document.getElementById(id);
    el.disabled = !isEnabling;
  });

  // Update button text and class
  button.innerText = isEnabling ? "Disable Editing" : "Enable Editing";
  button.classList.toggle("editing-enabled", isEnabling);

  calculate(); // Recalculate after toggle
}

function updateMultipliers() {
  const complexity = document.getElementById("complexity").value;
  const onshore = document.getElementById("onshore").value;

  const difficultyMap = {
    Standard: 1,
    Difficult: 1.1,
    Exceptional: 1.3
  };

  const difficultyInput = document.getElementById("difficultyMultiplier");
  const onshoreInput = document.getElementById("onshoreMultiplier");

  if (difficultyInput.disabled) {
    difficultyInput.value = difficultyMap[complexity];
  }

  if (onshoreInput.disabled) {
    onshoreInput.value = onshore === "Yes" ? 2 : 1;
  }
}

// Load services list from services.json and populate the serviceType select
async function loadServices() {
  // Embedded fallback for when fetch is blocked (file:// pages) or network fails
  const defaultServices = [
    { Services: 'Evaluation', ATTC: 44, Buffer: 10 },
    { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
    { Services: 'Internal: VPAT representative sample', ATTC: 34.71, Buffer: 10 },
    { Services: 'Live Consultation', ATTC: 15, Buffer: 10 },
    { Services: 'Technical Question', ATTC: 13, Buffer: 10 },
    { Services: 'Validation', ATTC: 12, Buffer: 10 },
    { Services: 'VPAT', ATTC: 24, Buffer: 10 },
    { Services: 'VPAT Update', ATTC: 24, Buffer: 10 },
    { Services: 'Demand Review', ATTC: 10, Buffer: 10 },
    { Services: 'Design Evaluation', ATTC: 33, Buffer: 10 }
  ];

  const select = document.getElementById('serviceType');
  let services = null;
  let multipliers = null;
  try {
    // try loading from data/services.json first (matches repository structure)
    const resp = await fetch('data/services.json');
    if (resp.ok) {
      const data = await resp.json();
      // New schema wraps services and multipliers
      if (data.services) {
        services = data.services;
        multipliers = data.multipliers || null;
      } else {
        // backward compatible: array
        services = data;
      }
    } else {
      // fallback to top-level services.json
      const resp2 = await fetch('services.json');
      if (resp2.ok) {
        const data2 = await resp2.json();
        if (data2.services) {
          services = data2.services;
          multipliers = data2.multipliers || null;
        } else {
          services = data2;
        }
      }
    }
  } catch (err) {
    // Fetch can fail on file:// pages due to CORS — fall back to embedded data
    console.log('%cCould not fetch services.json (falling back to embedded data)', 'color: #b45f00; font-weight: 600;', err);
  }

  if (!services) services = defaultServices;
  // If the JSON contained multipliers use them, otherwise fall back to defaults
  const GLOBAL_MULTIPLIERS = multipliers || {
    scoping: 1.2,
    pageEffort: 0.5625,
    difficultyMultiplier: 1.0,
    onshoreMultiplier: 1.0,
    triage: 0.25,
    finalReview: 0.0625,
    repSample: 10
  };
  // Debug: log loaded services and multipliers
  console.log('Loaded services:', services.map(s => s.Services));
  console.log('GLOBAL_MULTIPLIERS:', GLOBAL_MULTIPLIERS);

  // Try to load holidays.json (optional). Fall back to a small embedded list.
  let holidays = [];
  const defaultHolidays = [
    // A small sample of US federal-style holidays for the rest of 2025
    '2025-11-27', // Thanksgiving (example)
    '2025-12-25', // Christmas
    '2025-12-26'  // Boxing day observed
  ];
  try {
    const hResp = await fetch('data/holidays.json');
    if (hResp.ok) {
      const hData = await hResp.json();
      if (Array.isArray(hData)) holidays = hData;
    }
  } catch (e) {
    console.log('Could not load data/holidays.json, using embedded defaults');
  }
  if (!holidays || !holidays.length) holidays = defaultHolidays;
  // Normalize to a Set of ISO date strings for quick lookup
  window.GLOBAL_HOLIDAYS = new Set(holidays.map(d => (new Date(d)).toISOString().slice(0,10)));
  console.log('Holidays loaded:', Array.from(window.GLOBAL_HOLIDAYS));

  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.Services;
    opt.textContent = s.Services;
    opt.dataset.attc = s.ATTC;
    opt.dataset.buffer = s.Buffer;
    select.appendChild(opt);
  });

  // Default to Full Manual Evaluation (manual) so existing fields are used
  if (select.querySelector('option[value="Full Manual Evaluation"]')) {
    select.value = 'Full Manual Evaluation';
  }

  select.addEventListener('change', () => {
    // Show/hide inputs depending on service selection
    const val = select.value;
    const advanced = document.querySelector('.advanced-inputs');
     const manualNames = ['Evaluation', 'Full Manual Evaluation'];
    const isManual = manualNames.includes(val);
  console.log('Service changed to:', val, '| isManual:', isManual);

    // Always keep Service Ticket Created Date visible
    const startLabel = document.querySelector('label[for="startDate"]');
    const startInput = document.getElementById('startDate');
    const startHint = document.getElementById('startDateHint');
    if (startLabel) startLabel.style.display = '';
    if (startInput) startInput.style.display = '';
    if (startHint) startHint.style.display = '';

  // Page count should only be visible for Full Manual Evaluation
  const pagesLabel = document.querySelector('label[for="pages"]');
  const pagesInput = document.getElementById('pages');
  const showPages = val === 'Full Manual Evaluation';
  if (pagesLabel) pagesLabel.style.display = showPages ? '' : 'none';
  if (pagesInput) pagesInput.style.display = showPages ? '' : 'none';

    // Complexity/onshore/vpat should be hidden for all services per new requirement
    ['complexity', 'onshore', 'vpat'].forEach(id => {
      const lab = document.querySelector(`label[for="${id}"]`);
      const inp = document.getElementById(id);
      if (lab) lab.style.display = 'none';
      if (inp) inp.style.display = 'none';
    });

    // Findings count only for Validation (non-manual)
    const findingsLabel = document.querySelector('label[for="findingsCount"]');
    const findingsInput = document.getElementById('findingsCount');
    if (findingsLabel && findingsInput) {
      if (val === 'Validation') {
        findingsLabel.style.display = '';
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

  // Determine timeline by service type — only Evaluation is manual here
  const manualNames = ['Evaluation'];
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
