import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
    } else if (userRole !== requiredRole) {
      navigate('/unauthorized');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate, requiredRole]);

  return isAuthorized ? children : null;
};

export default ProtectedRoute;