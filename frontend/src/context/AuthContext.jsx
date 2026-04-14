import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const data = res.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const data = res.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const [activeOutletId, setActiveOutletIdState] = useState(() => {
    return localStorage.getItem('activeOutletId') || 'all';
  });

  const setActiveOutletId = (id) => {
    localStorage.setItem('activeOutletId', id);
    setActiveOutletIdState(id);
    // Reload the page or force re-fetch if needed, but since activeOutletId is in context,
    // components can depend on it in their useEffects!
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeOutletId');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, activeOutletId, setActiveOutletId }}>
      {children}
    </AuthContext.Provider>
  );
}
