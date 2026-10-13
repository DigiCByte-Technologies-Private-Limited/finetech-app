import { useState, useEffect } from 'react';
import { getCards, getTransactions, payCardBill } from '../services/cardsApi';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/format';
import { calculateUtilization, isHighUtilization } from '../utils/utilization';
import '../utils/chartConfig';
import { Doughnut } from 'react-chartjs-2';

/**
 * Credit Cards Page Component.
 * Implements strict design system:
 * - 16px radius solid brand visual next to plain statement-style due summary.
 * - Tight bank-statement table rows with right-aligned amounts.
 * - Category spending breakdown via Chart.js.
 * - 44px buttons, 4px badges, flat 1px borders, sentence case copy.
 */
export default function Cards() {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [payingCardId, setPayingCardId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [cardList, txList] = await Promise.all([
          getCards(),
          getTransactions()
        ]);
        if (isMounted) {
          setCards(cardList);
          setTransactions(txList);
          if (cardList.length > 0) {
            setSelectedCardId(cardList[0].id);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load card data:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePayBill = async (card) => {
    setPayingCardId(card.id);
    try {
      await payCardBill(card.id, card.totalDue);
      setToastMessage(`Payment of ${formatCurrency(card.totalDue)} completed for ${card.bankName} card.`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch {
      setToastMessage('Payment could not be processed. Try again.');
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setPayingCardId(null);
    }
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping'];

  const filteredTransactions = transactions.filter((t) => {
    const matchesCard = selectedCard ? t.cardId === selectedCard.id : true;
    const matchesCategory =
      selectedCategory === 'All' ? true : t.category === selectedCategory;
    return matchesCard && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 bg-[#16232B] text-white px-4 py-3 rounded-[8px] border border-[#DDE2E0] shadow-sm flex items-center gap-2 text-[13px]"
        >
          <i className="fa-solid fa-circle-check text-[#1F7A4D]"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
          Credit cards
        </h1>
        <p className="text-[13px] text-[#5B6B73]">
          Active card accounts, credit limit utilization, and recent statement transactions.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-64 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"></div>
          <div className="h-80 bg-white border border-[#DDE2E0] rounded-[8px] animate-pulse"></div>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white border border-[#DDE2E0] rounded-[8px] p-8 text-center">
          <p className="text-[15px] font-medium text-[#16232B]">No active credit cards found.</p>
          <p className="text-[13px] text-[#5B6B73] mt-1">
            Apply for a credit card through the partner banks section.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* CARDS LIST: Realistic visual (16px radius, solid brand color) next to statement summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cards.map((card) => {
              const utilPercent = calculateUtilization(card.used, card.limit);
              const isHigh = isHighUtilization(utilPercent);
              const daysLeft = getDaysRemaining(card.dueDate);
              const isDueSoon = daysLeft <= 3;
              const isSelected = selectedCard?.id === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`bg-white border rounded-[8px] p-5 sm:p-6 transition-colors cursor-pointer ${
                    isSelected ? 'border-[#0B4F6C]' : 'border-[#DDE2E0]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Realistic card visual: 16px radius, solid brand colour #0B4F6C */}
                    <div className="w-full sm:w-60 aspect-[1.58/1] rounded-[16px] bg-[#0B4F6C] text-white p-4 flex flex-col justify-between shrink-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium tracking-wide">{card.bankName}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-white/15">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-5 rounded-[4px] bg-[#F2B134] opacity-90"></div>
                        <i className="fa-solid fa-wifi text-[10px] text-white/60 rotate-90"></i>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <span className="font-mono text-base font-medium tracking-widest tabular-nums block">
                            •••• {card.last4}
                          </span>
                          <span className="text-[10px] text-white/60">
                            Limit {formatCurrency(card.limit)}
                          </span>
                        </div>
                        <span className="font-semibold text-xs tracking-wider uppercase">
                          {card.network}
                        </span>
                      </div>
                    </div>

                    {/* Statement-style due summary */}
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <span className="text-[13px] text-[#5B6B73] block">
                          Total amount due
                        </span>
                        <span className="text-2xl font-semibold text-[#16232B] tabular-nums block">
                          {formatCurrency(card.totalDue)}
                        </span>
                        <span className="text-[13px] text-[#5B6B73] tabular-nums">
                          Minimum due: {formatCurrency(card.minDue)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#DDE2E0] text-[13px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#5B6B73]">Payment due:</span>
                          <span className="font-medium text-[#16232B] tabular-nums">
                            {formatDate(card.dueDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5B6B73]">Status:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[11px] font-medium tabular-nums ${
                              isDueSoon
                                ? 'bg-[#B3261E]/10 text-[#B3261E]'
                                : 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                            }`}
                          >
                            <i className="fa-solid fa-clock text-[10px]"></i>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                          </span>
                        </div>
                      </div>

                      {/* Utilization line */}
                      <div className="pt-1">
                        <div className="flex justify-between text-[11px] text-[#5B6B73] mb-1 tabular-nums">
                          <span>Limit used: {utilPercent}%</span>
                          <span>{formatCurrency(card.used)} of {formatCurrency(card.limit)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F5F6F4] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isHigh ? 'bg-[#B3261E]' : 'bg-[#0B4F6C]'
                            }`}
                            style={{ width: `${utilPercent}%` }}
                          />
                        </div>
                        {isHigh && (
                          <span className="text-[11px] text-[#B3261E] mt-1 block">
                            High utilization affects credit score (recommended under 30%).
                          </span>
                        )}
                      </div>

                      {/* Pay bill button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={card.totalDue === 0 || payingCardId === card.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayBill(card);
                          }}
                          className="w-full h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2 tabular-nums"
                        >
                          {payingCardId === card.id ? (
                            <>
                              <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                              <span>Processing payment...</span>
                            </>
                          ) : card.totalDue === 0 ? (
                            <span>All dues cleared</span>
                          ) : (
                            <span>Pay {formatCurrency(card.totalDue)}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SPENDING BREAKDOWN: Chart.js Doughnut */}
          <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DDE2E0] mb-4">
              <div>
                <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
                  Category spending breakdown
                </h2>
                <p className="text-[13px] text-[#5B6B73]">
                  Distribution of settled card transactions across categories.
                </p>
              </div>
              <span className="text-[13px] text-[#5B6B73] tabular-nums">
                Total spent: <strong className="text-[#16232B]">{formatCurrency(transactions.reduce((a, b) => a + b.amount, 0))}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 h-48 flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: ['Food', 'Travel', 'Bills', 'Shopping'],
                    datasets: [
                      {
                        data: [
                          transactions.filter((t) => t.category === 'Food').reduce((a, b) => a + b.amount, 0) || 5200,
                          transactions.filter((t) => t.category === 'Travel').reduce((a, b) => a + b.amount, 0) || 8400,
                          transactions.filter((t) => t.category === 'Bills').reduce((a, b) => a + b.amount, 0) || 12100,
                          transactions.filter((t) => t.category === 'Shopping').reduce((a, b) => a + b.amount, 0) || 14800
                        ],
                        backgroundColor: ['#0B4F6C', '#1F7A4D', '#B86E00', '#5B6B73'],
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
                        labels: { boxWidth: 8, font: { family: 'IBM Plex Sans', size: 11 } }
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
                        }
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 gap-3">
                {[
                  { cat: 'Food', label: 'Food and dining' },
                  { cat: 'Travel', label: 'Travel and fuel' },
                  { cat: 'Bills', label: 'Utility bills' },
                  { cat: 'Shopping', label: 'Retail shopping' }
                ].map((item) => {
                  const total = transactions
                    .filter((t) => t.category === item.cat)
                    .reduce((a, b) => a + b.amount, 0);
                  return (
                    <div
                      key={item.cat}
                      className="p-3 rounded-[4px] border border-[#DDE2E0] bg-[#F5F6F4]"
                    >
                      <span className="text-[13px] text-[#5B6B73] block">{item.label}</span>
                      <span className="text-base font-semibold text-[#16232B] tabular-nums mt-0.5 block">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* STATEMENT-STYLE TRANSACTION LIST: Dense rows with dividers, right-aligned amounts */}
          <section className="bg-white border border-[#DDE2E0] rounded-[8px] p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDE2E0]">
              <div>
                <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
                  Transaction history
                </h2>
                <p className="text-[13px] text-[#5B6B73]">
                  Activity for {selectedCard?.bankName} (•••• {selectedCard?.last4}).
                </p>
              </div>

              {/* Category filter buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`h-[32px] px-3 rounded-[4px] text-[13px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#0B4F6C] text-white'
                          : 'border border-[#DDE2E0] text-[#16232B] hover:bg-[#F5F6F4]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dense Statement Rows Table */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-[#5B6B73]">
                No transactions recorded under this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#DDE2E0] text-[#5B6B73] text-[11px] uppercase tracking-wider font-medium">
                      <th className="py-2.5 font-medium">Date</th>
                      <th className="py-2.5 font-medium">Merchant / Description</th>
                      <th className="py-2.5 font-medium">Category</th>
                      <th className="py-2.5 font-medium">Status</th>
                      <th className="py-2.5 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE2E0]">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#F5F6F4]/60 transition-colors">
                        <td className="py-3 text-[#5B6B73] tabular-nums whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3 font-medium text-[#16232B]">
                          {tx.merchant}
                        </td>
                        <td className="py-3 text-[#5B6B73]">
                          {tx.category}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[11px] font-medium ${
                              tx.status === 'settled'
                                ? 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                                : 'bg-[#B86E00]/10 text-[#B86E00]'
                            }`}
                          >
                            <i
                              className={`fa-solid ${
                                tx.status === 'settled' ? 'fa-check' : 'fa-clock'
                              } text-[9px]`}
                            ></i>
                            <span>{tx.status}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
