export interface RentInputs {
  monthlyRent: number;
  rentalGrowth: number; // % p.a.
  securityDeposit: number;
}

export interface BuyInputs {
  housePrice: number;
  downPayment: number;
  interestRate: number; // % p.a.
  loanTenure: number; // years
  houseAppreciationRate: number; // % p.a.
  oneTimeCosts: number; // registration, stamp duty, interiors
  annualMaintenanceCosts: number; // annual maintenance
}

export interface StrategyInputs {
  expectedReturnsOnInvestments: number; // % p.a.
  incomeTaxBracket: number; // % (e.g. 10, 20, 30)
}

export interface CalculatorInputs extends RentInputs, BuyInputs, StrategyInputs {}

export interface RentWealthBreakdown {
  totalRent: number;
  investmentGains: number;
  taxSavings: number;
  emiSavings: number;
  totalWealth: number;
  totalCost: number;
  netWealth: number;
}

export interface BuyWealthBreakdown {
  houseValue: number;
  taxSavings: number;
  rentSavings: number;
  totalEMI: number;
  monthlyEMI: number;
  maintenanceTotal: number;
  totalWealth: number;
  totalCost: number;
  netWealth: number;
}

export interface CalculationResult {
  recommendation: 'RENT' | 'BUY';
  wealthDifference: number;
  crossoverYear: number | null; // Year when rent exceeds EMI, if any
  rent: RentWealthBreakdown;
  buy: BuyWealthBreakdown;
}

export interface YearlyDataPoint {
  year: number;
  annualRent: number;
  annualEMI: number;
  cumulativeRentPaid: number;
  cumulativeBuyPaid: number;
  houseValue: number;
  renterPortfolioValue: number;
}

export interface CityPreset {
  city: string;
  rate: number;
  note?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
