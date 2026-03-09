/**
 * efficiencyScore.js – Effizienz-Score-Berechnung
 * ============================================================
 * Definiert die Scoring-Parameter (Richtung + Gewichtung)
 * und berechnet den normierten Effizienz-Score (0–10)
 * für ein einzelnes Flugzeug auf Basis der Extremwerte.
 *
 * Normalisierungsformel:
 *  - "lower is better": score = (max - val) / (max - min) * 10
 *  - "higher is better": score = (val - min) / (max - min) * 10
 * ============================================================
 */

/**
 * Scoring-Konfiguration pro Parameter:
 *  - direction: "lower" = niedrigerer Wert ist besser, "higher" = höher ist besser
 *  - weight:    Gewichtungsfaktor für den Gesamtscore
 */
const scoreParameters = {
  'Price':                { direction: 'lower',  weight: 2.2 },
  'Seats':                { direction: 'higher', weight: 2.5 },
  'Fuel Consumption':     { direction: 'lower',  weight: 2.0 },
  'Cruise Speed':         { direction: 'higher', weight: 2.0 },
  'A-Check':              { direction: 'lower',  weight: 2.0 },
  'Maintenance Interval': { direction: 'higher', weight: 2.0 },
  'Crew Total':           { direction: 'lower',  weight: 1.0 },
  'CO2 Emission':         { direction: 'lower',  weight: 2.0 },
  'Runway Required':      { direction: 'lower',  weight: 0.75 },
  'Service Ceiling':      { direction: 'higher', weight: 1.0 },
  'Engineers':            { direction: 'lower',  weight: 0.5 },
  'Tech':                 { direction: 'lower',  weight: 0.5 },
  'Wingspan':             { direction: 'lower',  weight: 0.75 },
  'Length':               { direction: 'lower',  weight: 0.75 }
};

/**
 * Berechnet den normierten Effizienz-Score (0–10) für jeden Parameter.
 *
 * @param {Object} data    - Flugzeugdaten-Objekt (aircraftData[id])
 * @param {Object} extremes - Min/Max-Extremwerte aus calculateMinMax()
 * @returns {Object} Score-Objekt mit einem Wert (0–10) pro Parameter
 *
 * @example
 * const scores = calculateEfficiencyScore(aircraftData["cessna"], extremes);
 * // scores["Price"] => z.B. 9.8
 */
function calculateEfficiencyScore(data, extremes) {
  Logger.debug('efficiencyScore.js', 'calculateEfficiencyScore() gestartet...');

  const scores = {};

  for (const key in scoreParameters) {
    // Wert des Parameters aus dem Flugzeug-Datensatz lesen
    const val       = data[key]?.[0];
    const minMax    = extremes[key];
    const direction = scoreParameters[key].direction;

    // Fehlende Daten abfangen
    if (val === undefined || val === null) {
      Logger.warn('efficiencyScore.js', `Parameter "${key}" fehlt in Flugzeugdaten – Score = 0`);
      scores[key] = 0;
      continue;
    }
    if (!minMax) {
      Logger.warn('efficiencyScore.js', `Keine Extremwerte für "${key}" – Score = 0`);
      scores[key] = 0;
      continue;
    }

    const { min, max } = minMax;
    let score = 0;

    if (max !== min) {
      // Min-Max-Normalisierung auf Skala 0–10
      score = direction === 'lower'
        ? ((max - val) / (max - min)) * 10
        : ((val - min) / (max - min)) * 10;
    } else {
      // Alle Flugzeuge haben denselben Wert → perfekter Score
      score = 10;
      Logger.debug('efficiencyScore.js', `Parameter "${key}" hat überall denselben Wert (${val}) – Score = 10`);
    }

    // Score auf 0–10 begrenzen (Rundungsfehler vermeiden)
    scores[key] = Math.min(10, Math.max(0, score));
  }

  Logger.debug('efficiencyScore.js', 'Scores berechnet:', scores);
  return scores;
}

// Global verfügbar machen (verwendet in main.js)
window.calculateEfficiencyScore = calculateEfficiencyScore;
window.scoreParameters          = scoreParameters;
