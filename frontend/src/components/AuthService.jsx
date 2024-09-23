const API_URL = import.meta.env.VITE_API_URL;

// Register user
export const register = async (email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to register');
  }

  const data = await response.json();
  return data; // Returns the token and role
};

// Login user
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  const data = await response.json();
  return data; // Returns the token and role
};

// Verify token and get role
export const verifyToken = async (token) => {
  const response = await fetch(`${API_URL}/protected`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Token verification failed');
  }

  const data = await response.json();
  return data; // Returns the role from token verification
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('role');
}

