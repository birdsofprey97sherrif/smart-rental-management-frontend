// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any route that should only be accessed by logged-in users.
 * Optionally restrict by role (admin, landlord, etc.).
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">🔄 Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
      return <Navigate to="/" replace/>;
    }

  return children;
};

export default ProtectedRoute;
