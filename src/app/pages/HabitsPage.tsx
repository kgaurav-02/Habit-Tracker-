import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, BarChart3, Settings, Flame, CheckCircle2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { AddHabitDialog } from '../components/AddHabitDialog';
import { ManageHabitsDialog } from '../components/ManageHabitsDialog';
import { useTheme } from '../contexts/ThemeContext';
import confetti from 'canvas-confetti';
import {
  getAllHabits,
  toggleCompletion,
  formatDate,
  calculateStreak,
  Habit,
  getCompletion,
} from '../services/database';
import { toast } from 'sonner';

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { glassStyle, accentHex } = useTheme();

  const today = formatDate(selectedDate);
  const isToday = formatDate(new Date()) === today;

  // Glass styles
  const headerGlass: React.CSSProperties = {
    ...glassStyle(),
    borderRadius: 0,
    borderBottom: '1px solid rgba(255,255,255,0.35)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  };
  const navGlass: React.CSSProperties = {
    ...glassStyle(),
    borderRadius: 0,
    borderTop: '1px solid rgba(255,255,255,0.35)',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  };
  const cardGlass: React.CSSProperties = {
    ...glassStyle(-0.1),
    borderRadius: '0.875rem',
    border: '1px solid rgba(255,255,255,0.4)',
  };

  useEffect(() => { loadHabits(); }, [selectedDate]);

  async function loadHabits() {
    try {
      const habitsData = await getAllHabits();
      setHabits(habitsData);
      const completionsData: Record<string, boolean> = {};
      const streaksData: Record<string, number> = {};
      for (const habit of habitsData) {
        const completion = await getCompletion(habit.id, today);
        completionsData[habit.id] = completion?.completed || false;
        streaksData[habit.id] = await calculateStreak(habit.id);
      }
      setCompletions(completionsData);
      setStreaks(streaksData);
    } catch {
      toast.error('Failed to load habits');
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await toggleCompletion(habitId, today);
      const newState = !completions[habitId];
      setCompletions(prev => ({ ...prev, [habitId]: newState }));
      const newStreak = await calculateStreak(habitId);
      setStreaks(prev => ({ ...prev, [habitId]: newStreak }));

      if (newState) {
        toast.success('Great job! Keep it up! 🎉');
        const allComplete = Object.keys(completions).every(id => id === habitId ? true : completions[id]);
        if (allComplete && habits.length > 0 && isToday) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => toast.success('🎊 Perfect day! All habits completed!'), 500);
        }
      }
    } catch {
      toast.error('Failed to update habit');
    }
  }

  const completedCount = Object.values(completions).filter(Boolean).length;
  const totalCount = habits.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function goToPreviousDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  }
  function goToNextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d < tomorrow) setSelectedDate(d);
  }
  function goToToday() { setSelectedDate(new Date()); }

  const dateDisplay = isToday
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-transparent flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Header */}
      <div className="sticky top-0 z-20" style={headerGlass}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">My Habits</h1>
              <p className="text-sm text-gray-500">{dateDisplay}</p>
            </div>
            <div className="flex gap-1">
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors"
                onClick={() => setIsManageDialogOpen(true)}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date nav */}
          <div className="flex items-center gap-2 mb-3">
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-black/5 transition-colors border border-black/10"
              onClick={goToPreviousDay}
            >
              ← Prev
            </button>
            <div className="flex-1" />
            {!isToday && (
              <button
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: accentHex }}
                onClick={goToToday}
              >
                Today
              </button>
            )}
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-black/5 transition-colors border border-black/10 disabled:opacity-40"
              onClick={goToNextDay}
              disabled={isToday}
            >
              Next →
            </button>
          </div>

          {/* Progress banner */}
          <div className="rounded-2xl p-4 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${accentHex}dd, ${accentHex}88)` }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Daily Progress</p>
                <p className="text-3xl font-bold mt-0.5">{completedCount}<span className="text-lg font-normal opacity-70">/{totalCount}</span></p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{completionPct}%</p>
                <p className="text-xs opacity-70">Complete</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Habits list */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-28 space-y-2 overflow-y-auto">
        {habits.length === 0 ? (
          <div className="p-10 text-center rounded-2xl" style={cardGlass}>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
            <p className="text-gray-500 mb-4">No habits yet. Create your first habit!</p>
            <button
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: accentHex }}
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Your First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const done = completions[habit.id];
            return (
              <div
                key={habit.id}
                className="p-4 cursor-pointer transition-all duration-200 active:scale-[0.99]"
                style={{
                  ...cardGlass,
                  borderLeft: `4px solid ${done ? accentHex : habit.color}`,
                  opacity: done ? 0.85 : 1,
                }}
                onClick={() => handleToggleHabit(habit.id)}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => handleToggleHabit(habit.id)}
                    className="w-6 h-6 flex-shrink-0"
                    style={{ accentColor: accentHex } as any}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="font-semibold text-gray-800 transition-all"
                        style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}
                      >
                        {habit.name}
                      </h3>
                      {streaks[habit.id] > 0 && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                          style={{ backgroundColor: `${accentHex}22`, color: accentHex, borderColor: `${accentHex}44` }}
                        >
                          <Flame className="w-3 h-3" />
                          {streaks[habit.id]}d
                        </Badge>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{habit.description}</p>
                    )}
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3" style={navGlass}>
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1">
          {[
            { icon: Plus, label: 'Add', action: () => setIsAddDialogOpen(true), active: false },
            { icon: CheckCircle2, label: 'Habits', action: () => navigate('/'), active: true },
            { icon: CalendarIcon, label: 'Calendar', action: () => navigate('/calendar'), active: false },
            { icon: BarChart3, label: 'Stats', action: () => navigate('/stats'), active: false },
          ].map(({ icon: Icon, label, action, active }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1 py-2 rounded-xl transition-colors hover:bg-black/5"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: active ? accentHex : 'rgba(0,0,0,0.4)' }}
              />
              <span className="text-[10px] font-semibold" style={{ color: active ? accentHex : 'rgba(0,0,0,0.4)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AddHabitDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => { setIsAddDialogOpen(false); loadHabits(); }}
      />
      <ManageHabitsDialog
        open={isManageDialogOpen}
        onOpenChange={setIsManageDialogOpen}
        onUpdate={loadHabits}
      />
    </div>
  );
}
