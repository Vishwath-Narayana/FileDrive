import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch MongoDB user data via backend
  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;

      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        age: userData.age,
        personalOrganization: userData.personalOrganization?._id || userData.personalOrganization
      });

      setOrganizations(userData.organizations || []);

      const savedCurrentOrg = localStorage.getItem('currentOrganization');
      if (savedCurrentOrg) {
        try {
          const parsedOrg = JSON.parse(savedCurrentOrg);
          const freshOrg = userData.organizations?.find(org => org._id === parsedOrg._id);

          if (freshOrg) {
            setCurrentOrganization(freshOrg);
            localStorage.setItem('currentOrganization', JSON.stringify(freshOrg));
          } else if (userData.organizations && userData.organizations.length > 0) {
            setCurrentOrganization(userData.organizations[0]);
            localStorage.setItem('currentOrganization', JSON.stringify(userData.organizations[0]));
          }
        } catch (_) {
          // Corrupted localStorage — fall back to first org
          localStorage.removeItem('currentOrganization');
          if (userData.organizations && userData.organizations.length > 0) {
            setCurrentOrganization(userData.organizations[0]);
            localStorage.setItem('currentOrganization', JSON.stringify(userData.organizations[0]));
          }
        }
      } else if (userData.organizations && userData.organizations.length > 0) {
        setCurrentOrganization(userData.organizations[0]);
        localStorage.setItem('currentOrganization', JSON.stringify(userData.organizations[0]));
      }

      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
      setOrganizations([]);
      setCurrentOrganization(null);
      localStorage.removeItem('currentOrganization');
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        await fetchUserData();
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrganizations([]);
          setCurrentOrganization(null);
          localStorage.removeItem('currentOrganization');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch/create MongoDB user via backend
    const userData = await fetchUserData();
    return userData;
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;

    // If Supabase auto-confirms (no email verification), fetch user data
    if (data.session) {
      await fetchUserData();
    }

    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    // Always clear local state, even if signOut fails
    setUser(null);
    setOrganizations([]);
    setCurrentOrganization(null);
    localStorage.removeItem('currentOrganization');
  };

  const switchOrganization = (org) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
  };

  const refreshOrganizations = async () => {
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data);

      if (currentOrganization) {
        const updatedCurrentOrg = response.data.find(org => org._id === currentOrganization._id);
        if (updatedCurrentOrg) {
          setCurrentOrganization(updatedCurrentOrg);
          localStorage.setItem('currentOrganization', JSON.stringify(updatedCurrentOrg));
        }
      }
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
    }
  };

  const updateAvatar = (avatarUrl) => {
    setUser(prev => prev ? { ...prev, avatar: avatarUrl } : prev);
  };

  const value = {
    user,
    organizations,
    currentOrganization,
    login,
    register,
    logout,
    switchOrganization,
    refreshOrganizations,
    updateAvatar,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
