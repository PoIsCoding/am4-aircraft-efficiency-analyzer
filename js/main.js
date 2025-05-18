// Import efficiencyScore.js if using ES6 modules
// import './efficiencyScore.js';
let useGermanFormat = false;

// === Global Variables & Helpers ===

// Format a number according to the selected locale (German or US) with up to 2 decimal places
function formatNumber(num) {
  const checkbox = document.getElementById("useGermanFormat");
  const locale = checkbox && checkbox.checked ? "de-DE" : "en-US";
  return Number(num).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// === UI Initialization ===

// Populate the aircraft dropdowns with sorted aircraft names, setting default selections
function populateDropdowns() {
  const s1 = document.getElementById("aircraft1");
  const s2 = document.getElementById("aircraft2");
  s1.innerHTML = "";
  s2.innerHTML = '<option value="">-- None --</option>';

  const sortedList = [...aircraftList].sort((a, b) => a.name.localeCompare(b.name));
  sortedList.forEach(a => {
    const option1 = document.createElement("option");
    option1.value = a.id;
    option1.text = a.name;
    s1.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = a.id;
    option2.text = a.name;
    s2.appendChild(option2);
  });

  s1.value = sortedList[0]?.id || "";
  s2.value = "";
}

// === Data Handling & Table Update ===

// Update the displayed aircraft data and comparison table based on selected aircraft
function updateData() {
  const id1 = document.getElementById("aircraft1").value;
  const id2 = document.getElementById("aircraft2").value;
  const d1 = aircraftData[id1];
  const d2 = (id2 && aircraftData[id2]) ? aircraftData[id2] : null;

  const img1 = document.getElementById("img1");
  const img2 = document.getElementById("img2");
  const ac1 = aircraftList.find(a => a.id === id1);
  const ac2 = aircraftList.find(a => a.id === id2);

  img1.src = ac1 ? `./images/${ac1.image}` : "";
  img1.style.display = ac1 ? "block" : "none";
  img2.src = ac2 && id2 !== "" ? `./images/${ac2.image}` : "";
  img2.style.display = ac2 && id2 !== "" ? "block" : "none";

  const table = document.getElementById("data-table");
  table.innerHTML = "";

  const keys = [
    "Price", "Seats", "Range", "Fuel Consumption", "CO2 Emission",
    "Cruise Speed", "A-Check", "Maintenance Interval", "Runway Required", "Service Ceiling",
    "Crew Total", "Engineers", "Tech", "Wingspan", "Length"
  ];

  const betterIfHigher = ["Seats", "Range", "Cruise Speed", "Maintenance Interval", "Service Ceiling"];
  const betterIfLower = ["Price", "Fuel Consumption", "A-Check", "Crew Total", "Engineers", "Tech", "CO2 Emission", "Runway Required", "Wingspan", "Length"];

  // For each key, display the primary aircraft's value, and if comparison selected, show difference with color-coded arrows
  for (let key of keys) {
    const v1 = d1[key][0];
    const keyLabel = key.toLowerCase().replace(/[\s-]/g, "_");
    const unitMap = translations.units || {};
    const unit = unitMap[keyLabel] || "";
    const v2 = d2 && d2[key] ? d2[key][0] : null;
    let diff = "";
    if (v2 !== null) {
      const delta = v1 - v2;
      if (betterIfHigher.includes(key)) {
        diff = delta > 0 ? ` <span class="diff-green">↑ +${formatNumber(delta)}</span>` : delta < 0 ? ` <span class="diff-red">↓ ${formatNumber(Math.abs(delta))}</span>` : "";
      } else if (betterIfLower.includes(key)) {
        diff = delta > 0 ? ` <span class="diff-red">↑ +${formatNumber(delta)}</span>` : delta < 0 ? ` <span class="diff-green">↓ ${formatNumber(Math.abs(delta))}</span>` : "";
      } else {
        diff = delta > 0 ? ` <span class="diff-green">↑ +${formatNumber(delta)}</span>` : delta < 0 ? ` <span class="diff-red">↓ ${formatNumber(Math.abs(delta))}</span>` : "";
      }
    }
    const showCompare = document.getElementById("showCompareValues")?.checked;
    const compareText = showCompare && v2 !== null ? `<br><span style="color: #aaa;">${formatNumber(v2)}</span>` : "";
    const labelText = translations[keyLabel] || key;
    table.innerHTML += `<tr><td data-label-key="${keyLabel}">${labelText}</td><td>${formatNumber(v1)}${compareText}${diff}</td><td>${unit}</td></tr>`;
  }

  drawChart(d1, d2);
}

// === Efficiency Chart ===

// Calculate efficiency scores and build radar chart comparing selected aircraft
function drawChart(d1, d2) {
  const extremes = typeof calculateMinMax === "function" ? calculateMinMax(aircraftData) : {};
  if (typeof calculateEfficiencyScore !== "function") {
    console.error("calculateEfficiencyScore is not defined or not loaded");
    return;
  }
  const s1obj = typeof calculateEfficiencyScore === "function" ? calculateEfficiencyScore(d1, extremes) : {};
  const s1 = Object.values(s1obj);

  const s2obj = d2 ? calculateEfficiencyScore(d2, extremes) : null;
  const s2 = s2obj ? Object.values(s2obj) : null;

  // Weighted average calculation
  const weights = Object.keys(s1obj).map(k => window.scoreParameters?.[k]?.weight || 1);
  const avg1 = (Object.keys(s1obj).reduce((sum, key, i) => sum + s1obj[key] * weights[i], 0) / weights.reduce((a,b)=>a+b)).toFixed(2);
  const avg2 = s2obj ? (Object.keys(s2obj).reduce((sum, key, i) => sum + s2obj[key] * weights[i], 0) / weights.reduce((a,b) => a + b)).toFixed(2) : null;
  document.getElementById("scoreBox").innerHTML = `🚀 ${translations.efficiency_score}: <strong>${avg1}</strong>/10` +
    (avg2 ? (avg1 > avg2 ? ` ↑ +${(avg1 - avg2).toFixed(2)}` : ` ↓ ${(avg2 - avg1).toFixed(2)}`) : "");

  const ctx = document.getElementById("efficiencyChart").getContext("2d");
  if (window.radar) window.radar.destroy();

  const radarToggles = document.querySelectorAll('.radar-toggle');
  const selectedRadarKeys = Array.from(radarToggles)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const paramLabels = {
    price: translations.price || "Price",
    fuel_consumption: translations.fuel_consumption || "Fuel",
    cruise_speed: translations.cruise_speed || "Speed",
    a_check: translations.a_check || "A-Check",
    maintenance_interval: translations.maintenance_interval || "Maint. Int.",
    crew_total: translations.crew_total || "Crew",
    co2_emission: translations.co2_emission || "CO₂",
    runway_required: translations.runway_required || "Runway",
    service_ceiling: translations.service_ceiling || "Ceiling",
    engineers: translations.engineers || "Engineers",
    tech: translations.tech || "Tech",
    wingspan: translations.wingspan || "Wingspan",
    length: translations.length || "Length"
  };

  const labels = selectedRadarKeys.map(k => paramLabels[k]);

  const radarKeyToScoreKey = {
    price: "Price",
    fuel_consumption: "Fuel Consumption",
    cruise_speed: "Cruise Speed",
    a_check: "A-Check",
    maintenance_interval: "Maintenance Interval",
    crew_total: "Crew Total",
    co2_emission: "CO2 Emission",
    runway_required: "Runway Required",
    service_ceiling: "Service Ceiling",
    engineers: "Engineers",
    tech: "Tech",
    wingspan: "Wingspan",
    length: "Length"
  };

  const s1data = selectedRadarKeys.map(k => s1obj[radarKeyToScoreKey[k]]);
  const s2data = s2obj ? selectedRadarKeys.map(k => s2obj[radarKeyToScoreKey[k]]) : null;

  window.radar = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: (typeof translations !== "undefined" && translations.primary) || "Primary",
          data: s1data,
          backgroundColor: "rgba(46,204,113,0.2)",
          borderColor: "#2ecc71",
          borderWidth: 2
        },
        ...(s2 ? [{
          label: (typeof translations !== "undefined" && translations.compare) || "Compare",
          data: s2data,
          backgroundColor: "rgba(52,152,219,0.2)",
          borderColor: "#3498db",
          borderWidth: 2
        }] : [])
      ]
    },
    options: {
      scales: { r: { suggestedMin: 0, suggestedMax: 10 } }
    }
  });
}

// === Theme Toggle ===

// Switch between light and dark mode, updating button text accordingly
function toggleMode() {
  const body = document.body;
  const modeButton = document.getElementById("modeButton");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
    modeButton.textContent = "Light Mode";
  } else {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    modeButton.textContent = "Dark Mode";
  }
}

// === Window Load Event ===

// On window load, initialize dropdowns, update data display, and set event listeners for UI interactions
window.onload = function () {
  populateDropdowns();
  updateData();
  const aircraft1 = document.getElementById("aircraft1");
  const aircraft2 = document.getElementById("aircraft2");
  const modeBtn = document.getElementById("modeButton");
  const germanFormatToggle = document.getElementById("useGermanFormat");

  if (aircraft1) aircraft1.addEventListener("change", updateData);
  if (aircraft2) aircraft2.addEventListener("change", updateData);
  if (modeBtn) modeBtn.addEventListener("click", toggleMode);
  if (germanFormatToggle) germanFormatToggle.addEventListener("change", updateData);
};

window.radar = null;
