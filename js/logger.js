/**
 * logger.js – Zentrales Logging-Modul
 * =====================================================
 * Bietet einheitliche Log-Ausgaben mit Zeitstempel,
 * Log-Level und optionaler Kontext-Information.
 * Logs sind im Browser-DevTools-Konsole sichtbar.
 * =====================================================
 */

const Logger = (() => {
  // Log-Level Definition (je höher die Zahl, desto weniger Output)
  const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

  // Aktuelles Mindest-Level (kann für Produktion auf WARN gesetzt werden)
  let currentLevel = LEVELS.DEBUG;

  /**
   * Gibt einen formatierten Zeitstempel zurück.
   * @returns {string} z.B. "14:32:07.452"
   */
  function timestamp() {
    const now = new Date();
    return now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
  }

  /**
   * Interne Log-Funktion – baut die Nachricht auf und gibt sie aus.
   * @param {string} level  - Log-Level als Text
   * @param {string} module - Name des aufrufenden Moduls (z.B. "main.js")
   * @param {string} msg    - Die eigentliche Log-Nachricht
   * @param {...*}   args   - Optionale weitere Argumente (Objekte, etc.)
   */
  function log(level, module, msg, ...args) {
    if (LEVELS[level] < currentLevel) return;

    const prefix = `[${timestamp()}] [${level.padEnd(5)}] [${module}]`;

    switch (level) {
      case 'DEBUG': console.debug(`%c${prefix}`, 'color:#8899bb', msg, ...args); break;
      case 'INFO':  console.info( `%c${prefix}`, 'color:#00d4ff', msg, ...args); break;
      case 'WARN':  console.warn( `%c${prefix}`, 'color:#ffd32a', msg, ...args); break;
      case 'ERROR': console.error(`%c${prefix}`, 'color:#ff4757', msg, ...args); break;
      default:      console.log(prefix, msg, ...args);
    }
  }

  // Öffentliche API
  return {
    debug: (module, msg, ...args) => log('DEBUG', module, msg, ...args),
    info:  (module, msg, ...args) => log('INFO',  module, msg, ...args),
    warn:  (module, msg, ...args) => log('WARN',  module, msg, ...args),
    error: (module, msg, ...args) => log('ERROR', module, msg, ...args),

    /**
     * Setzt das Mindest-Log-Level.
     * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
     */
    setLevel: (level) => {
      if (LEVELS[level] !== undefined) {
        currentLevel = LEVELS[level];
        log('INFO', 'Logger', `Log-Level gesetzt auf: ${level}`);
      }
    }
  };
})();

// Globally verfügbar machen
window.Logger = Logger;
