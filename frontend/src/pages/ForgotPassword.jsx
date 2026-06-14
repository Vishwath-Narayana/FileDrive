import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setIsSubmitted(true);
      toast.success('Reset link sent!', { icon: '📧' });
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
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
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: 'var(--text-tertiary)', marginBottom: '24px',
            textDecoration: 'none', fontSize: '13px', fontWeight: 500,
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <ArrowLeft size={14} />
          Back to login
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logo} alt="FileDrive Logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px', margin: '0 auto 16px', boxShadow: 'var(--accent-indigo-glow)' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Reset Password</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>WE'LL SEND YOU A LINK TO RESET YOUR PASSWORD</p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label htmlFor="email" className="sys-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Email Address
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
                    Sending link...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Send Reset Link
                    <ArrowRight size={14} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--accent-green-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Mail size={22} style={{ color: 'var(--accent-green)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Check your email</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
                We've sent a password reset link to <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{email}</span>
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
