// ABOUTME: Layout wrapper for all dashboard pages with sidebar navigation.
// ABOUTME: Provides a responsive sidebar (hamburger on mobile) and kid selector header.

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { KidSelector } from './KidSelector';
import { LanguageToggle } from '../LanguageToggle';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'dashboard.overview', end: true },
  { path: '/dashboard/kids', labelKey: 'dashboard.kids', end: false },
  { path: '/dashboard/progress', labelKey: 'dashboard.progress', end: false },
  { path: '/dashboard/sessions', labelKey: 'dashboard.sessions', end: false },
  { path: '/dashboard/settings', labelKey: 'dashboard.settings', end: false },
];

export function DashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut, fetchKids } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchKids();
  }, [fetchKids]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-deep-brand"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <KidSelector />
        <LanguageToggle />
      </header>

      {/* Sidebar */}
      <nav
        className={`
          ${sidebarOpen ? 'block' : 'hidden'} md:block
          w-full md:w-60 bg-white shadow-sm md:shadow-md
          md:min-h-screen p-4 flex-shrink-0
        `}
      >
        <div className="hidden md:block mb-6">
          <h2 className="text-xl font-bold text-deep-brand mb-1">
            {t('app.title')}
          </h2>
          <p className="text-xs text-gray-400">
            {user?.displayName ?? 'Parent'}
          </p>
        </div>

        <div className="hidden md:block mb-6">
          <KidSelector />
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-brand/10 text-sky-brand'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2">
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-sm text-struggling hover:bg-red-50 rounded-lg transition-colors text-start"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
