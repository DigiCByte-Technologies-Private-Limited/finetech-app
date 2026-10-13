/**
 * Loans API Service.
 * Manages loan offerings, active loan accounts, and bank associations.
 */
import { userLoans } from '../data/userProducts';
import { banks } from '../data/banks';

const DELAY_MS = 300;

export const loanTypesData = [
  {
    type: 'personal',
    title: 'Personal Loan',
    icon: 'fa-solid fa-user-tag',
    color: 'indigo',
    rateFrom: '10.5% p.a.',
    description: 'Collateral-free funds for medical expenses, travel, or family needs with 24-hr disbursal.'
  },
  {
    type: 'home',
    title: 'Home Loan',
    icon: 'fa-solid fa-house-chimney',
    color: 'emerald',
    rateFrom: '8.25% p.a.',
    description: 'Affordable financing for buying, constructing, or extending your dream home with up to 30-year tenures.'
  },
  {
    type: 'auto',
    title: 'Auto Loan',
    icon: 'fa-solid fa-car',
    color: 'blue',
    rateFrom: '8.75% p.a.',
    description: 'Quick vehicle loans with up to 100% on-road funding for both new and pre-owned automobiles.'
  },
  {
    type: 'instant',
    title: 'Instant Cash',
    icon: 'fa-solid fa-bolt',
    color: 'amber',
    rateFrom: '1.2% / month',
    description: 'Small-ticket emergency micro-loans with instant digital sanction and immediate bank account transfer.'
  }
];

/**
 * Fetches user's active loan accounts enriched with bank details.
 */
export async function getActiveLoans() {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  return userLoans.map((loan) => {
    const bank = banks.find((b) => b.id === loan.bankId) || {
      id: loan.bankId,
      name: loan.bankId.toUpperCase() + ' Bank',
      icon: 'fa-solid fa-building-columns'
    };

    const remainingMonths = Math.max(0, loan.tenureMonths - loan.paidMonths);
    const progressPercent = Math.min(100, Math.round((loan.paidMonths / loan.tenureMonths) * 100));

    return {
      ...loan,
      bankName: bank.name,
      bankIcon: bank.icon,
      remainingMonths,
      progressPercent
    };
  });
}

/**
 * Fetches available loan product categories.
 */
export async function getLoanTypes() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return [...loanTypesData];
}
