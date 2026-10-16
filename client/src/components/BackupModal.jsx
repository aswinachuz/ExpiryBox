import React, { useState } from 'react';
import { X, Download, Upload, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { exportBackup, importBackup } from '../api';

export default function BackupModal({ isOpen, onClose, onDataRestored }) {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `ExpiryBox_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage('Backup JSON downloaded successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to export backup: ' + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        setError('');
        const parsed = JSON.parse(event.target.result);
        const res = await importBackup(parsed);
        if (res.success) {
          setMessage(res.message);
          onDataRestored();
          setTimeout(() => {
            setMessage('');
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error(err);
        setError('Invalid backup JSON file or import failed.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] shadow-2xl max-w-md w-full p-4 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-ink-primary">Backup & Data Privacy</h3>
              <p className="text-xs text-ink-secondary">Export or restore your personal database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] space-y-2">
            <h4 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
              <Download className="w-4 h-4 text-ink-muted" />
              <span>Export Full Database</span>
            </h4>
            <p className="text-xs text-ink-secondary">
              Save a clean JSON snapshot of all your documents, warranties, assets, and reminders.
            </p>
            <button
              onClick={handleExport}
              className="mt-2 w-full py-2 bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] text-ink-primary font-medium text-xs rounded-xl shadow-sm transition-colors"
            >
              Download Backup File (.json)
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] space-y-2">
            <h4 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
              <Upload className="w-4 h-4 text-ink-muted" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-xs text-ink-secondary">
              Restore documents onto a new phone or machine from a previously exported backup file.
            </p>
            <label className="mt-2 block w-full py-2 bg-ink-primary hover:bg-[#2D3748] text-white font-medium text-xs rounded-xl shadow-sm text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={importing}
                className="hidden"
              />
              <span>{importing ? 'Restoring Data...' : 'Select Backup File to Restore'}</span>
            </label>
          </div>

          <div className="pt-2 text-[11px] text-ink-muted text-center">
            🔐 Privacy note: Your documents and metadata stay securely in your own local MongoDB database.
          </div>
        </div>
      </div>
    </div>
  );
}
