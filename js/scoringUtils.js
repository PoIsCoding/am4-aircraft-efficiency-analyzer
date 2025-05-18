/**
 * Calculates the minimum and maximum values for each parameter across all aircraft.
 * @param {Object} data - The full aircraft data object.
 * @returns {Object} An object with min and max values for each parameter.
 */
function calculateMinMax(data) {
  const extremes = {};
  for (const id in data) {
    const plane = data[id];
    for (const key in plane) {
      const val = plane[key][0];
      if (!extremes[key]) {
        extremes[key] = { min: val, max: val };
      } else {
        extremes[key].min = Math.min(extremes[key].min, val);
        extremes[key].max = Math.max(extremes[key].max, val);
      }
    }
  }
  return extremes;
}

// Make the function globally accessible
window.calculateMinMax = calculateMinMax;
