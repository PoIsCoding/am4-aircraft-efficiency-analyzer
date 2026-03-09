/**
 * main.js – Hauptsteuerung der AM4 Analyzer Webapp
 * =====================================================
 * Verantwortlich für:
 *  - Initialisierung der Dropdowns
 *  - Darstellung der Flugzeugdaten in der Tabelle
 *  - Zeichnen des Radar-Charts
 *  - Theme-Toggle (Light / Dark)
 *  - Wiederherstellung der localStorage-Einstellungen
 * =====================================================
 */

// ============================================================
// Globale Hilfsfunktion: Zahlenformat
// ============================================================

/**
 * Formatiert eine Zahl entsprechend der gewählten Locale.
 * Deutsch: 1.234,56 | Englisch: 1,234.56
 * @param {number} num - Die zu formatierende Zahl
 * @returns {string} Formatierter Zahlen-String
 */
function formatNumber(num) {
  const checkbox = document.getElementById('useGermanFormat');
  const locale   = checkbox && checkbox.checked ? 'de-DE' : 'en-US';
  return Number(num).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// ============================================================
// UI Initialisierung – Dropdowns befüllen
// ============================================================

/**
 * Befüllt beide Flugzeug-Dropdowns mit sortierten Namen.
 * Setzt Default-Auswahl: erstes Flugzeug / kein Vergleich.
 */
function populateDropdowns() {
  Logger.info('main.js', 'Befülle Dropdowns mit Flugzeugdaten...');

  const s1 = document.getElementById('aircraft1');
  const s2 = document.getElementById('aircraft2');

  if (!s1 || !s2) {
    Logger.error('main.js', 'Dropdown-Elemente nicht gefunden!');
    return;
  }

  // Vorhandene Optionen löschen und "-- None --" für Vergleichs-Dropdown setzen
  s1.innerHTML = '';
  s2.innerHTML = '<option value="">-- None --</option>';

  // Alphabetisch sortiert einfügen
  const sortedList = [...aircraftList].sort((a, b) => a.name.localeCompare(b.name));
  Logger.debug('main.js', `${sortedList.length} Flugzeuge werden in Dropdowns geladen.`);

  sortedList.forEach(aircraft => {
    const opt1 = document.createElement('option');
    opt1.value = aircraft.id;
    opt1.text  = aircraft.name;
    s1.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = aircraft.id;
    opt2.text  = aircraft.name;
    s2.appendChild(opt2);
  });

  // Standardauswahl setzen
  s1.value = sortedList[0]?.id || '';
  s2.value = '';

  Logger.info('main.js', `Dropdown befüllt. Standard: "${sortedList[0]?.name || 'keiner'}"`);
}

// ============================================================
// Datentabelle aktualisieren
// ============================================================

/**
 * Liest die gewählten Flugzeuge aus, lädt die Daten und
 * befüllt die Vergleichstabelle sowie aktualisiert den Chart.
 */
function updateData() {
  Logger.info('main.js', 'updateData() aufgerufen – Tabelle und Chart werden aktualisiert...');

  const id1 = document.getElementById('aircraft1').value;
  const id2 = document.getElementById('aircraft2').value;
  const d1  = aircraftData[id1];
  const d2  = (id2 && aircraftData[id2]) ? aircraftData[id2] : null;

  // Fehlende Daten abfangen
  if (!d1) {
    Logger.error('main.js', `Keine Daten für Flugzeug ID: "${id1}"`);
    return;
  }

  Logger.debug('main.js', `Primär: "${id1}" | Vergleich: "${id2 || 'keiner'}"`);

  // ---- Flugzeugbilder aktualisieren ----
  const img1 = document.getElementById('img1');
  const img2 = document.getElementById('img2');
  const ac1  = aircraftList.find(a => a.id === id1);
  const ac2  = aircraftList.find(a => a.id === id2);

  if (img1 && ac1) {
    img1.src   = `./images/${ac1.image}`;
    img1.style.display = 'block';
    Logger.debug('main.js', `Bild 1 geladen: ./images/${ac1.image}`);
  } else if (img1) {
    img1.style.display = 'none';
  }

  if (img2 && ac2 && id2) {
    img2.src   = `./images/${ac2.image}`;
    img2.style.display = 'block';
    Logger.debug('main.js', `Bild 2 geladen: ./images/${ac2.image}`);
  } else if (img2) {
    img2.style.display = 'none';
  }

  // ---- Tabelle befüllen ----
  const table = document.getElementById('data-table');
  if (!table) {
    Logger.error('main.js', 'Tabellen-Element #data-table nicht gefunden!');
    return;
  }
  table.innerHTML = '';

  // Parameter in gewünschter Reihenfolge
  const keys = [
    'Price', 'Seats', 'Range', 'Fuel Consumption', 'CO2 Emission',
    'Cruise Speed', 'A-Check', 'Maintenance Interval', 'Runway Required',
    'Service Ceiling', 'Crew Total', 'Engineers', 'Tech', 'Wingspan', 'Length'
  ];

  // Definiert, welche Werte besser sind wenn HÖHER (grün wenn Primär > Vergleich)
  const betterIfHigher = ['Seats', 'Range', 'Cruise Speed', 'Maintenance Interval', 'Service Ceiling'];
  // Definiert, welche Werte besser sind wenn NIEDRIGER (grün wenn Primär < Vergleich)
  const betterIfLower  = ['Price', 'Fuel Consumption', 'A-Check', 'Crew Total', 'Engineers', 'Tech', 'CO2 Emission', 'Runway Required', 'Wingspan', 'Length'];

  const showCompare = document.getElementById('showCompareValues')?.checked;
  const unitMap     = (typeof translations !== 'undefined' && translations.units) ? translations.units : {};

  Logger.debug('main.js', `Tabellenzeilen werden generiert (${keys.length} Parameter)...`);

  keys.forEach(key => {
    const v1       = d1[key]?.[0];
    const keyLabel = key.toLowerCase().replace(/[\s-]/g, '_');
    const unit     = unitMap[keyLabel] || '';
    const v2       = d2 && d2[key] ? d2[key][0] : null;

    // Differenz-Anzeige berechnen
    let diff = '';
    if (v2 !== null && v1 !== undefined) {
      const delta = v1 - v2;

      if (betterIfHigher.includes(key)) {
        // Höher = besser → positiver Delta = grün
        if (delta > 0)      diff = ` <span class="diff-green">↑ +${formatNumber(delta)}</span>`;
        else if (delta < 0) diff = ` <span class="diff-red">↓ ${formatNumber(Math.abs(delta))}</span>`;
      } else if (betterIfLower.includes(key)) {
        // Niedriger = besser → negativer Delta = grün
        if (delta > 0)      diff = ` <span class="diff-red">↑ +${formatNumber(delta)}</span>`;
        else if (delta < 0) diff = ` <span class="diff-green">↓ ${formatNumber(Math.abs(delta))}</span>`;
      } else {
        // Neutral
        if (delta > 0)      diff = ` <span class="diff-green">↑ +${formatNumber(delta)}</span>`;
        else if (delta < 0) diff = ` <span class="diff-red">↓ ${formatNumber(Math.abs(delta))}</span>`;
      }
    }

    // Vergleichswert optional einblenden
    const compareText = showCompare && v2 !== null
      ? `<br><span style="color: var(--color-muted); font-size: 0.8em;">${formatNumber(v2)}</span>`
      : '';

    // Übersetzten Label-Text ermitteln (Fallback: Originalkey)
    const labelText = (typeof translations !== 'undefined' && translations[keyLabel]) || key;

    // Tabellenzeile einfügen
    const tr  = document.createElement('tr');
    tr.innerHTML = `
      <td data-label-key="${keyLabel}">${labelText}</td>
      <td>${v1 !== undefined ? formatNumber(v1) : '–'}${compareText}${diff}</td>
      <td>${unit}</td>
    `;
    table.appendChild(tr);
  });

  Logger.debug('main.js', 'Tabellenzeilen fertig. Zeichne Chart...');

  // ---- Radar-Chart zeichnen ----
  drawChart(d1, d2);
}

// ============================================================
// Radar-Chart zeichnen
// ============================================================

/**
 * Berechnet die Effizienz-Scores und rendert den Radar-Chart.
 * Aktualisiert auch die Score-Box mit dem gewichteten Durchschnitt.
 * @param {Object} d1 - Daten des Primär-Flugzeugs
 * @param {Object|null} d2 - Daten des Vergleichs-Flugzeugs (optional)
 */
function drawChart(d1, d2) {
  Logger.info('main.js', 'drawChart() gestartet...');

  // Min/Max-Extremwerte aus dem gesamten Datensatz berechnen
  const extremes = typeof calculateMinMax === 'function'
    ? calculateMinMax(aircraftData)
    : {};

  if (typeof calculateEfficiencyScore !== 'function') {
    Logger.error('main.js', 'calculateEfficiencyScore nicht definiert! Bitte efficiencyScore.js prüfen.');
    return;
  }

  // Effizienz-Scores berechnen
  const s1obj = calculateEfficiencyScore(d1, extremes);
  const s2obj = d2 ? calculateEfficiencyScore(d2, extremes) : null;

  // Gewichteten Durchschnitt berechnen
  const weights = Object.keys(s1obj).map(k => window.scoreParameters?.[k]?.weight || 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const avg1 = (
    Object.keys(s1obj).reduce((sum, key, i) => sum + s1obj[key] * weights[i], 0) / totalWeight
  ).toFixed(2);
  const avg2 = s2obj
    ? (Object.keys(s2obj).reduce((sum, key, i) => sum + s2obj[key] * weights[i], 0) / totalWeight).toFixed(2)
    : null;

  Logger.debug('main.js', `Score Primär: ${avg1} | Score Vergleich: ${avg2 ?? 'n/a'}`);

  // Score-Box Text setzen
  const scoreLabel = (typeof translations !== 'undefined' && translations.efficiency_score) || 'Efficiency Score';
  const diffText   = avg2
    ? (parseFloat(avg1) >= parseFloat(avg2)
        ? ` <span style="color: var(--color-green)">↑ +${(avg1 - avg2).toFixed(2)}</span>`
        : ` <span style="color: var(--color-red)">↓ ${(avg2 - avg1).toFixed(2)}</span>`)
    : '';
  document.getElementById('scoreBox').innerHTML =
    `🚀 ${scoreLabel}: <strong>${avg1}</strong>/10${diffText}`;

  // ---- Radar-Chart konfigurieren ----
  const ctx = document.getElementById('efficiencyChart').getContext('2d');

  // Alten Chart zerstören, falls vorhanden
  if (window.radar) {
    window.radar.destroy();
    Logger.debug('main.js', 'Alter Radar-Chart zerstört.');
  }

  // Gewählte Radar-Parameter aus den Checkboxen lesen
  const radarToggles     = document.querySelectorAll('.radar-toggle');
  const selectedRadarKeys = Array.from(radarToggles)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  Logger.debug('main.js', `Ausgewählte Radar-Parameter: ${selectedRadarKeys.join(', ')}`);

  // Mapping von Radar-Checkbox-Values auf Übersetzungs-Keys / Labels
  const paramLabels = {
    price:                (typeof translations !== 'undefined' && translations.price)                || 'Price',
    fuel_consumption:     (typeof translations !== 'undefined' && translations.fuel_consumption)     || 'Fuel',
    cruise_speed:         (typeof translations !== 'undefined' && translations.cruise_speed)         || 'Speed',
    a_check:              (typeof translations !== 'undefined' && translations.a_check)              || 'A-Check',
    maintenance_interval: (typeof translations !== 'undefined' && translations.maintenance_interval) || 'Maint.',
    crew_total:           (typeof translations !== 'undefined' && translations.crew_total)           || 'Crew',
    co2_emission:         (typeof translations !== 'undefined' && translations.co2_emission)         || 'CO₂',
    runway_required:      (typeof translations !== 'undefined' && translations.runway_required)      || 'Runway',
    service_ceiling:      (typeof translations !== 'undefined' && translations.service_ceiling)      || 'Ceiling',
    engineers:            (typeof translations !== 'undefined' && translations.engineers)            || 'Eng.',
    tech:                 (typeof translations !== 'undefined' && translations.tech)                 || 'Tech',
    wingspan:             (typeof translations !== 'undefined' && translations.wingspan)             || 'Wingspan',
    length:               (typeof translations !== 'undefined' && translations.length)               || 'Length'
  };

  // Mapping von Radar-Key zu Score-Objekt-Key
  const radarKeyToScoreKey = {
    price:                'Price',
    fuel_consumption:     'Fuel Consumption',
    cruise_speed:         'Cruise Speed',
    a_check:              'A-Check',
    maintenance_interval: 'Maintenance Interval',
    crew_total:           'Crew Total',
    co2_emission:         'CO2 Emission',
    runway_required:      'Runway Required',
    service_ceiling:      'Service Ceiling',
    engineers:            'Engineers',
    tech:                 'Tech',
    wingspan:             'Wingspan',
    length:               'Length'
  };

  const labels  = selectedRadarKeys.map(k => paramLabels[k]);
  const s1data  = selectedRadarKeys.map(k => s1obj[radarKeyToScoreKey[k]] ?? 0);
  const s2data  = s2obj ? selectedRadarKeys.map(k => s2obj[radarKeyToScoreKey[k]] ?? 0) : null;
  const primaryLabel = (typeof translations !== 'undefined' && translations.primary) || 'Primary';
  const compareLabel = (typeof translations !== 'undefined' && translations.compare) || 'Compare';

  // Chart rendern
  window.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label:           primaryLabel,
          data:            s1data,
          backgroundColor: 'rgba(0, 230, 118, 0.15)',
          borderColor:     '#00e676',
          borderWidth:     2,
          pointBackgroundColor: '#00e676',
          pointRadius: 3
        },
        ...(s2data ? [{
          label:           compareLabel,
          data:            s2data,
          backgroundColor: 'rgba(0, 212, 255, 0.12)',
          borderColor:     '#00d4ff',
          borderWidth:     2,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 3
        }] : [])
      ]
    },
    options: {
      animation: { duration: 400 },
      plugins: {
        legend: {
          labels: {
            color: '#c8d6f0',
            font: { family: "'Rajdhani', sans-serif", size: 12 }
          }
        }
      },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 10,
          ticks:       { color: '#8899bb', backdropColor: 'transparent', stepSize: 2 },
          grid:        { color: 'rgba(42, 53, 80, 0.8)' },
          angleLines:  { color: 'rgba(42, 53, 80, 0.8)' },
          pointLabels: {
            color: '#a8b8d0',
            font: { family: "'Rajdhani', sans-serif", size: 11 }
          }
        }
      }
    }
  });

  Logger.info('main.js', 'Radar-Chart erfolgreich gezeichnet.');
}

// ============================================================
// Radar-Chart Labels aktualisieren (nach Sprachwechsel)
// ============================================================

/**
 * Aktualisiert die Labels des bestehenden Radar-Charts
 * wenn die Sprache gewechselt wurde.
 */
function updateRadarChartLabels() {
  Logger.debug('main.js', 'updateRadarChartLabels() aufgerufen.');
  // updateData() zeichnet den Chart komplett neu – das reicht hier
  if (window.radar) {
    drawChart(
      aircraftData[document.getElementById('aircraft1').value],
      aircraftData[document.getElementById('aircraft2').value] || null
    );
  }
}

// ============================================================
// Theme Toggle (Light / Dark)
// ============================================================

/**
 * Wechselt zwischen Light- und Dark-Mode.
 * Speichert Präferenz in localStorage.
 */
function toggleMode() {
  const body      = document.body;
  const isDark    = body.classList.contains('dark-mode');
  const modeBtn   = document.getElementById('modeButton');

  if (isDark) {
    body.classList.replace('dark-mode', 'light-mode');
    if (modeBtn) modeBtn.textContent = '🌙 Dark Mode';
    localStorage.setItem('theme', 'light');
    Logger.info('main.js', 'Theme: Light Mode aktiviert.');
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    if (modeBtn) modeBtn.textContent = '☀️ Light Mode';
    localStorage.setItem('theme', 'dark');
    Logger.info('main.js', 'Theme: Dark Mode aktiviert.');
  }
}

// ============================================================
// localStorage zurücksetzen
// ============================================================

/**
 * Löscht alle gespeicherten Benutzereinstellungen und lädt neu.
 */
function resetLocalStorage() {
  Logger.warn('main.js', 'Alle localStorage-Daten werden gelöscht!');
  localStorage.clear();
  location.reload();
}

// ============================================================
// Window Load – Initialisierung
// ============================================================

window.onload = function () {
  Logger.info('main.js', '=== AM4 Analyzer wird initialisiert ===');

  // Dropdowns befüllen
  populateDropdowns();

  // ---- Einstellungen aus localStorage wiederherstellen ----
  Logger.debug('main.js', 'Lade gespeicherte Einstellungen aus localStorage...');

  // Radar-Checkboxen
  const savedRadar = JSON.parse(localStorage.getItem('selectedRadarParams') || '[]');
  if (savedRadar.length > 0) {
    document.querySelectorAll('.radar-toggle').forEach(cb => {
      cb.checked = savedRadar.includes(cb.value);
    });
    Logger.debug('main.js', `Radar-Parameter wiederhergestellt: ${savedRadar.join(', ')}`);
  } else {
    // Erststart: alle aktivieren und in localStorage sichern
    const allValues = Array.from(document.querySelectorAll('.radar-toggle')).map(el => el.value);
    localStorage.setItem('selectedRadarParams', JSON.stringify(allValues));
    Logger.debug('main.js', 'Erststart: alle Radar-Parameter aktiviert.');
  }

  // Zahlenformat
  const savedFormat  = localStorage.getItem('useGermanFormat') === 'true';
  const formatToggle = document.getElementById('useGermanFormat');
  if (formatToggle) {
    formatToggle.checked = savedFormat;
    Logger.debug('main.js', `Zahlenformat: ${savedFormat ? 'Deutsch' : 'Englisch'}`);
  }

  // Vergleichswerte in Tabelle
  const savedCompare  = localStorage.getItem('showCompareValues') === 'true';
  const compareToggle = document.getElementById('showCompareValues');
  if (compareToggle) compareToggle.checked = savedCompare;

  // Theme (Light/Dark)
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = savedTheme === 'light' ? 'light-mode' : 'dark-mode';
  const modeBtn = document.getElementById('modeButton');
  if (modeBtn) modeBtn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
  Logger.debug('main.js', `Theme wiederhergestellt: ${savedTheme}`);

  // ---- Initiale Datenanzeige ----
  updateData();

  // ---- Event Listener registrieren ----
  Logger.debug('main.js', 'Event Listener werden registriert...');

  const aircraft1 = document.getElementById('aircraft1');
  const aircraft2 = document.getElementById('aircraft2');

  if (aircraft1) aircraft1.addEventListener('change', () => {
    Logger.info('main.js', `Primär-Flugzeug gewechselt: "${aircraft1.value}"`);
    updateData();
  });

  if (aircraft2) aircraft2.addEventListener('change', () => {
    Logger.info('main.js', `Vergleichs-Flugzeug gewechselt: "${aircraft2.value}"`);
    updateData();
  });

  if (modeBtn) modeBtn.addEventListener('click', toggleMode);

  // Zahlenformat speichern + Tabelle neu laden
  if (formatToggle) {
    formatToggle.addEventListener('change', (e) => {
      localStorage.setItem('useGermanFormat', e.target.checked);
      Logger.debug('main.js', `Zahlenformat Toggle: ${e.target.checked}`);
      updateData();
    });
  }

  // Vergleichswerte speichern + Tabelle neu laden
  if (compareToggle) {
    compareToggle.addEventListener('change', (e) => {
      localStorage.setItem('showCompareValues', e.target.checked);
      Logger.debug('main.js', `Vergleichswerte Toggle: ${e.target.checked}`);
      updateData();
    });
  }

  // Radar-Checkboxen: Auswahl in localStorage speichern und Chart neu zeichnen
  document.querySelectorAll('.radar-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('.radar-toggle'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      localStorage.setItem('selectedRadarParams', JSON.stringify(selected));
      Logger.debug('main.js', `Radar-Parameter aktualisiert: ${selected.join(', ')}`);
      updateData();
    });
  });

  // Settings-Menü-Toggle
  const settingsBtn  = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', () => {
      settingsMenu.classList.toggle('hidden');
      Logger.debug('main.js', `Settings-Menü ${settingsMenu.classList.contains('hidden') ? 'geschlossen' : 'geöffnet'}`);
    });

    // Menü schließen wenn außerhalb geklickt wird
    document.addEventListener('click', (e) => {
      if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.add('hidden');
      }
    });
  }

  Logger.info('main.js', '=== Initialisierung abgeschlossen ===');
};

// Globale Chart-Referenz für Destroy/Neuzeichnen
window.radar = null;
