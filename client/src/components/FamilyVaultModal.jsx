import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  Pencil,
  Save,
  Check,
  Phone
} from 'lucide-react';
import { getPersons, createPerson, updatePerson } from '../api';
import { formatDate, getStatusMeta, getDaysRemaining, CATEGORY_META, formatCurrency } from '../utils/formatters';

export default function FamilyVaultModal({ isOpen, onClose, onSelectItem, onRenew, onPersonUpdated, lang = 'en' }) {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', relation: '', avatar: '', phone: '' });
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: 'Family Member',
    avatar: '👤',
    phone: '',
  });

  const loadPersons = async () => {
    try {
      const res = await getPersons();
      if (res.success) {
        setPersons(res.persons);
        if (!selectedPerson && res.persons.length > 0) {
          const dad = res.persons.find((p) => p.name.toLowerCase().includes('dad')) || res.persons[0];
          setSelectedPerson(dad);
        } else if (selectedPerson) {
          const updated = res.persons.find((p) => p._id === selectedPerson._id) || res.persons[0];
          setSelectedPerson(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPersons();
    }
  }, [isOpen]);

  const handleStartEdit = () => {
    if (!selectedPerson) return;
    setEditData({
      name: selectedPerson.name || '',
      relation: selectedPerson.relation || '',
      avatar: selectedPerson.avatar || '👤',
      phone: selectedPerson.phone || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) return;

    try {
      const res = await updatePerson(selectedPerson._id, editData);
      if (res.success) {
        setIsEditing(false);
        setEditSuccessMsg(`Updated ${editData.name}'s details successfully!`);
        setTimeout(() => setEditSuccessMsg(''), 3000);
        await loadPersons();
        if (onPersonUpdated) {
          onPersonUpdated();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update person: ' + err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPerson.name) return;
    try {
      const res = await createPerson(newPerson);
      if (res.success) {
        setShowAddForm(false);
        setNewPerson({ name: '', relation: 'Family Member', avatar: '👤', phone: '' });
        await loadPersons();
        if (onPersonUpdated) {
          onPersonUpdated();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add family member: ' + err.message);
    }
  };

  if (!isOpen) return null;

  // Calculate Family Expiry Score (weighted average)
  const totalScore = persons.reduce((acc, p) => acc + (p.healthScore || 100), 0);
  const averageFamilyScore = persons.length ? Math.round(totalScore / persons.length) : 87;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E7E5E4] flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              👨‍👩‍👧
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-primary">
                {lang === 'ml' ? 'കുടുംബ വോൾട്ട് (Family Vault)' : 'Family Vault & Shared Dossier'}
              </h2>
              <p className="text-[11px] sm:text-xs text-ink-secondary">
                {lang === 'ml'
                  ? 'കുടുംബാംഗങ്ങളുടെ പേര് മാറ്റാനും രേഖകൾ പരിശോധിക്കാനും'
                  : 'Inspect and edit family members, their documents, and active certificates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          {/* Success banner if edited */}
          {editSuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{editSuccessMsg}</span>
            </div>
          )}

          {/* Family Health Banner */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                {lang === 'ml' ? 'കുടുംബ സംരക്ഷണ സ്കോർ' : 'Family Expiry Score'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ink-primary">
                  {averageFamilyScore}%
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {averageFamilyScore >= 80 ? 'Household Protected' : 'Actions Pending'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E7E5E4] hover:border-amber-300 text-ink-primary shadow-xs transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ Add Family Member'}
            </button>
          </div>

          {/* Add Member Form */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E7E5E4] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    placeholder="e.g. Sister, Child"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary mb-1">Relation</label>
                  <input
                    type="text"
                    value={newPerson.relation}
                    onChange={(e) => setNewPerson({ ...newPerson, relation: e.target.value })}
                    placeholder="e.g. Sister, Mother"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary mb-1">Avatar Emoji</label>
                  <input
                    type="text"
                    value={newPerson.avatar}
                    onChange={(e) => setNewPerson({ ...newPerson, avatar: e.target.value })}
                    placeholder="👧 or 👨"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5E4]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-secondary mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5E4]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="py-1.5 px-4 bg-ink-primary hover:bg-[#2D3748] text-white text-xs font-semibold rounded-xl"
              >
                Save Family Member
              </button>
            </form>
          )}

          {/* Family Members Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {persons.map((p) => {
              const isSelected = selectedPerson?._id === p._id;

              return (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedPerson(p);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50/40 border-amber-600 shadow-sm ring-1 ring-amber-600'
                      : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.avatar || '👤'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-ink-primary flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isPrimary && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-normal">
                            Self
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-ink-muted">
                        {p.relation} • {p.totalItems || 0} items
                      </p>
                      {p.phone ? (
                        <p className="text-[11px] font-medium text-amber-900 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-700" />
                          <span>{p.phone}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          No mobile added
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E7E5E4]/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-primary">
                      {p.healthScore || 100}% Score
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      {p.expiredCount > 0 && (
                        <span className="text-rose-700 font-bold">🔴 {p.expiredCount} Expired</span>
                      )}
                      {p.urgentCount > 0 && (
                        <span className="text-amber-700 font-bold">🟡 {p.urgentCount} Soon</span>
                      )}
                      {p.expiredCount === 0 && p.urgentCount === 0 && (
                        <span className="text-emerald-700 font-medium">🟢 All Safe</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Dossier & Edit Form of Selected Person */}
          {selectedPerson && (
            <div className="bg-[#FAF9F6] p-5 rounded-3xl border border-[#E7E5E4] space-y-4">
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPerson.avatar}</span>
                  <div>
                    <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                      <span>{selectedPerson.name}'s Records</span>
                      <button
                        onClick={handleStartEdit}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white border border-[#E7E5E4] hover:border-amber-400 text-ink-secondary hover:text-amber-900 flex items-center gap-1.5 shadow-2xs transition-all"
                        title={`Edit name and mobile number for ${selectedPerson.name}`}
                      >
                        <Pencil className="w-3 h-3 text-amber-800" />
                        <span>Edit Profile & Mobile</span>
                      </button>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-ink-secondary font-medium">{selectedPerson.relation}</span>
                      <span className="text-xs text-ink-muted">•</span>
                      {selectedPerson.phone ? (
                        <a 
                          href={`tel:${selectedPerson.phone}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          title="Click to dial"
                        >
                          <Phone className="w-3 h-3 text-amber-800" />
                          <span>{selectedPerson.phone}</span>
                        </a>
                      ) : (
                        <button
                          onClick={handleStartEdit}
                          className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Phone className="w-3 h-3 text-amber-800" />
                          <span>+ Add Mobile Number</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-[#E7E5E4] text-ink-primary shadow-xs">
                  {selectedPerson.items?.length || 0} Registered Items
                </span>
              </div>

              {/* Inline Edit Form when isEditing is true */}
              {isEditing && (
                <form onSubmit={handleSaveEdit} className="p-4 bg-white rounded-2xl border border-amber-300 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Member Profile (Name & Mobile for {selectedPerson.name})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-ink-muted hover:text-ink-primary"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                        Full Name / Display Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="e.g. Suresh Kumar / Dad"
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                        Mobile Number (For Alerts & Reminders)
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="+91 94470 54321"
                          className="w-full pl-8.5 pr-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={editData.relation}
                        onChange={(e) => setEditData({ ...editData, relation: e.target.value })}
                        placeholder="e.g. Father, Mother, Self"
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                        Avatar Emoji
                      </label>
                      <input
                        type="text"
                        value={editData.avatar}
                        onChange={(e) => setEditData({ ...editData, avatar: e.target.value })}
                        placeholder="👨, 👩, or 🧑"
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F6] rounded-xl border border-[#E7E5E4] text-center text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#F5F5F4]">
                    <p className="text-[11px] text-ink-muted">
                      💡 Changing name automatically updates all linked policies, assets, and vehicle documents.
                    </p>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white shadow-xs flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile & Mobile</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Items List for the selected member */}
              {selectedPerson.items && selectedPerson.items.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedPerson.items.map((item) => {
                    const days = getDaysRemaining(item.expiryDate);
                    const statusMeta = getStatusMeta(days, item.isResolved);
                    const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

                    return (
                      <div
                        key={item._id}
                        onClick={() => {
                          if (onSelectItem) {
                            onSelectItem(item);
                            onClose();
                          }
                        }}
                        className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 truncate">
                          <span className="text-2xl flex-shrink-0">{catMeta.emoji}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-ink-primary group-hover:text-amber-900 transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.priority === 'critical' && (
                                <span className="text-[10px] font-bold px-1.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                                  Critical
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-ink-muted flex items-center gap-2 mt-0.5 truncate">
                              <span>{item.provider || item.documentType}</span>
                              {item.documentNumber && <span className="font-mono">• {item.documentNumber}</span>}
                              {item.assetName && <span>• Asset: {item.assetName}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F5F4]">
                          <div className="text-right text-xs">
                            <span className="font-semibold text-ink-primary block">
                              {formatDate(item.expiryDate)}
                            </span>
                            {item.amount && (
                              <span className="text-ink-muted text-[11px]">
                                {formatCurrency(item.amount, item.currency)}
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusMeta.badgeClass}`}>
                            {statusMeta.pillText}
                          </span>

                          {onRenew && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRenew(item);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs"
                              title="Renew document"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Renew</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-ink-muted bg-white rounded-2xl border border-dashed border-[#E7E5E4]">
                  No active documents currently logged for {selectedPerson.name}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
