// ABOUTME: Route guard that redirects unauthenticated users to the login page.
// ABOUTME: Shows a loading spinner while the auth state is being determined.

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#06628d',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
