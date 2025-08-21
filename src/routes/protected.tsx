import React from 'react';
import useAuth from '../hooks/useAuth';
import ProtectedPage from '../components/ProtectedPage';
import { useRouter } from '@tanstack/react-router';

const ProtectedRoute = () => {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      router.navigate({ to: '/' });
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <ProtectedPage />;
};

export default ProtectedRoute;