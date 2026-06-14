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
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-indigo)' }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <Link to="/" style={{ marginBottom: '32px', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
        <img src={logo} alt="FileDrive Logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px', margin: '0 auto 16px', boxShadow: 'var(--accent-indigo-glow)' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>FileDrive</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>ORGANIZATION INVITATION</p>
      </Link>

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}>
          {status === 'loading' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent-indigo)' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>VERIFYING LINK...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--accent-green-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--accent-green)',
              }}>
                <CheckCircle size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome Aboard</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
              {isAuthenticated ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '8px 16px', background: 'var(--bg-elevated)', borderRadius: '20px',
                  border: '1px solid var(--border)', margin: '0 auto',
                }}>
                  <div style={{ width: '6px', height: '6px', background: 'var(--accent-green)', borderRadius: '50%', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>OPENING DASHBOARD</span>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', height: '40px',
                    fontSize: '13px', display: 'inline-flex', textDecoration: 'none'
                  }}
                >
                  Sign in to continue
                </Link>
              )}
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--accent-red-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--accent-red)',
              }}>
                <XCircle size={22} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Link Invalid</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
              <Link
                to="/dashboard"
                className="btn-secondary"
                style={{
                  width: '100%', justifyContent: 'center', height: '40px',
                  fontSize: '13px', display: 'inline-flex', textDecoration: 'none',
                }}
              >
                Back to Safety
              </Link>
            </div>
          )}

          {status === 'needs-registration' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '24px',
              }}>
                👋
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{message}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                To join this organization, you'll need a FileDrive account associated with your email.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/register"
                  state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                  className="btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', height: '40px',
                    fontSize: '13px', display: 'inline-flex', textDecoration: 'none',
                  }}
                >
                  Create new account
                </Link>
                <Link
                  to="/login"
                  state={{ email: inviteData?.email, returnInviteToken: inviteData?.token }}
                  className="btn-secondary"
                  style={{
                    width: '100%', justifyContent: 'center', height: '40px',
                    fontSize: '13px', display: 'inline-flex', textDecoration: 'none',
                  }}
                >
                  Sign in to existing
                </Link>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  ONCE LOGGED IN, CLICK THE LINK IN YOUR EMAIL AGAIN TO JOIN.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
