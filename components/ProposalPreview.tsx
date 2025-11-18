
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
    <div className={`stat-card bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl text-center border border-orange-100 shadow-sm hover:shadow-md smooth-transition ${className}`}>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{label}</p>
        <p className="text-3xl font-black gradient-text">{value}</p>
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
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            // Handle images that might have CORS issues in the cloned document
            const images = clonedDoc.querySelectorAll('img');
            images.forEach((img: HTMLImageElement) => {
              if (img.src && !img.complete) {
                img.style.display = 'none';
              }
            });
          },
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
        alert("An error occurred while generating the PDF. If you're using external images, they may have CORS restrictions. Try using images from your own domain or services like logo.clearbit.com");
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
        <div className="bg-white rounded-2xl shadow-professional-lg border border-slate-100 overflow-hidden" ref={ref} id="proposal-preview">
          <div id="proposal-preview-content" className="p-8 bg-white">
              {/* Header with gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F98538] to-[#FE514A]"></div>

              <header className="flex items-start justify-between mb-8 pb-6 border-b-2 border-slate-100">
                  <div className="flex-1">
                      <div className="inline-block mb-3">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">ROI Proposal</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">
                        {formData.clientName}
                      </h2>
                      <p className="text-slate-500 font-medium">{formData.clientIndustry} • Prepared by {formData.yourName}</p>
                  </div>
                  {formData.clientLogoUrl && (
                      <div className="ml-6">
                        <img
                          src={formData.clientLogoUrl}
                          alt={`${formData.clientName} Logo`}
                          className="max-h-20 max-w-[200px] object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Try without CORS first
                            if (target.crossOrigin) {
                              target.crossOrigin = null;
                              target.src = formData.clientLogoUrl;
                            } else {
                              target.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                  )}
              </header>

              <section className="mb-8">
                <div className="flex items-center space-x-2 mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <h3 className="text-xl font-black text-slate-800">Projected Results</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Extra Leads / Month" value={`+${formatNumber(calculatedData?.extraLeadsPerMonth)}`} />
                    <StatCard label="Extra Revenue / Month" value={`${formatCurrency(calculatedData?.extraRevenuePerMonth, formData.currencySymbol)}`} />
                    <StatCard label={`${formData.timeframeMonths} Month ROI`} value={`${formatNumber(calculatedData?.roiPercent, 1)}%`} />
                    <StatCard label="Return Multiplier" value={`${formatNumber(calculatedData?.valueToFeeMultiple, 1)}x`} />
                </div>
              </section>

              <section className="mb-8 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                <div className="flex items-start space-x-3 text-slate-700 leading-relaxed">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="space-y-3 text-sm">
                    <p className="font-medium">By improving your ad creatives, we project an additional <strong className="font-bold text-orange-600">{formatNumber(calculatedData?.extraLeadsPerMonth)} leads per month</strong>, resulting in approximately <strong className="font-bold text-orange-600">{formatCurrency(calculatedData?.extraRevenuePerMonth, formData.currencySymbol)}</strong> in extra monthly revenue.</p>
                    <p className="font-medium">Over <strong className="font-bold text-orange-600">{formData.timeframeMonths} months</strong>, that's an estimated <strong className="font-bold text-orange-600">{formatCurrency(calculatedData?.extraRevenueTimeframe, formData.currencySymbol)}</strong> in additional revenue. Our service fee over the same period would be <strong className="font-bold text-orange-600">{formatCurrency(calculatedData?.serviceCostTimeframe, formData.currencySymbol)}</strong>, delivering an estimated ROI of <strong className="font-bold text-orange-600">{formatNumber(calculatedData?.roiPercent, 1)}%</strong> and a <strong className="font-bold text-orange-600">{formatNumber(calculatedData?.valueToFeeMultiple, 1)}x</strong> return on investment.</p>
                  </div>
                </div>
              </section>

              <section className="mb-8 bg-white p-6 rounded-xl border-2 border-orange-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-xl font-black text-slate-800">{formData.packageName}</h3>
                  </div>
                  <ul className="space-y-2.5">
                      {formData.packageBullets.map((bullet, index) => (
                        <li key={index} className="flex items-start space-x-3 text-slate-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{bullet}</span>
                        </li>
                      ))}
                  </ul>
              </section>

              <footer className="border-t-2 border-slate-100 pt-6">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100">
                    <div className="flex items-start space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 mb-2">Ready to Get Started?</p>
                        <p className="text-sm text-slate-600 mb-3">If these projections align with your goals, let's schedule your start date and deliver your first batch of high-converting creatives within 7 days.</p>
                        <div className="mt-4 border-t border-orange-200 pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-2">{formData.yourName}</p>
                              <p className="text-sm font-semibold text-slate-700 mb-2">{formData.yourAgencyName}</p>
                              <div className="space-y-1 text-xs text-slate-600">
                                {formData.yourEmail && (
                                  <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <a href={`mailto:${formData.yourEmail}`} className="hover:text-orange-600">{formData.yourEmail}</a>
                                  </div>
                                )}
                                {formData.yourPhone && (
                                  <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <a href={`tel:${formData.yourPhone}`} className="hover:text-orange-600">{formData.yourPhone}</a>
                                  </div>
                                )}
                                {formData.yourWebsite && (
                                  <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                    </svg>
                                    <a href={formData.yourWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600">{formData.yourWebsite.replace('https://', '').replace('http://', '')}</a>
                                  </div>
                                )}
                              </div>
                            </div>
                            {formData.agencyLogoUrl && (
                              <img
                                src={formData.agencyLogoUrl}
                                alt={formData.yourAgencyName}
                                className="max-h-16 max-w-[150px] object-contain"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  // Try without CORS first
                                  if (target.crossOrigin) {
                                    target.crossOrigin = null;
                                    target.src = formData.agencyLogoUrl;
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </footer>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 no-print">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex-1 min-w-[140px] btn-primary inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-[#F98538] to-[#FE514A] hover:opacity-90 disabled:opacity-50 smooth-transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 smooth-transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center px-5 py-3 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 smooth-transition shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              {isCopying ? 'Copied!' : 'Copy Summary'}
            </button>
        </div>
      </div>
    );
  }
);

export default ProposalPreview;
