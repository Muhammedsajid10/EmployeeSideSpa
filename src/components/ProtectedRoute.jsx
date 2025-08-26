import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <Loader2 className="loading-icon" />
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null - the main App component will handle showing the login page
    return null;
  }

  return children;
};

export default ProtectedRoute;

