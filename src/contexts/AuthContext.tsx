import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { googleAuthService } from '../services/googleAuth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  courses?: any[];
  softwareLicenses?: any[];
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USE_MOCK_AUTH = !process.env.REACT_APP_API_URL; // Use mock auth if no API URL is set

// Setup axios defaults only if using real backend
if (!USE_MOCK_AUTH) {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
}

// Mock authentication functions for demo purposes
const mockLogin = (email: string, password: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        const mockToken = `mock-token-${Date.now()}`;
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: true
        };
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('mockCurrentUser', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.firstName}!`);
        resolve(true);
      } else {
        toast.error('Invalid email or password');
        resolve(false);
      }
    }, 500); // Simulate network delay
  });
};

const mockRegister = (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        toast.error('User with this email already exists');
        resolve(false);
        return;
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        firstName,
        lastName
      };
      
      users.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(users));
      
      const mockToken = `mock-token-${Date.now()}`;
      const userData = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isEmailVerified: true
      };
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('mockCurrentUser', JSON.stringify(userData));
      toast.success(`Welcome to AOM Trading, ${userData.firstName}!`);
      resolve(true);
    }, 500); // Simulate network delay
  });
};

const mockGoogleLogin = (googleUser: any): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockToken = `mock-google-token-${Date.now()}`;
      const userData = {
        id: googleUser.sub,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        isEmailVerified: true
      };
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('mockCurrentUser', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.firstName}!`);
      resolve(true);
    }, 500);
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

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
          if (USE_MOCK_AUTH) {
            const mockUser = localStorage.getItem('mockCurrentUser');
            if (mockUser) {
              setUser(JSON.parse(mockUser));
            } else {
              logout();
            }
          } else {
            await refreshProfile();
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

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
    if (USE_MOCK_AUTH) {
      const success = await mockLogin(email, password);
      if (success) {
        const mockUser = JSON.parse(localStorage.getItem('mockCurrentUser') || '{}');
        setUser(mockUser);
        setToken(localStorage.getItem('token'));
      }
      return success;
    }

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
    if (USE_MOCK_AUTH) {
      const success = await mockRegister(email, password, firstName, lastName);
      if (success) {
        const mockUser = JSON.parse(localStorage.getItem('mockCurrentUser') || '{}');
        setUser(mockUser);
        setToken(localStorage.getItem('token'));
      }
      return success;
    }

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
      if (USE_MOCK_AUTH) {
        // For demo purposes, create a mock Google user
        const mockGoogleUser = {
          sub: `google-${Date.now()}`,
          email: 'user@gmail.com',
          given_name: 'Demo',
          family_name: 'User',
          email_verified: true
        };
        
        const success = await mockGoogleLogin(mockGoogleUser);
        if (success) {
          const mockUser = JSON.parse(localStorage.getItem('mockCurrentUser') || '{}');
          setUser(mockUser);
          setToken(localStorage.getItem('token'));
        }
        return success;
      }

      // Real Google OAuth implementation
      const googleUser = await googleAuthService.signInWithPopup();
      if (!googleUser) {
        toast.error('Google sign-in was cancelled');
        return false;
      }

      // Send Google user data to your backend
      const response = await axios.post('/auth/google', {
        googleId: googleUser.sub,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        picture: googleUser.picture
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        toast.success(`Welcome, ${userData.firstName}!`);
        return true;
      }

      toast.error(response.data.message || 'Google sign-in failed');
      return false;
    } catch (error: any) {
      const message = error.message || 'Google sign-in failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('mockCurrentUser');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
    refreshProfile
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