// ABOUTME: Root application component with routing and Firebase auth state listener.
// ABOUTME: Sets up react-router routes and listens for auth changes via onAuthStateChanged.

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './stores/auth';
import { useSettingsStore } from './stores/settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { SelectKid } from './pages/play/SelectKid';
import { GamePage } from './pages/play/GamePage';
import { Overview } from './pages/dashboard/Overview';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  const { setUser } = useAuthStore();
  const { locale } = useSettingsStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Play routes (kid-facing) */}
        <Route
          path="/play/select-kid"
          element={
            <ProtectedRoute>
              <SelectKid />
            </ProtectedRoute>
          }
        />
        <Route
          path="/play/game"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard routes (parent-facing) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
