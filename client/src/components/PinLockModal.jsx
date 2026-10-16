import React, { useState } from 'react';
import { Lock, Fingerprint } from 'lucide-react';

export default function PinLockModal({ isLocked, onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (enteredPin) => {
    // Default PIN: 1234 (or any 4 digits saved in localStorage)
    const storedPin = localStorage.getItem('expirybox_pin') || '1234';
    if (enteredPin === storedPin || enteredPin === '1234') {
      onUnlock();
      setPin('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const handleBiometricSimulate = () => {
    // Instant biometric authentication simulation
    onUnlock();
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
      <div className="max-w-xs w-full text-center space-y-6">
        {/* App Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-ink-primary text-white mx-auto flex items-center justify-center shadow-md">
          <Lock className="w-7 h-7 text-amber-200" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-ink-primary">ExpiryBox Protected</h2>
          <p className="text-xs text-ink-secondary mt-1">
            Enter your 4-digit PIN or use Biometric unlock
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                error
                  ? 'bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'bg-ink-primary scale-110'
                  : 'bg-[#E7E5E4]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium">
            Incorrect PIN. Default demo PIN is 1234.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-2xl bg-white border border-[#E7E5E4] text-xl font-semibold text-ink-primary hover:bg-[#F5F5F4] active:scale-95 shadow-sm transition-all mx-auto flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Biometric quick button */}
          <button
            onClick={handleBiometricSimulate}
            className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 active:scale-95 shadow-sm transition-all mx-auto flex flex-col items-center justify-center"
            title="Biometric Fingerprint"
          >
            <Fingerprint className="w-6 h-6" />
            <span className="text-[9px] font-semibold mt-0.5">Touch ID</span>
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-2xl bg-white border border-[#E7E5E4] text-xl font-semibold text-ink-primary hover:bg-[#F5F5F4] active:scale-95 shadow-sm transition-all mx-auto flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-2xl bg-white border border-[#E7E5E4] text-xs font-semibold text-ink-secondary hover:bg-[#F5F5F4] active:scale-95 shadow-sm transition-all mx-auto flex items-center justify-center"
          >
            Delete
          </button>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-ink-muted">
            Tip: Demo PIN is <code className="font-mono bg-[#E7E5E4] px-1 py-0.5 rounded text-ink-primary">1234</code> or tap Touch ID.
          </p>
        </div>
      </div>
    </div>
  );
}
