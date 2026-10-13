/**
 * Mock user financial products.
 * Includes cards, loans, insurance policies, and credit score.
 */

// Helper to generate dynamic dates relative to today
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const userCards = [
  {
    id: 'card-1',
    bankId: 'hdfc',
    network: 'Visa',
    last4: '4821',
    limit: 250000,
    used: 82500, // 33% utilization (> 30% warning triggered)
    totalDue: 38400,
    minDue: 3500,
    statementDate: getRelativeDate(-15),
    dueDate: getRelativeDate(3) // 3 days left (triggers red countdown warning)
  },
  {
    id: 'card-2',
    bankId: 'icici',
    network: 'Mastercard',
    last4: '9152',
    limit: 150000,
    used: 31800, // 21.2% utilization (healthy)
    totalDue: 18600,
    minDue: 1800,
    statementDate: getRelativeDate(-20),
    dueDate: getRelativeDate(12) // 12 days left (healthy)
  }
];

export const userLoans = [
  {
    id: 'loan-1',
    bankId: 'hdfc',
    type: 'Home Loan',
    principal: 3500000,
    emi: 31200,
    tenureMonths: 240,
    paidMonths: 48,
    outstanding: 2940000
  },
  {
    id: 'loan-2',
    bankId: 'sbi',
    type: 'Auto Loan',
    principal: 700000,
    emi: 14500,
    tenureMonths: 60,
    paidMonths: 24,
    outstanding: 442000
  }
];

export const userPolicies = [
  {
    id: 'pol-1',
    type: 'Health Insurance',
    insurer: 'Star Health',
    policyNumber: 'SH-884920',
    sumInsured: 1000000,
    premium: 14800,
    expiryDate: getRelativeDate(95)
  },
  {
    id: 'pol-2',
    type: 'Term Life Insurance',
    insurer: 'HDFC Life',
    policyNumber: 'HL-229104',
    sumInsured: 10000000,
    premium: 18500,
    expiryDate: getRelativeDate(180)
  }
];

export const creditScore = 742;
