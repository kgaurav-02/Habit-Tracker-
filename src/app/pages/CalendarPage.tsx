import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalendarIcon, BarChart3, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  getAllHabits,
  getCompletionsInRange,
  formatDate,
  Habit,
} from '../services/database';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Map<string, Set<string>>>(new Map());
  const navigate = useNavigate();
  const { glassStyle, accentHex } = useTheme();

  const headerGlass: React.CSSProperties = {
    ...glassStyle(),
    borderRadius: 0,
    borderBottom: '1px solid rgba(255,255,255,0.35)',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  };
  const navGlass: React.CSSProperties = {
    ...glassStyle(),
    borderRadius: 0,
    borderTop: '1px solid rgba(255,255,255,0.35)',
    borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
  };
  const cardGlass: React.CSSProperties = {
    ...glassStyle(-0.1),
    borderRadius: '0.875rem',
    border: '1px solid rgba(255,255,255,0.4)',
  };

  useEffect(() => { loadData(); }, [currentMonth]);

  async function loadData() {
    const habitsData = await getAllHabits();
    setHabits(habitsData);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const completionsData = await getCompletionsInRange(formatDate(firstDay), formatDate(lastDay));
    const byDate = new Map<string, Set<string>>();
    completionsData.forEach(c => {
      if (!byDate.has(c.date)) byDate.set(c.date, new Set());
      byDate.get(c.date)!.add(c.habitId);
    });
    setCompletions(byDate);
  }

  function getDaysInMonth() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }

  function getCompletionRate(date: Date) {
    const done = completions.get(formatDate(date))?.size || 0;
    return habits.length > 0 ? (done / habits.length) * 100 : 0;
  }

  function getDayBg(rate: number, isToday: boolean, isFuture: boolean): React.CSSProperties {
    if (isFuture) return { backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' };
    if (rate === 0) return { backgroundColor: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' };
    const alpha = 0.15 + (rate / 100) * 0.55;
    const style: React.CSSProperties = {
      backgroundColor: `${accentHex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`,
      border: `1px solid ${accentHex}44`,
    };
    if (isToday) style.outline = `2.5px solid ${accentHex}`;
    return style;
  }

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() &&
                         currentMonth.getFullYear() === new Date().getFullYear();

  const perfectDays = Array.from(completions.entries()).filter(
    ([, ids]) => ids.size === habits.length && habits.length > 0
  ).length;
  const totalCheckins = Array.from(completions.values()).reduce((s, ids) => s + ids.size, 0);

  return (
    <div className="min-h-screen bg-transparent flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={headerGlass}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-800">Calendar</h1>
            {!isCurrentMonth && (
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: accentHex }}
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-black/5 transition-colors"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-semibold text-gray-700">{monthName}</h2>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-black/5 transition-colors"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-28 space-y-4 overflow-y-auto">
        {/* Calendar grid */}
        <div className="p-4" style={cardGlass}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1 uppercase tracking-wide">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((date, idx) => {
              if (!date) return <div key={`e-${idx}`} className="aspect-square" />;
              const dateStr = formatDate(date);
              const rate = getCompletionRate(date);
              const isToday = formatDate(new Date()) === dateStr;
              const isFuture = date > new Date();
              return (
                <div
                  key={dateStr}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-default"
                  style={getDayBg(rate, isToday, isFuture)}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: rate > 50 && !isFuture ? accentHex : 'rgba(0,0,0,0.65)' }}
                  >
                    {date.getDate()}
                  </span>
                  {rate > 0 && !isFuture && (
                    <span className="text-[8px] font-medium leading-none mt-0.5" style={{ color: accentHex }}>
                      {Math.round(rate)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-black/8">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Completion Rate</p>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: '0%', alpha: 0.06 },
                { label: '25%', alpha: 0.25 },
                { label: '50%', alpha: 0.45 },
                { label: '75%', alpha: 0.60 },
                { label: '100%', alpha: 0.70 },
              ].map(({ label, alpha }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md"
                    style={{ backgroundColor: `${accentHex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` }}
                  />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Perfect Days', value: perfectDays, emoji: '🏆' },
            { label: 'Total Check-ins', value: totalCheckins, emoji: '✅' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="p-4" style={cardGlass}>
              <p className="text-2xl mb-0.5">{emoji}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3" style={navGlass}>
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1">
          {[
            { icon: Plus, label: 'Add', path: '/', active: false },
            { icon: CheckCircle2, label: 'Habits', path: '/', active: false },
            { icon: CalendarIcon, label: 'Calendar', path: '/calendar', active: true },
            { icon: BarChart3, label: 'Stats', path: '/stats', active: false },
          ].map(({ icon: Icon, label, path, active }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-black/5 transition-colors"
            >
              <Icon className="w-5 h-5" style={{ color: active ? accentHex : 'rgba(0,0,0,0.4)' }} />
              <span className="text-[10px] font-semibold" style={{ color: active ? accentHex : 'rgba(0,0,0,0.4)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
