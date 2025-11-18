
export interface FormData {
  clientName: string;
  clientIndustry: string;

  averageSaleValue: string;
  currentMonthlyLeads: string;
  leadToCustomerRate: string;

  expectedLeadIncreasePercent: string;
  serviceFeeMonthly: string;

  currencySymbol: string;
  timeframeMonths: string;

  clientLogoUrl: string;
  packageName: string;
  packageBullets: string[];
  notes: string;

  yourName: string;
  yourAgencyName: string;
}

export interface CalculatedData {
  extraLeadsPerMonth: number;
  extraCustomersPerMonth: number;
  extraRevenuePerMonth: number;
  extraRevenueTimeframe: number;
  serviceCostTimeframe: number;
  netGainTimeframe: number;
  roiPercent: number | null;
  valueToFeeMultiple: number | null;
}
