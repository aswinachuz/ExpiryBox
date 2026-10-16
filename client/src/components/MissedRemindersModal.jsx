import React from 'react';
import { X, RotateCw, BellOff } from 'lucide-react';
import { formatDate, getStatusMeta } from '../utils/formatters';

export default function MissedRemindersModal({
  missedItems,
  isOpen,
  onClose,
  onSelectItem,
  onRenew,
  onSnooze,
  lang = 'en',
}) {
  if (!isOpen || !missedItems || missedItems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto flex flex-col p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-xl">
              🔔
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                {lang === 'ml' ? 'ശ്രദ്ധിക്കപ്പെടാത്ത അറിയിപ്പുകൾ' : 'Missed-Reminder Recovery'}
              </h2>
              <p className="text-xs text-ink-secondary">
                {lang === 'ml'
                  ? `നിങ്ങൾ കാണാത്ത ${missedItems.length} അടിയന്തിര കാലാവധികൾ എത്തിയിരിക്കുന്നു.`
                  : `You have ${missedItems.length} critical or overdue deadlines requiring attention.`}
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

        {/* List of missed items */}
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {missedItems.map((item) => {
            const statusMeta = getStatusMeta(item.daysRemaining);

            return (
              <div
                key={item._id}
                className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-300 transition-all"
              >
                <div 
                  className="cursor-pointer flex-1"
                  onClick={() => onSelectItem && onSelectItem(item)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusMeta.badgeClass}`}>
                      {statusMeta.pillText}
                    </span>
                    <span className="text-xs font-semibold text-ink-primary truncate max-w-[220px]">
                      {item.title}
                    </span>
                  </div>

                  <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-2">
                    <span>{item.personName}</span>
                    {item.assetName && <span>• {item.assetName}</span>}
                    <span>• {formatDate(item.expiryDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSnooze(item);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-xl border border-[#E7E5E4] bg-white hover:bg-[#F5F5F4] text-ink-secondary flex items-center gap-1"
                    title="Snooze for tomorrow"
                  >
                    <BellOff className="w-3 h-3 text-amber-700" />
                    <span>{lang === 'ml' ? 'സ്നൂസ്' : 'Snooze'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onRenew(item);
                      onClose();
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-xl bg-ink-primary hover:bg-[#2D3748] text-white flex items-center gap-1 shadow-sm"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{lang === 'ml' ? 'പുതുക്കുക' : 'Renew'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-xs text-ink-muted">
          <span>{lang === 'ml' ? 'ആപ്പ് തുറക്കുമ്പോഴുള്ള ഓട്ടോമാറ്റിക് അറിയിപ്പ്' : 'Alert recovery on application launch'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-medium text-ink-primary hover:bg-[#F5F5F4]"
          >
            {lang === 'ml' ? 'ശരി' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}
