/**
 * scoringUtils.js – Hilfsberechnungen für den Effizienz-Score
 * ============================================================
 * Berechnet die globalen Minimum- und Maximum-Werte für jeden
 * Parameter über alle Flugzeuge im Datensatz.
 * Diese Extremwerte werden für die Min-Max-Normalisierung
 * des Effizienz-Scores verwendet.
 * ============================================================
 */

/**
 * Berechnet den kleinsten und größten Wert je Parameter
 * über den gesamten Flugzeug-Datensatz.
 *
 * @param {Object} data - Das vollständige aircraftData-Objekt
 * @returns {Object} Objekt mit { min, max } je Parameter-Key
 *
 * @example
 * const extremes = calculateMinMax(aircraftData);
 * // extremes["Price"] => { min: 51000, max: 9876000 }
 */
function calculateMinMax(data) {
  Logger.info('scoringUtils.js', 'calculateMinMax() gestartet...');

  const extremes = {};
  let count = 0;

  // Jeden Flugzeug-Eintrag durchgehen
  for (const id in data) {
    const plane = data[id];

    // Jeden Parameter des Flugzeugs prüfen
    for (const key in plane) {
      const val = plane[key][0]; // Wert ist immer im Array [0] gespeichert

      if (typeof val !== 'number') {
        // Nicht-numerische Werte überspringen (z.B. Strings)
        Logger.debug('scoringUtils.js', `Überspringe nicht-numerischen Wert: ${id}[${key}] = "${val}"`);
        continue;
      }

      if (!extremes[key]) {
        // Erster Fund: Startwert setzen
        extremes[key] = { min: val, max: val };
      } else {
        // Min/Max aktualisieren
        extremes[key].min = Math.min(extremes[key].min, val);
        extremes[key].max = Math.max(extremes[key].max, val);
      }
    }
    count++;
  }

  Logger.info('scoringUtils.js', `calculateMinMax() abgeschlossen. ${count} Flugzeuge, ${Object.keys(extremes).length} Parameter ausgewertet.`);
  return extremes;
}

// Funktion global verfügbar machen (wird in main.js und efficiencyScore.js verwendet)
window.calculateMinMax = calculateMinMax;
