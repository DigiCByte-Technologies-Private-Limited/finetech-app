/**
 * Credit card limit utilization utilities.
 * Enforces RBI / financial credit score health rule:
 * Utilization above 30% negatively impacts credit score and flags a high utilization warning.
 */

/**
 * Calculates credit card utilization percentage.
 * @param {number} used - Utilized amount on the card
 * @param {number} limit - Total credit limit
 * @returns {number} Percentage between 0 and 100
 */
export function calculateUtilization(used, limit) {
  if (!limit || limit <= 0) return 0;
  const pct = (used / limit) * 100;
  return Math.round(pct * 10) / 10; // Round to 1 decimal place
}

/**
 * Checks if credit utilization is above recommended 30% threshold.
 * @param {number} used - Utilized amount on the card
 * @param {number} limit - Total credit limit
 * @returns {boolean} True if > 30%
 */
export function isHighUtilization(used, limit) {
  return calculateUtilization(used, limit) > 30;
}

/**
 * Returns utilization details and warning metadata.
 */
export function getUtilizationMeta(used, limit) {
  const percent = calculateUtilization(used, limit);
  const isHigh = percent > 30;
  const available = Math.max(0, limit - used);

  return {
    percent,
    isHigh,
    available,
    statusText: isHigh ? 'High Utilization (>30%)' : 'Healthy Utilization (≤30%)',
    warningMessage: isHigh
      ? 'Credit utilization exceeds 30%. High usage may negatively affect your CIBIL score.'
      : null
  };
}
