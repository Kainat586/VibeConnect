import { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in on app start
    const fetchProfile = async () => {
      if (token) {
        try {
          const userData = await ApiService.getMe();
          setUser(userData);
        } catch {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const signup = async (userData) => {
    console.log("sign up data", userData);
    const response = await ApiService.signup(userData);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  };

  const signin = async (credentials) => {
    const response = await ApiService.signin(credentials);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  };

  const signout = async () => {
    try {
      await ApiService.signout();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (error) {
      // Even if API call fails, clear local state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    signup,
    signin,
    signout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};