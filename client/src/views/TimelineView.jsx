import React, { useState, useEffect } from 'react';
import { getTimeline } from '../api';
import { formatDate, getStatusMeta, getDaysRemaining, CATEGORY_META, formatCurrency } from '../utils/formatters';
import { Clock, AlertCircle, RotateCw, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';

export default function TimelineView({ onSelectItem, onRenew, onResolve }) {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await getTimeline();
      if (res.success) {
        setTimeline(res.timeline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      key: 'expired',
      title: 'Overdue & Expired',
      emoji: '🔴',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      description: 'Needs immediate renewal or action',
    },
    {
      key: 'next7Days',
      title: 'This Week (Next 7 Days)',
      emoji: '⚡',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      description: 'Critical deadlines within 7 days',
    },
    {
      key: 'next30Days',
      title: 'This Month (Next 30 Days)',
      emoji: '🟡',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Upcoming renewals and warranties',
    },
    {
      key: 'next90Days',
      title: 'Next Quarter (30 to 90 Days)',
      emoji: '🟢',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Scheduled maintenance, investments, and renewals',
    },
    {
      key: 'later',
      title: 'Future Horizons (Later Months & Years)',
      emoji: '📅',
      badgeClass: 'bg-stone-50 text-stone-700 border-stone-200',
      description: 'Long-term passports, policies, and fixed deposits',
    },
  ];

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-ink-muted">
        Loading Life Timeline...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
          Life Timeline
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Your chronological stream of deadlines, renewals, warranties, and payments.
        </p>
      </div>

      {/* Stream Sections */}
      <div className="space-y-8">
        {sections.map((sec) => {
          const items = timeline?.[sec.key] || [];
          if (items.length === 0) return null;

          return (
            <div key={sec.key} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sec.emoji}</span>
                  <h2 className="text-base font-bold text-ink-primary">{sec.title}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F4] text-ink-secondary">
                    {items.length}
                  </span>
                </div>
                <span className="text-xs text-ink-muted hidden sm:inline">{sec.description}</span>
              </div>

              {/* Items in this time horizon */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const days = getDaysRemaining(item.expiryDate);
                  const statusMeta = getStatusMeta(days, item.isResolved);
                  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

                  return (
                    <div
                      key={item._id}
                      onClick={() => onSelectItem(item)}
                      className="p-4 rounded-2xl bg-white border border-[#E7E5E4] hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Left Details */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                          {catMeta.emoji}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-ink-primary group-hover:text-amber-900 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F4] text-ink-secondary border border-[#E7E5E4]">
                              {item.personName}
                            </span>
                            {item.assetName && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F4] text-ink-secondary border border-[#E7E5E4]">
                                {item.assetName}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-ink-muted mt-1 flex items-center gap-2 flex-wrap">
                            <span>Deadline: <strong className="text-ink-primary">{formatDate(item.expiryDate)}</strong></span>
                            {item.amount && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-ink-primary">
                                  {formatCurrency(item.amount, item.currency)}
                                </span>
                              </>
                            )}
                            {item.provider && (
                              <>
                                <span>•</span>
                                <span>{item.provider}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Status Pill & Quick Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F5F4]">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusMeta.badgeClass}`}>
                          {statusMeta.pillText}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onRenew(item)}
                            className="p-1.5 rounded-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] text-ink-secondary hover:text-amber-800 transition-colors"
                            title="Renew item"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onResolve(item)}
                            className="p-1.5 rounded-lg border border-[#E7E5E4] hover:bg-emerald-50 text-ink-secondary hover:text-emerald-700 transition-colors"
                            title="Mark resolved"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
