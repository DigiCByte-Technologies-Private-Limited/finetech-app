/**
 * Loan Equated Monthly Instalment (EMI) Calculation Utilities.
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 * where r = annualRate / 12 / 100
 */

/**
 * Calculates monthly EMI, total interest, total payable, and split percentages.
 * @param {number} principal - Loan principal amount (P)
 * @param {number} annualRate - Annual interest rate in percentage
 * @param {number} tenureMonths - Total tenure duration in months (n)
 * @returns {object} { emi, totalInterest, totalPayable, principalPercent, interestPercent }
 */
export function calculateEmi(principal, annualRate, tenureMonths) {
  const p = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  const n = Number(tenureMonths) || 1;

  if (p <= 0 || n <= 0) {
    return {
      emi: 0,
      totalInterest: 0,
      totalPayable: 0,
      principalPercent: 100,
      interestPercent: 0
    };
  }

  // Handle 0% interest rate edge case
  if (rate === 0) {
    const emi = Math.round(p / n);
    return {
      emi,
      totalInterest: 0,
      totalPayable: p,
      principalPercent: 100,
      interestPercent: 0
    };
  }

  const r = rate / 12 / 100;
  const compoundFactor = Math.pow(1 + r, n);
  const emi = Math.round((p * r * compoundFactor) / (compoundFactor - 1));
  const totalPayable = emi * n;
  const totalInterest = Math.max(0, totalPayable - p);

  const principalPercent = Math.min(100, Math.max(0, Math.round((p / totalPayable) * 100)));
  const interestPercent = 100 - principalPercent;

  return {
    emi,
    totalInterest,
    totalPayable,
    principalPercent,
    interestPercent
  };
}

/*
 * =========================================================================
 * SANITY CHECKS & UNIT TESTS (Run mentally or via Node):
 * =========================================================================
 *
 * Check 1: Standard Personal Loan
 * calculateEmi(100000, 12, 12)
 * Expect:
 * - r = 12 / 12 / 100 = 0.01
 * - emi = 100000 * 0.01 * (1.01^12) / (1.01^12 - 1) = ~8,885
 * - totalPayable = 8885 * 12 = 106,620
 * - totalInterest = 6,620
 *
 * Check 2: 5-Year Car Loan
 * calculateEmi(500000, 8.5, 60)
 * Expect:
 * - emi = ~10,258
 * - totalPayable = 615,480
 * - totalInterest = 115,480
 *
 * Check 3: Zero-interest special promotional scheme
 * calculateEmi(120000, 0, 12)
 * Expect:
 * - emi = 120000 / 12 = 10,000
 * - totalInterest = 0
 * - totalPayable = 120,000
 * - principalPercent = 100, interestPercent = 0
 * =========================================================================
 */
