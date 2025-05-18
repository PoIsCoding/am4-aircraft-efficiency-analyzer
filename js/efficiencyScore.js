const scoreParameters = {
  "Price": { direction: "lower", weight: 2.2 },
  "Seats": { direction: "higher", weight: 2.5 },
  "Fuel Consumption": { direction: "lower", weight: 2.0 },
  "Cruise Speed": { direction: "higher", weight: 2.0 },
  "A-Check": { direction: "lower", weight: 2.0 },
  "Maintenance Interval": { direction: "higher", weight: 2.0 },
  "Crew Total": { direction: "lower", weight: 1.0 },
  "CO2 Emission": { direction: "lower", weight: 2.0 },
  "Runway Required": { direction: "lower", weight: 0.75 },
  "Service Ceiling": { direction: "higher", weight: 1.0 },
  "Engineers": { direction: "lower", weight: 0.5 },
  "Tech": { direction: "lower", weight: 0.5 },
  "Wingspan": { direction: "lower", weight: 0.75 },
  "Length": { direction: "lower", weight: 0.75 }
};

function calculateEfficiencyScore(data, extremes) {
  const scores = {};
  for (const key in scoreParameters) {
    const val = data[key][0];
    const { min, max } = extremes[key];
    const { direction } = scoreParameters[key];
    let score = 0;
    if (max !== min) {
      score = direction === "lower"
        ? ((max - val) / (max - min)) * 10
        : ((val - min) / (max - min)) * 10;
    } else {
      score = 10; // Wenn alle Werte gleich sind
    }
    scores[key] = score;
  }
  return scores;
}

// Make the function globally accessible for usage in main.js and other scripts
window.calculateEfficiencyScore = calculateEfficiencyScore;
window.scoreParameters = scoreParameters;