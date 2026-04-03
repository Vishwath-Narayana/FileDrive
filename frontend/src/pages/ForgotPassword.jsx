import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/users/request-password-reset', { email });
      setResetLink(response.data.resetLink);
      toast.success('Reset link generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
        <h1 className="text-2xl font-bold tracking-tight text-black">FileDrive</h1>
      </div>

      <div className="w-full max-w-[400px] bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]">
        {!resetLink ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-1">Reset Password</h2>
              <p className="text-sm text-gray-500">Enter your email to get a reset link</p>
            </div>

            <form onSubmit={handleRequestReset} className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="name@company.com"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex justify-center text-sm"
              >
                {loading ? 'Generating...' : 'Generate Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-black mb-1">Link Ready!</h2>
              <p className="text-sm text-gray-500">Share or open this link to reset the password for <strong>{email}</strong></p>
            </div>

            <div className="bg-gray-50 border border-[#EDEDED] rounded-[16px] p-4 mb-6">
              <p className="text-xs text-gray-500 font-mono break-all leading-relaxed">{resetLink}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className="w-full btn-primary py-3 flex justify-center items-center gap-2 text-sm"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Reset Link
                  </>
                )}
              </button>

              <a
                href={resetLink}
                className="w-full btn-secondary py-3 flex justify-center text-sm font-bold"
              >
                Open Link Now
              </a>
            </div>

            <button
              onClick={() => { setResetLink(''); setEmail(''); setCopied(false); }}
              className="w-full mt-4 text-xs text-gray-400 hover:text-black transition-colors font-medium"
            >
              Try a different email
            </button>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-[#EDEDED] text-center">
          <Link to="/login" className="text-xs font-bold text-black hover:underline underline-offset-4">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
