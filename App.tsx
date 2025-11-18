
import React, { useState, useCallback, useEffect, useRef } from 'react';
import InputPanel from './components/InputPanel';
import ProposalPreview from './components/ProposalPreview';
import ScreenShareScript from './components/ScreenShareScript';
import { FormData, CalculatedData } from './types';

const initialFormData: FormData = {
  clientName: 'Prospect Inc.',
  clientIndustry: 'eCommerce',
  clientWebsite: '',
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
  yourEmail: 'hello@adgenius.com',
  yourPhone: '+1 (555) 123-4567',
  yourWebsite: 'https://adgeniusai.io',
  agencyLogoUrl: '',
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
      if (savedData) {
        const parsed = JSON.parse(savedData);

        // Clean up invalid logo.dev URLs (URLs with empty domain)
        if (parsed.clientLogoUrl && parsed.clientLogoUrl.includes('img.logo.dev/?token=')) {
          parsed.clientLogoUrl = '';
        }

        return { ...initialFormData, ...parsed };
      }
      return initialFormData;
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

  // Auto-fetch logo from logo.dev when client website changes
  useEffect(() => {
    const fetchClientLogo = async () => {
      // Only fetch if we have a website and no logo URL yet
      const website = formData.clientWebsite?.trim();
      if (!website || formData.clientLogoUrl) {
        return;
      }

      try {
        // Extract domain from URL
        let domain = website
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]
          .split('?')[0]
          .trim()
          .toLowerCase();

        // Validate domain has at least a dot and proper format (e.g., example.com)
        if (!domain || !domain.includes('.') || domain.length < 4 || domain.startsWith('.') || domain.endsWith('.')) {
          console.log('Invalid domain format:', domain);
          return;
        }

        // Use logo.dev API with the publishable key
        const logoDevKey = import.meta.env.VITE_LOGODEV_PUBLISHABLE_KEY;
        if (!logoDevKey) {
          console.warn('Logo.dev API key not found');
          return;
        }

        // Build the logo URL
        const logoUrl = `https://img.logo.dev/${domain}?token=${logoDevKey}&size=200`;
        console.log('Fetching logo from:', logoUrl);

        // Update the form data with the fetched logo URL
        setFormData((prev) => ({ ...prev, clientLogoUrl: logoUrl }));
      } catch (error) {
        console.error('Error processing logo URL:', error);
      }
    };

    // Debounce the fetch to avoid too many API calls
    const timeoutId = setTimeout(fetchClientLogo, 1500);
    return () => clearTimeout(timeoutId);
  }, [formData.clientWebsite, formData.clientLogoUrl]);

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
      <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://adgeniusai.io/special/images/adsgenius_logo_light.png"
                alt="AdGenius AI"
                className="h-8 sm:h-10"
              />
              <div className="hidden sm:block border-l border-slate-700 pl-4">
                <h1 className="text-lg font-bold text-white">ROI Proposal Generator</h1>
                <p className="text-xs text-slate-400">Create compelling client proposals in seconds</p>
              </div>
            </div>
            <a
              href="https://adgeniusai.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-slate-400 hover:text-orange-500 smooth-transition group"
            >
              <span className="hidden sm:inline text-sm font-medium">Visit AdGenius</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 smooth-transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 py-8">
        <div className="text-center mb-8 no-print">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Generate Professional ROI Proposals
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Input your client's metrics and instantly create data-driven proposals that showcase the value of your ad creative services
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
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

      <footer className="bg-slate-900 text-slate-400 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} AdGenius AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
