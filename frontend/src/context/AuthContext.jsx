import { createContext, useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedOrgs = localStorage.getItem('organizations');
    const savedCurrentOrg = localStorage.getItem('currentOrganization');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedOrgs) {
        const orgs = JSON.parse(savedOrgs);
        setOrganizations(orgs);
        if (savedCurrentOrg) {
          setCurrentOrganization(JSON.parse(savedCurrentOrg));
        } else if (orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, organizations: userOrgs, ...userData } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('organizations', JSON.stringify(userOrgs || []));
    
    setUser(userData);
    setOrganizations(userOrgs || []);
    
    if (userOrgs && userOrgs.length > 0) {
      const defaultOrg = userOrgs.find(org => org._id === userData.personalOrganization) || userOrgs[0];
      setCurrentOrganization(defaultOrg);
      localStorage.setItem('currentOrganization', JSON.stringify(defaultOrg));
    }
    
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organizations');
    localStorage.removeItem('currentOrganization');
    setUser(null);
    setOrganizations([]);
    setCurrentOrganization(null);
  };

  const switchOrganization = (org) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
  };

  const refreshOrganizations = async () => {
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data);
      localStorage.setItem('organizations', JSON.stringify(response.data));
      
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

  const value = {
    user,
    organizations,
    currentOrganization,
    login,
    register,
    logout,
    switchOrganization,
    refreshOrganizations,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
