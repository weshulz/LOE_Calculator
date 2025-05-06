<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ProjectScopeEstimator.aspx.cs" Inherits="ProjectScopeEstimator" %>

  <!DOCTYPE html>
  <html lang="en">

  <head>
    <title>Project Scope Estimator</title>
    <meta charset="utf-8" />
    <style>
      /* (Keep all your CSS as-is — truncated here for brevity) */
      body {
        font-family: "Segoe UI", "Helvetica Neue", sans-serif;
        background-color: #fafafa;
        margin: auto;
        padding: 2rem;
        color: #1a1a1a;
        max-width: 1080px;
      }

      input:focus {
        outline-offset: 2px;
        outline: #a30083 2px solid;
      }

      *:focus {
        box-shadow: 0 0 0 2px #fff, 0 0 0 4px #a30083, 0 0 0 6px #fff !important;
        outline: 2px solid transparent !important;
      }

      form {
        max-width: 920px;
        margin: auto;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 2rem 3rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      h1 {
        font-size: 1.75rem;
        margin-bottom: 2rem;
        color: #003057;
      }

      h2 {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        color: #003057;
      }

      label {
        font-weight: 600;
        margin-bottom: 0.4rem;
        display: block;
      }

      input,
      select {
        width: 100%;
        font-size: 1rem;
        padding: 0.65rem;
        margin-bottom: 1.5rem;
        border: 1px solid black;
        background-color: #fff;
        box-sizing: border-box;
      }

      input:disabled {
        background-color: #f0f0f0;
        color: #666;
      }

      select:disabled {
        background-color: #f0f0f0;
        color: #666;
      }

      button {
        background-color: #0072ce;
        color: #fff;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      button:hover {
        background-color: #005ea2;
      }

      .advanced-inputs {
        background: rgba(0, 0, 0, 0.01);
      }

      h2#results {
        border: 1px solid black;
        padding: 2.5rem 1rem;
        margin-top: 0.75rem;
        background: rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-weight: 600;
        font-size: 1.2rem;
        height: 100%;
        min-height: 4rem;
      }

      h2#results>span {
        color: #0665d0;
        /*   border-bottom: 1px solid #0665d0; */
        font-weight: 900;
        padding-left: 0.5rem;
      }

      .form-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2.5rem;
      }

      .main-inputs,
      .advanced-inputs {
        flex: 1;
        min-width: 300px;
      }

      button[type="button"] {
        background: none;
        color: #0072ce;
        font-weight: 500;
        padding: 1rem 2rem;
        margin-bottom: 1rem;
        outline: 1px solid #0072ce;
      }

      /* button[type="button"]:hover,  button[type="button"]:focus{
    color: black; 
    outline: 1px solid black;
    border: 1px solid white;
    text-decoration: underline;
  } */

      fieldset {
        border: 1px solid black;
        padding: 1rem;
      }

      legend {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #003057;
      }

      .main-inputs p,
      .advanced-inputs p {
        font-size: 0.95rem;
        color: #555;
        margin-top: -0.5rem;
        margin-bottom: 1.5rem;
      }

      button[type="button"].editing-enabled {
        background: #0072ce;
        color: #fff;
        outline: 1px solid #fff;
      }
    </style>
  </head>

  <body>
    <h1>Project Scope Estimator</h1>

    <form aria-labelledby="project-scope-form" id="project-scope-form" runat="server">
      <div class="form-container">

        <fieldset class="main-inputs">
          <legend>Project Details</legend>
          <p>Please complete the form to estimate how long the testing project may take.</p>

          <label for="complexity">Client Testing Complexity:</label>
          <select id="complexity" aria-label="Client Testing Complexity">
            <option value="Standard">Standard</option>
            <option value="Difficult">Difficult</option>
            <option value="Exceptional">Exceptional</option>
          </select>

          <label for="onshore">Onshore Testing Required:</label>
          <select id="onshore" aria-label="Onshore Testing Required">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          <label for="vpat">VPAT Required:</label>
          <select id="vpat" aria-label="VPAT Required">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          <label for="pages">Estimated Number of Pages:</label>
          <input type="number" id="pages" min="1" value="10" aria-label="Estimated Number of Pages" />
        </fieldset>

        <h2 id="results" aria-live="polite"></h2>

        <fieldset class="advanced-inputs">
          <legend>Advanced Settings</legend>
          <p>These are auto-calculated but can be edited by activating the "Enable Editing" button. It is unlikely that you will need to change these fields.</p>

          <button type="button" onclick="toggleAdvancedInputs()">Enable Editing</button>

          <label for="pageEffort">Page Effort:</label>
          <input id="pageEffort" value="4.5" disabled aria-label="Page Effort">

          <label for="scoping">Scoping:</label>
          <input id="scoping" value="10" disabled aria-label="Scoping">

          <label for="vpatTime">VPAT:</label>
          <input id="vpatTime" value="10" disabled aria-label="VPAT Time">

          <label for="triage">Triage & Setup:</label>
          <input id="triage" value="2" disabled aria-label="Triage and Setup">

          <label for="finalReview">Final Review:</label>
          <input id="finalReview" value="0.5" disabled aria-label="Final Review">

          <label for="difficultyMultiplier">Difficulty Multiplier:</label>
          <input id="difficultyMultiplier" value="1" disabled aria-label="Difficulty Multiplier">

          <label for="onshoreMultiplier">Onshore Multiplier:</label>
          <input id="onshoreMultiplier" value="1" disabled aria-label="Onshore Multiplier">
        </fieldset>

      </div>
    </form>

    <script>
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

    </script>
  </body>

  </html>