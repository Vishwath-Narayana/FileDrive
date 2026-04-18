import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import api, { setAuthToken } from '../services/api';
import socket from '../services/socket';

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

  // Prevent double-fetch when login() and onAuthStateChange both fire
  const isHandlingAuth = useRef(false);

  // Fetch MongoDB user data via backend
  const fetchUserData = async () => {
    try {
      console.log('📡 Fetching /auth/me...');
      const response = await api.get('/auth/me');
      const userData = response.data;
      console.log('✅ Got user data:', userData.email);

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
      console.error('❌ Failed to fetch user data:', error);
      setUser(null);
      setOrganizations([]);
      setCurrentOrganization(null);
      localStorage.removeItem('currentOrganization');
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      isHandlingAuth.current = true;
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        console.log('🔐 INIT SESSION:', session ? 'exists' : 'null');

        if (!session) {
          setUser(null);
          setLoading(false);
          isHandlingAuth.current = false;
          return;
        }

        // Cache token BEFORE fetching user data
        setAuthToken(session.access_token);
        await fetchUserData();
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
      }

      setLoading(false);
      isHandlingAuth.current = false;
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH EVENT:', event, session ? '(session exists)' : '(no session)');

        // Skip if login() or register() is already handling this
        if (isHandlingAuth.current) {
          console.log('⏭️ Skipping — login/register is handling auth');
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔐 Recovery session detected');
          if (window.location.pathname !== '/reset-password') {
            window.location.href = '/reset-password';
          }
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            setAuthToken(session.access_token);
            // Skip fetching backend data if on reset password page
            if (window.location.pathname !== '/reset-password') {
              await fetchUserData();

              // 🔥 Auto-join: check if an invite token was stored (from magic link)
              const inviteToken = localStorage.getItem('inviteToken');
              if (inviteToken && event === 'SIGNED_IN') {
                try {
                  await api.post('/organizations/accept-invite', { token: inviteToken });
                  localStorage.removeItem('inviteToken');
                  // Refresh orgs so the new one appears in sidebar
                  const orgRes = await api.get('/organizations');
                  setOrganizations(orgRes.data);
                  if (orgRes.data.length > 0) {
                    const saved = localStorage.getItem('currentOrganization');
                    const parsedSaved = saved ? JSON.parse(saved) : null;
                    const match = parsedSaved ? orgRes.data.find(o => o._id === parsedSaved._id) : null;
                    const active = match || orgRes.data[0];
                    setCurrentOrganization(active);
                    localStorage.setItem('currentOrganization', JSON.stringify(active));
                  }
                } catch (err) {
                  // If already a member or invalid token, silently clear
                  localStorage.removeItem('inviteToken');
                  console.warn('Auto-join invite failed:', err.response?.data?.message);
                }
              }
            }
          }
        }

        if (event === 'SIGNED_OUT') {
          setAuthToken(null);
          setUser(null);
          setOrganizations([]);
          setCurrentOrganization(null);
          localStorage.removeItem('currentOrganization');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentOrganization) return;
    const orgId = currentOrganization._id;
    
    // Join the org room for real-time updates
    socket.emit('join-org', orgId);

    const handleOrgUpdated = (updatedOrg) => {
      console.log('📡 Real-time org update received:', updatedOrg.name);
      
      // Update global currentOrganization state
      if (updatedOrg._id === orgId) {
        setCurrentOrganization(updatedOrg);
        localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg));
      }

      // Also update the organizations list so the sidebar/switcher stays fresh
      setOrganizations(prev => 
        prev.map(org => org._id === updatedOrg._id ? updatedOrg : org)
      );
    };

    socket.on('org:updated', handleOrgUpdated);
    
    return () => {
      socket.off('org:updated', handleOrgUpdated);
      socket.emit('leave-org', orgId);
    };
  }, [currentOrganization?._id]);

  const login = async (email, password) => {
    isHandlingAuth.current = true; // Block listener from double-fetching

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔑 LOGIN DATA:', data);
      console.log('🔑 LOGIN ERROR:', error);

      if (error) throw error;

      if (!data.session) {
        throw new Error('No session returned from Supabase');
      }

      // Cache token, then fetch user data
      setAuthToken(data.session.access_token);
      const userData = await fetchUserData();
      
      if (!userData) {
        throw new Error('Failed to fetch user data from backend');
      }

      console.log('✅ Login complete, user:', userData.email);
      return userData;
    } finally {
      isHandlingAuth.current = false; // Unblock listener
    }
  };

  const register = async (name, email, password) => {
    isHandlingAuth.current = true;

    try {
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
        setAuthToken(data.session.access_token);
        await fetchUserData();
      }

      return data;
    } finally {
      isHandlingAuth.current = false;
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setAuthToken(null);
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
          // Org still exists — update with fresh data
          setCurrentOrganization(updatedCurrentOrg);
          localStorage.setItem('currentOrganization', JSON.stringify(updatedCurrentOrg));
        } else if (response.data.length > 0) {
          // Current org was deleted — fall back to personal org or first available
          const fallback =
            response.data.find(o => o._id === user?.personalOrganization?.toString()) ||
            response.data.find(o => o._id === user?.personalOrganization) ||
            response.data[0];
          setCurrentOrganization(fallback);
          localStorage.setItem('currentOrganization', JSON.stringify(fallback));
        } else {
          setCurrentOrganization(null);
          localStorage.removeItem('currentOrganization');
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
    resetPassword,
    updatePassword,
    switchOrganization,
    refreshOrganizations,
    updateAvatar,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
