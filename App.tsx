
import React, { useState, useCallback, useEffect, useRef } from 'react';
import InputPanel from './components/InputPanel';
import ProposalPreview from './components/ProposalPreview';
import ScreenShareScript from './components/ScreenShareScript';
import { FormData, CalculatedData } from './types';

const initialFormData: FormData = {
  clientName: 'Prospect Inc.',
  clientIndustry: 'eCommerce',
  averageSaleValue: '2500',
  currentMonthlyLeads: '50',
  leadToCustomerRate: '10',
  expectedLeadIncreasePercent: '30',
  serviceFeeMonthly: '3000',
  currencySymbol: '$',
  timeframeMonths: '12',
  clientLogoUrl: '',
  packageName: 'Ad Creative Growth Package',
  packageBullets: [
    'Up to 30 new ad creatives per month',
    'Ongoing testing & optimization',
    'Creative strategy sessions',
  ],
  notes: '',
  yourName: 'Your Name',
  yourAgencyName: 'AdGenius Agency',
};

const initialCalculatedData: CalculatedData = {
  extraLeadsPerMonth: 0,
  extraCustomersPerMonth: 0,
  extraRevenuePerMonth: 0,
  extraRevenueTimeframe: 0,
  serviceCostTimeframe: 0,
  netGainTimeframe: 0,
  roiPercent: 0,
  valueToFeeMultiple: 0,
};

function App() {
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const savedData = localStorage.getItem('proposalFormData');
      return savedData ? { ...initialFormData, ...JSON.parse(savedData) } : initialFormData;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialFormData;
    }
  });

  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const proposalPreviewRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      localStorage.setItem('proposalFormData', JSON.stringify(formData));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulletsChange = (index: number, value: string) => {
    const newBullets = [...formData.packageBullets];
    newBullets[index] = value;
    setFormData((prev) => ({ ...prev, packageBullets: newBullets }));
  };

  const addBullet = () => {
    setFormData((prev) => ({
      ...prev,
      packageBullets: [...prev.packageBullets, ''],
    }));
  };
  
  const removeBullet = (index: number) => {
    const newBullets = formData.packageBullets.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, packageBullets: newBullets }));
  };

  const calculateResults = useCallback(() => {
    const currentMonthlyLeads = parseFloat(formData.currentMonthlyLeads) || 0;
    const expectedLeadIncreasePercent = parseFloat(formData.expectedLeadIncreasePercent) || 0;
    const leadToCustomerRate = parseFloat(formData.leadToCustomerRate) || 0;
    const averageSaleValue = parseFloat(formData.averageSaleValue) || 0;
    const serviceFeeMonthly = parseFloat(formData.serviceFeeMonthly) || 0;
    const timeframeMonths = parseInt(formData.timeframeMonths, 10) || 0;

    const extraLeadsPerMonth = currentMonthlyLeads * (expectedLeadIncreasePercent / 100);
    const extraCustomersPerMonth = extraLeadsPerMonth * (leadToCustomerRate / 100);
    const extraRevenuePerMonth = extraCustomersPerMonth * averageSaleValue;
    const extraRevenueTimeframe = extraRevenuePerMonth * timeframeMonths;
    const serviceCostTimeframe = serviceFeeMonthly * timeframeMonths;
    const netGainTimeframe = extraRevenueTimeframe - serviceCostTimeframe;
    
    const roiPercent = serviceCostTimeframe > 0 ? (netGainTimeframe / serviceCostTimeframe) * 100 : null;
    const valueToFeeMultiple = serviceCostTimeframe > 0 ? extraRevenueTimeframe / serviceCostTimeframe : null;

    setCalculatedData({
      extraLeadsPerMonth,
      extraCustomersPerMonth,
      extraRevenuePerMonth,
      extraRevenueTimeframe,
      serviceCostTimeframe,
      netGainTimeframe,
      roiPercent,
      valueToFeeMultiple,
    });

    setTimeout(() => {
      proposalPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  }, [formData]);

  const resetForm = () => {
    setFormData(initialFormData);
    setCalculatedData(null);
  };
  
  // Perform initial calculation on load if data exists
  useEffect(() => {
    calculateResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen text-slate-800">
      <header className="bg-slate-900 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <img src="https://adgeniusai.io/special/images/adsgenius_logo_light.png" alt="AdGenius Logo" className="h-10" />
          <a href="https://adgeniusai.io" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputPanel
            formData={formData}
            onInputChange={handleInputChange}
            onBulletsChange={handleBulletsChange}
            addBullet={addBullet}
            removeBullet={removeBullet}
            onCalculate={calculateResults}
            onReset={resetForm}
          />
          <ProposalPreview
            ref={proposalPreviewRef}
            formData={formData}
            calculatedData={calculatedData}
          />
        </div>
        <div className="mt-8">
            <ScreenShareScript formData={formData} calculatedData={calculatedData} />
        </div>
      </main>
    </div>
  );
}

export default App;
