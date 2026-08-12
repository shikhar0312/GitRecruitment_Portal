import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const fetchProfile = async (activeToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const profileData: User = await res.json();
        setUser(profileData);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (err) {
      // API unreachable or other error, keep token but clear loading
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string) => {
    setLoading(true);
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    await fetchProfile(newToken);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
