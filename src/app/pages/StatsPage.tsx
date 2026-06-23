import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, Calendar as CalendarIcon, BarChart3, Plus, TrendingUp, Award, Target } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getAllHabits,
  getCompletionsInRange,
  formatDate,
  calculateStreak,
  Habit,
  getHabitCompletions,
} from '../services/database';

export function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalCompletions: 0, currentStreak: 0, bestStreak: 0, completionRate: 0,
  });
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

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    const habitsData = await getAllHabits();
    setHabits(habitsData);

    // Last 7 days
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
    });
    const weekly = await Promise.all(last7.map(async (d) => {
      const ds = formatDate(d);
      const comps = await getCompletionsInRange(ds, ds);
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: comps.length,
        rate: habitsData.length > 0 ? Math.round((comps.length / habitsData.length) * 100) : 0,
      };
    }));
    setWeeklyData(weekly);

    // Last 30 days
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d;
    });
    const monthly = await Promise.all(last30.map(async (d) => {
      const ds = formatDate(d);
      const comps = await getCompletionsInRange(ds, ds);
      return { date: d.getDate(), completed: comps.length };
    }));
    setMonthlyData(monthly);

    // Per-habit stats
    const stats = await Promise.all(habitsData.map(async (h) => {
      const comps = await getHabitCompletions(h.id);
      const completed = comps.filter(c => c.completed).length;
      const streak = await calculateStreak(h.id);
      const daysSince = Math.max(1, Math.floor((Date.now() - new Date(h.createdAt).getTime()) / 86400000) + 1);
      return { name: h.name, color: h.color, completed, streak, completionRate: Math.round((completed / daysSince) * 100), total: daysSince };
    }));
    setHabitStats(stats);

    // Overall
    const all = await getCompletionsInRange(formatDate(new Date(2020, 0, 1)), formatDate(new Date()));
    let cur = 0, best = 0, temp = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dayComps = all.filter(c => c.date === formatDate(d));
      if (dayComps.length > 0) { temp++; if (i === 0 || cur > 0) cur = temp; }
      else { best = Math.max(best, temp); temp = 0; if (cur === 0) break; }
    }
    best = Math.max(best, temp);
    const monthTotal = monthly.reduce((s, d) => s + d.completed, 0);
    const poss = habitsData.length * 30;
    setOverallStats({ totalCompletions: all.length, currentStreak: cur, bestStreak: best, completionRate: poss > 0 ? Math.round((monthTotal / poss) * 100) : 0 });
  }

  const statCards = [
    { label: 'Current Streak', value: overallStats.currentStreak, sub: 'days in a row', icon: TrendingUp, grad: `${accentHex}dd, ${accentHex}99` },
    { label: 'Best Streak', value: overallStats.bestStreak, sub: 'days record', icon: Award, grad: '#10b981dd, #10b98188' },
    { label: 'Total Check-ins', value: overallStats.totalCompletions, sub: 'all time', icon: CheckCircle2, grad: '#f97316dd, #f9731688' },
    { label: 'Completion Rate', value: `${overallStats.completionRate}%`, sub: 'last 30 days', icon: Target, grad: '#ec4899dd, #ec489988' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-20" style={headerGlass}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Statistics</h1>
          <p className="text-sm text-gray-500">Track your progress over time</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-28 space-y-4 overflow-y-auto">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ label, value, sub, icon: Icon, grad }) => (
            <div key={label} className="p-4 text-white rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${grad})` }}>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Icon className="w-4 h-4" />
                <p className="text-xs font-semibold">{label}</p>
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs opacity-70 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Weekly bar chart */}
        <div className="p-4" style={cardGlass}>
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.95)' }}
              />
              <Bar dataKey="completed" fill={accentHex} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 30-day line chart */}
        <div className="p-4" style={cardGlass}>
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">30-Day Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.95)' }}
              />
              <Line type="monotone" dataKey="completed" stroke={accentHex} strokeWidth={2.5} dot={{ fill: accentHex, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Per-habit performance */}
        <div className="p-4" style={cardGlass}>
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Habit Performance</h3>
          {habitStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No habits yet. Add habits to see stats!</p>
          ) : (
            <div className="space-y-4">
              {habitStats.map((stat) => (
                <div key={stat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{stat.completed}/{stat.total}d</span>
                      <span className="font-semibold text-gray-700">{stat.completionRate}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/8">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${stat.completionRate}%`, backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie chart */}
        {habitStats.length > 0 && (
          <div className="p-4" style={cardGlass}>
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Completion Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={habitStats} dataKey="completed" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {habitStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3" style={navGlass}>
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1">
          {[
            { icon: Plus, label: 'Add', path: '/', active: false },
            { icon: CheckCircle2, label: 'Habits', path: '/', active: false },
            { icon: CalendarIcon, label: 'Calendar', path: '/calendar', active: false },
            { icon: BarChart3, label: 'Stats', path: '/stats', active: true },
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
