import React, { useState } from 'react';
import ItemCard from '../components/ItemCard';
import { CATEGORY_META } from '../utils/formatters';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, Sparkles, Filter, BellOff, Plus } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function DashboardView({
  stats,
  items,
  activeCategory,
  setActiveCategory,
  onSelectItem,
  onRenew,
  onResolve,
  onSnooze,
  onOpenAdd,
  onOpenMissedReminders,
  missedCount = 0,
  lang = 'en',
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Missed Reminder Recovery Banner if any */}
      {missedCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-rose-900">
                {lang === 'ml'
                  ? `ശ്രദ്ധിക്കുക: ${missedCount} അടിയന്തിര അറിയിപ്പുകൾ നടപടി കാത്തിരിക്കുന്നു`
                  : `Missed-Reminder Recovery: ${missedCount} critical deadlines arrived`}
              </h3>
              <p className="text-[11px] text-rose-800/80">
                {lang === 'ml'
                  ? 'ഇവ പരിശോധിച്ച് നടപടിയെടുക്കുകയോ താൽക്കാലികമായി സ്നൂസ് ചെയ്യുകയോ ചെയ്യുക.'
                  : 'Review expired or upcoming deadlines that triggered while you were away.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenMissedReminders}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-800 hover:bg-rose-900 text-white shadow-xs transition-colors flex-shrink-0"
          >
            {lang === 'ml' ? 'പരിശോധിക്കുക' : 'Review Alerts'}
          </button>
        </div>
      )}

      {/* Hero / Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
            {lang === 'ml' ? 'നമസ്കാരം, അശ്വിൻ 👋' : 'Good Evening, Aswin 👋'}
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            {lang === 'ml'
              ? `നിങ്ങളുടെ കുടുംബത്തിനും ആസ്തികൾക്കുമായി ആകെ ${stats?.totalTracked || 0} രേഖകൾ ട്രാക്ക് ചെയ്യപ്പെടുന്നു.`
              : `You have ${stats?.totalTracked || 0} active records tracked across your family, vehicles, and assets.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto flex-wrap">
          {/* Health Score Pill */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
              {stats?.healthScore || 100}%
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                {getTranslation(lang, 'healthScore')}
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                {(stats?.healthScore || 100) >= 80 ? getTranslation(lang, 'goodStanding') : getTranslation(lang, 'needsAttention')}
              </span>
            </div>
          </div>

          {/* Desktop & Mobile Direct Add Button */}
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-ink-primary hover:bg-[#2D3748] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            title="Add a new deadline, warranty, or renewal"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ {getTranslation(lang, 'addItem')}</span>
          </button>
        </div>
      </div>

      {/* Metric Counters (Total, Expired, Soon, Active) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total */}
        <div 
          onClick={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' && priorityFilter === 'all'
              ? 'bg-white border-[#B45309] shadow-sm ring-1 ring-[#B45309]'
              : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
          }`}
        >
          <span className="text-xs font-medium text-ink-muted block mb-1">
            {getTranslation(lang, 'totalTracked')}
          </span>
          <div className="text-2xl font-bold text-ink-primary">{stats?.totalTracked || 0}</div>
          <span className="text-[11px] text-ink-secondary mt-1 block">Household records</span>
        </div>

        {/* Expired */}
        <div 
          onClick={() => setStatusFilter('expired')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'expired'
              ? 'bg-rose-50/50 border-rose-600 shadow-sm ring-1 ring-rose-600'
              : 'bg-white border-[#E7E5E4] hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-rose-800">{getTranslation(lang, 'expired')}</span>
            <span className="w-2 h-2 rounded-full bg-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-800">{stats?.expiredCount || 0}</div>
          <span className="text-[11px] text-rose-700/80 mt-1 block">Immediate action</span>
        </div>

        {/* Soon */}
        <div 
          onClick={() => setStatusFilter('urgent')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'urgent'
              ? 'bg-amber-50/50 border-amber-600 shadow-sm ring-1 ring-amber-600'
              : 'bg-white border-[#E7E5E4] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-amber-800">{getTranslation(lang, 'expiresSoon')}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-800">{stats?.soonCount || 0}</div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Next 30 days</span>
        </div>

        {/* Active / Good */}
        <div 
          onClick={() => setStatusFilter('good')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'good'
              ? 'bg-emerald-50/50 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
              : 'bg-white border-[#E7E5E4] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-emerald-800">{getTranslation(lang, 'activeSafe')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-800">{stats?.activeCount || 0}</div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Safe for &gt;30d</span>
        </div>
      </div>

      {/* Promoted "Needs Attention" Triage */}
      {stats?.needsAttention && stats.needsAttention.length > 0 && (
        <div className="bg-[#FAF9F6] p-5 rounded-3xl border border-[#E7E5E4] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-800 text-lg">⚠️</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-primary">
                {getTranslation(lang, 'needsAttention')}
              </h2>
            </div>
            <span className="text-xs text-ink-muted">Sorted by risk & urgency</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.needsAttention.slice(0, 3).map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onSelect={onSelectItem}
                onRenew={onRenew}
                onResolve={onResolve}
                onSnooze={onSnooze}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories & Priority Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-ink-primary">
            {getTranslation(lang, 'totalTracked')} ({filteredItems.length})
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink-muted hidden sm:inline">Priority:</span>
              {['all', 'critical', 'high', 'normal'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-all capitalize ${
                    priorityFilter === p
                      ? 'bg-ink-primary text-white'
                      : 'bg-white border border-[#E7E5E4] text-ink-secondary hover:bg-[#F5F5F4]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenAdd}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-amber-50 text-amber-900 border border-[#E7E5E4] hover:border-amber-300 shadow-2xs transition-colors"
              title="Add a new deadline or document"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>{getTranslation(lang, 'addItem')}</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-ink-primary text-white shadow-sm'
                : 'bg-white border border-[#E7E5E4] text-ink-secondary hover:bg-[#F5F5F4]'
            }`}
          >
            All Items ({items.length})
          </button>

          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const count = stats?.categoryCounts?.[key] || 0;
            if (count === 0 && activeCategory !== key) return null;

            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === key
                    ? 'bg-ink-primary text-white shadow-sm'
                    : 'bg-white border border-[#E7E5E4] text-ink-secondary hover:bg-[#F5F5F4]'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
                {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E7E5E4] p-8 space-y-3">
            <span className="text-3xl block">📭</span>
            <h3 className="text-sm font-semibold text-ink-primary">No items found</h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              There are no tracked deadlines matching this category or priority filter.
            </p>
            <button
              onClick={onOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-ink-primary text-white hover:bg-[#2D3748] transition-colors"
            >
              + {getTranslation(lang, 'addItem')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onSelect={onSelectItem}
                onRenew={onRenew}
                onResolve={onResolve}
                onSnooze={onSnooze}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
