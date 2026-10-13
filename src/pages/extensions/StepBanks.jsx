import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { banks } from '../../data/banks';
import { userCards, userLoans } from '../../data/userProducts';
import { getBankRelationship } from '../../utils/relationship';
import { useLoanFlow } from '../../context/useLoanFlow';

/**
 * Step 3: Bank List Selection Component (/extensions/loan/:type/banks).
 * Lists banks supporting the selected loan type.
 * Features:
 * - Badges: "You have a card here" / "You have a loan here" / "You have both"
 * - Sort by lowest interest rate
 * - Filter "Only my banks"
 * - Stores selected bank in context and navigates to /extensions/loan/:type/banks/:bankId
 */
export default function StepBanks() {
  const { type = 'personal' } = useParams();
  const navigate = useNavigate();
  const { setSelectedBank, selectedBank } = useLoanFlow();

  const [sortByLowestRate, setSortByLowestRate] = useState(true);
  const [onlyMyBanks, setOnlyMyBanks] = useState(false);

  const normalizedType = type.toLowerCase();

  // Filter banks supporting this loan type
  const matchingBanks = useMemo(() => {
    return banks.filter((b) => b.loanTypes.includes(normalizedType));
  }, [normalizedType]);

  // Compute relationship data for each bank
  const banksWithRelationship = useMemo(() => {
    return matchingBanks.map((bank) => {
      const rel = getBankRelationship(bank.id, userCards, userLoans);
      return {
        ...bank,
        relationship: rel
      };
    });
  }, [matchingBanks]);

  // Apply filters and sorting
  const displayedBanks = useMemo(() => {
    let result = [...banksWithRelationship];

    // Filter "Only my banks"
    if (onlyMyBanks) {
      result = result.filter((b) => b.relationship.isExistingCustomer);
    }

    // Sort by lowest interest rate
    if (sortByLowestRate) {
      result.sort((a, b) => a.rateMin - b.rateMin);
    }

    return result;
  }, [banksWithRelationship, onlyMyBanks, sortByLowestRate]);

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    navigate(`/extensions/loan/${normalizedType}/banks/${bank.id}`);
  };

  // Helper for bank relationship badge
  const renderRelationshipBadge = (rel) => {
    if (rel.hasCard && rel.hasLoan) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#1F7A4D]/10 text-[#1F7A4D] border border-[#1F7A4D]/20">
          <i className="fa-solid fa-star text-[10px]"></i>
          <span>You have both</span>
        </span>
      );
    }
    if (rel.hasCard) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#E3EEF3] text-[#0B4F6C] border border-[#0B4F6C]/20">
          <i className="fa-solid fa-credit-card text-[10px]"></i>
          <span>You have a card here</span>
        </span>
      );
    }
    if (rel.hasLoan) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#B86E00]/10 text-[#B86E00] border border-[#B86E00]/20">
          <i className="fa-solid fa-hand-holding-dollar text-[10px]"></i>
          <span>You have a loan here</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2E0]">
        <div>
          <span className="text-xs font-medium text-[#5B6B73]">
            Step 3 of 5 — {normalizedType} loan
          </span>
          <h2 className="text-lg font-semibold text-[#16232B] tracking-tight mt-1">
            Choose lending bank
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B73] mt-0.5">
            Partner banks offering {normalizedType} loan facilities with fast approval.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle "Only my banks" */}
          <button
            type="button"
            onClick={() => setOnlyMyBanks(!onlyMyBanks)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-[8px] text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] ${
              onlyMyBanks
                ? 'bg-[#0B4F6C] text-white border-[#0B4F6C]'
                : 'bg-white text-[#16232B] border-[#DDE2E0] hover:bg-[#F5F6F4]'
            }`}
          >
            <i className={`fa-solid ${onlyMyBanks ? 'fa-check' : 'fa-building'}`}></i>
            <span>Only my banks</span>
          </button>

          {/* Sort by lowest interest rate */}
          <button
            type="button"
            onClick={() => setSortByLowestRate(!sortByLowestRate)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-[8px] text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px] ${
              sortByLowestRate
                ? 'bg-[#16232B] text-white border-[#16232B]'
                : 'bg-white text-[#16232B] border-[#DDE2E0] hover:bg-[#F5F6F4]'
            }`}
          >
            <i className="fa-solid fa-arrow-down-short-wide text-xs"></i>
            <span>Lowest rate first</span>
          </button>
        </div>
      </div>

      {/* Bank Cards Grid */}
      {displayedBanks.length === 0 ? (
        <div className="p-8 text-center bg-[#F5F6F4] rounded-[8px] border border-[#DDE2E0] text-xs text-[#5B6B73] space-y-2">
          <i className="fa-solid fa-filter-circle-xmark text-xl text-[#5B6B73] block mb-1"></i>
          <p className="font-medium text-[#16232B]">No banks match your active filter.</p>
          <button
            type="button"
            onClick={() => setOnlyMyBanks(false)}
            className="text-[#0B4F6C] hover:underline font-medium cursor-pointer"
          >
            Clear &ldquo;Only my banks&rdquo; filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBanks.map((bank) => {
            const isSelected = selectedBank?.id === bank.id;

            return (
              <div
                key={bank.id}
                onClick={() => handleSelectBank(bank)}
                className={`p-4 sm:p-5 rounded-[8px] border transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0B4F6C] bg-[#E3EEF3]/40'
                    : 'border-[#DDE2E0] bg-white hover:border-[#16232B]/30'
                }`}
              >
                <div>
                  {/* Bank Header + Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[4px] bg-[#F5F6F4] text-[#16232B] border border-[#DDE2E0] flex items-center justify-center text-sm">
                        <i className={bank.icon}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#16232B] text-sm leading-tight">
                          {bank.name}
                        </h3>
                        <span className="text-[10px] font-medium text-[#5B6B73]">
                          {bank.id.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Pre-existing relationship badge */}
                    {renderRelationshipBadge(bank.relationship)}
                  </div>

                  {/* Financial Parameters Box */}
                  <div className="bg-[#F5F6F4] rounded-[4px] p-3 border border-[#DDE2E0] space-y-1.5 text-xs mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B73]">Interest rate:</span>
                      <strong className="text-[#0B4F6C] font-semibold tabular-nums">
                        {bank.rateMin}% - {bank.rateMax}% p.a.
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B73]">Processing fee:</span>
                      <span className="text-[#16232B] font-medium tabular-nums">
                        {bank.processingFee}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B73]">Max tenure:</span>
                      <span className="text-[#16232B] font-medium tabular-nums">
                        {bank.maxTenureMonths} months ({Math.round(bank.maxTenureMonths / 12)} yrs)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DDE2E0] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#5B6B73]">
                    Step 4: Details & check
                  </span>
                  <span className="font-medium text-[#0B4F6C] flex items-center gap-1">
                    <span>Select bank</span>
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back Control */}
      <div className="pt-4 border-t border-[#DDE2E0] flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/extensions/loan/${normalizedType}/documents`)}
          className="min-h-[44px] text-xs sm:text-sm font-medium px-4 py-2 rounded-[8px] border border-[#DDE2E0] hover:bg-[#F5F6F4] text-[#16232B] active:translate-y-[1px] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Back to documents</span>
        </button>

        <span className="text-xs text-[#5B6B73]">
          Click any bank card to proceed to application details
        </span>
      </div>
    </div>
  );
}
