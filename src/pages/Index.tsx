import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to matches page
  if (user) {
    return <Navigate to="/matches" replace />;
  }

  // Redirect unauthenticated users to login
  return <Navigate to="/login" replace />;
};

export default Index;