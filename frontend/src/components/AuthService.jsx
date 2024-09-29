const API_URL = import.meta.env.VITE_API_URL;

// Register user
export const register = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
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
  const response = await fetch(`${API_URL}/auth/login`, {
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


export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('role');
}

