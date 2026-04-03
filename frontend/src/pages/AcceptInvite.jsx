import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
        <h1 className="text-2xl font-bold tracking-tight text-black">FileDrive</h1>
      </div>

      <div className="w-full max-w-[440px] bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-black mb-1">Organization Invite</h2>
          <p className="text-sm text-gray-400">Join your team workspace</p>
        </div>

        {status === 'loading' && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-black animate-spin mx-auto mb-6 opacity-20" />
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Verifying Link...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-10 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Welcome Aboard</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">{message}</p>
            {isAuthenticated ? (
              <div className="flex items-center justify-center gap-3 py-3 px-6 bg-gray-50 rounded-full inline-flex mx-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Opening Dashboard</span>
              </div>
            ) : (
              <Link to="/login" className="btn-primary w-full justify-center py-3">
                Sign in to continue
              </Link>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Link Invalid</h3>
            <p className="text-sm text-gray-500 mb-8 px-4">{message}</p>
            <Link
              to="/dashboard"
              className="btn-secondary w-full justify-center py-3 text-sm font-bold"
            >
              Back to Safety
            </Link>
          </div>
        )}

        {status === 'needs-registration' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
              👋
            </div>
            <h3 className="text-xl font-bold text-black mb-3 text-pretty">{message}</h3>
            <p className="text-sm text-gray-400 mb-10 text-balance leading-relaxed">To join this organization, you'll need a FileDrive account associated with your email.</p>

            <div className="space-y-3">
              <Link
                to="/register"
                state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                className="btn-primary w-full justify-center py-3.5 text-sm"
              >
                Create new account
              </Link>
              <Link
                to="/login"
                state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                className="btn-secondary w-full justify-center py-3.5 text-sm"
              >
                Sign in to existing
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-[#FAFAFA]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                Once logged in, click the link <br/>in your email again to join.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
