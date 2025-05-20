## [1.2.2] - 2025-05-20

### Added
- Generated sitemap.xml to improve indexing and search engine visibility.
- Integrated sitemap support and submitted via Google Search Console.

### Changed
- Clarified first-load behavior for radar parameter defaults in localStorage.
- Enhanced changelog to reflect recent sitemap and SEO-related additions.

## [1.2.1] - 2025-05-20

### Added
- Reset button in settings to clear all saved localStorage preferences.
- Default activation of all radar chart checkboxes on first page load.
- Persistent localStorage saving for radar checkbox state.

### Changed
- Radar chart settings now default to all parameters selected on first page load.
- Added check to store default radar settings in localStorage only if not already set.
- `sitemap.xml` generation and integration for improved SEO and discoverability.
- Spaltenüberschriften umbrechen sich nun automatisch bei Platzmangel.
- Tooltip-Anzeige für alle Spaltentitel in der Übersichtstabelle ergänzt.
- Breite der ersten Spalte angepasst, sodass Flugzeugnamen immer vollständig sichtbar sind.
- Neue Einstellung zum vollständigen Zurücksetzen aller lokalen Daten (localStorage).

## [1.2.0] - 2025-05-20

### Added
- New aircraft overview table with sortable columns and all aircraft parameters.
- Option to switch between languages via JSON-based translations.
- User settings (language, radar parameters, formatting) now persist in localStorage.
- Efficiency Score now displayed directly in aircraft table.
- Scrollable table layout with sticky first column and responsive design.
- Tooltips for column headers showing full parameter names.

### Changed
- Improved column alignment and consistent number formatting based on user locale.
- Auto-wrapping and hyphenation enabled for long table headers.
- Visual enhancements to keep layout readable across devices.

## [1.1.1] - 2025-05-18

### Added
- Dynamic normalization for each parameter in the efficiency score based on min/max values.
- Weighting system per parameter in `efficiencyScore.js` for more precise control.
- `Seats` and `Maintenance Interval` now contribute to the overall efficiency score.
- Option in settings to include/exclude specific parameters from the radar chart.
- Dynamic scaling for each efficiency parameter using min/max normalization.
- New weighting system in `efficiencyScore.js` to adjust importance per metric.
- `Seats` and `Maintenance Interval` now factor into the efficiency score.
- Settings panel now includes toggle options for which metrics appear in the radar chart.

### Changed
- Score calculation no longer uses fixed assumptions but adapts based on aircraft dataset.
- Radar chart updates now reflect current score parameters and translation settings.
- Efficiency scores now adapt based on aircraft dataset extremes instead of fixed formulas.
- Radar chart translation and display fully synced with current settings and language.

### Fixed
- Bug where the comparison aircraft did not display in the radar chart.
- `ReferenceError: a is not defined` in `main.js`.
- Various console warnings and errors during language switch and redraws.
- Bug where the comparison aircraft wouldn't display in the radar chart.
- Console error `ReferenceError: a is not defined` in `main.js`.
- Language sync issues and redraw glitches during language changes.

### Notes
- Code structure improved for easier maintenance.
- Refactored code structure for maintainability.