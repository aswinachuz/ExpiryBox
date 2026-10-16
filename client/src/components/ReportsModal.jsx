import React, { useState } from 'react';
import { X, Download, Printer, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { getCsvExportUrl } from '../api';
import { formatDate, formatCurrency, CATEGORY_META } from '../utils/formatters';

export default function ReportsModal({ items = [], isOpen, onClose, lang = 'en' }) {
  const [reportType, setReportType] = useState('inventory'); // 'inventory' | 'urgent30'

  if (!isOpen) return null;

  const urgentItems = items.filter((i) => {
    if (i.isResolved) return false;
    const diff = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  });

  const displayedList = reportType === 'urgent30' ? urgentItems : items;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.location.href = getCsvExportUrl();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                {lang === 'ml' ? 'റിപ്പോർട്ടുകളും എക്സ്പോർട്ടും' : 'Reports & Portable Records'}
              </h2>
              <p className="text-xs text-ink-secondary">
                {lang === 'ml' ? 'പ്രിന്റ് ചെയ്യാവുന്ന രേഖകളും CSV ഡൗൺലോഡും' : 'Printable expiry summary and portable CSV download'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-[#FAF9F6] p-3 rounded-2xl border border-[#E7E5E4]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setReportType('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reportType === 'inventory'
                  ? 'bg-ink-primary text-white shadow-sm'
                  : 'bg-white text-ink-secondary border border-[#E7E5E4] hover:bg-[#F5F5F4]'
              }`}
            >
              Full Inventory ({items.length})
            </button>
            <button
              onClick={() => setReportType('urgent30')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                reportType === 'urgent30'
                  ? 'bg-ink-primary text-white shadow-sm'
                  : 'bg-white text-ink-secondary border border-[#E7E5E4] hover:bg-[#F5F5F4]'
              }`}
            >
              Next 30 Days ({urgentItems.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E7E5E4] hover:bg-[#F5F5F4] text-ink-primary flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-800" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Printable Document Table */}
        <div id="printable-report" className="border border-[#E7E5E4] rounded-2xl overflow-hidden text-xs">
          <div className="bg-[#FAF9F6] px-4 py-3 border-b border-[#E7E5E4] flex items-center justify-between">
            <span className="font-bold text-ink-primary">
              ExpiryBox Executive Summary ({reportType === 'urgent30' ? 'Urgent 30-Day Deadlines' : 'All Household Assets'})
            </span>
            <span className="text-ink-muted">
              Generated: {new Date().toLocaleDateString('en-IN')}
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E7E5E4] text-[11px] font-semibold text-ink-muted uppercase">
                <th className="p-3">Title / Asset</th>
                <th className="p-3">Category</th>
                <th className="p-3">Responsible</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4] bg-white">
              {displayedList.map((item) => {
                const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

                return (
                  <tr key={item._id} className="hover:bg-[#FAF9F6]/50">
                    <td className="p-3 font-semibold text-ink-primary">
                      {item.title}
                      {item.assetName && (
                        <span className="block text-[11px] font-normal text-ink-muted">
                          {item.assetName} • {item.documentNumber || '—'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-ink-secondary">
                      {catMeta.emoji} {catMeta.label}
                    </td>
                    <td className="p-3 text-ink-secondary">
                      {item.responsiblePerson || item.personName}
                    </td>
                    <td className="p-3 font-medium text-ink-primary">
                      {formatDate(item.expiryDate)}
                    </td>
                    <td className="p-3 font-semibold text-ink-primary">
                      {item.amount ? formatCurrency(item.amount, item.currency) : '—'}
                    </td>
                    <td className="p-3">
                      {item.isResolved ? (
                        <span className="text-emerald-700 font-semibold">Done</span>
                      ) : diff < 0 ? (
                        <span className="text-rose-700 font-semibold">Expired ({Math.abs(diff)}d ago)</span>
                      ) : diff <= 7 ? (
                        <span className="text-orange-700 font-semibold">Critical ({diff}d left)</span>
                      ) : diff <= 30 ? (
                        <span className="text-amber-700 font-semibold">Due in {diff}d</span>
                      ) : (
                        <span className="text-emerald-700 font-normal">Active ({diff}d left)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-ink-muted text-center pt-2">
          📄 Designed for offline records, insurance claims, and household handovers.
        </div>
      </div>
    </div>
  );
}
