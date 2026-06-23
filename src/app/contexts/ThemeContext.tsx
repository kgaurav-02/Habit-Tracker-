import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ThemeSettings {
  wallpaper: string;          // CSS gradient string or 'custom-image'
  wallpaperImage: string;     // data URL when wallpaper === 'custom-image'
  accentHex: string;
  glassOpacity: number;       // 0.15–0.90
}

interface ThemeContextType extends ThemeSettings {
  setWallpaper: (css: string) => void;
  setWallpaperImage: (dataUrl: string) => void;
  clearWallpaperImage: () => void;
  setAccentHex: (hex: string) => void;
  setGlassOpacity: (v: number) => void;
  /** CSS object for a glass-panel surface */
  glassStyle: (extraOpacity?: number) => React.CSSProperties;
  /** true when wallpaper is a custom uploaded image */
  isCustomImage: boolean;
  /** resolved background-image / background CSS for the root container */
  backgroundStyle: React.CSSProperties;
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const GRADIENT_PRESETS = [
  { name: 'Midnight', css: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' },
  { name: 'Aurora',   css: 'linear-gradient(135deg,#005c97 0%,#363795 100%)' },
  { name: 'Ocean',    css: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' },
  { name: 'Forest',   css: 'linear-gradient(135deg,#0a3d0a 0%,#1a5c1a 50%,#0a2a0a 100%)' },
  { name: 'Crimson',  css: 'linear-gradient(135deg,#1a0010 0%,#4a0030 50%,#1a001a 100%)' },
  { name: 'Slate',    css: 'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)' },
  { name: 'Sunset',   css: 'linear-gradient(135deg,#1c1c2e 0%,#2d1b69 50%,#11998e 100%)' },
  { name: 'Rose',     css: 'linear-gradient(135deg,#200122 0%,#6f0000 100%)' },
];

export const ACCENT_COLORS = [
  { name: 'Violet',   hex: '#8b5cf6' },
  { name: 'Emerald',  hex: '#10b981' },
  { name: 'Sky',      hex: '#0ea5e9' },
  { name: 'Rose',     hex: '#f43f5e' },
  { name: 'Amber',    hex: '#f59e0b' },
  { name: 'Fuchsia',  hex: '#d946ef' },
  { name: 'Teal',     hex: '#14b8a6' },
  { name: 'Orange',   hex: '#f97316' },
  { name: 'Indigo',   hex: '#6366f1' },
  { name: 'Lime',     hex: '#84cc16' },
  { name: 'Pink',     hex: '#ec4899' },
  { name: 'Cyan',     hex: '#06b6d4' },
  { name: 'Red',      hex: '#ef4444' },
  { name: 'Yellow',   hex: '#eab308' },
  { name: 'Green',    hex: '#22c55e' },
  { name: 'Blue',     hex: '#3b82f6' },
];

// ── Defaults ───────────────────────────────────────────────────────────────────
const DEFAULT: ThemeSettings = {
  wallpaper: GRADIENT_PRESETS[0].css,
  wallpaperImage: '',
  accentHex: '#8b5cf6',
  glassOpacity: 0.55,
};

const STORAGE_KEY = 'habitapp_theme_v2';

function loadTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT;
}

function saveTheme(t: ThemeSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {}
}

// ── Context ────────────────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(loadTheme);

  // Persist whenever theme changes
  useEffect(() => { saveTheme(theme); }, [theme]);

  const update = useCallback((patch: Partial<ThemeSettings>) =>
    setTheme(prev => ({ ...prev, ...patch })), []);

  const setWallpaper       = useCallback((css: string) => update({ wallpaper: css }), [update]);
  const setWallpaperImage  = useCallback((dataUrl: string) =>
    update({ wallpaper: 'custom-image', wallpaperImage: dataUrl }), [update]);
  const clearWallpaperImage = useCallback(() =>
    update({ wallpaper: GRADIENT_PRESETS[0].css, wallpaperImage: '' }), [update]);
  const setAccentHex       = useCallback((hex: string) => update({ accentHex: hex }), [update]);
  const setGlassOpacity    = useCallback((v: number) => update({ glassOpacity: v }), [update]);

  const isCustomImage = theme.wallpaper === 'custom-image' && !!theme.wallpaperImage;

  const backgroundStyle: React.CSSProperties = isCustomImage
    ? { backgroundImage: `url(${theme.wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: theme.wallpaper };

  const glassStyle = useCallback((extraOpacity = 0): React.CSSProperties => ({
    backgroundColor: `rgba(255,255,255,${Math.min(theme.glassOpacity + extraOpacity, 0.92)})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.5)',
  }), [theme.glassOpacity]);

  const value: ThemeContextType = {
    ...theme,
    setWallpaper,
    setWallpaperImage,
    clearWallpaperImage,
    setAccentHex,
    setGlassOpacity,
    glassStyle,
    isCustomImage,
    backgroundStyle,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/** Convenience: returns inline styles for a card-level glass panel */
export function useGlassCard(extraOpacity = 0): React.CSSProperties {
  const { glassStyle } = useTheme();
  return {
    ...glassStyle(extraOpacity),
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.45)',
  };
}
