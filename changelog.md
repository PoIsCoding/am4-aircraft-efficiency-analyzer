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