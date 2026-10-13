import { useState, useId } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { banks } from '../../data/banks';
import { userCards, userLoans } from '../../data/userProducts';
import { getBankRelationship } from '../../utils/relationship';
import { calculateFoir } from '../../utils/foir';
import { calculateUtilization } from '../../utils/utilization';
import { formatCurrency } from '../../utils/format';
import { useLoanFlow } from '../../context/useLoanFlow';

/**
 * Step 4 & 5: Bank Detail, Form & Relationship Summary (/extensions/loan/:type/banks/:bankId).
 * Features:
 * - Bank summary at top
 * - Form with validation (income > 0, amount, tenure <= bank.maxTenureMonths)
 * - Required consent checkbox
 * - Step 5 Relationship Summary:
 *   - Cards (Yes/No with masked number, limit, utilization)
 *   - Loans (Yes/No with type, EMI, outstanding)
 *   - Total monthly EMI burden
 *   - FOIR with color indicator and plain-language eligibility message
 *   - "Existing customer" vs "New to bank" badge
 * - "Proceed to review" button navigating to /extensions/loan/:type/review
 */
export default function StepBankDetail() {
  const { type = 'personal', bankId } = useParams();
  const navigate = useNavigate();
  const consentId = useId();

  const {
    formData,
    updateFormData,
    consentGiven,
    setConsentGiven,
    setSelectedBank,
    relationshipResult,
    setRelationshipResult
  } = useLoanFlow();

  const normalizedType = type.toLowerCase();
  const bank = banks.find((b) => b.id === bankId) || banks[0];

  // Form local state initialized from context
  const [income, setIncome] = useState(formData.monthlyIncome || 75000);
  const [empType, setEmpType] = useState(formData.employmentType || 'Salaried');
  const [loanAmount, setLoanAmount] = useState(formData.amount || 500000);
  const [tenure, setTenure] = useState(formData.tenureMonths || 36);
  const [consent, setConsent] = useState(consentGiven || false);

  // Errors state
  const [errors, setErrors] = useState({});
  const [isEvaluated, setIsEvaluated] = useState(!!relationshipResult);

  // Run relationship check & FOIR
  const handleCheckRelationship = (e) => {
    e.preventDefault();

    const newErrors = {};

    // Validate income
    if (!income || Number(income) <= 0) {
      newErrors.income = 'Monthly income must be greater than ₹0.';
    }

    // Validate loan amount
    if (!loanAmount || Number(loanAmount) < 25000) {
      newErrors.loanAmount = 'Loan amount must be at least ₹25,000.';
    } else if (Number(loanAmount) > 10000000) {
      newErrors.loanAmount = 'Loan amount cannot exceed ₹1 crore.';
    }

    // Validate tenure
    if (!tenure || Number(tenure) < 6) {
      newErrors.tenure = 'Tenure must be at least 6 months.';
    } else if (Number(tenure) > bank.maxTenureMonths) {
      newErrors.tenure = `Tenure cannot exceed ${bank.name}'s maximum of ${bank.maxTenureMonths} months.`;
    }

    // Validate consent
    if (!consent) {
      newErrors.consent = 'You must grant consent to check your accounts with this bank.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Save form data into Context
    updateFormData({
      monthlyIncome: Number(income),
      employmentType: empType,
      amount: Number(loanAmount),
      tenureMonths: Number(tenure)
    });
    setConsentGiven(true);
    setSelectedBank(bank);

    // Compute Bank Relationship
    const rel = getBankRelationship(bank.id, userCards, userLoans);

    // Compute FOIR
    const foirAnalysis = calculateFoir(
      Number(income),
      userLoans,
      Number(loanAmount),
      bank.rateMin,
      Number(tenure)
    );

    const result = {
      ...rel,
      foir: foirAnalysis
    };

    setRelationshipResult(result);
    setIsEvaluated(true);
  };

  const handleProceedToReview = () => {
    navigate(`/extensions/loan/${normalizedType}/review`);
  };

  return (
    <div className="space-y-6">
      {/* STEP 4: Bank Summary & Detail Form */}
      <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
        {/* Step Indicator & Header */}
        <div className="pb-4 border-b border-[#DDE2E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-[#5B6B73]">
              Step 4 of 5 — {normalizedType} loan
            </span>
            <h2 className="text-lg font-semibold text-[#16232B] tracking-tight mt-1">
              Application details & bank relationship check
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/extensions/loan/${normalizedType}/banks`)}
            className="min-h-[44px] text-xs font-medium text-[#0B4F6C] hover:underline flex items-center gap-1 cursor-pointer w-fit"
          >
            <i className="fa-solid fa-arrow-left text-[11px]"></i>
            <span>Change bank</span>
          </button>
        </div>

        {/* Bank Summary Banner */}
        <div className="p-4 rounded-[8px] bg-[#0B4F6C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-white/10 flex items-center justify-center text-lg text-white">
              <i className={bank.icon}></i>
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-tight text-white">
                {bank.name}
              </h3>
              <p className="text-xs text-white/80">
                Lending partner
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <span className="text-white/70 text-[11px] block">
                Interest rate
              </span>
              <strong className="text-white font-semibold text-sm tabular-nums">
                {bank.rateMin}% - {bank.rateMax}% p.a.
              </strong>
            </div>
            <div>
              <span className="text-white/70 text-[11px] block">
                Processing fee
              </span>
              <span className="text-white font-medium tabular-nums">{bank.processingFee}%</span>
            </div>
            <div>
              <span className="text-white/70 text-[11px] block">
                Max tenure
              </span>
              <span className="text-white font-medium tabular-nums">
                {bank.maxTenureMonths} months
              </span>
            </div>
          </div>
        </div>

        {/* Financial Inputs Form */}
        <form onSubmit={handleCheckRelationship} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly Income */}
            <div>
              <label
                htmlFor="income-field"
                className="block text-xs font-medium text-[#16232B] mb-1.5"
              >
                Net monthly take-home income (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#5B6B73] text-sm font-medium">
                  ₹
                </span>
                <input
                  id="income-field"
                  type="number"
                  min="1"
                  step="1000"
                  value={income}
                  onChange={(e) => {
                    setIncome(e.target.value);
                    if (errors.income) setErrors((prev) => ({ ...prev, income: '' }));
                  }}
                  className={`w-full pl-8 pr-3 h-10 rounded-[4px] border text-sm font-normal tabular-nums focus:outline-none focus:border-[#0B4F6C] ${
                    errors.income
                      ? 'border-[#B3261E] bg-[#B3261E]/5'
                      : 'border-[#DDE2E0] bg-white'
                  }`}
                  placeholder="75000"
                />
              </div>
              {errors.income && (
                <p className="text-xs text-[#B3261E] mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[11px]"></i>
                  <span>{errors.income}</span>
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label
                htmlFor="emp-type-field"
                className="block text-xs font-medium text-[#16232B] mb-1.5"
              >
                Employment type
              </label>
              <select
                id="emp-type-field"
                value={empType}
                onChange={(e) => setEmpType(e.target.value)}
                className="w-full px-3 h-10 rounded-[4px] border border-[#DDE2E0] text-sm font-normal focus:outline-none focus:border-[#0B4F6C] bg-white"
              >
                <option value="Salaried">Salaried (MNC / Private / Govt)</option>
                <option value="Self-employed">Self-employed professional / business</option>
              </select>
            </div>

            {/* Loan Amount */}
            <div>
              <label
                htmlFor="amount-field"
                className="block text-xs font-medium text-[#16232B] mb-1.5"
              >
                Required loan amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#5B6B73] text-sm font-medium">
                  ₹
                </span>
                <input
                  id="amount-field"
                  type="number"
                  min="25000"
                  max="10000000"
                  step="25000"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(e.target.value);
                    if (errors.loanAmount) setErrors((prev) => ({ ...prev, loanAmount: '' }));
                  }}
                  className={`w-full pl-8 pr-3 h-10 rounded-[4px] border text-sm font-normal tabular-nums focus:outline-none focus:border-[#0B4F6C] ${
                    errors.loanAmount
                      ? 'border-[#B3261E] bg-[#B3261E]/5'
                      : 'border-[#DDE2E0] bg-white'
                  }`}
                  placeholder="500000"
                />
              </div>
              {errors.loanAmount && (
                <p className="text-xs text-[#B3261E] mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[11px]"></i>
                  <span>{errors.loanAmount}</span>
                </p>
              )}
            </div>

            {/* Tenure in Months */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="tenure-field"
                  className="block text-xs font-medium text-[#16232B]"
                >
                  Repayment tenure (months)
                </label>
                <span className="text-[11px] text-[#5B6B73] tabular-nums">
                  Bank max: {bank.maxTenureMonths} months
                </span>
              </div>
              <input
                id="tenure-field"
                type="number"
                min="6"
                max={bank.maxTenureMonths}
                value={tenure}
                onChange={(e) => {
                  setTenure(e.target.value);
                  if (errors.tenure) setErrors((prev) => ({ ...prev, tenure: '' }));
                }}
                className={`w-full px-3 h-10 rounded-[4px] border text-sm font-normal tabular-nums focus:outline-none focus:border-[#0B4F6C] ${
                  errors.tenure
                    ? 'border-[#B3261E] bg-[#B3261E]/5'
                    : 'border-[#DDE2E0] bg-white'
                }`}
                placeholder="36"
              />
              {errors.tenure && (
                <p className="text-xs text-[#B3261E] mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[11px]"></i>
                  <span>{errors.tenure}</span>
                </p>
              )}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label
              htmlFor={consentId}
              className="flex items-start gap-3 p-3.5 rounded-[4px] bg-[#F5F6F4] border border-[#DDE2E0] cursor-pointer"
            >
              <input
                id={consentId}
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
                }}
                className="mt-0.5 w-4 h-4 rounded-[4px] accent-[#0B4F6C] cursor-pointer shrink-0"
              />
              <span className="text-xs text-[#16232B] leading-relaxed">
                <strong className="font-semibold">Allow us to check your existing accounts with this bank.</strong>{' '}
                I authorize FinPulse to query existing credit cards and loans with{' '}
                {bank.name} to determine relationship perks.
              </span>
            </label>
            {errors.consent && (
              <p className="text-xs text-[#B3261E] mt-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation text-[11px]"></i>
                <span>{errors.consent}</span>
              </p>
            )}
          </div>

          {/* Relationship Trigger Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
              <span>Check my relationship with this bank</span>
            </button>
          </div>
        </form>
      </div>

      {/* STEP 5: RELATIONSHIP SUMMARY (Appears once relationship is checked) */}
      {isEvaluated && relationshipResult && (
        <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
          {/* Header & Existing Customer Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2E0]">
            <div>
              <span className="text-xs font-medium text-[#5B6B73] block">
                Step 5 of 5
              </span>
              <h3 className="text-lg font-semibold text-[#16232B] tracking-tight mt-0.5">
                Bank relationship & FOIR assessment
              </h3>
              <p className="text-xs text-[#5B6B73]">
                Verified portfolio held with {bank.name} and debt-to-income analysis.
              </p>
            </div>

            {/* Customer Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium border ${
                relationshipResult.isExistingCustomer
                  ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border-[#1F7A4D]/20'
                  : 'bg-[#F5F6F4] text-[#5B6B73] border-[#DDE2E0]'
              }`}
            >
              <i
                className={`fa-solid ${
                  relationshipResult.isExistingCustomer
                    ? 'fa-circle-check text-[#1F7A4D]'
                    : 'fa-id-card text-[#5B6B73]'
                } text-xs`}
              ></i>
              <span>
                {relationshipResult.isExistingCustomer
                  ? 'Existing customer: may get faster approval and fewer documents'
                  : 'New to bank: full documents needed'}
              </span>
            </span>
          </div>

          {/* Cards & Loans with that bank */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Credit Card Check */}
            <div className="p-4 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#16232B] flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-[#0B4F6C]"></i>
                  Credit card with {bank.name}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded-[4px] text-[11px] ${
                    relationshipResult.hasCard
                      ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border border-[#1F7A4D]/20'
                      : 'bg-white text-[#5B6B73] border border-[#DDE2E0]'
                  }`}
                >
                  {relationshipResult.hasCard ? 'Yes' : 'No'}
                </span>
              </div>

              {relationshipResult.hasCard && relationshipResult.cards.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-[#DDE2E0]">
                  {relationshipResult.cards.map((c) => {
                    const util = calculateUtilization(c.used, c.limit);
                    return (
                      <div
                        key={c.id}
                        className="bg-white p-3 rounded-[4px] border border-[#DDE2E0] space-y-1"
                      >
                        <div className="flex justify-between font-normal text-[#16232B] tabular-nums">
                          <span>•••• {c.last4} ({c.network})</span>
                          <span>Limit: {formatCurrency(c.limit)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                          <span>Utilized: {formatCurrency(c.used)}</span>
                          <span
                            className={util > 30 ? 'text-[#B3261E] font-medium' : 'text-[#1F7A4D] font-medium'}
                          >
                            Utilization: {util}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[#5B6B73] pt-1">
                  No active credit cards detected with {bank.name}.
                </p>
              )}
            </div>

            {/* 2. Active Loan Check */}
            <div className="p-4 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#16232B] flex items-center gap-2">
                  <i className="fa-solid fa-hand-holding-dollar text-[#1F7A4D]"></i>
                  Active loan with {bank.name}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded-[4px] text-[11px] ${
                    relationshipResult.hasLoan
                      ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border border-[#1F7A4D]/20'
                      : 'bg-white text-[#5B6B73] border border-[#DDE2E0]'
                  }`}
                >
                  {relationshipResult.hasLoan ? 'Yes' : 'No'}
                </span>
              </div>

              {relationshipResult.hasLoan && relationshipResult.loans.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-[#DDE2E0]">
                  {relationshipResult.loans.map((l) => (
                    <div
                      key={l.id}
                      className="bg-white p-3 rounded-[4px] border border-[#DDE2E0] space-y-1"
                    >
                      <div className="flex justify-between font-normal text-[#16232B] tabular-nums">
                        <span className="font-medium text-[#16232B]">{l.type}</span>
                        <span className="text-[#0B4F6C] font-semibold">
                          EMI: {formatCurrency(l.emi)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                        <span>Outstanding principal:</span>
                        <strong className="text-[#16232B] font-medium">{formatCurrency(l.outstanding)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#5B6B73] pt-1">
                  No existing loan facilities held with {bank.name}.
                </p>
              )}
            </div>
          </div>

          {/* FOIR Calculation & Colour Indicator */}
          <div className="p-4 rounded-[8px] border border-[#DDE2E0] bg-[#F5F6F4] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-semibold text-[#16232B] text-sm">
                  Fixed obligation to income ratio (FOIR)
                </h4>
                <p className="text-[11px] text-[#5B6B73]">
                  (Total existing EMIs + estimated new EMI) ÷ monthly income × 100
                </p>
              </div>

              {/* Colour Indicator Badge */}
              <div
                className={`px-2.5 py-1 rounded-[4px] text-xs font-medium border flex items-center gap-1.5 w-fit tabular-nums ${
                  relationshipResult.foir.foirPercent <= 40
                    ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border-[#1F7A4D]/30'
                    : relationshipResult.foir.foirPercent <= 50
                    ? 'bg-[#B86E00]/10 text-[#B86E00] border-[#B86E00]/30'
                    : 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/30'
                }`}
              >
                <span>FOIR: {relationshipResult.foir.foirPercent}% — {relationshipResult.foir.status}</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-[4px] border border-[#DDE2E0]">
              <div>
                <span className="text-[#5B6B73] text-[11px]">
                  Existing EMIs
                </span>
                <p className="font-semibold text-[#16232B] mt-0.5 tabular-nums">
                  {formatCurrency(relationshipResult.foir.totalExistingEmis)}
                </p>
              </div>
              <div>
                <span className="text-[#5B6B73] text-[11px]">
                  Estimated new EMI
                </span>
                <p className="font-semibold text-[#0B4F6C] mt-0.5 tabular-nums">
                  {formatCurrency(relationshipResult.foir.estimatedNewEmi)}
                </p>
              </div>
              <div>
                <span className="text-[#5B6B73] text-[11px]">
                  Total monthly burden
                </span>
                <p className="font-semibold text-[#16232B] mt-0.5 tabular-nums">
                  {formatCurrency(relationshipResult.foir.totalMonthlyBurden)}
                </p>
              </div>
              <div>
                <span className="text-[#5B6B73] text-[11px]">
                  Declared income
                </span>
                <p className="font-semibold text-[#16232B] mt-0.5 tabular-nums">
                  {formatCurrency(income)}
                </p>
              </div>
            </div>

            {/* Visual Color Bar Indicator */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-[#DDE2E0] rounded-[2px] overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    relationshipResult.foir.foirPercent <= 40
                      ? 'bg-[#1F7A4D]'
                      : relationshipResult.foir.foirPercent <= 50
                      ? 'bg-[#B86E00]'
                      : 'bg-[#B3261E]'
                  }`}
                  style={{ width: `${Math.min(100, relationshipResult.foir.foirPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                <span className="text-[#1F7A4D]">≤ 40% (healthy)</span>
                <span className="text-[#B86E00]">40% - 50% (moderate)</span>
                <span className="text-[#B3261E]">&gt; 50% (high risk)</span>
              </div>
            </div>

            {/* Plain-Language Eligibility Message */}
            <div className="p-3 rounded-[4px] bg-white border border-[#DDE2E0] text-xs text-[#16232B] flex items-start gap-2.5">
              <i className="fa-solid fa-circle-info text-[#0B4F6C] text-sm mt-0.5 shrink-0"></i>
              <p className="leading-relaxed">
                <strong className="font-semibold">Eligibility assessment:</strong> {relationshipResult.foir.message}
              </p>
            </div>
          </div>

          {/* Action to proceed to Step 6 (Review & Submit) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#5B6B73]">
              Review all details and documents before final submission
            </span>

            <button
              type="button"
              onClick={handleProceedToReview}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
