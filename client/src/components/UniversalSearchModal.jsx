import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { searchItems } from '../api';
import { getStatusMeta, getDaysRemaining, CATEGORY_META } from '../utils/formatters';

export default function UniversalSearchModal({ isOpen, onClose, onSelectItem }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const res = await searchItems(q);
      if (res.success) {
        setResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query.trim());
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-20 p-2.5 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[#E7E5E4] flex items-center gap-3">
          <Search className="w-5 h-5 text-ink-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, vehicles, warranties, family members, policy #..."
            className="w-full text-base bg-transparent border-none focus:outline-none text-ink-primary placeholder:text-ink-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-[#F5F5F4] text-ink-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline text-xs font-mono bg-[#F5F5F4] px-2 py-0.5 rounded border border-[#E7E5E4] text-ink-muted">
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Pills */}
        {!query && (
          <div className="p-4 bg-[#FAF9F6] border-b border-[#E7E5E4] flex items-center gap-2 flex-wrap text-xs text-ink-secondary">
            <span className="font-medium text-ink-muted">Try:</span>
            {['bike', 'insurance', 'ASUS', 'passport', 'FD', 'Dad'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E5E4] hover:border-amber-300 hover:text-amber-900 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div className="p-2 overflow-y-auto flex-1 space-y-1">
          {loading && (
            <div className="p-8 text-center text-xs text-ink-muted">
              Searching your personal records...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center text-xs text-ink-muted">
              No matching deadlines or documents found for "{query}".
            </div>
          )}

          {!loading &&
            results.map((item) => {
              const days = getDaysRemaining(item.expiryDate);
              const statusMeta = getStatusMeta(days, item.isResolved);
              const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

              return (
                <div
                  key={item._id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F5F5F4] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xl flex-shrink-0">{catMeta.emoji}</span>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-ink-primary group-hover:text-amber-900 transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-ink-muted flex items-center gap-2 truncate">
                        <span>{item.personName}</span>
                        {item.assetName && <span>• {item.assetName}</span>}
                        {item.provider && <span>• {item.provider}</span>}
                        {item.documentNumber && <span>• {item.documentNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusMeta.badgeClass}`}>
                      {statusMeta.pillText}
                    </span>
                    <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
