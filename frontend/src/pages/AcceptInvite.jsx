import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, refreshOrganizations } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [inviteData, setInviteData] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = searchParams.get('token');

    if (!t) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    setToken(t);

    // Wait for auth check to complete before processing
    if (!authLoading) {
      acceptInvitation(t);
    }
  }, [searchParams, authLoading]);

  const acceptInvitation = async (t) => {
    try {
      setStatus('loading');
      const response = await api.post('/organizations/accept-invite', { token: t });

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
        // No account found for this email – show create/login options
        setStatus('needs-registration');
        setInviteData({ ...error.response.data, token: t });
        setMessage('You need an account to join this organization.');
      } else if (error.response?.status === 401 && !isAuthenticated) {
        // Not logged in – prompt them to login/register first
        setStatus('needs-registration');
        setInviteData({ email: '', token: t });
        setMessage('Please log in or create an account to accept this invitation.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to accept invitation');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Organization Invitation</h1>
            <p className="text-sm text-gray-500">FileDrive</p>
          </div>

          {status === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Processing your invitation...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-10">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">You're in!</h2>
              <p className="text-gray-600 mb-2 text-sm">{message}</p>
              {isAuthenticated && (
                <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-10">
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6 text-sm">{message}</p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === 'needs-registration' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to FileDrive</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>

              <div className="space-y-3">
                {/* Pass the invite token in state so after login the user can re-visit the link */}
                <Link
                  to="/register"
                  state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                  className="block w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                  className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Log in to Existing Account
                </Link>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                After signing in, click the invitation link again to join.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
