import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLoanFlow } from '../../context/useLoanFlow';
import { submitLoanApplication } from '../../services/loanApplicationApi';
import { formatCurrency } from '../../utils/format';

/**
 * Step 6: Review and Submit Component (/extensions/loan/:type/review).
 * Features:
 * - Comprehensive summary of loan type, bank, form inputs, relationship FOIR, and attached documents.
 * - Mock submission with delay and application ID.
 * - Auto-advancing demo status tracker: Submitted -> Under review -> Approved (via timers).
 * - Back navigation preserving all entered data.
 */
export default function StepReview() {
  const { type = 'personal' } = useParams();
  const navigate = useNavigate();

  const {
    loanType,
    selectedBank,
    formData,
    relationshipResult,
    uploadedFiles,
    applicationResult,
    setApplicationResult,
    resetFlow
  } = useLoanFlow();

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(!!applicationResult);
  const [statusStep, setStatusStep] = useState(applicationResult ? 3 : 1); // 1 = Submitted, 2 = Under review, 3 = Approved

  const normalizedType = type.toLowerCase();
  const bank = selectedBank || {
    id: 'hdfc',
    name: 'HDFC Bank',
    icon: 'fa-solid fa-building-columns',
    rateMin: 8.5
  };

  // Convert uploadedFiles object into array
  const filesArray = Object.entries(uploadedFiles).map(([docId, file]) => ({
    id: docId,
    name: file.name,
    size: (file.size / 1024).toFixed(0) + ' KB'
  }));

  // Automatic status tracker timer progression for demo
  useEffect(() => {
    let timer1 = null;
    let timer2 = null;

    if (submissionSuccess) {
      // Advance to "Under review" after 3 seconds
      timer1 = setTimeout(() => {
        setStatusStep(2);
      }, 3000);

      // Advance to "Approved" after 6 seconds (3s after Under review)
      timer2 = setTimeout(() => {
        setStatusStep(3);
      }, 6000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [submissionSuccess]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        loanType,
        bankName: bank.name,
        amount: formData.amount,
        tenureMonths: formData.tenureMonths,
        monthlyIncome: formData.monthlyIncome
      };

      const result = await submitLoanApplication(payload);
      setApplicationResult(result);
      setSubmissionSuccess(true);
      setStatusStep(1); // Start at Submitted
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#DDE2E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-[#5B6B73]">
            Step 5 of 5 — {normalizedType} loan
          </span>
          <h2 className="text-lg font-semibold text-[#16232B] tracking-tight mt-1">
            Application review & submission
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B73] mt-0.5">
            Carefully verify all details before final transmission to {bank.name}.
          </p>
        </div>

        {!submissionSuccess && (
          <button
            type="button"
            onClick={() => navigate(`/extensions/loan/${normalizedType}/banks/${bank.id}`)}
            className="min-h-[44px] text-xs font-medium text-[#0B4F6C] hover:underline flex items-center gap-1 cursor-pointer w-fit"
          >
            <i className="fa-solid fa-pen-to-square text-[11px]"></i>
            <span>Edit details</span>
          </button>
        )}
      </div>

      {/* SUCCESS STATE & AUTOMATIC ADVANCING STATUS TRACKER */}
      {submissionSuccess && (
        <div className="p-5 sm:p-6 rounded-[8px] bg-[#F5F6F4] border border-[#1F7A4D]/40 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#1F7A4D] text-white flex items-center justify-center text-lg">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#16232B]">
                Application submitted successfully
              </h3>
              <p className="text-xs text-[#5B6B73]">
                Application ID:{' '}
                <strong className="text-[#16232B] font-medium tabular-nums">
                  {applicationResult?.applicationId || 'APP-2026-8921'}
                </strong>
              </p>
            </div>
          </div>

          {/* Real-time Status Tracker (Submitted -> Under review -> Approved) */}
          <div className="bg-white p-4 sm:p-5 rounded-[8px] border border-[#DDE2E0] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5B6B73] pb-2 border-b border-[#DDE2E0]">
              <span className="font-medium text-[#16232B]">Application tracker</span>
              <span className="text-[#1F7A4D] font-medium">Demo auto-advancing</span>
            </div>

            <div className="flex items-center justify-between relative max-w-lg mx-auto pt-2">
              {/* Connecting line */}
              <div className="absolute top-3.5 left-6 right-6 h-[2px] bg-[#DDE2E0] z-0">
                <div
                  className="h-full bg-[#1F7A4D] transition-all duration-700"
                  style={{
                    width:
                      statusStep === 1 ? '0%' : statusStep === 2 ? '50%' : '100%'
                  }}
                />
              </div>

              {/* Step 1: Submitted */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-7 h-7 rounded-[4px] bg-[#1F7A4D] text-white flex items-center justify-center text-xs">
                  <i className="fa-solid fa-check text-[11px]"></i>
                </div>
                <span className="text-xs font-medium text-[#16232B] mt-1.5">Submitted</span>
                <span className="text-[10px] text-[#5B6B73]">Received</span>
              </div>

              {/* Step 2: Under review */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-[4px] flex items-center justify-center text-xs ${
                    statusStep >= 2
                      ? 'bg-[#1F7A4D] text-white'
                      : 'bg-[#B86E00] text-white'
                  }`}
                >
                  {statusStep >= 2 ? (
                    <i className="fa-solid fa-check text-[11px]"></i>
                  ) : (
                    <i className="fa-solid fa-rotate text-[10px]"></i>
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-1.5 ${
                    statusStep >= 2 ? 'text-[#16232B]' : 'text-[#B86E00]'
                  }`}
                >
                  Under review
                </span>
                <span className="text-[10px] text-[#5B6B73]">KYC check</span>
              </div>

              {/* Step 3: Approved */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-[4px] flex items-center justify-center text-xs ${
                    statusStep === 3
                      ? 'bg-[#1F7A4D] text-white'
                      : 'bg-[#F5F6F4] text-[#5B6B73] border border-[#DDE2E0]'
                  }`}
                >
                  {statusStep === 3 ? (
                    <i className="fa-solid fa-check text-[11px]"></i>
                  ) : (
                    <span className="tabular-nums">3</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium mt-1.5 ${
                    statusStep === 3 ? 'text-[#1F7A4D]' : 'text-[#5B6B73]'
                  }`}
                >
                  Approved
                </span>
                <span className="text-[10px] text-[#5B6B73]">Pre-sanction</span>
              </div>
            </div>

            {/* Status explanation alert */}
            <div className="mt-4 p-3 rounded-[4px] bg-[#F5F6F4] border border-[#DDE2E0] text-xs text-[#16232B] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <i
                  className={`fa-solid ${
                    statusStep === 3
                      ? 'fa-circle-check text-[#1F7A4D]'
                      : 'fa-arrows-rotate text-[#0B4F6C]'
                  }`}
                ></i>
                <span>
                  {statusStep === 1 && 'Application received by underwriter. Initiating checks.'}
                  {statusStep === 2 && 'Under review: Documents verified and FOIR approved.'}
                  {statusStep === 3 &&
                    'Your loan has received automated pre-approval sanction.'}
                </span>
              </span>

              {statusStep === 3 && (
                <span className="px-2 py-0.5 rounded-[4px] bg-[#1F7A4D]/10 text-[#1F7A4D] border border-[#1F7A4D]/20 text-[11px] font-medium">
                  Sanction active
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors text-center cursor-pointer flex items-center justify-center"
            >
              Back to dashboard
            </Link>

            <button
              type="button"
              onClick={() => {
                resetFlow();
                navigate('/extensions');
              }}
              className="w-full sm:w-auto min-h-[44px] text-xs text-[#0B4F6C] hover:underline font-medium cursor-pointer text-center flex items-center justify-center"
            >
              Apply for another loan
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY DETAILS (Shown before and after submission) */}
      <div className="space-y-4">
        {/* Top 2 Cards: Facility & Bank + Financial Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Facility & Bank Info */}
          <div className="p-4 sm:p-5 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-3 text-xs">
            <h4 className="font-semibold text-[#16232B] text-sm flex items-center gap-2">
              <i className="fa-solid fa-building-columns text-[#0B4F6C]"></i>
              Loan facility & bank
            </h4>

            <div className="space-y-2 pt-2 border-t border-[#DDE2E0]">
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Loan facility:</span>
                <span className="font-medium text-[#16232B] capitalize">
                  {normalizedType} loan
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Partner bank:</span>
                <span className="font-medium text-[#16232B]">{bank.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Indicative rate:</span>
                <span className="font-medium text-[#1F7A4D] tabular-nums">
                  {bank.rateMin}% - {bank.rateMax}% p.a.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Customer classification:</span>
                <span className="font-medium text-[#16232B]">
                  {relationshipResult?.isExistingCustomer ? 'Existing customer' : 'New customer'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Application Parameters */}
          <div className="p-4 sm:p-5 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-3 text-xs">
            <h4 className="font-semibold text-[#16232B] text-sm flex items-center gap-2">
              <i className="fa-solid fa-file-invoice-dollar text-[#0B4F6C]"></i>
              Application parameters
            </h4>

            <div className="space-y-2 pt-2 border-t border-[#DDE2E0]">
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Requested amount:</span>
                <span className="font-semibold text-[#16232B] tabular-nums">
                  {formatCurrency(formData.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Tenure:</span>
                <span className="font-medium text-[#16232B] tabular-nums">
                  {formData.tenureMonths} months ({(formData.tenureMonths / 12).toFixed(1)} yrs)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Monthly net income:</span>
                <span className="font-medium text-[#16232B] tabular-nums">
                  {formatCurrency(formData.monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B6B73]">Employment type:</span>
                <span className="font-medium text-[#16232B]">
                  {formData.employmentType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship & FOIR Assessment Summary */}
        {relationshipResult && (
          <div className="p-4 sm:p-5 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#16232B] text-sm flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-[#0B4F6C]"></i>
                Relationship & FOIR assessment
              </h4>
              <span
                className={`px-2 py-0.5 rounded-[4px] text-xs font-medium border tabular-nums ${
                  relationshipResult.foir?.foirPercent <= 40
                    ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border-[#1F7A4D]/30'
                    : relationshipResult.foir?.foirPercent <= 50
                    ? 'bg-[#B86E00]/10 text-[#B86E00] border-[#B86E00]/30'
                    : 'bg-[#B3261E]/10 text-[#B3261E] border-[#B3261E]/30'
                }`}
              >
                FOIR: {relationshipResult.foir?.foirPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#DDE2E0]">
              <div>
                <span className="text-[#5B6B73] block">Existing accounts:</span>
                <span className="font-medium text-[#16232B]">
                  {relationshipResult.hasCard ? '1 active card' : 'No cards'}, {relationshipResult.hasLoan ? '1 active loan' : 'no loans'}
                </span>
              </div>
              <div>
                <span className="text-[#5B6B73] block">Total monthly burden:</span>
                <span className="font-semibold text-[#0B4F6C] tabular-nums">
                  {formatCurrency(relationshipResult.foir?.totalMonthlyBurden)}/mo
                </span>
              </div>
              <div>
                <span className="text-[#5B6B73] block">Underwriting verdict:</span>
                <span className="font-medium text-[#1F7A4D]">
                  {relationshipResult.foir?.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Attached Verification Documents */}
        <div className="p-4 sm:p-5 rounded-[8px] bg-[#F5F6F4] border border-[#DDE2E0] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[#16232B] text-sm flex items-center gap-2">
              <i className="fa-solid fa-paperclip text-[#5B6B73]"></i>
              Attached verification documents ({filesArray.length})
            </h4>
            <span className="text-[#1F7A4D] font-medium flex items-center gap-1">
              <i className="fa-solid fa-circle-check text-xs"></i>
              Verified in memory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#DDE2E0]">
            {filesArray.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-2.5 rounded-[4px] border border-[#DDE2E0] flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <i className="fa-solid fa-file-pdf text-[#B3261E]"></i>
                  <span className="font-normal text-[#16232B] truncate">{doc.name}</span>
                </div>
                <span className="text-[10px] text-[#5B6B73] shrink-0 ml-2 tabular-nums">
                  {doc.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {!submissionSuccess && (
        <div className="pt-4 border-t border-[#DDE2E0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/extensions/loan/${normalizedType}/banks/${bank.id}`)}
            className="min-h-[44px] text-xs sm:text-sm font-medium px-4 py-2 rounded-[8px] border border-[#DDE2E0] hover:bg-[#F5F6F4] text-[#16232B] active:translate-y-[1px] transition-colors flex items-center gap-1.5 cursor-pointer order-2 sm:order-1"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Back to details</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 order-1 sm:order-2"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                <span>Submitting application...</span>
              </>
            ) : (
              <span>Submit application to {bank.name}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
