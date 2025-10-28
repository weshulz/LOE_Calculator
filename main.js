// TODO add copy button for date results
// Make estiamted totoal timeline more less noticeable (secodnary designed)

/*
  MANAGER CONFIGURATION
  ---------------------
  This top section groups values a manager may edit without
  digging through the implementation below. Edit these values to change the
  app behavior. Keep the shapes consistent: services array entries must include
  "Services", "ATTC", and "Buffer". Holidays should be ISO date strings
  (YYYY-MM-DD). Multipliers represent numeric values in days used by the calculator.
*/

// Services: list of service types with ATTC and Buffer (editable)
const MANAGER_SERVICES = [
  { Services: 'Evaluation', ATTC: 44, Buffer: 10 },
  { Services: 'Full Manual Evaluation', ATTC: 37, Buffer: 10 },
  { Services: 'Internal: VPAT representative sample', ATTC: 34.71, Buffer: 10 },
  { Services: 'Live Consultation', ATTC: 5, Buffer: 5 },
  { Services: 'Technical Question', ATTC: 10, Buffer: 3 },
  { Services: 'Validation', ATTC: 12, Buffer: 5 },
  { Services: 'VPAT', ATTC: 24, Buffer: 10 },
  { Services: 'VPAT Update', ATTC: 24, Buffer: 10 },
  { Services: 'Demand Review', ATTC: 10, Buffer: 5 },
  { Services: 'Design Evaluation', ATTC: 33, Buffer: 10 }
];

// Multipliers and small constants managers may adjust
const MANAGER_MULTIPLIERS = {
  scoping: 1.2,
  pageEffort: 0.5625,
  difficultyMultiplier: 1.0,
  onshoreMultiplier: 1.0,
  triage: 0.25,
  finalReview: 0.0625,
  repSample: 10
};

// Holidays (ISO strings). You can optionally create data/holidays.json to override.
const MANAGER_HOLIDAYS = [
  '2025-11-27', // Thanksgiving (example)
  '2025-12-25', // Christmas (example)
  '2025-12-26'  // Boxing day observed (example)
];

// Which services use the page-based (manual) calculation
const PAGE_BASED_SERVICES = ['Full Manual Evaluation'];
const PAGES_VISIBLE_SERVICES = ['Full Manual Evaluation'];

// Default service selected when the page loads (editable)
const DEFAULT_SELECTED_SERVICE = 'Full Manual Evaluation';

// This function is a deprecated feature, remove soon
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

// This function is also deprecated feature, remove soon
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
  // Embedded fallback uses `MANAGER_SERVICES` defined at the top of this file.

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
    // console.warn('%cCould not fetch services.json (falling back to embedded data)', 'color: #b45f00; font-weight: 600;', err);
  }

  if (!services) services = MANAGER_SERVICES;
  // If the JSON contained multipliers use them, otherwise fall back to manager defaults
  const GLOBAL_MULTIPLIERS = multipliers || MANAGER_MULTIPLIERS;
  // Debug: log loaded services and multipliers
  // console.log('Loaded services:', services.map(s => s.Services));
  // console.log('GLOBAL_MULTIPLIERS:', GLOBAL_MULTIPLIERS);

  // Try to load holidays.json (optional). Fall back to manager-configured holidays.
  let holidays = [];
  try {
    const hResp = await fetch('data/holidays.json');
    if (hResp.ok) {
      const hData = await hResp.json();
      if (Array.isArray(hData)) holidays = hData;
    }
  } catch (e) {
    // console.log('Could not load data/holidays.json, using manager defaults');
  }
  if (!holidays || !holidays.length) holidays = MANAGER_HOLIDAYS;
  // Normalize to a Set of ISO date strings for quick lookup
  window.GLOBAL_HOLIDAYS = new Set(holidays.map(d => (new Date(d)).toISOString().slice(0, 10)));
  // console.log('Holidays loaded:', Array.from(window.GLOBAL_HOLIDAYS));

  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.Services;
    opt.textContent = s.Services;
    opt.dataset.attc = s.ATTC;
    opt.dataset.buffer = s.Buffer;
    select.appendChild(opt);
  });

  // Default selection from manager config
  if (select.querySelector(`option[value="${DEFAULT_SELECTED_SERVICE}"]`)) {
    select.value = DEFAULT_SELECTED_SERVICE;
  }

  select.addEventListener('change', () => {
    // Show/hide inputs depending on service selection
    const val = select.value;
    const advanced = document.querySelector('.advanced-inputs');
    // Pages visibility and page-based service list are manager-configurable
    const isManual = PAGE_BASED_SERVICES.includes(val);
    const isPagesVisible = PAGES_VISIBLE_SERVICES.includes(val);
    // console.log('Service changed to:', val, '| isManual:', isManual);

    // Always keep Service Ticket Created Date visible
    const startLabel = document.querySelector('label[for="startDate"]');
    const startInput = document.getElementById('startDate');
    const startHint = document.getElementById('startDateHint');
    if (startLabel) startLabel.style.display = '';
    if (startInput) startInput.style.display = '';
    if (startHint) startHint.style.display = '';

    // Page count visibility is driven by manager config
    const pagesLabel = document.querySelector('label[for="pages"]');
    const pagesInput = document.getElementById('pages');
    if (pagesLabel) pagesLabel.style.display = isPagesVisible ? '' : 'none';
    if (pagesInput) pagesInput.style.display = isPagesVisible ? '' : 'none';

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
    // console.log('Visibility -> startDate: shown, pages:', isManual, 'findings:', val === 'Validation');
    calculate();
  });
  // Run the change handler once so the default selection visibility is applied
  select.dispatchEvent(new Event('change'));
  // expose globals for other functions to use
  window.GLOBAL_SERVICES = services;
  window.GLOBAL_MULTIPLIERS = GLOBAL_MULTIPLIERS;
}


function calculate() {
  // updateMultipliers();

  // When a service is selected, get its option and name
  const serviceSelect = document.getElementById('serviceType');
  const selectedOption = serviceSelect?.selectedOptions[0];

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

  // console.log('Base Effort: ', baseEffort.toFixed(2), '| Review Effort: ', reviewEffort.toFixed(2));

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

      if (pagesCount <= 10) {
        totalTimeline = attc + buffer;
      } else {
        // console.log('Full Manual components -> attc:', attc, 'buffer:', buffer, 'scoping:', scopingVal, 'pageEffort*pages:', pagesEffort, 'triage:', triageVal, 'finalReview*pages:', pagesReview);
        totalTimeline = attc + buffer + scopingVal + pagesEffort + triageVal + pagesReview;  
      }
      
    } else {
      // Non-FME services use ATTC + Buffer
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
    // Should not occur, create error
    totalTimeline = scoping + testingTimeline;
    alert("No service found, total timeline: ", totalTimeline);
  }

  // Safety: ensure totalTimeline is a finite number
  if (!Number.isFinite(totalTimeline)) {
    console.warn('%cComputed totalTimeline is not a finite number, defaulting to 0', 'color: #b45f00; font-weight: 600;', totalTimeline);
    totalTimeline = 0;
  }

  // console.log('Service:', selectedOption ? selectedOption.value : 'none', '| totalTimeline:', totalTimeline);

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

  // console.log('Total timeline (days):', totalTimeline, delivery ? '| delivery: ' + delivery.toLocaleDateString() : '');
}

// Adds or subtracts n business days to a given date (skips weekends)
function addBusinessDays(date, days) {
  const result = new Date(date);
  if (days === 0) return result;

  const direction = Math.sign(days);
  let remaining = Math.abs(days);

  // console.log('direction: ', direction, '| remaining days: ', remaining);
  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    // Skip weekends
    if (day === 0 || day === 6) continue;
    // Skip holidays (ISO date string in GLOBAL_HOLIDAYS)
    try {
      const iso = result.toISOString().slice(0, 10);
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
