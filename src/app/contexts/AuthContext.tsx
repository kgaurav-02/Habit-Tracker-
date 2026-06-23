import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, saveSettings, initializeSettings, addHabit, getAllHabits } from '../services/database';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstLaunch: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  setupPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const settings = await getSettings();
      if (!settings || settings.firstLaunch === undefined) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsFirstLaunch(true);
    } finally {
      setLoading(false);
    }
  }

  async function login(pin: string): Promise<boolean> {
    try {
      const settings = await getSettings();
      if (settings && settings.pin === pin) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  function logout() {
    setIsAuthenticated(false);
  }

  async function setupPin(pin: string): Promise<void> {
    try {
      await initializeSettings(pin);
      
      // Add sample habits for first-time users
      const existingHabits = await getAllHabits();
      if (existingHabits.length === 0) {
        const sampleHabits = [
          { name: 'Morning Exercise', description: '30 minutes of physical activity', color: '#8B5CF6', goal: 'daily' as const, order: 0 },
          { name: 'Drink Water', description: '8 glasses throughout the day', color: '#3B82F6', goal: 'daily' as const, order: 1 },
          { name: 'Read Books', description: 'At least 20 pages', color: '#10B981', goal: 'daily' as const, order: 2 },
          { name: 'Meditation', description: '10 minutes mindfulness', color: '#F59E0B', goal: 'daily' as const, order: 3 },
        ];
        
        for (const habit of sampleHabits) {
          await addHabit(habit);
        }
      }
      
      setIsFirstLaunch(false);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Setup PIN error:', error);
      throw error;
    }
  }

  async function changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      const settings = await getSettings();
      if (settings && settings.pin === oldPin) {
        await saveSettings({ ...settings, pin: newPin });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Change PIN error:', error);
      return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstLaunch,
        login,
        logout,
        setupPin,
        changePin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}