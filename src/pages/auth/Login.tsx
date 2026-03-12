// ABOUTME: Login page with Google sign-in button.
// ABOUTME: Redirects to kid selection after successful authentication.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/auth';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/play/select-kid', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#FFF8E1',
      fontFamily: 'Arial, sans-serif',
      gap: '24px',
    }}>
      <h1 style={{
        fontSize: '48px',
        color: '#06628d',
        margin: 0,
      }}>
        {t('app.title')}
      </h1>
      <button
        onClick={signInWithGoogle}
        style={{
          padding: '16px 32px',
          fontSize: '20px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: '#06628d',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {t('auth.signIn')}
      </button>
    </div>
  );
}
