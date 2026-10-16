import React from 'react';
import { 
  formatDate, 
  getDaysRemaining, 
  getStatusMeta, 
  CATEGORY_META, 
  formatCurrency 
} from '../utils/formatters';
import { Paperclip, CheckCircle2, RotateCw, BellOff, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export default function ItemCard({
  item,
  onSelect,
  onRenew,
  onResolve,
  onSnooze,
  lang = 'en',
}) {
  const days = getDaysRemaining(item.expiryDate);
  const statusMeta = getStatusMeta(days, item.isResolved);
  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

  const isSnoozed = item.snoozedUntil && new Date(item.snoozedUntil) > new Date();

  return (
    <div 
      onClick={() => onSelect(item)}
      className={`group relative bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
        item.priority === 'critical'
          ? 'border-rose-300 ring-1 ring-rose-300/50'
          : item.priority === 'high'
          ? 'border-amber-300'
          : 'border-[#E7E5E4] hover:border-[#D6D3D1]'
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Category Badge & Context */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${catMeta.color}`}>
              <span>{catMeta.emoji}</span>
              <span>{catMeta.label}</span>
            </span>

            {/* Priority Indicator */}
            {item.priority === 'critical' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 uppercase">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Critical
              </span>
            )}
            {item.priority === 'high' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 uppercase">
                High
              </span>
            )}

            {/* Privacy indicator */}
            {item.privacy === 'private' && (
              <span className="p-1 rounded-md bg-[#F5F5F4] text-ink-muted" title="Private to you">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {isSnoozed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-50 text-purple-800 border-purple-200">
                <BellOff className="w-3 h-3" />
                <span>Snoozed</span>
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                <span>{statusMeta.pillText}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-ink-primary group-hover:text-amber-900 transition-colors line-clamp-1 mb-1">
          {item.title}
        </h3>

        {/* Context metadata (Asset, Assigned person, Document number) */}
        <div className="text-xs text-ink-secondary flex items-center gap-2 flex-wrap mb-3">
          {item.assetName && (
            <span className="font-medium text-ink-primary bg-[#FAF9F6] px-2 py-0.5 rounded-md border border-[#E7E5E4]">
              {item.assetName}
            </span>
          )}
          {item.responsiblePerson && item.responsiblePerson !== item.personName && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
              <UserCheck className="w-3 h-3" />
              <span>Assigned: {item.responsiblePerson}</span>
            </span>
          )}
          {item.provider && <span className="text-ink-muted">• {item.provider}</span>}
          {item.documentNumber && <span className="font-mono text-ink-muted">• {item.documentNumber}</span>}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="pt-3 border-t border-[#F5F5F4] flex items-center justify-between text-xs">
        {/* Expiry Date & Amount */}
        <div className="flex items-center gap-3">
          <div>
            <span className="text-ink-muted">Expiry: </span>
            <span className="font-medium text-ink-primary">{formatDate(item.expiryDate)}</span>
          </div>
          {item.amount && (
            <div className="font-semibold text-ink-primary">
              {formatCurrency(item.amount, item.currency)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {item.attachments && item.attachments.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-ink-muted p-1" title={`${item.attachments.length} file(s)`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>{item.attachments.length}</span>
            </span>
          )}

          {/* Snooze Button */}
          {onSnooze && (
            <button
              onClick={() => onSnooze(item)}
              className="p-1 rounded-md text-ink-muted hover:text-amber-800 hover:bg-[#F5F5F4] transition-colors"
              title="Snooze notification"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Renew Button */}
          <button
            onClick={() => onRenew(item)}
            className="px-2 py-1 rounded-md text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-[#F5F5F4] border border-[#E7E5E4] flex items-center gap-1 transition-colors"
            title="Renew item"
          >
            <RotateCw className="w-3 h-3 text-amber-700" />
            <span className="hidden sm:inline">Renew</span>
          </button>

          {/* Resolve / Done */}
          <button
            onClick={() => onResolve(item)}
            className={`p-1 rounded-md border transition-colors ${
              item.isResolved 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'text-ink-muted hover:text-emerald-700 hover:bg-emerald-50 border-transparent'
            }`}
            title={item.isResolved ? 'Marked complete' : 'Mark complete'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
