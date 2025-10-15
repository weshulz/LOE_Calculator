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
    console.warn('Could not fetch services.json (falling back to embedded data)', err);
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
    const manualNames = ['Full Manual Evaluation', 'Evaluation'];
    const isManual = manualNames.includes(val);

    // Always keep Service Ticket Created Date visible
    const startLabel = document.querySelector('label[for="startDate"]');
    const startInput = document.getElementById('startDate');
    const startHint = document.getElementById('startDateHint');
    if (startLabel) startLabel.style.display = '';
    if (startInput) startInput.style.display = '';
    if (startHint) startHint.style.display = '';

    // Page count should only be visible for manual services
    const pagesLabel = document.querySelector('label[for="pages"]');
    const pagesInput = document.getElementById('pages');
    if (pagesLabel) pagesLabel.style.display = isManual ? '' : 'none';
    if (pagesInput) pagesInput.style.display = isManual ? '' : 'none';

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

  // If a non-manual service is selected, prefer the ATTC + Buffer as the timeline
  const serviceSelect = document.getElementById('serviceType');
  const selectedService = serviceSelect ? serviceSelect.value : null;
  const selectedOption = serviceSelect ? serviceSelect.selectedOptions[0] : null;
  const manualNames = ['Full Manual Evaluation', 'Evaluation'];
  const isManual = selectedService ? manualNames.includes(selectedService) : true;

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

  let testingTimeline = baseEffort + triage + reviewEffort;
  if (testingTimeline < 10) testingTimeline = 10;

  let totalTimeline = scoping + testingTimeline;

  // Special-case Full Manual Evaluation: use combined Eval ATTC formula
  if (selectedOption && selectedOption.value === 'Full Manual Evaluation') {
    const mult = window.GLOBAL_MULTIPLIERS || {};
    const attc = parseFloat(selectedOption.dataset.attc) || 0;
    const buffer = parseFloat(selectedOption.dataset.buffer) || 0;
    const repSample = parseFloat(mult.repSample) || 10;
    const pagesCount = parseFloat(document.getElementById('pages').value) || 0;
    const pageEff = parseFloat(mult.pageEffort) || 1.5;
    const finalRev = parseFloat(mult.finalReview) || 0.5;

    // totalTimeline = Eval ATTC + Eval buffer + repSample + pages*finalReview + pages*pageEffort
    console.log(attc + buffer + repSample + pagesCount * finalRev + pagesCount * pageEff);
    totalTimeline = attc + buffer + repSample + pagesCount * finalRev + pagesCount * pageEff;
  } else if (!isManual && selectedOption) {
    let attc = parseFloat(selectedOption.dataset.attc) || 0;
    const buffer = parseFloat(selectedOption.dataset.buffer) || 0;

    // If Validation, add findings-based days: 1 day per 20 findings
    if (selectedOption.value === 'Validation') {
      const findings = parseInt(document.getElementById('findingsCount').value) || 0;
      const extra = Math.floor(findings / 20);
      attc += extra;
    }

    totalTimeline = attc + buffer;
  }

  const resultsList = document.getElementById("resultsList");
  // Clear previous results
  resultsList.innerHTML = "";

  // Estimated Total Timeline
  const dtTimeline = document.createElement("dt");
  dtTimeline.textContent = "Estimated Total Timeline:";
  const ddTimeline = document.createElement("dd");
  ddTimeline.innerHTML = `<span>${totalTimeline.toFixed(1)} Business Days</span>`;
  resultsList.appendChild(dtTimeline);
  resultsList.appendChild(ddTimeline);

  // Compute Estimated Delivery Date if a start date is provided
  const startDateValue = document.getElementById("startDate").value;
  if (startDateValue) {
    const start = new Date(startDateValue);
    const delivery = addBusinessDays(start, Math.round(totalTimeline));
    const dtDelivery = document.createElement("dt");
    dtDelivery.textContent = "Estimated Delivery Date:";
    const ddDelivery = document.createElement("dd");
    ddDelivery.innerHTML = `<span>${delivery.toLocaleDateString()}</span>`;
    resultsList.appendChild(dtDelivery);
    resultsList.appendChild(ddDelivery);
  }
}

// Adds n business days to the given date (skips weekends)
function addBusinessDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
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
