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
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Perform a hard-check against the database to guarantee the user account still exists
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
            // Verify if the saved current org exists in updated organizations
            const parsedOrg = JSON.parse(savedCurrentOrg);
            const isValidSavedOrg = userData.organizations?.some(org => org._id === parsedOrg._id);
            
            if (isValidSavedOrg) {
              setCurrentOrganization(parsedOrg);
            } else if (userData.organizations && userData.organizations.length > 0) {
              setCurrentOrganization(userData.organizations[0]);
            }
          } else if (userData.organizations && userData.organizations.length > 0) {
            setCurrentOrganization(userData.organizations[0]);
          }
        } catch (error) {
          console.error('Session verification failed, force logging out:', error);
          // If the DB says they don't exist anymore, wipe their local tokens
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
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
