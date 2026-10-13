import { useContext } from 'react';
import { InsuranceContext } from './insuranceContextInstance';

/**
 * Hook to access InsuranceContext.
 */
export function useInsurance() {
  const context = useContext(InsuranceContext);
  if (!context) {
    throw new Error('useInsurance must be used within an InsuranceProvider');
  }
  return context;
}

export default useInsurance;
