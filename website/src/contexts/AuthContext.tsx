import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Setup axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const updateToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Listen for storage changes and check token periodically
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      if (newToken !== token) {
        setToken(newToken);
      }
    };

    // Check for token changes periodically
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  // Setup axios interceptor for auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Setup response interceptor for handling auth errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Load user profile on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshProfile = async () => {
    if (!token) return;

    try {
      const response = await axios.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        toast.success('Login successful!');
        return true;
      }
      
      toast.error(response.data.message || 'Login failed');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      const response = await axios.post('/auth/register', {
        email,
        password,
        firstName,
        lastName
      });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        toast.success('Registration successful!');
        return true;
      }
      
      toast.error(response.data.message || 'Registration failed');
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // Redirect to backend Google OAuth flow
      window.location.href = `${API_BASE_URL}/auth/google`;
      console.log("~~logged in")
      return true; // Will redirect, so return true
    } catch (error: any) {
      const message = error.message || 'Google sign-in failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    updateToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const setAuthToken = async (newToken: string) => {
    updateToken(newToken);
    try {
      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      if (response.data.success) {
        setUser(response.data.data.user);
        console.log('User profile loaded successfully:', response.data.data.user);
      } else {
        console.error('Profile response not successful:', response.data);
      }
    } catch (error) {
      console.error('Failed to load profile after token set:', error);
      updateToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
    refreshProfile,
    setAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
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