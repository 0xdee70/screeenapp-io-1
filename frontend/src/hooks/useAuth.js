import { useState, useEffect } from 'react';


export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const storedRole = localStorage.getItem('role');
            if (token) {
                try {
                    setIsAuthenticated(true);
                    setUserRole(storedRole);
                } catch (error) {
                    console.error('Token verification failed:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('role');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    return { isAuthenticated, userRole, isLoading };
};
