import { Outlet, useLocation } from 'react-router-dom';
import { LoanFlowProvider } from '../context/LoanFlowContext';

/**
 * Stepper bar showing: Type -> Documents -> Bank -> Details -> Review.
 */
function Stepper() {
  const location = useLocation();

  // Determine current active step index based on path
  const getActiveStep = () => {
    const path = location.pathname;
    if (path.includes('/review')) return 5;
    if (path.includes('/banks/')) return 4;
    if (path.includes('/banks')) return 3;
    if (path.includes('/documents')) return 2;
    return 1;
  };

  const activeStep = getActiveStep();

  const steps = [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Documents' },
    { number: 3, label: 'Bank' },
    { number: 4, label: 'Details' },
    { number: 5, label: 'Review' }
  ];

  return (
    <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 -translate-y-1/2 h-[1px] bg-[#DDE2E0] z-0 hidden sm:block" />

        {steps.map((step) => {
          const isCompleted = activeStep > step.number;
          const isCurrent = activeStep === step.number;

          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center flex-1 text-center"
            >
              <div
                className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-medium tabular-nums transition-colors duration-150 ${
                  isCompleted
                    ? 'bg-[#0B4F6C] text-white'
                    : isCurrent
                    ? 'bg-[#0B4F6C] text-white ring-2 ring-[#0B4F6C]/20'
                    : 'bg-[#F5F6F4] text-[#5B6B73] border border-[#DDE2E0]'
                }`}
              >
                {isCompleted ? (
                  <i className="fa-solid fa-check text-[11px]"></i>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              <span
                className={`text-xs mt-2 transition-colors ${
                  isCurrent
                    ? 'text-[#0B4F6C] font-semibold'
                    : isCompleted
                    ? 'text-[#16232B] font-medium'
                    : 'text-[#5B6B73]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Extensions Layout Component.
 * Wraps all /extensions routes in LoanFlowProvider and renders the Stepper and <Outlet />.
 */
export default function Extensions() {
  return (
    <LoanFlowProvider>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#16232B] tracking-tight">
              Extensions
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6B73] mt-0.5">
              Complete your multi-step loan application and document verification.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium bg-[#E3EEF3] border border-[#0B4F6C]/20 text-[#0B4F6C] w-fit">
            <i className="fa-solid fa-shield-halved text-xs"></i>
            100% paperless digital flow
          </span>
        </div>

        {/* Progress Stepper */}
        <Stepper />

        {/* Nested Step Views */}
        <Outlet />
      </div>
    </LoanFlowProvider>
  );
}
