import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HabitsPage } from './pages/HabitsPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Full-screen wallpaper background that every page renders on top of
function ThemedBackground({ children }: { children: React.ReactNode }) {
  const { backgroundStyle } = useTheme();
  return (
    <div className="relative min-h-screen w-full" style={backgroundStyle}>
      {/* Subtle dark scrim so text is always readable regardless of wallpaper */}
      <div className="fixed inset-0 bg-black/10 pointer-events-none z-0" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <ThemedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-white/50 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 text-sm font-medium">Loading...</p>
          </div>
        </div>
      </ThemedBackground>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <ThemedBackground>{children}</ThemedBackground>;
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <HabitsPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <RootLayout>
        <ThemedBackgroundLogin />
      </RootLayout>
    ),
  },
  {
    path: '/calendar',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/stats',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <StatsPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <RootLayout>
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </RootLayout>
    ),
  },
  {
    path: '*',
    element: (
      <RootLayout>
        <NotFoundPage />
      </RootLayout>
    ),
  },
]);

// Login page also gets the wallpaper background
function ThemedBackgroundLogin() {
  return (
    <ThemedBackground>
      <LoginPage />
    </ThemedBackground>
  );
}
