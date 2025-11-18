
import React, { forwardRef, useState } from 'react';
import { FormData, CalculatedData } from '../types';

// FIX: Add global type declarations for jspdf and html2canvas to resolve TypeScript errors.
// These libraries are likely included via script tags in index.html, making them available on the window object.
declare global {
    interface Window {
        jspdf: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jsPDF: any; 
        };
        html2canvas: (element: HTMLElement, options?: object) => Promise<HTMLCanvasElement>;
    }
}

interface ProposalPreviewProps {
  formData: FormData;
  calculatedData: CalculatedData | null;
}

const formatNumber = (num: number | null | undefined, digits = 0) => {
  if (num === null || typeof num === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
};

const formatCurrency = (num: number | null | undefined, symbol: string, digits = 0) => {
  if (num === null || typeof num === 'undefined') return 'N/A';
  return `${symbol}${formatNumber(num, digits)}`;
};


const StatCard: React.FC<{ label: string; value: string, className?: string }> = ({ label, value, className }) => (
    <div className={`bg-slate-50 p-4 rounded-lg text-center ${className}`}>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-3xl font-bold bg-gradient-to-b from-[#F98538] to-[#FE514A] text-transparent bg-clip-text">{value}</p>
    </div>
);


const ProposalPreview = forwardRef<HTMLDivElement, ProposalPreviewProps>(
  ({ formData, calculatedData }, ref) => {
    const [isCopying, setIsCopying] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const handleDownloadPdf = async () => {
      if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        console.error("jsPDF or html2canvas is not loaded!");
        alert("PDF generation library is not loaded. Please ensure you are connected to the internet and try again.");
        return;
      }
    
      const proposalContentElement = document.getElementById('proposal-preview-content');
      if (!proposalContentElement || isDownloadingPdf) {
        console.error("Required elements for PDF generation not found.");
        return;
      }
    
      setIsDownloadingPdf(true);
      // Add a class to apply PDF-specific styles (e.g., fixing gradient text)
      proposalContentElement.classList.add('pdf-render-fix');
    
      try {
        const canvas = await window.html2canvas(proposalContentElement, {
          scale: 2,
          useCORS: true, // Important for external images
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
    
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
    
        let newCanvasWidth = pdfWidth;
        let newCanvasHeight = newCanvasWidth / ratio;
    
        if (newCanvasHeight > pdfHeight) {
          newCanvasHeight = pdfHeight;
          newCanvasWidth = newCanvasHeight * ratio;
        }
    
        const xOffset = (pdfWidth - newCanvasWidth) / 2;
    
        pdf.addImage(imgData, 'PNG', xOffset, 0, newCanvasWidth, newCanvasHeight);
        pdf.save(`Proposal for ${formData.clientName}.pdf`);
    
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please check the console for more details.");
      } finally {
        // Clean up the temporary class
        proposalContentElement.classList.remove('pdf-render-fix');
        setIsDownloadingPdf(false);
      }
    };
    
    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
      if (!calculatedData) return;
      setIsCopying(true);

      const summary = `
Proposal for: ${formData.clientName}
      
Key Projections (${formData.timeframeMonths} months):
- Extra Monthly Revenue: ${formatCurrency(calculatedData.extraRevenuePerMonth, formData.currencySymbol, 2)}
- Total Extra Revenue: ${formatCurrency(calculatedData.extraRevenueTimeframe, formData.currencySymbol)}
- Total Service Cost: ${formatCurrency(calculatedData.serviceCostTimeframe, formData.currencySymbol)}
- Net Gain: ${formatCurrency(calculatedData.netGainTimeframe, formData.currencySymbol)}
- Estimated ROI: ${formatNumber(calculatedData.roiPercent, 1)}%

This is based on an estimated ${formatNumber(calculatedData.extraLeadsPerMonth)} extra leads per month from our ${formData.packageName}.
      `;
      navigator.clipboard.writeText(summary.trim()).then(() => {
        setTimeout(() => setIsCopying(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        setIsCopying(false);
      });
    };

    return (
      <div className="sticky top-24">
        <div className="bg-white p-6 rounded-2xl shadow-lg" ref={ref} id="proposal-preview">
          <div id="proposal-preview-content" className="p-4 bg-white">
              <header className="flex items-start justify-between mb-6 border-b pb-4">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900">Ad Creative ROI Proposal for {formData.clientName}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-slate-500">{formData.clientIndustry} - Prepared by</p>
                        <img src="https://adgeniusai.io/special/images/adgenius_logo_dark.png" alt="AdGenius" className="h-5" />
                      </div>
                  </div>
                  {formData.clientLogoUrl && (
                      <img 
                        src={formData.clientLogoUrl} 
                        alt={`${formData.clientName} Logo`} 
                        className="max-h-16 max-w-xs object-contain"
                        crossOrigin="anonymous" // Added to help html2canvas with CORS
                      />
                  )}
              </header>

              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Summary of Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <StatCard label="Extra Leads / Month" value={`+${formatNumber(calculatedData?.extraLeadsPerMonth)}`} />
                    <StatCard label="Extra Revenue / Month" value={`+${formatCurrency(calculatedData?.extraRevenuePerMonth, formData.currencySymbol)}`} />
                    <StatCard label={`ROI over ${formData.timeframeMonths} months`} value={`${formatNumber(calculatedData?.roiPercent, 1)}%`} />
                    <StatCard label="Return vs Fee" value={`~${formatNumber(calculatedData?.valueToFeeMultiple, 1)}x`} />
                </div>
              </section>

              <section className="text-slate-600 space-y-4 mb-6 leading-relaxed">
                <p>Based on your current numbers, by improving your ad creatives we estimate an additional <strong className="font-semibold text-orange-600">{formatNumber(calculatedData?.extraLeadsPerMonth)}</strong> leads per month, resulting in approximately <strong className="font-semibold text-orange-600">{formatCurrency(calculatedData?.extraRevenuePerMonth, formData.currencySymbol)}</strong> in extra monthly revenue.</p>
                <p>Over <strong className="font-semibold text-orange-600">{formData.timeframeMonths} months</strong>, that’s an estimated <strong className="font-semibold text-orange-600">{formatCurrency(calculatedData?.extraRevenueTimeframe, formData.currencySymbol)}</strong> in extra revenue. Our creative service fee over the same period would be <strong className="font-semibold text-orange-600">{formatCurrency(calculatedData?.serviceCostTimeframe, formData.currencySymbol)}</strong>, which means an estimated ROI of <strong className="font-semibold text-orange-600">{formatNumber(calculatedData?.roiPercent, 1)}%</strong> and a <strong className="font-semibold text-orange-600">~{formatNumber(calculatedData?.valueToFeeMultiple, 1)}x</strong> return on your investment.</p>
              </section>

              <section className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">{formData.packageName}</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {formData.packageBullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
                  </ul>
              </section>

              <footer className="text-sm text-slate-500 border-t pt-4">
                  <p className="font-semibold mb-2">Next Steps</p>
                  <p>If these numbers make sense to you, the next step is simple: Let’s schedule your start date, and we’ll get your first batch of new creatives ready within the next 7 days.</p>
                  <p className="mt-4 font-medium">{formData.yourName} - {formData.yourAgencyName}</p>
              </footer>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 no-print">
            <button 
              onClick={handleDownloadPdf} 
              disabled={isDownloadingPdf}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-b from-[#F98538] to-[#FE514A] hover:opacity-90 transition disabled:opacity-50"
            >
              {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
            </button>
            <button onClick={handlePrint} className="flex-1 min-w-[150px] inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">Print / Save</button>
            <button onClick={handleCopy} className="flex-1 min-w-[150px] inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
              {isCopying ? 'Copied!' : 'Copy Email Summary'}
            </button>
        </div>
      </div>
    );
  }
);

export default ProposalPreview;
