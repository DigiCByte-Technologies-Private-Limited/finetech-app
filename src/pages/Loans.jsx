import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveLoans, getLoanTypes } from '../services/loansApi';
import { calculateEmi } from '../utils/emi';
import { formatCurrency } from '../utils/format';
import '../utils/chartConfig';
import { Doughnut } from 'react-chartjs-2';

/**
 * Loans Page Component.
 * Implements strict design system:
 * - Clean loan product selection cards with 44px buttons and 8px radii.
 * - Synchronized EMI calculator with non-floating inputs and Chart.js Doughnut.
 * - Active loans tracker formatted as dense bank-statement rows with right-aligned amounts.
 */
export default function Loans() {
  const navigate = useNavigate();

  const [activeLoans, setActiveLoans] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // EMI calculator state
  const [amount, setAmount] = useState(1000000); // 10 Lakhs
  const [rate, setRate] = useState(9.5); // 9.5% p.a.
  const [tenure, setTenure] = useState(60); // 60 months

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [loans, types] = await Promise.all([
          getActiveLoans(),
          getLoanTypes()
        ]);
        if (isMounted) {
          setActiveLoans(loans);
          setLoanTypes(types);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load loans data:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const emiDetails = calculateEmi(amount, rate, tenure);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
          Loans and credit facilities
        </h1>
        <p className="text-[13px] text-[#5B6B73]">
          Compare interest rates from partner banks, calculate monthly EMIs, and monitor active loan accounts.
        </p>
      </div>

      {/* 1. LOAN TYPE PRODUCTS */}
      <section className="space-y-3">
        <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
          Available loan facilities
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loanTypes.map((item) => (
              <div
                key={item.type}
                className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-semibold text-[#16232B]">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-medium text-[#0B4F6C] bg-[#E3EEF3] px-2 py-0.5 rounded-[4px] tabular-nums">
                      From {item.rateFrom}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#5B6B73] mb-4">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/extensions?type=${item.type}`)}
                  className="w-full h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[13px] rounded-[8px] transition-colors flex items-center justify-center cursor-pointer focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
                >
                  <span>Apply for {item.title.toLowerCase()}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. EMI CALCULATOR */}
      <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-[#DDE2E0]">
          <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
            Interactive EMI calculator
          </h2>
          <p className="text-[13px] text-[#5B6B73]">
            Adjust principal amount, annual interest rate, and tenure to estimate monthly payments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px] font-medium">
                <label htmlFor="amount-input" className="text-[#16232B]">
                  Loan amount (principal)
                </label>
                <div className="flex items-center gap-1 border border-[#DDE2E0] rounded-[4px] px-2.5 py-1 bg-[#F5F6F4]">
                  <span className="text-[#5B6B73]">₹</span>
                  <input
                    id="amount-input"
                    type="number"
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-right font-semibold text-[#16232B] tabular-nums bg-transparent focus:outline-none text-[13px]"
                  />
                </div>
              </div>

              <input
                type="range"
                min="50000"
                max="10000000"
                step="25000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#0B4F6C] cursor-pointer h-2 bg-[#F5F6F4] rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                <span>₹50,000</span>
                <span>₹1 Crore</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px] font-medium">
                <label htmlFor="rate-input" className="text-[#16232B]">
                  Annual interest rate (%)
                </label>
                <div className="flex items-center gap-1 border border-[#DDE2E0] rounded-[4px] px-2.5 py-1 bg-[#F5F6F4]">
                  <input
                    id="rate-input"
                    type="number"
                    min="0"
                    max="25"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                    className="w-16 text-right font-semibold text-[#16232B] tabular-nums bg-transparent focus:outline-none text-[13px]"
                  />
                  <span className="text-[#5B6B73]">%</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="25"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-[#0B4F6C] cursor-pointer h-2 bg-[#F5F6F4] rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                <span>0% (Promo rate)</span>
                <span>25%</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px] font-medium">
                <label htmlFor="tenure-input" className="text-[#16232B]">
                  Loan tenure (months)
                </label>
                <div className="flex items-center gap-1 border border-[#DDE2E0] rounded-[4px] px-2.5 py-1 bg-[#F5F6F4]">
                  <input
                    id="tenure-input"
                    type="number"
                    min="6"
                    max="360"
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-right font-semibold text-[#16232B] tabular-nums bg-transparent focus:outline-none text-[13px]"
                  />
                  <span className="text-[#5B6B73]">Mo</span>
                </div>
              </div>

              <input
                type="range"
                min="6"
                max="360"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-[#0B4F6C] cursor-pointer h-2 bg-[#F5F6F4] rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums">
                <span>6 Months</span>
                <span>{tenure} Mo ({(tenure / 12).toFixed(1)} Yrs)</span>
                <span>360 Months</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-[#16232B] text-white rounded-[8px] p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <span className="text-[13px] text-[#DDE2E0] block">
                Estimated monthly EMI
              </span>
              <p className="text-3xl font-semibold text-white tracking-tight tabular-nums mt-1">
                {formatCurrency(emiDetails.emi)}
              </p>
              <span className="text-[11px] text-[#5B6B73]">Fixed monthly payment</span>

              {/* Financial Breakdowns */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-[13px]">
                <div className="flex justify-between text-[#DDE2E0]">
                  <span>Principal amount:</span>
                  <span className="font-medium text-white tabular-nums">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#DDE2E0]">
                  <span>Total interest payable:</span>
                  <span className="font-medium text-white tabular-nums">
                    {formatCurrency(emiDetails.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between text-[#DDE2E0] pt-2 border-t border-white/10">
                  <span className="font-semibold text-white">Total amount payable:</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatCurrency(emiDetails.totalPayable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Chart.js Doughnut Breakup */}
            <div className="pt-2 border-t border-white/10">
              <div className="h-32 w-full flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: ['Principal', 'Interest'],
                    datasets: [
                      {
                        data: [amount, emiDetails.totalInterest || 1],
                        backgroundColor: ['#0B4F6C', '#DDE2E0'],
                        borderWidth: 1,
                        borderColor: '#16232B'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                        }
                      }
                    },
                    cutout: '72%'
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#DDE2E0] pt-2 tabular-nums">
                <span>Principal: {emiDetails.principalPercent}%</span>
                <span>Interest: {emiDetails.interestPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE LOANS TRACKER: Dense statement table rows with right-aligned amounts */}
      <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-[#DDE2E0]">
          <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
            Active loans tracker
          </h2>
          <p className="text-[13px] text-[#5B6B73]">
            Currently active loans linked to your identity across partner lenders.
          </p>
        </div>

        {activeLoans.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-[#5B6B73]">
            No active loan accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#DDE2E0] text-[#5B6B73] text-[11px] uppercase tracking-wider font-medium">
                  <th className="py-2.5 font-medium">Lender</th>
                  <th className="py-2.5 font-medium">Facility type</th>
                  <th className="py-2.5 font-medium text-right">Monthly EMI</th>
                  <th className="py-2.5 font-medium text-right">Repaid progress</th>
                  <th className="py-2.5 font-medium text-right">Outstanding balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2E0]">
                {activeLoans.map((loan) => {
                  const percentPaid = Math.round(
                    (loan.paidMonths / loan.tenureMonths) * 100
                  );
                  return (
                    <tr key={loan.id} className="hover:bg-[#F5F6F4]/60 transition-colors">
                      <td className="py-3 font-medium text-[#16232B]">
                        {loan.bankName}
                      </td>
                      <td className="py-3 text-[#5B6B73]">
                        {loan.type}
                      </td>
                      <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                        {formatCurrency(loan.emi)}
                      </td>
                      <td className="py-3 text-right tabular-nums whitespace-nowrap">
                        <span className="text-[#16232B] font-medium">{loan.paidMonths}</span>
                        <span className="text-[#5B6B73]"> / {loan.tenureMonths} EMIs ({percentPaid}%)</span>
                      </td>
                      <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                        {formatCurrency(loan.outstanding)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
