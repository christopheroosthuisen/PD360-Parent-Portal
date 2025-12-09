
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppLoadingScreen } from './UI';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirect: (view: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirect }) => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !currentUser) {
      onRedirect('login');
    }
  }, [currentUser, loading, onRedirect]);

  if (loading) {
    return <AppLoadingScreen />;
  }

  return currentUser ? <>{children}</> : null;
};
