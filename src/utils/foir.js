import { calculateEmi } from './emi';

/**
 * Fixed Obligation to Income Ratio (FOIR) Utility.
 * FOIR = (total existing EMIs + estimated new EMI) ÷ monthly income × 100
 */

/**
 * Calculates FOIR and evaluates loan eligibility bands.
 * @param {number} monthlyIncome - Net monthly income in INR
 * @param {Array} existingLoans - Array of user's active loan objects with .emi property
 * @param {number} newLoanAmount - Requested new loan principal
 * @param {number} newLoanRate - Annual interest rate (%) of selected bank
 * @param {number} newLoanTenure - Repayment tenure in months
 * @returns {object} { foirPercent, estimatedNewEmi, totalExistingEmis, totalMonthlyBurden, status, color, message }
 */
export function calculateFoir(
  monthlyIncome,
  existingLoans = [],
  newLoanAmount = 0,
  newLoanRate = 8.5,
  newLoanTenure = 36
) {
  const income = Number(monthlyIncome) || 1;

  // Calculate existing monthly EMI obligations
  const totalExistingEmis = (existingLoans || []).reduce(
    (sum, l) => sum + (Number(l.emi) || 0),
    0
  );

  // Calculate new EMI using calculateEmi from emi.js
  const { emi: estimatedNewEmi } = calculateEmi(
    newLoanAmount,
    newLoanRate,
    newLoanTenure
  );

  const totalMonthlyBurden = totalExistingEmis + estimatedNewEmi;
  const rawFoir = (totalMonthlyBurden / income) * 100;
  const foirPercent = Math.round(rawFoir * 10) / 10;

  // Evaluate bands: up to 40% (green), 40-50% (orange), above 50% (red)
  if (foirPercent <= 40) {
    return {
      foirPercent,
      estimatedNewEmi,
      totalExistingEmis,
      totalMonthlyBurden,
      status: 'Healthy (Optimal)',
      color: 'emerald',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeClass: 'bg-emerald-500',
      message:
        'Excellent debt-to-income ratio. You have a very high probability of loan sanction at prime interest rates.'
    };
  }

  if (foirPercent <= 50) {
    return {
      foirPercent,
      estimatedNewEmi,
      totalExistingEmis,
      totalMonthlyBurden,
      status: 'Moderate (Manageable)',
      color: 'amber',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeClass: 'bg-amber-500',
      message:
        'Moderate debt burden. The bank may request additional income verification or salary documentation.'
    };
  }

  return {
    foirPercent,
    estimatedNewEmi,
    totalExistingEmis,
    totalMonthlyBurden,
    status: 'High Risk (>50%)',
    color: 'rose',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeClass: 'bg-rose-500',
    message:
      'High debt-to-income ratio. We recommend reducing existing balances or opting for a longer tenure to lower monthly EMI.'
  };
}
