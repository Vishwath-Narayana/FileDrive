import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase, createEphemeralClient } from '../services/supabaseClient';
import api, { setAuthToken } from '../services/api';
import socket, { joinOrg, leaveOrg, connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Session needs a second factor if the user enrolled TOTP but this session is still aal1.
const getPendingMfa = async () => {
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (totp) return { factorId: totp.id };
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when the password step passed but the 2FA code has not been entered yet
  const [mfaPending, setMfaPending] = useState(null);

  // Prevent double-fetch when login() and onAuthStateChange both fire
  const isHandlingAuth = useRef(false);

  const clearLocalState = () => {
    setAuthToken(null);
    setUser(null);
    setOrganizations([]);
    setCurrentOrganization(null);
    localStorage.removeItem('currentOrganization');
  };

  const pickOrganization = (orgs) => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('currentOrganization'));
    } catch {
      localStorage.removeItem('currentOrganization');
    }
    const active = orgs.find((o) => o._id === saved?._id) || orgs[0];
    if (active) {
      setCurrentOrganization(active);
      localStorage.setItem('currentOrganization', JSON.stringify(active));
    } else {
      setCurrentOrganization(null);
    }
  };

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
      pickOrganization(userData.organizations || []);

      return userData;
    } catch (error) {
      if (error.response?.data?.code === 'MFA_REQUIRED') {
        setMfaPending(await getPendingMfa());
      } else {
        console.error('Failed to fetch user data:', error);
      }
      clearLocalState();
      return null;
    }
  };

  // Consume an invite token saved from an /accept-invite?token=... link
  const joinPendingInvite = async () => {
    const inviteToken = localStorage.getItem('inviteToken');
    if (!inviteToken) return;
    try {
      await api.post('/organizations/accept-invite', { token: inviteToken });
      const orgRes = await api.get('/organizations');
      setOrganizations(orgRes.data);
      pickOrganization(orgRes.data);
    } catch (err) {
      console.warn('Auto-join invite failed:', err.response?.data?.message);
    } finally {
      localStorage.removeItem('inviteToken');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      isHandlingAuth.current = true;
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session) {
          setUser(null);
        } else {
          setAuthToken(session.access_token);
          const pending = await getPendingMfa();
          if (pending) {
            // Page was reloaded half-way through login: ask for the code again
            setMfaPending(pending);
          } else {
            await fetchUserData();
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
        setUser(null);
      }

      setLoading(false);
      isHandlingAuth.current = false;
    };

    initAuth();

    const handleAuthEvent = async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Remember that this session came from a reset link (ResetPassword requires it)
        sessionStorage.setItem('fd_recovery', '1');
        if (window.location.pathname !== '/reset-password') {
          window.location.href = '/reset-password';
        }
        return;
      }

      // Skip if login() / verifyMfa() / register() is already handling this
      if (isHandlingAuth.current) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          setAuthToken(session.access_token);
          if (window.location.pathname === '/reset-password') return;
          const pending = await getPendingMfa();
          if (pending) {
            setMfaPending(pending);
            return;
          }
          await fetchUserData();
          if (event === 'SIGNED_IN') await joinPendingInvite();
        }
      }

      if (event === 'SIGNED_OUT') {
        clearLocalState();
        setMfaPending(null);
      }
    };

    // The callback must not await Supabase calls directly (it can deadlock the auth lock),
    // so defer the work to the next tick.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => handleAuthEvent(event, session), 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Socket lives only while logged in
  useEffect(() => {
    if (user?._id) connectSocket();
    else disconnectSocket();
  }, [user?._id]);

  const refreshOrganizations = async () => {
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data);

      if (currentOrganization) {
        const updatedCurrentOrg = response.data.find(org => org._id === currentOrganization._id);
        if (updatedCurrentOrg) {
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

  useEffect(() => {
    if (!currentOrganization) return;
    const orgId = currentOrganization._id;

    // Reference-counted and re-joined automatically after reconnects
    joinOrg(orgId);

    const isMe = (m) => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString() || m.user;
      return memberUserId === user?._id?.toString();
    };

    const handleOrgUpdated = (updatedOrg) => {
      if (updatedOrg._id === orgId) {
        if (!updatedOrg.members?.some(isMe)) {
          // Removed from this organization
          setCurrentOrganization(null);
          setOrganizations(prev => prev.filter(org => org._id !== orgId));
          localStorage.removeItem('currentOrganization');
          refreshOrganizations();
          return;
        }
        setCurrentOrganization(updatedOrg);
        localStorage.setItem('currentOrganization', JSON.stringify(updatedOrg));
      }

      setOrganizations(prev => {
        if (!updatedOrg.members?.some(isMe)) {
          return prev.filter(org => org._id !== updatedOrg._id);
        }
        return prev.map(org => org._id === updatedOrg._id ? updatedOrg : org);
      });
    };

    const handleOrgDeleted = ({ orgId: deletedId }) => {
      if (deletedId === orgId) refreshOrganizations();
      else setOrganizations(prev => prev.filter(org => org._id !== deletedId));
    };

    socket.on('org:updated', handleOrgUpdated);
    socket.on('org:deleted', handleOrgDeleted);

    return () => {
      socket.off('org:updated', handleOrgUpdated);
      socket.off('org:deleted', handleOrgDeleted);
      leaveOrg(orgId);
    };
  }, [currentOrganization?._id]);

  /**
   * Resolves to the user data, or to { mfaRequired: true } when a 2FA code is still needed
   * (the Login page then shows the code step).
   */
  const login = async (email, password) => {
    isHandlingAuth.current = true; // Block listener from double-fetching

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('No session returned from Supabase');

      setAuthToken(data.session.access_token);

      const pending = await getPendingMfa();
      if (pending) {
        setMfaPending(pending);
        return { mfaRequired: true };
      }

      const userData = await fetchUserData();
      if (!userData) throw new Error('Failed to fetch user data from backend');
      await joinPendingInvite();
      return userData;
    } finally {
      isHandlingAuth.current = false;
    }
  };

  const verifyMfa = async (code) => {
    if (!mfaPending) throw new Error('No verification in progress');
    isHandlingAuth.current = true;

    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaPending.factorId,
        code: code.replace(/\s/g, ''),
      });
      if (error) throw error;

      const { data } = await supabase.auth.getSession();
      setAuthToken(data.session?.access_token);
      setMfaPending(null);

      const userData = await fetchUserData();
      if (!userData) throw new Error('Failed to fetch user data from backend');
      await joinPendingInvite();
      return userData;
    } finally {
      isHandlingAuth.current = false;
    }
  };

  const cancelMfa = async () => {
    setMfaPending(null);
    try {
      await supabase.auth.signOut();
    } catch { /* already signed out */ }
    clearLocalState();
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

  // Used by the reset-link flow (the emailed link itself proves identity)
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    sessionStorage.removeItem('fd_recovery');
    // Log out every other device: whoever knew the old password is kicked out
    await supabase.auth.signOut({ scope: 'others' });
  };

  // Used from Settings: the current password must be proven first.
  const changePassword = async (currentPassword, newPassword) => {
    // Check on a throwaway client so the live session (and its 2FA level) stays untouched
    const { error: verifyError } = await createEphemeralClient().auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    await supabase.auth.signOut({ scope: 'others' });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    clearLocalState();
    setMfaPending(null);
  };

  const switchOrganization = (org) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
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
    changePassword,
    mfaPending,
    verifyMfa,
    cancelMfa,
    switchOrganization,
    refreshOrganizations,
    refreshUser: fetchUserData,
    updateAvatar,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
