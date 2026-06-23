import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, Trash2, Download, Upload, LogOut, Check, Palette, Image, Sliders } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useAuth } from '../contexts/AuthContext';
import {
  useTheme,
  GRADIENT_PRESETS,
  ACCENT_COLORS,
} from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { initDB } from '../services/database';

type Tab = 'appearance' | 'security' | 'data';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  // Change PIN state
  const [changingPin, setChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const { logout, changePin } = useAuth();
  const {
    wallpaper, isCustomImage, accentHex, glassOpacity,
    setWallpaper, setWallpaperImage, clearWallpaperImage,
    setAccentHex, setGlassOpacity,
    glassStyle,
  } = useTheme();
  const navigate = useNavigate();
  const wallpaperFileRef = useRef<HTMLInputElement>(null);

  // ── Styles
  const headerGlass: React.CSSProperties = {
    ...glassStyle(),
    borderRadius: 0,
    borderBottom: '1px solid rgba(255,255,255,0.35)',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  };
  const cardGlass: React.CSSProperties = {
    ...glassStyle(-0.1),
    borderRadius: '0.875rem',
    border: '1px solid rgba(255,255,255,0.4)',
  };

  // ── Wallpaper upload
  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setWallpaperImage(ev.target?.result as string);
      toast.success('Wallpaper applied!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Data operations
  async function handleExportData() {
    try {
      const db = await initDB();
      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        habits: await db.getAll('habits'),
        completions: await db.getAll('completions'),
        settings: (await db.getAll('settings')).map(s => ({ ...s, pin: '****' })),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    } catch {
      toast.error('Export failed');
    }
  }

  async function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data.habits || !data.completions) throw new Error('Invalid file');
        const db = await initDB();
        for (const h of data.habits) await db.put('habits', h);
        for (const c of data.completions) await db.put('completions', c);
        toast.success('Data imported!');
        navigate('/');
      } catch {
        toast.error('Import failed — check file format');
      }
    };
    input.click();
  }

  async function handleClearData() {
    try {
      const db = await initDB();
      for (const k of await db.getAllKeys('habits')) await db.delete('habits', k);
      for (const k of await db.getAllKeys('completions')) await db.delete('completions', k);
      toast.success('All data cleared');
      setShowClearDataDialog(false);
      navigate('/');
    } catch {
      toast.error('Failed to clear data');
    }
  }

  function handleLogout() {
    logout();
    setShowLogoutDialog(false);
    navigate('/login');
  }

  async function handleChangePin() {
    if (!oldPin || !newPin || !confirmNewPin) { toast.error('Fill all fields'); return; }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { toast.error('New PIN must be 4 digits'); return; }
    if (newPin !== confirmNewPin) { toast.error("New PINs don't match"); return; }
    const success = await changePin(oldPin, newPin);
    if (success) {
      toast.success('PIN changed successfully!');
      setChangingPin(false);
      setOldPin(''); setNewPin(''); setConfirmNewPin('');
    } else {
      toast.error('Old PIN is incorrect');
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security',   label: 'Security',   icon: Lock },
    { id: 'data',       label: 'Data',        icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <input ref={wallpaperFileRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaperUpload} />

      {/* Header */}
      <div className="sticky top-0 z-20" style={headerGlass}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-black/5 transition-colors"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Settings</h1>
              <p className="text-xs text-gray-400">Customise your app</p>
            </div>
          </div>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={activeTab === id
                  ? { backgroundColor: 'rgba(255,255,255,0.85)', color: accentHex, boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }
                  : { color: 'rgba(0,0,0,0.45)' }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-12 space-y-4 overflow-y-auto">

        {/* ── APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <>
            {/* Wallpaper */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Wallpaper</p>
              <div className="p-4 space-y-3" style={cardGlass}>
                {/* Upload button */}
                <button
                  onClick={() => wallpaperFileRef.current?.click()}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:bg-black/5 transition-colors border border-dashed border-black/15"
                >
                  <Image className="w-4 h-4" />
                  Upload your photo
                </button>

                {/* Custom image active indicator */}
                {isCustomImage && (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: `${accentHex}15`, border: `1px solid ${accentHex}30` }}>
                    <span className="text-sm font-medium" style={{ color: accentHex }}>Custom photo active</span>
                    <button
                      onClick={() => { clearWallpaperImage(); toast.success('Wallpaper reset'); }}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Gradient grid */}
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((preset) => {
                    const active = !isCustomImage && wallpaper === preset.css;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => { setWallpaper(preset.css); toast.success(`${preset.name} applied`); }}
                        className="relative h-16 rounded-xl overflow-hidden transition-all hover:scale-105"
                        style={{ background: preset.css, outline: active ? `2.5px solid ${accentHex}` : 'none', outlineOffset: '2px' }}
                      >
                        {active && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                              <Check className="w-3 h-3" style={{ color: accentHex }} />
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-1 left-0 right-0 text-[9px] text-white/70 text-center font-medium">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Accent color */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Accent Color</p>
              <div className="p-4 space-y-3" style={cardGlass}>
                <div className="grid grid-cols-8 gap-2.5">
                  {ACCENT_COLORS.map((c) => {
                    const active = accentHex === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => setAccentHex(c.hex)}
                        className="w-9 h-9 rounded-full transition-all hover:scale-110 relative"
                        style={{
                          backgroundColor: c.hex,
                          outline: active ? `3px solid ${c.hex}` : 'none',
                          outlineOffset: '2px',
                        }}
                        title={c.name}
                      >
                        {active && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom color picker */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  <span className="text-xs text-gray-500 font-medium">Custom</span>
                  <input
                    type="color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5"
                    style={{ backgroundColor: 'transparent' }}
                  />
                  <span className="text-xs font-mono font-semibold" style={{ color: accentHex }}>
                    {accentHex.toUpperCase()}
                  </span>
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: accentHex, opacity: 0.6 }} />
                </div>
              </div>
            </section>

            {/* Glass opacity */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Panel Opacity</p>
              <div className="p-4" style={cardGlass}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-medium">UI transparency</span>
                  <span className="text-sm font-bold" style={{ color: accentHex }}>{Math.round(glassOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={92}
                  value={Math.round(glassOpacity * 100)}
                  onChange={(e) => setGlassOpacity(Number(e.target.value) / 100)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: accentHex }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">More glass</span>
                  <span className="text-[10px] text-gray-400">More solid</span>
                </div>
                {/* Live preview swatch */}
                <div
                  className="mt-3 h-10 rounded-xl flex items-center justify-center text-xs font-medium text-gray-600"
                  style={{
                    backgroundColor: `rgba(255,255,255,${glassOpacity})`,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                  }}
                >
                  Preview panel at {Math.round(glassOpacity * 100)}% opacity
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── SECURITY TAB */}
        {activeTab === 'security' && (
          <>
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Access Control</p>
              <div style={cardGlass} className="overflow-hidden divide-y divide-black/8">
                {/* Change PIN */}
                <div className="p-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setChangingPin(!changingPin)}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}15` }}>
                      <Lock className="w-4 h-4" style={{ color: accentHex }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">Change PIN</p>
                      <p className="text-xs text-gray-400">Update your 4-digit security PIN</p>
                    </div>
                    <span className="text-gray-400 text-xs">{changingPin ? '▲' : '▼'}</span>
                  </div>

                  {changingPin && (
                    <div className="mt-4 space-y-3">
                      {[
                        { label: 'Current PIN', value: oldPin, setter: setOldPin, placeholder: '••••' },
                        { label: 'New PIN', value: newPin, setter: setNewPin, placeholder: '••••' },
                        { label: 'Confirm New PIN', value: confirmNewPin, setter: setConfirmNewPin, placeholder: '••••' },
                      ].map(({ label, value, setter, placeholder }) => (
                        <div key={label}>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={value}
                            onChange={(e) => setter(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder={placeholder}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.06)',
                              border: '1px solid rgba(0,0,0,0.1)',
                              color: '#1a1a1a',
                            }}
                          />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleChangePin}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ backgroundColor: accentHex }}
                        >
                          Update PIN
                        </button>
                        <button
                          onClick={() => { setChangingPin(false); setOldPin(''); setNewPin(''); setConfirmNewPin(''); }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500"
                          style={{ backgroundColor: 'rgba(0,0,0,0.07)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lock app */}
                <button
                  className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors text-left"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Lock App</p>
                    <p className="text-xs text-gray-400">Return to login screen</p>
                  </div>
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── DATA TAB */}
        {activeTab === 'data' && (
          <>
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Backup & Restore</p>
              <div style={cardGlass} className="overflow-hidden divide-y divide-black/8">
                <button
                  className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors text-left"
                  onClick={handleExportData}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}15` }}>
                    <Download className="w-4 h-4" style={{ color: accentHex }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Export Data</p>
                    <p className="text-xs text-gray-400">Download a JSON backup</p>
                  </div>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors text-left"
                  onClick={handleImportData}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentHex}15` }}>
                    <Upload className="w-4 h-4" style={{ color: accentHex }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">Import Data</p>
                    <p className="text-xs text-gray-400">Restore from a backup file</p>
                  </div>
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors text-left"
                  onClick={() => setShowClearDataDialog(true)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-600 text-sm">Clear All Data</p>
                    <p className="text-xs text-red-400">Permanently delete everything</p>
                  </div>
                </button>
              </div>
            </section>

            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">About</p>
              <div className="p-4" style={cardGlass}>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Version', value: '1.0.0' },
                    { label: 'Storage', value: 'Local (Offline)' },
                    { label: 'Internet Required', value: 'No — fully offline' },
                    { label: 'Data Sync', value: 'Device only' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-medium text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── Dialogs */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock App?</AlertDialogTitle>
            <AlertDialogDescription>You will be returned to the login screen. Your data stays safe.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Lock App</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all habits and completion history. Consider exporting first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">Delete Everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
