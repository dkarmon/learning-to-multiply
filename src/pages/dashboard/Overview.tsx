// ABOUTME: Parent dashboard landing page showing key metrics.
// ABOUTME: Placeholder layout to be populated by the Dashboard agent.

import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';
import { LanguageToggle } from '../../components/LanguageToggle';

export function Overview() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthStore();

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <h1 style={{ color: '#06628d', margin: 0 }}>
          {t('dashboard.title')}
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <LanguageToggle />
          <button
            onClick={signOut}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid #EF5350',
              backgroundColor: 'white',
              color: '#EF5350',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
            }}
          >
            {t('auth.signOut')}
          </button>
        </div>
      </header>

      <p style={{ color: '#666', fontSize: '16px' }}>
        Welcome, {user?.displayName ?? 'Parent'}. Dashboard content coming soon.
      </p>
    </div>
  );
}
