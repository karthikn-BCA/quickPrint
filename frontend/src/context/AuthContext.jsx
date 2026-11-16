import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cp_admin_token');
    if (token) {
      api.getAdminMe()
        .then((res) => {
          if (res.success) {
            setAdminUser(res.user);
          } else {
            localStorage.removeItem('cp_admin_token');
            setAdminUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('cp_admin_token');
          setAdminUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    const res = await api.adminLogin(identifier, password);
    if (res.success && res.token) {
      localStorage.setItem('cp_admin_token', res.token);
      setAdminUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('cp_admin_token');
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ adminUser, login, logout, loading, isAuthenticated: !!adminUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
