import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {


  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if(!token || (requiredRole && role !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;