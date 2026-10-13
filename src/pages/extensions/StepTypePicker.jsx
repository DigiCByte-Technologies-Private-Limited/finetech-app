import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoanFlow } from '../../context/useLoanFlow';

/**
 * Step 1: Loan Type Picker.
 * If ?type= is present in the URL, preselects it and immediately skips ahead to Step 2.
 */
export default function StepTypePicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loanType, setLoanType } = useLoanFlow();

  const [selected, setSelected] = useState(loanType || 'personal');

  // Check URL query param ?type=...
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (
      typeParam &&
      ['personal', 'home', 'auto', 'instant'].includes(typeParam.toLowerCase())
    ) {
      const normalized = typeParam.toLowerCase();
      setLoanType(normalized);
      // Skip ahead to Step 2 (Documents)
      navigate(`/extensions/loan/${normalized}/documents`, { replace: true });
    }
  }, [searchParams, navigate, setLoanType]);

  const options = [
    {
      id: 'personal',
      title: 'Personal loan',
      icon: 'fa-solid fa-user-tag',
      badge: 'Up to ₹40 lakhs',
      description: 'Collateral-free cash for travel, medical emergencies, weddings, or debt consolidation.'
    },
    {
      id: 'home',
      title: 'Home loan',
      icon: 'fa-solid fa-house-chimney',
      badge: 'Up to ₹1 crore',
      description: 'Housing finance for purchasing, constructing, or renovating residential properties.'
    },
    {
      id: 'auto',
      title: 'Auto loan',
      icon: 'fa-solid fa-car',
      badge: 'Up to 100% funding',
      description: 'Vehicle financing for new or pre-owned four-wheelers and commercial vehicles.'
    },
    {
      id: 'instant',
      title: 'Instant cash',
      icon: 'fa-solid fa-bolt',
      badge: 'Instant disbursal',
      description: 'Emergency small-ticket funds disbursed directly to your bank account within 15 minutes.'
    }
  ];

  const handleContinue = () => {
    setLoanType(selected);
    navigate(`/extensions/loan/${selected}/documents`);
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
      <div className="pb-4 border-b border-[#DDE2E0]">
        <span className="text-xs font-medium text-[#5B6B73] block">
          Step 1 of 5
        </span>
        <h2 className="text-lg font-semibold text-[#16232B] tracking-tight mt-1">
          Select loan facility
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B73] mt-0.5">
          Choose the loan product you wish to apply for to view the customized document requirements.
        </p>
      </div>

      {/* Grid of 4 Loan Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isChosen = selected === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`p-4 sm:p-5 rounded-[8px] border transition-colors flex flex-col justify-between cursor-pointer ${
                isChosen
                  ? 'border-[#0B4F6C] bg-[#E3EEF3]/40'
                  : 'border-[#DDE2E0] bg-white hover:border-[#16232B]/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-[4px] flex items-center justify-center text-sm transition-colors ${
                      isChosen
                        ? 'bg-[#0B4F6C] text-white'
                        : 'bg-[#F5F6F4] text-[#16232B]'
                    }`}
                  >
                    <i className={opt.icon}></i>
                  </div>

                  <span className="text-[11px] font-medium text-[#5B6B73] bg-[#F5F6F4] border border-[#DDE2E0] px-2 py-0.5 rounded-[4px]">
                    {opt.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#16232B] mb-1">{opt.title}</h3>
                <p className="text-xs text-[#5B6B73] leading-relaxed mb-4">
                  {opt.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#DDE2E0] text-xs">
                <span className="text-[#5B6B73]">Step 2: Document verification</span>
                <span
                  className={`font-medium flex items-center gap-1 ${
                    isChosen ? 'text-[#0B4F6C]' : 'text-[#5B6B73]'
                  }`}
                >
                  {isChosen ? (
                    <>
                      <i className="fa-solid fa-circle-check text-xs"></i>
                      <span>Selected</span>
                    </>
                  ) : (
                    <span>Select</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      <div className="pt-4 border-t border-[#DDE2E0] flex items-center justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="min-h-[44px] px-5 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors cursor-pointer"
        >
          Continue to documents
        </button>
      </div>
    </div>
  );
}
