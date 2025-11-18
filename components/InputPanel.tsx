
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

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: string }> = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-professional-lg card-hover border border-slate-100">
    <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-5">
      {icon && <span className="text-2xl">{icon}</span>}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
    <div className="space-y-6">
      <Section title="Client Business Inputs" icon="🏢">
        <Input label="Client Name" name="clientName" value={formData.clientName} onChange={onInputChange} className="md:col-span-2" />
        <Input label="Client Industry" name="clientIndustry" value={formData.clientIndustry} onChange={onInputChange} className="md:col-span-2" />
        <div className="md:col-span-2">
          <Input label="Client Website" name="clientWebsite" type="url" placeholder="https://example.com" value={formData.clientWebsite} onChange={onInputChange} />
          <p className="text-xs text-slate-500 mt-1.5">🌐 Website will be used to auto-fetch the company logo</p>
        </div>
        <div className="md:col-span-2">
          <Input label="Client Logo URL (Optional)" name="clientLogoUrl" type="url" placeholder="Auto-filled from website..." value={formData.clientLogoUrl} onChange={onInputChange} />
          <p className="text-xs text-slate-500 mt-1.5">💡 Tip: Auto-fetches from website or paste your own URL</p>
        </div>
        <Input label="Average Sale Value" name="averageSaleValue" type="number" value={formData.averageSaleValue} onChange={onInputChange} prefix={formData.currencySymbol} />
        <Input label="Current Monthly Leads" name="currentMonthlyLeads" type="number" value={formData.currentMonthlyLeads} onChange={onInputChange} />
        <Input label="Lead → Customer Close Rate" name="leadToCustomerRate" type="number" value={formData.leadToCustomerRate} onChange={onInputChange} suffix="%" />
      </Section>

      <Section title="Service & Pricing" icon="💰">
        <Input label="Estimated % Increase in Leads" name="expectedLeadIncreasePercent" type="number" value={formData.expectedLeadIncreasePercent} onChange={onInputChange} suffix="%" />
        <Input label="Your Monthly Fee" name="serviceFeeMonthly" type="number" value={formData.serviceFeeMonthly} onChange={onInputChange} prefix={formData.currencySymbol} />
      </Section>

      <Section title="Your Details" icon="👤">
        <Input label="Your Name" name="yourName" value={formData.yourName} onChange={onInputChange} />
        <Input label="Your Agency Name" name="yourAgencyName" value={formData.yourAgencyName} onChange={onInputChange} />
        <Input label="Your Email" name="yourEmail" type="url" value={formData.yourEmail} onChange={onInputChange} placeholder="hello@youragency.com" />
        <Input label="Your Phone" name="yourPhone" value={formData.yourPhone} onChange={onInputChange} placeholder="+1 (555) 123-4567" />
        <Input label="Your Website" name="yourWebsite" type="url" value={formData.yourWebsite} onChange={onInputChange} placeholder="https://youragency.com" className="md:col-span-2" />
      </Section>

      <Section title="Customization & Settings" icon="⚙️">
        <Input label="Timeframe for ROI (months)" name="timeframeMonths" type="number" value={formData.timeframeMonths} onChange={onInputChange} className="md:col-span-1" />
        <Input label="Currency Symbol" name="currencySymbol" value={formData.currencySymbol} onChange={onInputChange} className="md:col-span-1" />
        <div className="md:col-span-2">
          <Input label="Your Agency Logo URL (Optional)" name="agencyLogoUrl" type="url" placeholder="https://yourwebsite.com/logo.png" value={formData.agencyLogoUrl} onChange={onInputChange} />
          <p className="text-xs text-slate-500 mt-1.5">💡 Your logo will appear in the proposal signature</p>
        </div>
        <Input label="Package Name" name="packageName" value={formData.packageName} onChange={onInputChange} className="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Package Bullets</label>
          <div className="space-y-2.5">
            {formData.packageBullets.map((bullet, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">•</span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => onBulletsChange(index, e.target.value)}
                    className="block w-full pl-8 pr-3 py-2.5 rounded-lg border-slate-200 focus:border-orange-500 focus:ring-orange-500 sm:text-sm smooth-transition"
                    placeholder="Enter feature or benefit"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBullet(index)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg smooth-transition opacity-0 group-hover:opacity-100"
                  title="Remove bullet"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addBullet}
              className="flex items-center space-x-2 text-sm font-semibold text-orange-600 hover:text-orange-700 smooth-transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>Add Bullet Point</span>
            </button>
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 glass-effect py-4 px-4 -mx-4 rounded-xl shadow-professional-lg no-print">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCalculate}
            className="flex-1 btn-primary justify-center inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-[#F98538] to-[#FE514A] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Generate ROI Proposal
          </button>
          <button
            onClick={onReset}
            className="sm:w-auto justify-center inline-flex items-center px-6 py-4 border border-slate-300 text-base font-semibold rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 smooth-transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
