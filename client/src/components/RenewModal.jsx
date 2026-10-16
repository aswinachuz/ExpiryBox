import React, { useState } from 'react';
import { X, RotateCw, Calendar, Check } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { renewItem } from '../api';

export default function RenewModal({ item, isOpen, onClose, onRenewed }) {
  if (!isOpen || !item) return null;

  // Calculate default +1 year from existing expiry or today
  const calculateDefaultNewDate = () => {
    const base = new Date(item.expiryDate) > new Date() ? new Date(item.expiryDate) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    return base.toISOString().split('T')[0];
  };

  const [newDate, setNewDate] = useState(calculateDefaultNewDate());
  const [renewalNotes, setRenewalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await renewItem(item._id, {
        newExpiryDate: newDate,
        notes: renewalNotes,
      });
      if (res.success) {
        onRenewed(res.item);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to renew item: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <RotateCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-primary">Renew Item</h3>
              <p className="text-xs text-ink-secondary truncate max-w-[240px]">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs text-ink-secondary">
            Current expiry date: <span className="font-medium text-ink-primary">{formatDate(item.expiryDate)}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              New Expiry Date
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Renewal Note (Optional)
            </label>
            <input
              type="text"
              value={renewalNotes}
              onChange={(e) => setRenewalNotes(e.target.value)}
              placeholder="e.g. Paid via UPI, Policy # renewal confirmed"
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-[#F5F5F4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-amber-800 hover:bg-amber-900 text-white shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Renewing...' : 'Confirm Renewal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
