import React, { useState } from 'react';
import { X, Calendar, Check, BellOff } from 'lucide-react';
import { snoozeItem } from '../api';

export default function SnoozeModal({ item, isOpen, onClose, onSnoozed, lang = 'en' }) {
  const [selectedOption, setSelectedOption] = useState(1); // 1 = tomorrow, 7 = next week, 'custom'
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleSnooze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        days: selectedOption === 'custom' ? undefined : selectedOption,
        customDate: selectedOption === 'custom' ? customDate : undefined,
        reason,
      };

      const res = await snoozeItem(item._id, payload);
      if (res.success) {
        onSnoozed(res.item);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to snooze item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-sm w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <BellOff className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-ink-primary text-sm">
                {lang === 'ml' ? 'സ്നൂസ് ചെയ്യുക' : 'Snooze Alert'}
              </h3>
              <p className="text-xs text-ink-secondary truncate max-w-[200px]">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSnooze} className="space-y-4">
          <p className="text-xs text-ink-secondary">
            {lang === 'ml'
              ? 'ഈ റിമൈൻഡർ താൽക്കാലികമായി മാറ്റിവെക്കുക:'
              : 'Pause notifications for this item until:'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedOption(1)}
              className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                selectedOption === 1
                  ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-[#E7E5E4] bg-white text-ink-secondary hover:border-[#D6D3D1]'
              }`}
            >
              <div className="font-bold">
                {lang === 'ml' ? 'നാളെ' : 'Tomorrow'}
              </div>
              <div className="text-[10px] text-ink-muted font-normal mt-0.5">+1 day</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOption(7)}
              className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                selectedOption === 7
                  ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-[#E7E5E4] bg-white text-ink-secondary hover:border-[#D6D3D1]'
              }`}
            >
              <div className="font-bold">
                {lang === 'ml' ? 'അടുത്ത ആഴ്ച' : 'Next Week'}
              </div>
              <div className="text-[10px] text-ink-muted font-normal mt-0.5">+7 days</div>
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setSelectedOption('custom')}
              className={`w-full p-2.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                selectedOption === 'custom'
                  ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-[#E7E5E4] bg-white text-ink-secondary hover:border-[#D6D3D1]'
              }`}
            >
              <span>{lang === 'ml' ? 'മറ്റൊരു തീയതി തിരഞ്ഞെടുക്കുക' : 'Pick a Specific Date'}</span>
              <Calendar className="w-3.5 h-3.5" />
            </button>

            {selectedOption === 'custom' && (
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2 w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#E7E5E4] font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-secondary mb-1">
              {lang === 'ml' ? 'കാരണം (ഓപ്ഷണൽ)' : 'Reason (Optional)'}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={lang === 'ml' ? 'ഉദാ: ശമ്പളം കിട്ടിയ ശേഷം അടയ്ക്കും' : 'e.g. Waiting for salary / awaiting agent reply'}
              className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5E4]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary"
            >
              {lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-ink-primary text-white hover:bg-[#2D3748] shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Snoozing...' : lang === 'ml' ? 'സ്നൂസ് സ്ഥിരീകരിക്കുക' : 'Confirm Snooze'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
