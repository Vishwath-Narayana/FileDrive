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
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4">
      <div className="animate-slide-up w-full max-w-[400px]">
        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-400 mb-8 transition-colors text-sm font-medium"
          onMouseEnter={e => e.currentTarget.style.color = '#5B5BD6'}
          onMouseLeave={e => e.currentTarget.style.color = ''}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to login
        </Link>
        
        <div className="text-center mb-8">
          <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
          <h1 className="text-2xl font-bold tracking-tight text-black">Reset Password</h1>
          <p className="text-sm text-gray-400 mt-1">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white p-10 rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 12px 32px rgba(15,17,21,0.08), 0 2px 8px rgba(15,17,21,0.04)' }}>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="cc-text-mono block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
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
                className="w-full btn-primary py-3.5 flex justify-center text-sm group"
                style={{ background: '#5B5BD6', boxShadow: '0 1px 2px rgba(91,91,214,0.25)', transition: 'background 150ms ease, box-shadow 150ms ease' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,91,214,0.35)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5B5BD6'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(91,91,214,0.25)'; }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <Mail size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Check your email</h3>
              <p className="text-sm text-gray-500 mb-6">
                We've sent a password reset link to <span className="font-semibold text-black">{email}</span>
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm font-bold text-gray-400 transition-colors"
                onMouseEnter={e => e.currentTarget.style.color = '#5B5BD6'}
                onMouseLeave={e => e.currentTarget.style.color = ''}
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
