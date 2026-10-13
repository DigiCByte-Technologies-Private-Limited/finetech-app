import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getDashboardData } from '../services/dashboardApi';
import { formatCurrency } from '../utils/format';
import '../utils/chartConfig';
import { Bar, Doughnut } from 'react-chartjs-2';

/**
 * Dashboard Page Component.
 * Structured by priority:
 * 1. "Due soon" section with statement-style dense rows, right-aligned amounts,
 *    and the single Marigold #F2B134 primary action.
 * 2. Credit score with a thin horizontal scale and marker, alongside KYC status.
 * 3. Compact figures in a single bordered strip (instead of four separate stat cards).
 * 4. Monthly cashflow and liabilities analytics.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paidNotice, setPaidNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const result = await getDashboardData();
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Normalise score position (300 to 900)
  const score = data?.creditScore || 742;
  const scorePercent = Math.min(100, Math.max(0, ((score - 300) / 600) * 100));

  // Upcoming obligations list sorted by due date
  const upcomingObligations = [
    {
      id: 'ob-1',
      title: 'HDFC Bank credit card bill',
      account: '•••• 4321',
      dueDate: '18 Oct 2026',
      daysLeft: 5,
      amount: 4200,
      type: 'card'
    },
    {
      id: 'ob-2',
      title: 'SBI Home loan EMI',
      account: 'HL-882190',
      dueDate: '24 Oct 2026',
      daysLeft: 11,
      amount: 24500,
      type: 'loan'
    },
    {
      id: 'ob-3',
      title: 'Bajaj Finserv auto loan EMI',
      account: 'AL-331049',
      dueDate: '28 Oct 2026',
      daysLeft: 15,
      amount: 8200,
      type: 'loan'
    },
    {
      id: 'ob-4',
      title: 'Star Health insurance renewal',
      account: 'POL-HL-9921',
      dueDate: '15 Nov 2026',
      daysLeft: 33,
      amount: 14800,
      type: 'policy'
    }
  ];

  const handlePayDue = () => {
    setPaidNotice(true);
    setTimeout(() => setPaidNotice(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast feedback */}
      {paidNotice && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 bg-[#16232B] text-white px-4 py-3 rounded-[8px] border border-[#DDE2E0] shadow-sm flex items-center gap-2 text-[13px]"
        >
          <i className="fa-solid fa-circle-check text-[#1F7A4D]"></i>
          <span>Payment of ₹4,200 processed. Statement updated.</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
          Financial overview
        </h1>
        <p className="text-[13px] text-[#5B6B73]">
          Upcoming commitments and active credit status for {user?.name || 'Rahul Sharma'}.
        </p>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <div className="h-40 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"></div>
          <div className="h-24 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"></div>
          <div className="h-16 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. DUE SOON: Leading section with primary action */}
          <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2E0]">
              <div>
                <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
                  Due soon
                </h2>
                <p className="text-[13px] text-[#5B6B73]">
                  Upcoming card bills, monthly EMIs and policy renewals sorted by date.
                </p>
              </div>

              {/* Marigold Accent: The single primary action on the page */}
              <button
                type="button"
                onClick={handlePayDue}
                className="h-[44px] px-5 bg-[#F2B134] hover:bg-[#e0a32b] text-[#16232B] font-semibold text-[15px] rounded-[8px] transition-colors cursor-pointer shrink-0 focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2 tabular-nums"
              >
                Pay ₹4,200 by 18 Oct
              </button>
            </div>

            {/* Statement-style dense rows */}
            <div className="divide-y divide-[#DDE2E0]">
              {upcomingObligations.map((item) => {
                const isDueSoon = item.daysLeft <= 7;
                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-[#16232B]">
                          {item.title}
                        </span>
                        <span className="text-[13px] text-[#5B6B73] tabular-nums">
                          ({item.account})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[13px] text-[#5B6B73]">
                        <span>Due {item.dueDate}</span>
                        <span>•</span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[11px] font-medium tabular-nums ${
                            isDueSoon
                              ? 'bg-[#B3261E]/10 text-[#B3261E]'
                              : 'bg-[#F5F6F4] text-[#5B6B73]'
                          }`}
                        >
                          {item.daysLeft} days left
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[17px] font-semibold text-[#16232B] tabular-nums block">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-[#5B6B73]">
                        {item.type === 'card'
                          ? 'Total due'
                          : item.type === 'loan'
                          ? 'Monthly EMI'
                          : 'Annual premium'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. CREDIT SCORE & KYC STATUS */}
          <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Credit Score scale */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
                      Credit score
                    </h2>
                    <p className="text-[13px] text-[#5B6B73]">
                      Based on Credit Information Bureau of India records.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-semibold text-[#16232B] tabular-nums">
                      {score}
                    </span>
                    <span className="text-[13px] font-medium text-[#1F7A4D] ml-2">
                      Good
                    </span>
                  </div>
                </div>

                {/* Thin horizontal scale */}
                <div className="space-y-1.5 pt-2">
                  <div className="relative h-2 w-full bg-[#DDE2E0] rounded-full overflow-hidden flex">
                    <div className="w-[30%] bg-[#B3261E]" title="Poor (300-550)" />
                    <div className="w-[35%] bg-[#B86E00]" title="Fair (550-700)" />
                    <div className="w-[35%] bg-[#1F7A4D]" title="Good (700-900)" />
                  </div>

                  {/* Marker indicator position */}
                  <div className="relative w-full h-4">
                    <div
                      className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${scorePercent}%` }}
                    >
                      <div className="w-2.5 h-2.5 bg-[#16232B] rotate-45 border border-white"></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-[#5B6B73] tabular-nums pt-0.5">
                    <span>300 (Poor)</span>
                    <span>650 (Fair)</span>
                    <span>750 (Good)</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>
              </div>

              {/* KYC Status box */}
              <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#DDE2E0] lg:pl-6 pt-4 lg:pt-0 space-y-2">
                <span className="text-[13px] font-medium text-[#5B6B73] block">
                  Identity verification
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[13px] font-medium bg-[#1F7A4D]/10 text-[#1F7A4D] border border-[#1F7A4D]/20">
                    <i className="fa-solid fa-circle-check text-xs"></i>
                    <span>KYC verified</span>
                  </span>
                </div>
                <p className="text-[13px] text-[#5B6B73]">
                  Aadhaar and PAN matched with registered mobile number.
                </p>
              </div>
            </div>
          </section>

          {/* 3. COMPACT FIGURES IN A SINGLE BORDERED STRIP (Replaces four identical stat tiles) */}
          <section className="bg-white border border-[#DDE2E0] rounded-[8px] overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DDE2E0]">
              {/* Item 1 */}
              <div className="p-4 sm:p-5">
                <span className="text-[13px] text-[#5B6B73] block">
                  Total card due
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-[#16232B] tabular-nums mt-1 block">
                  {formatCurrency(data.totalCardDue)}
                </span>
                <Link
                  to="/cards"
                  className="text-[13px] text-[#0B4F6C] hover:underline mt-1 inline-block"
                >
                  View 2 cards
                </Link>
              </div>

              {/* Item 2 */}
              <div className="p-4 sm:p-5">
                <span className="text-[13px] text-[#5B6B73] block">
                  Active loans
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-[#16232B] tabular-nums mt-1 block">
                  {data.activeLoansCount} facilities
                </span>
                <Link
                  to="/loans"
                  className="text-[13px] text-[#0B4F6C] hover:underline mt-1 inline-block"
                >
                  View loan tracker
                </Link>
              </div>

              {/* Item 3 */}
              <div className="p-4 sm:p-5">
                <span className="text-[13px] text-[#5B6B73] block">
                  Active policies
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-[#16232B] tabular-nums mt-1 block">
                  {data.activePoliciesCount} policies
                </span>
                <Link
                  to="/insurance"
                  className="text-[13px] text-[#0B4F6C] hover:underline mt-1 inline-block"
                >
                  Manage insurance
                </Link>
              </div>

              {/* Item 4 */}
              <div className="p-4 sm:p-5">
                <span className="text-[13px] text-[#5B6B73] block">
                  Monthly EMI outgo
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-[#16232B] tabular-nums mt-1 block">
                  {formatCurrency(data.totalMonthlyEmi)}
                </span>
                <span className="text-[13px] text-[#5B6B73] mt-1 block">
                  Auto-debit on 5th
                </span>
              </div>
            </div>
          </section>

          {/* 4. VISUAL ANALYTICS: Chart.js Inflow vs Outflow and Liabilities */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE2E0] mb-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#16232B]">
                    Monthly cashflow
                  </h3>
                  <p className="text-[13px] text-[#5B6B73]">
                    Net salary credits vs total monthly expenditures over the last 6 months.
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <Bar
                  data={{
                    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                      {
                        label: 'Income inflow',
                        data: [95000, 98000, 96500, 102000, 99000, 105000],
                        backgroundColor: '#0B4F6C',
                        borderRadius: 4
                      },
                      {
                        label: 'Outflow spend',
                        data: [42000, 45500, 39000, 51200, 44800, 48000],
                        backgroundColor: '#DDE2E0',
                        borderRadius: 4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          boxWidth: 10,
                          font: { family: 'IBM Plex Sans', size: 12 }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            ` ${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                        }
                      }
                    },
                    scales: {
                      x: { grid: { display: false } },
                      y: {
                        grid: { color: '#F5F6F4' },
                        ticks: {
                          callback: (v) => `₹${(v / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#16232B] pb-1 border-b border-[#DDE2E0]">
                  Debt & commitments
                </h3>
                <p className="text-[13px] text-[#5B6B73] mt-2 mb-4">
                  Breakdown across active credit card balances and loan principals.
                </p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: ['Cards due', 'Outstanding loans', 'Insurance'],
                    datasets: [
                      {
                        data: [
                          data.totalCardDue || 42800,
                          data.userLoans
                            ? data.userLoans.reduce((a, b) => a + b.outstanding, 0)
                            : 1850000,
                          data.userPolicies
                            ? data.userPolicies.reduce((a, b) => a + b.premium, 0)
                            : 26000
                        ],
                        backgroundColor: ['#0B4F6C', '#5B6B73', '#DDE2E0'],
                        borderWidth: 1,
                        borderColor: '#FFFFFF'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 8,
                          font: { family: 'IBM Plex Sans', size: 11 }
                        }
                      },
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
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
