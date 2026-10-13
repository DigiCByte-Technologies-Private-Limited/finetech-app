/**
 * Loan Application API Service.
 * Simulates submitting loan applications to partner banks.
 */

const SUBMIT_DELAY_MS = 600;

/**
 * Submits the completed loan application package.
 * @param {object} applicationData - Application form, bank details, and document metadata
 * @returns {Promise<object>} Application reference details
 */
export async function submitLoanApplication(applicationData) {
  await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS));

  const randomRef = Math.floor(1000 + Math.random() * 9000);
  const applicationId = `APP-2026-${randomRef}`;

  return {
    success: true,
    applicationId,
    status: 'Submitted',
    bankName: applicationData.bankName || 'Partner Bank',
    loanType: applicationData.loanType || 'Personal Loan',
    loanAmount: applicationData.amount || 500000,
    tenureMonths: applicationData.tenureMonths || 36,
    submittedAt: new Date().toISOString()
  };
}
