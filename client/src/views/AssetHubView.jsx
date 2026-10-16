import React, { useState, useEffect } from 'react';
import { getAssets } from '../api';
import { formatDate, getStatusMeta, getDaysRemaining, CATEGORY_META, formatCurrency } from '../utils/formatters';
import { ChevronRight } from 'lucide-react';

export default function AssetHubView({ onSelectItem, onOpenAdd, lang = 'en' }) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets();
      if (res.success) {
        setAssets(res.assets);
        if (res.assets.length > 0 && !selectedAsset) {
          setSelectedAsset(res.assets[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const getAssetIcon = (type) => {
    switch (type) {
      case 'Vehicle':
        return '🚗';
      case 'Electronics':
        return '💻';
      case 'Home Appliance':
        return '❄️';
      case 'Banking & Finance':
        return '🏦';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-ink-muted">
        Loading Asset Hub...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
          {lang === 'ml' ? 'ആസ്തി ഹബ്ബ് (Asset Hub)' : 'Asset Hub & Garage'}
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          {lang === 'ml'
            ? 'ഓരോ വാഹനത്തിനും ഉപകരണത്തിനും കീഴിലുള്ള എല്ലാ ഇൻഷുറൻസ്, സർവീസ്, വാറന്റി രേഖകളും ഒരിടത്ത്.'
            : 'View every policy, PUC, warranty, and service record organized under its parent asset.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Asset Selector List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {lang === 'ml' ? 'നിങ്ങളുടെ ആസ്തികൾ' : 'Tracked Assets'} ({assets.length})
            </span>
            <button
              onClick={onOpenAdd}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              + {lang === 'ml' ? 'ചേർക്കുക' : 'Add Item'}
            </button>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => {
              const isSelected = selectedAsset?._id === asset._id;

              return (
                <div
                  key={asset._id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-amber-600 shadow-sm ring-1 ring-amber-600'
                      : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-2xl flex-shrink-0">{getAssetIcon(asset.type)}</span>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-ink-primary truncate">
                        {asset.name}
                      </h4>
                      <p className="text-xs text-ink-muted truncate">
                        {asset.identifier || asset.type} • {asset.personName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E7E5E4] text-ink-secondary">
                      {asset.totalItems || 0} records
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Asset's Connected Documents & Deadlines */}
        <div className="md:col-span-2 space-y-4">
          {selectedAsset ? (
            <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-6">
              {/* Asset Header Info */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center text-3xl">
                    {getAssetIcon(selectedAsset.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-primary">
                      {selectedAsset.name}
                    </h2>
                    <p className="text-xs text-ink-secondary font-mono">
                      {selectedAsset.identifier} • {selectedAsset.type} (Owner: {selectedAsset.personName})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                    {selectedAsset.totalItems || 0} Linked Items
                  </span>
                </div>
              </div>

              {/* Asset Metadata (e.g. brand, odometer, purchase date) */}
              {selectedAsset.metadata && (
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {selectedAsset.metadata.brand && (
                    <div>
                      <span className="text-ink-muted block text-[11px]">Brand / Model</span>
                      <span className="font-semibold text-ink-primary">{selectedAsset.metadata.brand} {selectedAsset.metadata.model || ''}</span>
                    </div>
                  )}
                  {selectedAsset.metadata.odometerKm && (
                    <div>
                      <span className="text-ink-muted block text-[11px]">Odometer Reading</span>
                      <span className="font-semibold text-ink-primary">{selectedAsset.metadata.odometerKm.toLocaleString('en-IN')} km</span>
                    </div>
                  )}
                  {selectedAsset.metadata.technicianContact && (
                    <div>
                      <span className="text-ink-muted block text-[11px]">Technician / Support</span>
                      <span className="font-semibold text-ink-primary">{selectedAsset.metadata.technicianContact}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Connected Records List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Connected Policies, Deadlines & Warranties
                </h3>

                {selectedAsset.items && selectedAsset.items.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedAsset.items.map((item) => {
                      const days = getDaysRemaining(item.expiryDate);
                      const statusMeta = getStatusMeta(days, item.isResolved);
                      const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

                      return (
                        <div
                          key={item._id}
                          onClick={() => onSelectItem(item)}
                          className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] hover:border-amber-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className="text-xl flex-shrink-0">{catMeta.emoji}</span>
                            <div className="truncate">
                              <h4 className="text-sm font-semibold text-ink-primary group-hover:text-amber-900 transition-colors truncate">
                                {item.title}
                              </h4>
                              <p className="text-xs text-ink-muted flex items-center gap-2 truncate">
                                <span>{item.provider || item.documentType}</span>
                                {item.documentNumber && <span>• {item.documentNumber}</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                            <div className="text-right text-xs">
                              <span className="font-semibold text-ink-primary block">{formatDate(item.expiryDate)}</span>
                              {item.amount && (
                                <span className="text-ink-muted text-[11px]">{formatCurrency(item.amount, item.currency)}</span>
                              )}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusMeta.badgeClass}`}>
                              {statusMeta.pillText}
                            </span>
                            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-ink-muted bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E7E5E4]">
                    No active documents currently linked to this asset.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-ink-muted bg-white rounded-3xl border border-[#E7E5E4]">
              Select an asset on the left to inspect its connected portfolio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
