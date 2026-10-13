/**
 * Mock transaction history for user credit cards.
 * Includes category, merchant, amount, status (settled/pending), and cardId association.
 */

// Dynamic dates relative to today
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const transactions = [
  {
    id: 'tx-101',
    cardId: 'card-1',
    merchant: 'Swiggy Gourmet',
    category: 'Food',
    amount: 1450,
    date: getRelativeDate(0), // Today
    status: 'pending'
  },
  {
    id: 'tx-102',
    cardId: 'card-1',
    merchant: 'Amazon India',
    category: 'Shopping',
    amount: 4999,
    date: getRelativeDate(-1),
    status: 'settled'
  },
  {
    id: 'tx-103',
    cardId: 'card-1',
    merchant: 'Uber Rides India',
    category: 'Travel',
    amount: 680,
    date: getRelativeDate(-2),
    status: 'settled'
  },
  {
    id: 'tx-104',
    cardId: 'card-1',
    merchant: 'BESCOM Electricity Bill',
    category: 'Bills',
    amount: 2850,
    date: getRelativeDate(-3),
    status: 'settled'
  },
  {
    id: 'tx-105',
    cardId: 'card-1',
    merchant: 'Zomato Gold Delivery',
    category: 'Food',
    amount: 820,
    date: getRelativeDate(-4),
    status: 'settled'
  },
  {
    id: 'tx-106',
    cardId: 'card-1',
    merchant: 'MakeMyTrip Flights',
    category: 'Travel',
    amount: 12400,
    date: getRelativeDate(-6),
    status: 'settled'
  },
  {
    id: 'tx-107',
    cardId: 'card-1',
    merchant: 'Zara Fashion Store',
    category: 'Shopping',
    amount: 5690,
    date: getRelativeDate(-8),
    status: 'settled'
  },
  {
    id: 'tx-108',
    cardId: 'card-1',
    merchant: 'Airtel Fiber Broadband',
    category: 'Bills',
    amount: 1179,
    date: getRelativeDate(-10),
    status: 'settled'
  },
  {
    id: 'tx-109',
    cardId: 'card-2',
    merchant: 'Starbucks Coffee',
    category: 'Food',
    amount: 750,
    date: getRelativeDate(0), // Today
    status: 'pending'
  },
  {
    id: 'tx-110',
    cardId: 'card-2',
    merchant: 'IndiGo Airlines',
    category: 'Travel',
    amount: 7850,
    date: getRelativeDate(-2),
    status: 'settled'
  },
  {
    id: 'tx-111',
    cardId: 'card-2',
    merchant: 'Flipkart Electronics',
    category: 'Shopping',
    amount: 3290,
    date: getRelativeDate(-3),
    status: 'settled'
  },
  {
    id: 'tx-112',
    cardId: 'card-2',
    merchant: 'Jio Postpaid Mobile Bill',
    category: 'Bills',
    amount: 799,
    date: getRelativeDate(-5),
    status: 'settled'
  },
  {
    id: 'tx-113',
    cardId: 'card-2',
    merchant: 'Blinkit Instant Grocery',
    category: 'Food',
    amount: 1240,
    date: getRelativeDate(-7),
    status: 'settled'
  },
  {
    id: 'tx-114',
    cardId: 'card-2',
    merchant: 'BookMyShow Cinema',
    category: 'Shopping',
    amount: 950,
    date: getRelativeDate(-9),
    status: 'settled'
  },
  {
    id: 'tx-115',
    cardId: 'card-2',
    merchant: 'Indian Oil Petrol Pump',
    category: 'Travel',
    amount: 3500,
    date: getRelativeDate(-11),
    status: 'settled'
  }
];

export default transactions;
