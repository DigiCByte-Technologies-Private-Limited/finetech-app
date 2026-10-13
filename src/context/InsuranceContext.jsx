import { useState } from 'react';
import { InsuranceContext } from './insuranceContextInstance';
import { userPolicies } from '../data/userProducts';

// Dynamic relative date generator
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

/**
 * Initial in-memory policies list:
 * - 1 active healthy (>30 days)
 * - 1 expiring soon (<30 days, orange countdown)
 * - 1 expired policy (red countdown)
 */
const initialPolicies = [
  ...userPolicies,
  {
    id: 'pol-3',
    type: 'Comprehensive Motor Insurance',
    insurer: 'ICICI Lombard',
    policyNumber: 'MO-449182',
    sumInsured: 680000,
    premium: 7200,
    expiryDate: getRelativeDate(18) // 18 days left (Orange alert)
  },
  {
    id: 'pol-4',
    type: 'Overseas Travel Protection',
    insurer: 'Tata AIG',
    policyNumber: 'TR-108492',
    sumInsured: 4000000,
    premium: 1650,
    expiryDate: getRelativeDate(-5) // Expired 5 days ago (Red alert)
  }
];

/**
 * Insurance Context Provider.
 * Maintains user policies IN MEMORY ONLY (never in localStorage/sessionStorage).
 */
export function InsuranceProvider({ children }) {
  const [myPolicies, setMyPolicies] = useState(initialPolicies);

  // Adds newly purchased policy to in-memory state
  const addPolicy = (newPolicy) => {
    setMyPolicies((prev) => [newPolicy, ...prev]);
  };

  const value = {
    myPolicies,
    addPolicy
  };

  return (
    <InsuranceContext.Provider value={value}>
      {children}
    </InsuranceContext.Provider>
  );
}

export default InsuranceProvider;
