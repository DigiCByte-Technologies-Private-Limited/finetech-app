/**
 * Base insurance plan templates for Health, Term, Motor, and Travel insurance categories.
 * Used by insuranceApi.js to compute dynamic quotes based on user input.
 */

export const baseInsurancePlans = {
  health: [
    {
      id: 'h_star',
      insurer: 'Star Health & Allied Insurance',
      planName: 'Comprehensive Health Shield',
      icon: 'fa-solid fa-heart-pulse',
      basePremium: 11500,
      baseSumInsured: 1000000, // 10 Lakhs
      claimSettlementRatio: 99.2, // Best CSR
      cashlessNetwork: '14,000+ Hospitals',
      coPay: '0% Co-Pay',
      waitingPeriod: '2 Years (Pre-existing)',
      tag: 'Best Claim Support'
    },
    {
      id: 'h_hdfc',
      insurer: 'HDFC ERGO',
      planName: 'Optima Secure Super',
      icon: 'fa-solid fa-shield-heart',
      basePremium: 10200,
      baseSumInsured: 1000000,
      claimSettlementRatio: 98.7,
      cashlessNetwork: '12,500+ Hospitals',
      coPay: '0% Co-Pay',
      waitingPeriod: '3 Years (Pre-existing)',
      tag: '2X Automatic Cover'
    },
    {
      id: 'h_care',
      insurer: 'Care Health Insurance',
      planName: 'Care Supreme Freedom',
      icon: 'fa-solid fa-hospital',
      basePremium: 8900, // Lowest Premium
      baseSumInsured: 1000000,
      claimSettlementRatio: 97.9,
      cashlessNetwork: '11,000+ Hospitals',
      coPay: '0% Co-Pay',
      waitingPeriod: '3 Years (Pre-existing)',
      tag: 'Most Affordable'
    },
    {
      id: 'h_niva',
      insurer: 'Niva Bupa Health',
      planName: 'ReAssure 2.0 Titanium',
      icon: 'fa-solid fa-hand-holding-medical',
      basePremium: 12800,
      baseSumInsured: 1500000,
      claimSettlementRatio: 98.4,
      cashlessNetwork: '10,500+ Hospitals',
      coPay: '0% Co-Pay',
      waitingPeriod: '1 Year (Pre-existing)',
      tag: 'Lock the Clock Age Rate'
    }
  ],

  term: [
    {
      id: 't_hdfc',
      insurer: 'HDFC Life Insurance',
      planName: 'Click 2 Protect 3D Plus',
      icon: 'fa-solid fa-umbrella',
      basePremium: 14500,
      baseSumInsured: 10000000, // 1 Crore
      claimSettlementRatio: 99.5, // Best CSR
      cashlessNetwork: 'Instant Death Claim',
      coPay: 'N/A',
      waitingPeriod: 'Zero Days',
      tag: 'Highest Settlement Ratio'
    },
    {
      id: 't_icici',
      insurer: 'ICICI Prudential Life',
      planName: 'iProtect Smart Pure Term',
      icon: 'fa-solid fa-shield-halved',
      basePremium: 12900,
      baseSumInsured: 10000000,
      claimSettlementRatio: 98.9,
      cashlessNetwork: 'Same Day Processing',
      coPay: 'N/A',
      waitingPeriod: 'Zero Days',
      tag: 'Critical Illness Booster'
    },
    {
      id: 't_max',
      insurer: 'Max Life Insurance',
      planName: 'Smart Secure Plus Protection',
      icon: 'fa-solid fa-award',
      basePremium: 11800, // Lowest Premium
      baseSumInsured: 10000000,
      claimSettlementRatio: 99.3,
      cashlessNetwork: 'Express Claim Helpline',
      coPay: 'N/A',
      waitingPeriod: 'Zero Days',
      tag: 'Terminal Illness Payout'
    },
    {
      id: 't_tata',
      insurer: 'Tata AIA Life',
      planName: 'Sampoorna Raksha Supreme',
      icon: 'fa-solid fa-ribbon',
      basePremium: 13600,
      baseSumInsured: 15000000, // 1.5 Crore
      claimSettlementRatio: 99.1,
      cashlessNetwork: 'Digital Claim Intimation',
      coPay: 'N/A',
      waitingPeriod: 'Zero Days',
      tag: 'Return of Premium Option'
    }
  ],

  motor: [
    {
      id: 'm_icici',
      insurer: 'ICICI Lombard',
      planName: 'Comprehensive Zero-Dep Protect',
      icon: 'fa-solid fa-car-burst',
      basePremium: 6800,
      baseSumInsured: 650000, // IDV
      claimSettlementRatio: 98.6, // Best CSR
      cashlessNetwork: '9,500+ Network Garages',
      coPay: '0% (Zero Depreciation)',
      waitingPeriod: 'Instant Cover',
      tag: 'Zero Depreciation'
    },
    {
      id: 'm_bajaj',
      insurer: 'Bajaj Allianz General',
      planName: 'DriveSmart Comprehensive',
      icon: 'fa-solid fa-car-side',
      basePremium: 5900,
      baseSumInsured: 650000,
      claimSettlementRatio: 98.1,
      cashlessNetwork: '8,200+ Network Garages',
      coPay: '0% (Standard Comp)',
      waitingPeriod: 'Instant Cover',
      tag: '24x7 Roadside Assistance'
    },
    {
      id: 'm_acko',
      insurer: 'Acko General Insurance',
      planName: 'Digital Express Auto Shield',
      icon: 'fa-solid fa-bolt',
      basePremium: 4800, // Lowest Premium
      baseSumInsured: 650000,
      claimSettlementRatio: 97.8,
      cashlessNetwork: '7,000+ Doorstep Garages',
      coPay: '0% with Instant Settlement',
      waitingPeriod: 'Instant Cover',
      tag: 'Paperless Instant Claims'
    },
    {
      id: 'm_digit',
      insurer: 'Go Digit General',
      planName: 'On-Demand Motor Guard',
      icon: 'fa-solid fa-truck-pickup',
      basePremium: 6200,
      baseSumInsured: 650000,
      claimSettlementRatio: 98.3,
      cashlessNetwork: '8,800+ Garages',
      coPay: '0% Engine Protection',
      waitingPeriod: 'Instant Cover',
      tag: 'Engine & Consumables Included'
    }
  ],

  travel: [
    {
      id: 'tr_tata',
      insurer: 'Tata AIG General',
      planName: 'Travel Guard Worldwide',
      icon: 'fa-solid fa-plane-departure',
      basePremium: 1450,
      baseSumInsured: 4000000, // ~ $50,000 USD
      claimSettlementRatio: 99.0, // Best CSR
      cashlessNetwork: 'Global Medical Assistance',
      coPay: 'Zero Deductible',
      waitingPeriod: 'Valid from Flight Departure',
      tag: 'Global Cashless OPD'
    },
    {
      id: 'tr_hdfc',
      insurer: 'HDFC ERGO Travel',
      planName: 'Global Explorer Elite',
      icon: 'fa-solid fa-earth-americas',
      basePremium: 1650,
      baseSumInsured: 8000000, // ~ $100,000 USD
      claimSettlementRatio: 98.8,
      cashlessNetwork: '24x7 Emergency Worldwide Concierge',
      coPay: '$50 Deductible',
      waitingPeriod: 'Valid from Flight Departure',
      tag: 'Lost Passport & Baggage Delay'
    },
    {
      id: 'tr_rel',
      insurer: 'Reliance General Insurance',
      planName: 'Travel Care International',
      icon: 'fa-solid fa-passport',
      basePremium: 1100, // Lowest Premium
      baseSumInsured: 4000000,
      claimSettlementRatio: 97.5,
      cashlessNetwork: 'International Medical Network',
      coPay: '$100 Deductible',
      waitingPeriod: 'Valid from Flight Departure',
      tag: 'Budget Friendly'
    },
    {
      id: 'tr_bajaj',
      insurer: 'Bajaj Allianz Travel',
      planName: 'Travel Companion Platinum',
      icon: 'fa-solid fa-compass',
      basePremium: 1950,
      baseSumInsured: 12000000, // ~ $150,000 USD
      claimSettlementRatio: 98.4,
      cashlessNetwork: 'Worldwide Air Ambulance Cover',
      coPay: 'Zero Deductible',
      waitingPeriod: 'Valid from Flight Departure',
      tag: 'Trip Cancellation Included'
    }
  ]
};

export default baseInsurancePlans;
