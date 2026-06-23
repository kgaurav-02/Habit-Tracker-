import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, Delete } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [isConfirming, setIsConfirming] = useState(false);
  const [shake, setShake] = useState(false);
  const { login, setupPin, isFirstLaunch } = useAuth();
  const { glassStyle, accentHex } = useTheme();
  const navigate = useNavigate();

  const inputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];
  const confirmInputRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  // Glass card style for this page
  const cardGlass: React.CSSProperties = {
    ...glassStyle(0.1),
    borderRadius: '1.5rem',
    border: '1px solid rgba(255,255,255,0.5)',
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const currentPin = isConfirm ? [...confirmPin] : [...pin];
    currentPin[index] = value;
    if (isConfirm) setConfirmPin(currentPin);
    else setPin(currentPin);

    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      if (isFirstLaunch) {
        if (isConfirm) handleSetup(currentPin.join(''));
        else { setIsConfirming(true); setTimeout(() => confirmInputRefs[0].current?.focus(), 100); }
      } else {
        handleLogin(currentPin.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (pinValue: string) => {
    const success = await login(pinValue);
    if (success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error('Incorrect PIN. Try again.');
      triggerShake();
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs[0].current?.focus(), 50);
    }
  };

  const handleSetup = async (confirmPinValue: string) => {
    const originalPin = pin.join('');
    if (originalPin !== confirmPinValue) {
      toast.error("PINs don't match. Try again.");
      triggerShake();
      setConfirmPin(['', '', '', '']);
      setTimeout(() => confirmInputRefs[0].current?.focus(), 50);
      return;
    }
    try {
      await setupPin(originalPin);
      toast.success('PIN created! Welcome!');
      navigate('/');
    } catch {
      toast.error('Failed to create PIN');
    }
  };

  const handleNumpadPress = (num: number | '⌫') => {
    if (num === '⌫') {
      const currentPin = isConfirming ? confirmPin : pin;
      const lastIdx = currentPin.findLastIndex(d => d !== '');
      if (lastIdx >= 0) {
        const refs = isConfirming ? confirmInputRefs : inputRefs;
        handlePinChange(lastIdx, '', isConfirming);
        refs[lastIdx].current?.focus();
      }
    } else {
      const currentPin = isConfirming ? confirmPin : pin;
      const firstEmpty = currentPin.findIndex(d => d === '');
      if (firstEmpty >= 0) handlePinChange(firstEmpty, num.toString(), isConfirming);
    }
  };

  const activePinArray = isConfirming ? confirmPin : pin;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl"
            style={{ backgroundColor: accentHex }}
          >
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow">Habit Tracker</h1>
          <p className="text-white/60 mt-2 text-sm">
            {isFirstLaunch
              ? isConfirming ? 'Confirm your 4-digit PIN' : 'Create a PIN to secure your data'
              : 'Enter your PIN to continue'}
          </p>
        </div>

        {/* Card */}
        <div className="p-7 shadow-2xl" style={cardGlass}>
          {/* PIN dots */}
          <div
            className={`flex justify-center gap-4 mb-6 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
            style={{
              animation: shake ? 'shake 0.4s ease-in-out' : undefined,
            }}
          >
            {activePinArray.map((digit, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-inner"
                style={{
                  backgroundColor: digit ? `${accentHex}22` : 'rgba(0,0,0,0.07)',
                  border: `2px solid ${digit ? accentHex : 'rgba(0,0,0,0.12)'}`,
                  color: accentHex,
                  transform: digit ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {digit ? '●' : ''}
                {/* Hidden real input for keyboard support */}
                <input
                  ref={isConfirming ? confirmInputRefs[i] : inputRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value, isConfirming)}
                  onKeyDown={(e) => handleKeyDown(i, e, isConfirming)}
                  className="sr-only"
                  autoFocus={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫' as const].map((num, idx) => (
              <button
                key={idx}
                disabled={num === ''}
                onClick={() => num !== '' && handleNumpadPress(num as number | '⌫')}
                className={`h-14 rounded-2xl text-xl font-semibold transition-all duration-150 active:scale-95 ${
                  num === '' ? 'pointer-events-none' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: num === '' ? 'transparent' : 'rgba(0,0,0,0.07)',
                  color: num === '⌫' ? '#ef4444' : 'rgba(0,0,0,0.75)',
                  border: num === '' ? 'none' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {num === '⌫' ? <Delete className="w-5 h-5 mx-auto" /> : num}
              </button>
            ))}
          </div>

          {/* First-launch back button */}
          {isFirstLaunch && isConfirming && (
            <button
              className="w-full mt-4 py-3 rounded-2xl text-sm font-medium text-white/60 hover:text-white/80 transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
              onClick={() => {
                setIsConfirming(false);
                setConfirmPin(['', '', '', '']);
                setTimeout(() => inputRefs[0].current?.focus(), 100);
              }}
            >
              ← Back
            </button>
          )}
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          {isFirstLaunch
            ? "✨ We'll add some sample habits to get you started!"
            : 'All data is stored locally on your device'}
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
