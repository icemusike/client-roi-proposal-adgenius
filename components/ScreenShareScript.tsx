import React, { useState } from 'react';
import { FormData, CalculatedData } from '../types';

interface ScreenShareScriptProps {
  formData: FormData;
  calculatedData: CalculatedData | null;
}

const formatNumber = (num: number | null | undefined, digits = 0) => {
  if (num === null || typeof num === 'undefined') return '...';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
};

const formatCurrency = (num: number | null | undefined, symbol: string, digits = 0) => {
  if (num === null || typeof num === 'undefined') return '...';
  return `${symbol}${formatNumber(num, digits)}`;
};

const ScreenShareScript: React.FC<ScreenShareScriptProps> = ({ formData, calculatedData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const talkingPoints = [
    `"Okay, ${formData.clientName}, let's plug in your current numbers together to see what's possible."`,
    `"You mentioned you're getting around ${formData.currentMonthlyLeads} leads per month, with an average sale value of ${formatCurrency(parseFloat(formData.averageSaleValue), formData.currencySymbol)}."`,
    `"Here’s what happens if we just improve your creatives by a conservative ${formData.expectedLeadIncreasePercent}%. This isn't about more ad spend, just better-performing ads."`,
    `"Based on that, we're looking at an extra ${formatNumber(calculatedData?.extraLeadsPerMonth)} leads per month."`,
    `"Over ${formData.timeframeMonths} months, that’s an extra ${formatCurrency(calculatedData?.extraRevenueTimeframe, formData.currencySymbol)} in revenue for your business."`,
    `"My fee over the same period is ${formatCurrency(calculatedData?.serviceCostTimeframe, formData.currencySymbol)}. When you look at the total return, that's about a ${formatNumber(calculatedData?.valueToFeeMultiple, 1)}x return on your investment."`,
    `"So, for every dollar you put in, you'd get about ${formatNumber(calculatedData?.valueToFeeMultiple, 1)} dollars back in new revenue. Does that kind of ROI make sense for your growth goals?"`
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left"
      >
        <h3 className="text-lg font-semibold text-slate-800">Screen-Share Script</h3>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="max-w-none p-4 bg-slate-50 rounded-lg">
            <p className="text-sm italic text-slate-600">Use these talking points while walking your client through the calculator live.</p>
            <ul className="list-disc list-outside space-y-3 text-slate-700 mt-4 pl-5">
                {talkingPoints.map((point, index) => (
                    <li key={index} className="leading-relaxed">{point}</li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenShareScript;
