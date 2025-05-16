function formatNumber(num) {
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

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

  for (let key of keys) {
    const v1 = d1[key][0], unit = d1[key][1];
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
    table.innerHTML += `<tr><td>${key}</td><td>${formatNumber(v1)}${diff}</td><td>${unit}</td></tr>`;
  }

  drawChart(d1, d2);
}

function drawChart(d1, d2) {
  const calcScore = d => {
    const s = d.Seats[0], r = d.Range[0], p = d.Price[0], f = d["Fuel Consumption"][0];
    const sp = d["Cruise Speed"][0], a = d["A-Check"][0], m = d["Maintenance Interval"][0];
    const c = d["Crew Total"][0], co = d["CO2 Emission"][0];
    const rw = d["Runway Required"][0], ceil = d["Service Ceiling"][0];
    return [
      p / (s * r) < 40 ? 10 : 8,
      f / s < 1.5 ? 10 : 8,
      sp > 600 ? 10 : 8,
      a / m < 15 ? 10 : 8,
      c <= 2 ? 10 : 6,
      co <= 0.05 ? 10 : 8,
      rw < 3000 ? 10 : 8,
      ceil > 25000 ? 10 : 8
    ];
  };

  const s1 = calcScore(d1);
  const s2 = d2 ? calcScore(d2) : null;
  const avg1 = (s1.reduce((a,b)=>a+b,0)/8).toFixed(2);
  const avg2 = s2 ? (s2.reduce((a,b)=>a+b,0)/8).toFixed(2) : null;
  document.getElementById("scoreBox").innerHTML = `🚀 Efficiency Score: <strong>${avg1}</strong>/10` +
    (avg2 ? (avg1 > avg2 ? ` ↑ +${(avg1 - avg2).toFixed(2)}` : ` ↓ ${(avg2 - avg1).toFixed(2)}`) : "");

  const ctx = document.getElementById("efficiencyChart").getContext("2d");
  if (window.radar) window.radar.destroy();
  window.radar = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Cost", "Fuel", "Speed", "Maintenance", "Crew", "CO₂", "Runway", "Ceiling"],
      datasets: [
        {
          label: "Primary",
          data: s1,
          backgroundColor: "rgba(46,204,113,0.2)",
          borderColor: "#2ecc71",
          borderWidth: 2
        },
        ...(s2 ? [{
          label: "Compare",
          data: s2,
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

window.onload = function () {
  populateDropdowns();
  updateData();
  document.getElementById("aircraft1").addEventListener("change", updateData);
  document.getElementById("aircraft2").addEventListener("change", updateData);
  document.getElementById("modeButton").addEventListener("click", toggleMode);
};

window.radar = null;
