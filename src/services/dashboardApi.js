/**
 * Dashboard API Service.
 * Returns user products, banks, and summary calculations with simulated network delay.
 */
import { userCards, userLoans, userPolicies, creditScore } from '../data/userProducts';
import { banks } from '../data/banks';

const SIMULATED_DELAY_MS = 350;

export async function getDashboardData() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  const totalCardDue = userCards.reduce((acc, card) => acc + card.totalDue, 0);
  const totalMonthlyEmi = userLoans.reduce((acc, loan) => acc + loan.emi, 0);

  return {
    creditScore,
    userCards: [...userCards],
    userLoans: [...userLoans],
    userPolicies: [...userPolicies],
    banks: [...banks],
    totalCardDue,
    activeLoansCount: userLoans.length,
    activePoliciesCount: userPolicies.length,
    totalMonthlyEmi
  };
}

export async function getUserCards() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  return [...userCards];
}

export async function getUserLoans() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  return [...userLoans];
}

export async function getUserPolicies() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  return [...userPolicies];
}

export async function getCreditScore() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  return creditScore;
}
