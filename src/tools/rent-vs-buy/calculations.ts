import {
  CalculatorInputs,
  CalculationResult,
  CityPreset,
  FaqItem,
  YearlyDataPoint,
} from './types';

/**
 * Standard Home Loan Equated Monthly Installment (EMI) Formula.
 */
export function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  if (annualRate <= 0) return principal / (tenureYears * 12);
  const r = annualRate / 1200;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Compound Future Value of the purchased home.
 */
export function getHouseValue(housePrice: number, appreciationRate: number, tenureYears: number): number {
  return housePrice * Math.pow(1 + appreciationRate / 100, tenureYears);
}

/**
 * Investment gains earned by investing the saved Down Payment + Closing Costs into market assets.
 * Initial Capital Saved = Down Payment + One-Time Costs - Security Deposit
 */
export function getInvestmentGains(
  downPayment: number,
  oneTimeCosts: number,
  securityDeposit: number,
  tenureYears: number,
  roi: number,
): number {
  const initialCapital = Math.max(0, downPayment + oneTimeCosts - securityDeposit);
  return initialCapital * Math.pow(1 + roi / 100, tenureYears);
}

/**
 * Total cumulative rent paid across the loan tenure with annual rent growth.
 */
export function getTotalRentPaid(monthlyRent: number, rentalGrowthRate: number, tenureYears: number): number {
  let annual = 12 * monthlyRent;
  let total = annual;
  for (let y = 1; y < tenureYears; y++) {
    annual *= 1 + rentalGrowthRate / 100;
    total += annual;
  }
  return total;
}

/**
 * Tax savings for the renter from House Rent Allowance (HRA).
 * Standard empirical assumption: 20% of rent paid is saved in taxes.
 */
export function getTaxSavingsRent(totalRentPaid: number): number {
  return 0.2 * totalRentPaid;
}

/**
 * Total home maintenance costs over the tenure, escalating at 5% annual inflation.
 */
export function getMaintenanceCosts(annualMaintenance: number, tenureYears: number): number {
  let current = annualMaintenance;
  let total = current;
  for (let y = 1; y < tenureYears; y++) {
    current *= 1.05;
    total += current;
  }
  return total;
}

/**
 * Home Loan Tax Savings under Indian Income Tax Act:
 * - Section 24b: Interest deduction up to ₹2,00,000 / year
 * - Section 80C: Principal repayment deduction up to ₹1,50,000 / year (modeled capped conservative at ₹50,000)
 */
export function getTaxSavingsBuy(
  tenureYears: number,
  taxBracket: number,
  housePrice: number,
  interestRate: number,
  downPayment: number,
): number {
  if (taxBracket <= 0) return 0;
  const principal = Math.max(0, housePrice - downPayment);
  const totalMonths = tenureYears * 12;
  const emi = calculateEMI(principal, interestRate, tenureYears);

  let balance = principal;
  let annualInterest = 0;
  let annualPrincipal = 0;
  let totalTaxSavings = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interestMonth = balance * (interestRate / 1200);
    const principalMonth = Math.max(0, emi - interestMonth);
    balance = Math.max(0, balance - principalMonth);
    annualInterest += interestMonth;
    annualPrincipal += principalMonth;

    if (m > 1 && m % 12 === 0) {
      const interestDeduction = Math.min(annualInterest, 200000) * (taxBracket / 100);
      const principalDeduction = Math.min(annualPrincipal, 50000) * (taxBracket / 100);
      totalTaxSavings += interestDeduction + principalDeduction;
      annualInterest = 0;
      annualPrincipal = 0;
    }
  }

  return totalTaxSavings;
}

/**
 * Compounded monthly cash flow differentials:
 * - When EMI > Rent: Renter invests (EMI - Rent) monthly at market ROI until end of tenure.
 * - When Rent > EMI (after crossover): Buyer saves (Rent - EMI) monthly at market ROI until end of tenure.
 */
export function getMonthlyCashflowSavings(
  housePrice: number,
  downPayment: number,
  interestRate: number,
  tenureYears: number,
  monthlyRent: number,
  rentalGrowthRate: number,
  roi: number,
): { emiSavingsForRenter: number; rentSavingsForBuyer: number; crossoverYear: number | null } {
  const principal = Math.max(0, housePrice - downPayment);
  const emi = calculateEMI(principal, interestRate, tenureYears);
  const totalMonths = tenureYears * 12;

  let currentRent = monthlyRent;
  let emiSavingsForRenter = 0;
  let rentSavingsForBuyer = 0;
  let crossoverYear: number | null = null;

  for (let m = 1; m <= totalMonths; m++) {
    if (m > 1 && (m - 1) % 12 === 0) {
      currentRent *= 1 + rentalGrowthRate / 100;
    }

    if (currentRent >= emi && crossoverYear === null) {
      crossoverYear = Math.ceil(m / 12);
    }

    const compoundMultiplier = Math.pow(1 + roi / 1200, totalMonths - m);

    if (emi > currentRent) {
      emiSavingsForRenter += (emi - currentRent) * compoundMultiplier;
    } else {
      rentSavingsForBuyer += (currentRent - emi) * compoundMultiplier;
    }
  }

  return { emiSavingsForRenter, rentSavingsForBuyer, crossoverYear };
}

/**
 * Evaluates the full Rent vs Buy comparison.
 */
export function evaluateRentVsBuy(inputs: CalculatorInputs): CalculationResult {
  const totalRent = getTotalRentPaid(inputs.monthlyRent, inputs.rentalGrowth, inputs.loanTenure);
  const rentTaxSavings = getTaxSavingsRent(totalRent);
  const investmentGains = getInvestmentGains(
    inputs.downPayment,
    inputs.oneTimeCosts,
    inputs.securityDeposit,
    inputs.loanTenure,
    inputs.expectedReturnsOnInvestments,
  );

  const principal = Math.max(0, inputs.housePrice - inputs.downPayment);
  const monthlyEMI = calculateEMI(principal, inputs.interestRate, inputs.loanTenure);
  const totalEMI = monthlyEMI * inputs.loanTenure * 12;
  const maintenanceTotal = getMaintenanceCosts(inputs.annualMaintenanceCosts, inputs.loanTenure);
  const houseValue = getHouseValue(inputs.housePrice, inputs.houseAppreciationRate, inputs.loanTenure);
  const buyTaxSavings = getTaxSavingsBuy(
    inputs.loanTenure,
    inputs.incomeTaxBracket,
    inputs.housePrice,
    inputs.interestRate,
    inputs.downPayment,
  );

  const { emiSavingsForRenter, rentSavingsForBuyer, crossoverYear } = getMonthlyCashflowSavings(
    inputs.housePrice,
    inputs.downPayment,
    inputs.interestRate,
    inputs.loanTenure,
    inputs.monthlyRent,
    inputs.rentalGrowth,
    inputs.expectedReturnsOnInvestments,
  );

  // RENT
  const rentTotalWealth = investmentGains + rentTaxSavings + emiSavingsForRenter;
  const rentTotalCost = totalRent;
  const rentNetWealth = rentTotalWealth - rentTotalCost;

  // BUY
  const buyTotalWealth = houseValue + buyTaxSavings + rentSavingsForBuyer;
  const buyTotalCost = totalEMI + maintenanceTotal;
  const buyNetWealth = buyTotalWealth - buyTotalCost;

  const recommendation = buyNetWealth > rentNetWealth ? 'BUY' : 'RENT';
  const wealthDifference = Math.abs(buyNetWealth - rentNetWealth);

  return {
    recommendation,
    wealthDifference,
    crossoverYear,
    rent: {
      totalRent,
      investmentGains,
      taxSavings: rentTaxSavings,
      emiSavings: emiSavingsForRenter,
      totalWealth: rentTotalWealth,
      totalCost: rentTotalCost,
      netWealth: rentNetWealth,
    },
    buy: {
      houseValue,
      taxSavings: buyTaxSavings,
      rentSavings: rentSavingsForBuyer,
      totalEMI,
      monthlyEMI,
      maintenanceTotal,
      totalWealth: buyTotalWealth,
      totalCost: buyTotalCost,
      netWealth: buyNetWealth,
    },
  };
}

/**
 * Generates year-by-year trajectory data for charts and tables.
 */
export function calculateYearlyProjection(inputs: CalculatorInputs): YearlyDataPoint[] {
  const points: YearlyDataPoint[] = [];
  const principal = Math.max(0, inputs.housePrice - inputs.downPayment);
  const monthlyEMI = calculateEMI(principal, inputs.interestRate, inputs.loanTenure);
  const annualEMI = monthlyEMI * 12;

  let currentAnnualRent = 12 * inputs.monthlyRent;
  let cumulativeRent = 0;
  let cumulativeBuy = 0;
  let initialPortfolio = inputs.downPayment + inputs.oneTimeCosts - inputs.securityDeposit;

  for (let year = 1; year <= inputs.loanTenure; year++) {
    cumulativeRent += currentAnnualRent;
    cumulativeBuy += annualEMI + inputs.annualMaintenanceCosts * Math.pow(1.05, year - 1);

    const houseValueAtYear = inputs.housePrice * Math.pow(1 + inputs.houseAppreciationRate / 100, year);

    // Approximate portfolio growth with yearly difference
    const monthlyDiff = (monthlyEMI - currentAnnualRent / 12);
    initialPortfolio = initialPortfolio * (1 + inputs.expectedReturnsOnInvestments / 100) + (monthlyDiff * 12);

    points.push({
      year,
      annualRent: Math.round(currentAnnualRent),
      annualEMI: Math.round(annualEMI),
      cumulativeRentPaid: Math.round(cumulativeRent),
      cumulativeBuyPaid: Math.round(cumulativeBuy),
      houseValue: Math.round(houseValueAtYear),
      renterPortfolioValue: Math.max(0, Math.round(initialPortfolio)),
    });

    currentAnnualRent *= 1 + inputs.rentalGrowth / 100;
  }

  return points;
}

/**
 * Format currency in Indian Numbering System (Lakh / Crore / Thousands).
 */
export function formatINR(val: number, compact: boolean = false): string {
  if (isNaN(val)) return '₹0';
  const isNegative = val < 0;
  const abs = Math.abs(val);

  let formatted = '';
  if (compact) {
    if (abs >= 10000000) {
      formatted = `₹${(abs / 10000000).toFixed(2)} Cr`;
    } else if (abs >= 100000) {
      formatted = `₹${(abs / 100000).toFixed(2)} L`;
    } else if (abs >= 1000) {
      formatted = `₹${(abs / 1000).toFixed(1)}k`;
    } else {
      formatted = `₹${Math.round(abs)}`;
    }
  } else {
    // Standard Indian number format with commas (e.g. 12,34,567)
    const rounded = Math.round(abs).toString();
    const lastThree = rounded.substring(rounded.length - 3);
    const otherNumbers = rounded.substring(0, rounded.length - 3);
    const withCommas =
      otherNumbers !== ''
        ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
        : lastThree;
    formatted = `₹${withCommas}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Pre-configured Indian Metro Real Estate Appreciation Rates.
 */
export const CITY_PRESETS: CityPreset[] = [
  { city: 'Kochi', rate: 9.9, note: 'High commercial & infrastructure growth' },
  { city: 'Bangalore', rate: 9.0, note: 'Tech corridors & IT corridor expansion' },
  { city: 'Kanpur', rate: 8.0, note: 'Fast-developing industrial hub' },
  { city: 'Chennai', rate: 7.5, note: 'Manufacturing & coastal expansion' },
  { city: 'Mumbai', rate: 6.71, note: 'High density, premium mature market' },
  { city: 'Ahmedabad', rate: 6.7, note: 'GIFT City & western corridor development' },
  { city: 'Kolkata', rate: 6.0, note: 'Steady traditional appreciation' },
  { city: 'Delhi NCR', rate: 5.2, note: 'Broad regional market with high inventory' },
  { city: 'Jaipur', rate: 2.9, note: 'Tourist & emerging residential pocket' },
];

/**
 * Comprehensive FAQ list for user education and SEO rich snippets.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How are the tax savings calculated for buying vs renting?',
    answer:
      'When buying a house, tax savings on a home loan are calculated under Section 24(b) (deduction up to ₹2,00,000/year for interest payments) and Section 80C (deduction for principal repayments up to ₹1,50,000/year) based on your income tax slab. When renting, HRA tax exemption is estimated at 20% of your annual rent, reflecting typical exemption rules.',
  },
  {
    question: 'What is the opportunity cost of the down payment and closing costs?',
    answer:
      'Buying a home requires an immediate cash outflow: a 20% down payment plus 4%–10% in registration, stamp duty, and interior setup. When you rent, you only pay a refundable security deposit. The remaining capital (Down Payment + One-Time Costs − Security Deposit) is free to be invested in equity mutual funds or diversified assets, generating compounding returns over 10–30 years.',
  },
  {
    question: 'What is the Rent vs EMI Crossover point?',
    answer:
      'Because home loan EMIs remain fixed while rental payments increase yearly by inflation (typically 5%–8% p.a.), monthly rent eventually overtakes the fixed EMI. The crossover point is the exact year this happens. After the crossover, the buyer enjoys a monthly cashflow surplus compared to renting, which can then be invested.',
  },
  {
    question: 'Why are maintenance costs and one-time buying costs included?',
    answer:
      'Buying a property involves substantial hidden expenses that renters avoid: registration and stamp duty (usually 5%–7%), interior furnishing (3%–5%), and annual society maintenance (0.2%–0.5% of property value per year, escalating at 5% inflation). Over a 20-year period, maintenance alone often adds ₹10 Lakh to ₹25 Lakh to the total cost of ownership.',
  },
  {
    question: 'How does the investment return rate (ROI) affect the outcome?',
    answer:
      'If you invest in equity index funds or diversified mutual funds yielding 12%–15% p.a. while real estate in your city grows at 5%–7% p.a., renting and disciplined investing will almost always create significantly more wealth. Conversely, in cities with 9%+ real estate appreciation and conservative 7% investment returns, buying often creates superior long-term net wealth.',
  },
  {
    question: 'Is emotional peace of mind or stability factored into the calculation?',
    answer:
      'This calculator provides pure financial analysis based on net wealth generated minus total costs paid. Homeownership also carries qualitative benefits like security from landlord eviction, personalization freedom, and emotional pride, which you can weigh alongside the financial numbers.',
  },
];
