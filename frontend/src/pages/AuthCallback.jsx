import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/screen');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Logging you in...</div>;
};

export default AuthCallback;


