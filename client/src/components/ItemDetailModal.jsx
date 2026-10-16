import React, { useState } from 'react';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  Trash2, 
  Paperclip, 
  ExternalLink, 
  Calendar, 
  AlertCircle, 
  Bell, 
  BellOff, 
  Tag, 
  User, 
  Briefcase, 
  CheckSquare, 
  History, 
  Activity, 
  RotateCcw, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { 
  formatDate, 
  getDaysRemaining, 
  getStatusMeta, 
  CATEGORY_META, 
  formatCurrency 
} from '../utils/formatters';
import { updateChecklist, getAttachmentUrl } from '../api';

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onRenew,
  onResolve,
  onDelete,
  onSnooze,
  lang = 'en',
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'checklist' | 'history' | 'activity'
  const [checklist, setChecklist] = useState(item?.checklist || []);
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!isOpen || !item) return null;

  const days = getDaysRemaining(item.expiryDate);
  const statusMeta = getStatusMeta(days, item.isResolved);
  const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

  const handleToggleTask = async (index, currentVal) => {
    try {
      const nextVal = !currentVal;
      const res = await updateChecklist(item._id, index, nextVal);
      if (res.success) {
        setChecklist(res.checklist);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rotateImage = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${catMeta.color}`}>
              <span>{catMeta.emoji}</span>
              <span>{catMeta.label}</span>
            </span>

            {item.priority === 'critical' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 uppercase">
                Critical Priority
              </span>
            )}

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
              <span>{statusMeta.pillText}</span>
            </span>

            {item.privacy === 'private' && (
              <span className="text-xs bg-[#FAF9F6] border border-[#E7E5E4] px-2 py-0.5 rounded-md text-ink-muted flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-[#E7E5E4] flex items-center gap-2 bg-[#FAF9F6] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-ink-primary shadow-sm border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'checklist'
                ? 'bg-white text-ink-primary shadow-sm border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Renewal Checklist</span>
            {item.checklist && item.checklist.length > 0 && (
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 rounded-full">
                {item.checklist.filter((c) => c.isCompleted).length}/{item.checklist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-white text-ink-primary shadow-sm border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History ({item.renewalHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'activity'
                ? 'bg-white text-ink-primary shadow-sm border border-[#E7E5E4]'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 flex-1">
            <div>
              <h2 className="text-xl font-bold text-ink-primary mb-2">
                {item.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-ink-secondary flex-wrap">
                <span className="flex items-center gap-1 bg-[#F5F5F4] px-2.5 py-1 rounded-lg border border-[#E7E5E4]">
                  <User className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Owner: <strong>{item.personName || 'Aswin'}</strong></span>
                </span>

                {item.responsiblePerson && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                    <span>Task Assigned To: <strong>{item.responsiblePerson}</strong></span>
                  </span>
                )}

                {item.assetName && (
                  <span className="flex items-center gap-1 bg-[#F5F5F4] px-2.5 py-1 rounded-lg border border-[#E7E5E4]">
                    <Briefcase className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Asset: <strong>{item.assetName}</strong></span>
                  </span>
                )}
              </div>
            </div>

            {/* Date & Financial Banner */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4] grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-ink-muted block mb-0.5">
                  Current Expiry
                </span>
                <span className="text-base font-bold text-ink-primary">
                  {formatDate(item.expiryDate)}
                </span>
              </div>

              {item.amount && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ink-muted block mb-0.5">
                    Amount / Cost
                  </span>
                  <span className="text-base font-bold text-ink-primary">
                    {formatCurrency(item.amount, item.currency)}
                    {item.billingCycle && item.billingCycle !== 'one-time' && (
                      <span className="text-xs font-normal text-ink-muted"> / {item.billingCycle}</span>
                    )}
                  </span>
                </div>
              )}

              {item.gracePeriodDays > 0 && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-ink-muted block mb-0.5">
                    Grace Period
                  </span>
                  <span className="text-sm font-semibold text-emerald-800">
                    +{item.gracePeriodDays} days allowed
                  </span>
                </div>
              )}
            </div>

            {/* Document Particulars */}
            <div className="space-y-3 text-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Document Particulars
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <span className="text-ink-muted block">Provider / Authority</span>
                  <span className="font-medium text-ink-primary">{item.provider || '—'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Document Number</span>
                  <span className="font-mono font-medium text-ink-primary">{item.documentNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Document Type</span>
                  <span className="font-medium text-ink-primary">{item.documentType || '—'}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Issue Date</span>
                  <span className="font-medium text-ink-primary">{formatDate(item.issueDate)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-semibold uppercase tracking-wider text-ink-muted">Notes</h4>
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E7E5E4] text-ink-secondary whitespace-pre-line">
                  {item.notes}
                </div>
              </div>
            )}

            {/* Attachments with Rotate preview */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Uploaded Documents ({item.attachments.length})</span>
                  </h4>
                  <button
                    onClick={rotateImage}
                    className="text-xs text-ink-secondary hover:text-ink-primary flex items-center gap-1"
                    title="Rotate attachment preview"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rotate (90°)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {item.attachments.map((file, i) => (
                    <a
                      key={i}
                      href={getAttachmentUrl(file.path)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E7E5E4] hover:border-amber-300 hover:bg-amber-50/20 text-xs font-medium text-ink-primary transition-all group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>📄</span>
                        <span className="truncate">{file.originalname || file.filename}</span>
                        <span className="text-ink-muted">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-muted group-hover:text-amber-800 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Smart Renewal Checklist */}
        {activeTab === 'checklist' && (
          <div className="p-6 space-y-4 flex-1">
            <div>
              <h3 className="text-sm font-bold text-ink-primary">
                Smart Renewal Preparation Checklist
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Complete these verified procedures before paying or submitting renewal applications.
              </p>
            </div>

            <div className="space-y-2.5">
              {(item.checklist || []).map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleTask(idx, step.isCompleted)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    step.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      step.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#D6D3D1] bg-white'
                    }`}>
                      {step.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-medium ${step.isCompleted ? 'line-through opacity-80' : 'text-ink-primary'}`}>
                      {step.task}
                    </span>
                  </div>

                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-[#E7E5E4] hover:border-amber-400 text-amber-800 flex items-center gap-1 shadow-xs"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Renewal History & Document Versioning */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4 flex-1">
            <div>
              <h3 className="text-sm font-bold text-ink-primary">
                Renewal History & Document Versions
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Inspect what was paid and which document versions were active in previous years.
              </p>
            </div>

            {item.renewalHistory && item.renewalHistory.length > 0 ? (
              <div className="space-y-3">
                {item.renewalHistory.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-ink-primary">
                      <span>Renewed on {formatDate(rev.renewalDate)}</span>
                      {rev.amountPaid && <span>{formatCurrency(rev.amountPaid)}</span>}
                    </div>

                    <div className="text-xs text-ink-muted">
                      Previous Expiry: <strong className="text-ink-primary">{formatDate(rev.previousExpiryDate)}</strong> → Extended To: <strong className="text-ink-primary">{formatDate(rev.newExpiryDate)}</strong>
                    </div>

                    {rev.notes && (
                      <p className="text-xs text-ink-secondary bg-white p-2.5 rounded-xl border border-[#E7E5E4]">
                        {rev.notes}
                      </p>
                    )}

                    {rev.attachments && rev.attachments.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {rev.attachments.map((att, attIdx) => (
                          <a
                            key={attIdx}
                            href={getAttachmentUrl(att.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"
                          >
                            📄 {att.originalname || att.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-ink-muted bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E7E5E4]">
                No historical renewals recorded yet. When you click "Renew Item", previous versions will automatically be archived here.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Activity Log */}
        {activeTab === 'activity' && (
          <div className="p-6 space-y-4 flex-1">
            <h3 className="text-sm font-bold text-ink-primary">
              Audit & Activity History
            </h3>

            <div className="space-y-2">
              {(item.activityLog || []).map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-ink-primary capitalize">{log.action.replace('_', ' ')}</span>
                    <p className="text-ink-secondary text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right text-[11px] text-ink-muted">
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 py-3 sm:py-4 border-t border-[#E7E5E4] flex items-center justify-between gap-2 z-10">
          <button
            onClick={() => {
              if (window.confirm(`Delete "${item.title}"?`)) {
                onDelete(item._id);
                onClose();
              }
            }}
            className="p-2 rounded-xl text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex-shrink-0"
            title="Delete this item"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {onSnooze && (
              <button
                onClick={() => {
                  onSnooze(item);
                  onClose();
                }}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium border border-[#E7E5E4] hover:bg-[#F5F5F4] text-ink-secondary flex items-center gap-1.5 transition-colors"
              >
                <BellOff className="w-3.5 h-3.5 text-amber-700" />
                <span>Snooze</span>
              </button>
            )}

            <button
              onClick={() => {
                onResolve(item);
                onClose();
              }}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium border border-[#E7E5E4] hover:bg-[#F5F5F4] text-ink-secondary flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{item.isResolved ? 'Pending' : 'Completed'}</span>
            </button>

            <button
              onClick={() => {
                onRenew(item);
                onClose();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Renew</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
