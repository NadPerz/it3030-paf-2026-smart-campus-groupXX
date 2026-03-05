import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Authentication context — shared across all modules.
 * Member 4 is responsible for integrating OAuth2 Google sign-in.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage for a saved user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Failed to parse saved user from localStorage', err);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Persist authenticated user data (called after OAuth2 success).
   * @param {object} userData - user object from /api/auth/me
   */
  function login(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  }

  /**
   * Clear user session.
   */
  function logout() {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * Returns true if the current user has the ADMIN role.
   */
  function isAdmin() {
    return user?.role === 'ADMIN';
  }

  const value = { user, loading, login, logout, isAdmin };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context from any component.
 * Usage: const { user, login, logout, isAdmin } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
