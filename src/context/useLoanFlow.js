import { useContext } from 'react';
import { LoanFlowContext } from './loanFlowContextInstance';

/**
 * Hook to access LoanFlowContext.
 */
export function useLoanFlow() {
  const context = useContext(LoanFlowContext);
  if (!context) {
    throw new Error('useLoanFlow must be used within a LoanFlowProvider');
  }
  return context;
}

export default useLoanFlow;
