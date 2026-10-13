import { useState } from 'react';
import { LoanFlowContext } from './loanFlowContextInstance';

/**
 * Loan Flow Context Provider.
 * Holds in-memory state for multi-step loan application flow:
 * - loanType ('personal', 'home', 'auto', 'instant')
 * - selectedBank
 * - formData (income, employment, amount, tenure, purpose)
 * - consentGiven
 * - relationshipResult (existing cards/loans + FOIR analysis)
 * - uploadedFiles (docId -> File, KEPT IN MEMORY ONLY, never in storage)
 * - applicationResult (submission reference and status)
 */
export function LoanFlowProvider({ children }) {
  const [loanType, setLoanType] = useState('personal');
  const [selectedBank, setSelectedBank] = useState(null);
  const [formData, setFormData] = useState({
    amount: 500000,
    tenureMonths: 36,
    employmentType: 'Salaried',
    monthlyIncome: 75000,
    purpose: 'Personal Loan Requirements'
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [relationshipResult, setRelationshipResult] = useState(null);
  const [applicationResult, setApplicationResult] = useState(null);

  // IN-MEMORY ONLY: Object of docId -> File object
  const [uploadedFiles, setUploadedFiles] = useState({});

  const uploadDocument = (docId, file) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docId]: file
    }));
  };

  const removeDocument = (docId) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };

  const updateFormData = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields
    }));
  };

  const resetFlow = () => {
    setLoanType('personal');
    setSelectedBank(null);
    setUploadedFiles({});
    setConsentGiven(false);
    setRelationshipResult(null);
    setApplicationResult(null);
    setFormData({
      amount: 500000,
      tenureMonths: 36,
      employmentType: 'Salaried',
      monthlyIncome: 75000,
      purpose: 'Personal Loan Requirements'
    });
  };

  const value = {
    loanType,
    setLoanType,
    selectedBank,
    setSelectedBank,
    formData,
    setFormData,
    updateFormData,
    consentGiven,
    setConsentGiven,
    relationshipResult,
    setRelationshipResult,
    applicationResult,
    setApplicationResult,
    uploadedFiles,
    setUploadedFiles,
    uploadDocument,
    removeDocument,
    resetFlow
  };

  return (
    <LoanFlowContext.Provider value={value}>
      {children}
    </LoanFlowContext.Provider>
  );
}

export default LoanFlowProvider;
