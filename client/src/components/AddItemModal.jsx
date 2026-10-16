import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Calendar, Bell, Shield, AlertCircle, AlertTriangle, Lock, UserCheck } from 'lucide-react';
import { CATEGORY_META } from '../utils/formatters';
import { createItem, getPersons, getAssets } from '../api';

export default function AddItemModal({ isOpen, onClose, onItemCreated, lang = 'en' }) {
  const [persons, setPersons] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'document',
    priority: 'normal',
    privacy: 'family',
    personName: 'Aswin',
    responsiblePerson: 'Aswin',
    assetName: '',
    documentNumber: '',
    documentType: 'Document',
    provider: '',
    issueDate: '',
    expiryDate: '',
    isRecurring: false,
    recurrenceInterval: 'none',
    gracePeriodDays: 0,
    amount: '',
    currency: 'INR',
    billingCycle: 'one-time',
    notes: '',
    tags: '',
  });

  const [reminders, setReminders] = useState([
    { daysBefore: 90, isEnabled: true },
    { daysBefore: 60, isEnabled: true },
    { daysBefore: 30, isEnabled: true },
    { daysBefore: 15, isEnabled: true },
    { daysBefore: 7, isEnabled: true },
    { daysBefore: 1, isEnabled: true },
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadContext();
    }
  }, [isOpen]);

  const loadContext = async () => {
    try {
      const [personsData, assetsData] = await Promise.all([getPersons(), getAssets()]);
      if (personsData.success) setPersons(personsData.persons);
      if (assetsData.success) setAssets(assetsData.assets);
    } catch (err) {
      console.error('Failed to load persons/assets', err);
    }
  };

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReminderToggle = (daysBefore) => {
    setReminders((prev) =>
      prev.map((r) => (r.daysBefore === daysBefore ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.expiryDate) {
      setError('Please provide at least a title and an expiry date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      data.append('reminders', JSON.stringify(reminders));

      // Append files
      selectedFiles.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await createItem(data);
      if (res.success) {
        onItemCreated(res.item);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E7E5E4] flex items-center justify-between z-10">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-ink-primary">
              {lang === 'ml' ? 'പുതിയത് ചേർക്കുക' : 'Add New Tracked Item'}
            </h2>
            <p className="text-[11px] sm:text-xs text-ink-secondary">
              {lang === 'ml' ? 'ആസ്തി, രേഖകൾ, ഗ്രേസ് പിരീഡ്, ഉത്തരവാദിത്തം എന്നിവ രേഖപ്പെടുത്തുക' : '4-tier model with recurrence, priority, and delegated responsibilities'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Who & What (Person, Asset, Responsible, Privacy) */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4] space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              1. Hierarchy & Shared Delegation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Document Owner (Person)
                </label>
                <input
                  type="text"
                  name="personName"
                  value={formData.personName}
                  onChange={handleInputChange}
                  placeholder="e.g. Aswin, Dad, Mom"
                  list="person-options"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
                <datalist id="person-options">
                  {persons.map((p) => (
                    <option key={p._id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Task Delegated To (Responsible Person)
                </label>
                <input
                  type="text"
                  name="responsiblePerson"
                  value={formData.responsiblePerson}
                  onChange={handleInputChange}
                  placeholder="Who will actually renew / pay?"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Associated Asset (Optional)
                </label>
                <input
                  type="text"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleInputChange}
                  placeholder="e.g. Honda Activa, ASUS Laptop, Home AC"
                  list="asset-options"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
                <datalist id="asset-options">
                  {assets.map((a) => (
                    <option key={a._id} value={a.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Privacy Level
                </label>
                <select
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                >
                  <option value="family">Family Visible (Shared)</option>
                  <option value="private">Private (PIN Required)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Core Details & Priority */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              2. Item Particulars & Risk Priority
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Item Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Vehicle Insurance, Laptop Hardware Warranty"
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Priority / Risk Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] font-semibold"
                >
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="normal">🟡 Normal</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.emoji} {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Provider / Authority
                </label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC ERGO, Kerala MVD, Netflix"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
              </div>
            </div>

            {/* Dates & Recurring Schedules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Expiry / Renewal Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  required
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] font-semibold text-ink-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Recurring Schedule
                </label>
                <select
                  name="recurrenceInterval"
                  value={formData.recurrenceInterval}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      recurrenceInterval: val,
                      isRecurring: val !== 'none',
                    }));
                  }}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                >
                  <option value="none">One-time / Not Recurring</option>
                  <option value="monthly">Monthly Recurring</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="annual">Annual Recurring</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  name="gracePeriodDays"
                  value={formData.gracePeriodDays}
                  onChange={handleInputChange}
                  placeholder="e.g. 15 or 30"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Document / Policy No
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. POL-HDFC-99201"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">
                  Amount / Premium (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g. 2450"
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Smart Multi-Stage Reminders */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>3. Multi-Stage Reminders</span>
              </span>
              <span className="text-[11px] text-ink-muted">Escalates automatically</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {reminders.map((r) => (
                <button
                  type="button"
                  key={r.daysBefore}
                  onClick={() => handleReminderToggle(r.daysBefore)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border text-center transition-all ${
                    r.isEnabled
                      ? 'bg-amber-100/70 border-amber-300 text-amber-900 shadow-sm'
                      : 'bg-white border-[#E7E5E4] text-ink-muted hover:border-[#D6D3D1]'
                  }`}
                >
                  {r.daysBefore}d before
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Attachments & Quality Check */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              4. Document Upload & Quality
            </span>

            <div>
              <div className="border-2 border-dashed border-[#E7E5E4] hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white">
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-6 h-6 mx-auto text-ink-muted mb-1" />
                  <span className="text-xs font-medium text-ink-primary">
                    Attach Invoice, Policy PDF, or Warranty Card
                  </span>
                  <span className="block text-[11px] text-ink-muted mt-0.5">
                    Supports rotate, zoom, and authenticity preview
                  </span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      📄 {f.name} ({(f.size / 1024).toFixed(0)} KB)
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Notes & Instructions
              </label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="e.g. Auto-renewal active, Zero depreciation policy..."
                className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4]"
              />
            </div>
          </div>

          {/* Submit Row */}
          <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-[#F5F5F4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-ink-primary hover:bg-[#2D3748] text-white shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to ExpiryBox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
