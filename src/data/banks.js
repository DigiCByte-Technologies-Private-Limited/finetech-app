/**
 * Bank partners data for loan facilities and card products.
 */
export const banks = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    icon: 'fa-solid fa-building-columns',
    loanTypes: ['personal', 'home', 'auto', 'instant'],
    rateMin: 8.5,
    rateMax: 14.5,
    processingFee: 0.5, // 0.5%
    maxTenureMonths: 240
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    icon: 'fa-solid fa-landmark',
    loanTypes: ['personal', 'home', 'auto'],
    rateMin: 8.25,
    rateMax: 13.0,
    processingFee: 0.35, // 0.35%
    maxTenureMonths: 360
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    icon: 'fa-solid fa-vault',
    loanTypes: ['personal', 'home', 'auto', 'instant'],
    rateMin: 8.65,
    rateMax: 15.0,
    processingFee: 0.75, // 0.75%
    maxTenureMonths: 180
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    icon: 'fa-solid fa-piggy-bank',
    loanTypes: ['personal', 'home', 'auto', 'instant'],
    rateMin: 8.75,
    rateMax: 15.5,
    processingFee: 1.0, // 1%
    maxTenureMonths: 120
  },
  {
    id: 'bajaj',
    name: 'Bajaj Finserv',
    icon: 'fa-solid fa-bolt',
    loanTypes: ['personal', 'instant'],
    rateMin: 9.99,
    rateMax: 18.0,
    processingFee: 1.5, // 1.5%
    maxTenureMonths: 84
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    icon: 'fa-solid fa-shield-halved',
    loanTypes: ['personal', 'home', 'instant'],
    rateMin: 8.85,
    rateMax: 16.0,
    processingFee: 0.99, // 0.99%
    maxTenureMonths: 240
  }
];

export default banks;
