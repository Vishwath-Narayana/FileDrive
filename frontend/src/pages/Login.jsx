import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back!', { icon: '👋' });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Welcome back</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>ENTER YOUR CREDENTIALS TO CONTINUE</p>
      </Link>

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" className="sys-label" style={{ display: 'block', marginBottom: '8px' }}>
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="password" className="sys-label">
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: '10px', fontWeight: 600, color: 'var(--text-quaternary)',
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-quaternary)'}
                >
                  FORGOT?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--text-quaternary)', display: 'flex', alignItems: 'center',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-quaternary)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center', height: '40px',
                fontSize: '13px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Sign in
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              New to FileDrive?{' '}
              <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent-indigo)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
