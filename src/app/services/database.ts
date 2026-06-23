import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
  goal: 'daily' | 'weekly' | 'custom';
  targetDays?: number[]; // 0-6 for days of week, null for daily
  order: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string;
  note?: string;
}

export interface AppSettings {
  id: string;
  pin: string;
  theme: 'light' | 'dark';
  firstLaunch: boolean;
  reminderTime?: string;
}

interface HabitTrackerDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
    indexes: { 'by-order': number };
  };
  completions: {
    key: string;
    value: HabitCompletion;
    indexes: { 'by-date': string; 'by-habit': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'HabitTrackerDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HabitTrackerDB> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<HabitTrackerDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<HabitTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create habits store
      if (!db.objectStoreNames.contains('habits')) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
        habitStore.createIndex('by-order', 'order');
      }

      // Create completions store
      if (!db.objectStoreNames.contains('completions')) {
        const completionStore = db.createObjectStore('completions', { keyPath: 'id' });
        completionStore.createIndex('by-date', 'date');
        completionStore.createIndex('by-habit', 'habitId');
      }

      // Create settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Settings operations
export async function getSettings(): Promise<AppSettings | undefined> {
  const db = await initDB();
  return await db.get('settings', 'app-settings');
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await initDB();
  await db.put('settings', settings);
}

export async function initializeSettings(pin: string): Promise<void> {
  const db = await initDB();
  const existing = await db.get('settings', 'app-settings');
  
  if (!existing) {
    await db.put('settings', {
      id: 'app-settings',
      pin,
      theme: 'light',
      firstLaunch: false,
    });
  }
}

// Habit operations
export async function getAllHabits(): Promise<Habit[]> {
  const db = await initDB();
  const habits = await db.getAllFromIndex('habits', 'by-order');
  return habits.sort((a, b) => a.order - b.order);
}

export async function getHabit(id: string): Promise<Habit | undefined> {
  const db = await initDB();
  return await db.get('habits', id);
}

export async function addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
  const db = await initDB();
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await db.add('habits', newHabit);
  return newHabit;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  const db = await initDB();
  const habit = await db.get('habits', id);
  if (habit) {
    await db.put('habits', { ...habit, ...updates });
  }
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('habits', id);
  
  // Also delete all completions for this habit
  const completions = await getHabitCompletions(id);
  const tx = db.transaction('completions', 'readwrite');
  for (const completion of completions) {
    await tx.store.delete(completion.id);
  }
  await tx.done;
}

// Completion operations
export async function getCompletion(habitId: string, date: string): Promise<HabitCompletion | undefined> {
  const db = await initDB();
  const completions = await db.getAllFromIndex('completions', 'by-habit', habitId);
  return completions.find(c => c.date === date);
}

export async function toggleCompletion(habitId: string, date: string): Promise<HabitCompletion> {
  const db = await initDB();
  const existing = await getCompletion(habitId, date);
  
  if (existing) {
    const updated: HabitCompletion = {
      ...existing,
      completed: !existing.completed,
      completedAt: !existing.completed ? new Date().toISOString() : undefined,
    };
    await db.put('completions', updated);
    return updated;
  } else {
    const newCompletion: HabitCompletion = {
      id: crypto.randomUUID(),
      habitId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    await db.add('completions', newCompletion);
    return newCompletion;
  }
}

export async function getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
  const db = await initDB();
  return await db.getAllFromIndex('completions', 'by-date', date);
}

export async function getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
  const db = await initDB();
  return await db.getAllFromIndex('completions', 'by-habit', habitId);
}

export async function getCompletionsInRange(startDate: string, endDate: string): Promise<HabitCompletion[]> {
  const db = await initDB();
  const allCompletions = await db.getAll('completions');
  return allCompletions.filter(c => c.date >= startDate && c.date <= endDate && c.completed);
}

// Utility to format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate streak for a habit
export async function calculateStreak(habitId: string): Promise<number> {
  const completions = await getHabitCompletions(habitId);
  const sortedDates = completions
    .filter(c => c.completed)
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  
  for (const completionDate of sortedDates) {
    completionDate.setHours(0, 0, 0, 0);
    
    if (completionDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (completionDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}
