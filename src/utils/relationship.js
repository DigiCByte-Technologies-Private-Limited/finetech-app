/**
 * Bank Relationship Utility.
 * Checks whether the user holds active credit cards or loan accounts with a given bank.
 */

/**
 * Evaluates user's relationship with a specific bank.
 * @param {string} bankId - Identifier of the bank (e.g. 'hdfc', 'sbi', 'icici')
 * @param {Array} cards - User's credit cards list
 * @param {Array} loans - User's active loans list
 * @returns {object} { hasCard, hasLoan, cards, loans, isExistingCustomer }
 */
export function getBankRelationship(bankId, cards = [], loans = []) {
  if (!bankId) {
    return {
      hasCard: false,
      hasLoan: false,
      cards: [],
      loans: [],
      isExistingCustomer: false
    };
  }

  const bankCards = (cards || []).filter((c) => c.bankId === bankId);
  const bankLoans = (loans || []).filter((l) => l.bankId === bankId);

  const hasCard = bankCards.length > 0;
  const hasLoan = bankLoans.length > 0;
  const isExistingCustomer = hasCard || hasLoan;

  return {
    hasCard,
    hasLoan,
    cards: bankCards,
    loans: bankLoans,
    isExistingCustomer
  };
}
