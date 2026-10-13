/**
 * Insurance API Service.
 * Computes dynamic insurance quotes based on user input parameters and returns comparison plans.
 */
import { baseInsurancePlans } from '../data/insurancePlans';

const DELAY_MS = 350;

/**
 * Calculates dynamic quotes for a given insurance category and user inputs.
 * @param {string} category - 'health' | 'term' | 'motor' | 'travel'
 * @param {object} formData - Form input parameters
 * @returns {Promise<Array>} List of 4 generated comparison plans with highlighted best CSR and lowest premium
 */
export async function getInsurancePlans(category, formData = {}) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  const plans = baseInsurancePlans[category.toLowerCase()] || baseInsurancePlans.health;

  // Compute category-specific multiplier
  let multiplier = 1.0;

  if (category === 'health') {
    const age = Number(formData.age) || 30;
    if (age > 45) {
      multiplier += (age - 45) * 0.025; // 2.5% per year above 45
    } else if (age < 25) {
      multiplier -= 0.1; // 10% discount for youth
    }
    if (formData.preExisting === 'yes') {
      multiplier += 0.25; // 25% pre-existing condition loading
    }
  } else if (category === 'term') {
    const age = Number(formData.age) || 30;
    if (age > 35) {
      multiplier += (age - 35) * 0.03;
    }
    if (formData.smoker === 'yes') {
      multiplier += 0.4; // 40% tobacco smoker risk loading
    }
    const cover = Number(formData.coverAmount) || 10000000;
    multiplier *= cover / 10000000; // Scales with sum assured
  } else if (category === 'motor') {
    if (formData.vehicleType === 'bike') {
      multiplier *= 0.35; // 65% cheaper for two-wheelers
    }
  } else if (category === 'travel') {
    const days = Number(formData.days) || 7;
    const travellers = Number(formData.travellers) || 1;
    // Scale with trip duration and number of travellers
    multiplier = (days / 7) * travellers * 0.95;
    if (formData.destination === 'usa_canada') {
      multiplier *= 1.45; // 45% loading for USA/Canada medical costs
    }
  }

  // Calculate adjusted premiums
  const adjustedPlans = plans.map((plan) => {
    const calculatedPremium = Math.round(plan.basePremium * multiplier);
    return {
      ...plan,
      premium: calculatedPremium,
      sumInsured: plan.baseSumInsured
    };
  });

  // Identify lowest premium and best CSR
  let minPremium = Infinity;
  let maxCsr = -Infinity;

  adjustedPlans.forEach((p) => {
    if (p.premium < minPremium) minPremium = p.premium;
    if (p.claimSettlementRatio > maxCsr) maxCsr = p.claimSettlementRatio;
  });

  return adjustedPlans.map((p) => ({
    ...p,
    isLowestPremium: p.premium === minPremium,
    isBestCsr: p.claimSettlementRatio === maxCsr
  }));
}

/**
 * Simulates purchasing a policy.
 * Generates unique policy number.
 */
export async function buyPolicy(plan) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const prefixMap = {
    health: 'POL-HL',
    term: 'POL-LF',
    motor: 'POL-MO',
    travel: 'POL-TR'
  };

  const prefix = prefixMap[plan.category?.toLowerCase()] || 'POL-IN';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const policyNumber = `${prefix}-${randomNum}`;

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1); // 1-year policy

  return {
    success: true,
    policyNumber,
    insurer: plan.insurer,
    type: plan.planName,
    sumInsured: plan.sumInsured,
    premium: plan.premium,
    expiryDate: expiry.toISOString().split('T')[0],
    message: 'Policy issued instantly via partner digital integration.'
  };
}
