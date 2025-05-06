function toggleAdvancedInputs() {
    const fields = [
      "pageEffort",
      "scoping",
      "vpatTime",
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
  
  
  function calculate() {
    updateMultipliers();
  
    const pages = parseFloat(document.getElementById("pages").value) || 0;
    const vpat = document.getElementById("vpat").value === "Yes";
  
    const pageEffort = parseFloat(document.getElementById("pageEffort").value);
    const scoping = parseFloat(document.getElementById("scoping").value);
    const vpatTime = vpat
      ? parseFloat(document.getElementById("vpatTime").value)
      : 0;
    const triage = parseFloat(document.getElementById("triage").value);
    const finalReview = parseFloat(document.getElementById("finalReview").value);
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
  
    const totalTimeline = scoping + testingTimeline + vpatTime;
  
    document.getElementById(
      "results"
    ).innerHTML = `Estimated Total Timeline: <span>${totalTimeline.toFixed(
      1
    )} Business Days</span>`;
  }
  
  // Watch for updates
  ["complexity", "onshore", "vpat", "pages"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculate);
  });
  
  // Also watch advanced fields when unlocked
  [
    "pageEffort",
    "scoping",
    "vpatTime",
    "triage",
    "finalReview",
    "difficultyMultiplier",
    "onshoreMultiplier"
  ].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculate);
  });
  
  calculate(); // Initial calculation
  