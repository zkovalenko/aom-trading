import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// Helper function for authenticated API calls
export const apiCall = async (url: string, options: RequestInit = {}, token?: string | null): Promise<Response> => {
  console.log('🌐 apiCall - Token received:', token ? 'Token exists' : 'No token received');
  console.log('🌐 apiCall - Token type:', typeof token);
  console.log('🌐 apiCall - Token length:', token ? token.length : 0);
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('🌐 apiCall - Authorization header set');
  } else {
    console.log('🌐 apiCall - No Authorization header set (token is falsy)');
  }
  
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  // Use correct API URL based on environment
  const isDevelopment = window.location.hostname === 'localhost';
  let apiUrl;
  
  if (isDevelopment) {
    // In development, use relative URLs - React dev server will proxy to backend
    apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  } else {
    // In production, frontend and backend are served from same domain
    // Use relative URLs (same as development)
    apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  }
  
  console.log('🌐 API call to:', apiUrl);
  
  const response = await fetch(apiUrl, {
    ...options,
    headers,
    credentials: 'include' // Include cookies for session-based auth
  });

  // Handle 401 errors globally
  if (response.status === 401) {
    console.log('401 Unauthorized - clearing auth state');
    localStorage.clear(); // Clear all localStorage data
    toast.error('Session expired. Please login again.');
    window.location.href = '/login';
  }

  return response;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Initial token from localStorage:', storedToken ? 'Token exists' : 'No token');
    return storedToken;
  });
  const [loading, setLoading] = useState(true);

  const updateToken = (newToken: string | null) => {
    console.log('Updating token:', newToken ? 'New token set' : 'Token cleared');
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
      const response = await apiCall('/auth/profile', { method: 'GET' }, token);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Profile loaded for user:', data.data.user.email);
          setUser(data.data.user);
        }
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If token is malformed, clear it
      if (error instanceof Error && error.message.includes('malformed')) {
        console.log('Malformed token detected, clearing auth state');
        logout();
      }
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First, clear any existing session/cookies
      try {
        await apiCall('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.log('No existing session to clear');
      }
      
      // Clear cookies manually
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });
      
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        console.log('Login successful for user:', userData.email);
        // Clear any previous state
        localStorage.clear();
        updateToken(newToken);
        setUser(userData);
        toast.success('Login successful!');
        
        return true;
      }
      
      toast.error(data.message || 'Login failed');
      return false;
    } catch (error: any) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        updateToken(newToken);
        setUser(userData);
        toast.success('Registration successful!');
        return true;
      }
      
      toast.error(data.message || 'Registration failed');
      return false;
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // Check for subscription redirect parameters and store them
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      const productId = urlParams.get('product');
      const subscriptionType = urlParams.get('type');
      
      // Use correct backend URL for Google OAuth redirect
      const isDevelopment = window.location.hostname === 'localhost';
      const backendUrl = isDevelopment 
        ? window.location.origin.replace(':3000', ':5001') // localhost:5001 for dev
        : window.location.origin; // Same domain in production
      
      let googleAuthUrl = `${backendUrl}/api/auth/google`;
      console.log('🔗 Google OAuth URL:', googleAuthUrl);
      
      // If we have subscription parameters, pass them to the Google auth flow
      if ((redirect === 'subscribe' || redirect === 'subscribe-direct') && productId && subscriptionType) {
        googleAuthUrl += `?redirect=${redirect}&product=${productId}&type=${subscriptionType}`;
      }
      
      // Redirect to backend Google OAuth flow
      window.location.href = googleAuthUrl;
      console.log("~~logged in")
      return true; // Will redirect, so return true
    } catch (error: any) {
      const message = error.message || 'Google sign-in failed';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out - clearing all auth state');
    
    try {
      // Call backend logout endpoint to clear session
      await apiCall('/auth/logout', { method: 'POST' }, token);
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
    
    updateToken(null);
    setUser(null);
    localStorage.clear(); // Clear all localStorage data
    
    // Also clear all cookies manually
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    });
    
    toast.success('Logged out successfully');
    
    // Redirect to login screen
    window.location.href = '/login';
  };

  const setAuthToken = async (newToken: string) => {
    updateToken(newToken);
    try {
      const response = await apiCall('/auth/profile', { method: 'GET' }, newToken);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          console.log('User profile loaded successfully:', data.data.user);
        } else {
          console.error('Profile response not successful:', data);
        }
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