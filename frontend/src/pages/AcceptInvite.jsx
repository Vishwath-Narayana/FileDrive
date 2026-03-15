import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshOrganizations } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [inviteData, setInviteData] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    acceptInvitation(token);
  }, [searchParams]);

  const acceptInvitation = async (token) => {
    try {
      setStatus('loading');
      const response = await api.post('/organizations/accept-invite', { token });
      
      setStatus('success');
      setMessage(response.data.message);
      
      if (isAuthenticated) {
        await refreshOrganizations();
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.needsRegistration) {
        setStatus('needs-registration');
        setNeedsRegistration(true);
        setInviteData(error.response.data);
        setMessage('Please register or login to accept this invitation');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to accept invitation');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Organization Invitation</h1>
          </div>

          {status === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Processing your invitation...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              {isAuthenticated && (
                <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'needs-registration' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  to="/register"
                  state={{ email: inviteData?.email }}
                  className="block w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="block w-full px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Login to Existing Account
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                After logging in, click the invitation link again to join the organization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
