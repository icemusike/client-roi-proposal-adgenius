
import React from 'react';
import Input from './Input';
import { FormData } from '../types';

interface InputPanelProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBulletsChange: (index: number, value: string) => void;
  addBullet: () => void;
  removeBullet: (index: number) => void;
  onCalculate: () => void;
  onReset: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

const InputPanel: React.FC<InputPanelProps> = ({
  formData,
  onInputChange,
  onBulletsChange,
  addBullet,
  removeBullet,
  onCalculate,
  onReset,
}) => {
  return (
    <div className="space-y-8">
      <Section title="Client Business Inputs">
        <Input label="Client Name" name="clientName" value={formData.clientName} onChange={onInputChange} className="md:col-span-2" />
        <Input label="Client Industry" name="clientIndustry" value={formData.clientIndustry} onChange={onInputChange} className="md:col-span-2" />
        <Input label="Average Sale Value" name="averageSaleValue" type="number" value={formData.averageSaleValue} onChange={onInputChange} prefix={formData.currencySymbol} />
        <Input label="Current Monthly Leads" name="currentMonthlyLeads" type="number" value={formData.currentMonthlyLeads} onChange={onInputChange} />
        <Input label="Lead → Customer Close Rate" name="leadToCustomerRate" type="number" value={formData.leadToCustomerRate} onChange={onInputChange} suffix="%" />
      </Section>

      <Section title="Service / Fee Inputs">
        <Input label="Estimated % Increase in Leads" name="expectedLeadIncreasePercent" type="number" value={formData.expectedLeadIncreasePercent} onChange={onInputChange} suffix="%" />
        <Input label="Your Monthly Fee" name="serviceFeeMonthly" type="number" value={formData.serviceFeeMonthly} onChange={onInputChange} prefix={formData.currencySymbol} />
      </Section>

      <Section title="Your Details">
        <Input label="Your Name" name="yourName" value={formData.yourName} onChange={onInputChange} />
        <Input label="Your Agency Name" name="yourAgencyName" value={formData.yourAgencyName} onChange={onInputChange} />
      </Section>

      <Section title="Assumptions & Advanced Settings">
        <Input label="Timeframe for ROI (months)" name="timeframeMonths" type="number" value={formData.timeframeMonths} onChange={onInputChange} className="md:col-span-1" />
        <Input label="Currency Symbol" name="currencySymbol" value={formData.currencySymbol} onChange={onInputChange} className="md:col-span-1" />
        <Input label="Client Logo URL (Optional)" name="clientLogoUrl" type="url" placeholder="https://..." value={formData.clientLogoUrl} onChange={onInputChange} className="md:col-span-2" />
        <Input label="Package Name" name="packageName" value={formData.packageName} onChange={onInputChange} className="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Package Bullets</label>
          <div className="space-y-2">
            {formData.packageBullets.map((bullet, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => onBulletsChange(index, e.target.value)}
                  className="block w-full rounded-md border-slate-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeBullet(index)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBullet}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              + Add Bullet
            </button>
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 bg-slate-50 py-4 z-5">
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onCalculate} className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-b from-[#F98538] to-[#FE514A] hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Calculate ROI & Generate Proposal
              </button>
              <button onClick={onReset} className="w-full sm:w-auto justify-center inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Reset
              </button>
          </div>
      </div>
    </div>
  );
};

export default InputPanel;
