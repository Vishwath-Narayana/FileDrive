import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(token ? 'form' : 'error');

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Both fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/reset-password', { token, newPassword });
      setStatus('success');
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      if (error.response?.data?.message?.includes('expired') || error.response?.data?.message?.includes('Invalid')) {
        setStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <div className="w-12 h-12 bg-black rounded-xl mx-auto mb-4 shadow-lg flex items-center justify-center text-white">
          <Lock size={24} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-black">FileDrive</h1>
      </div>

      <div className="w-full max-w-[400px] bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]">
        {status === 'form' && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-1">Set New Password</h2>
              <p className="text-sm text-gray-500">Enter your new password below</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="new-password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-12 text-sm"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-12 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex justify-center text-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-10 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Password Changed</h3>
            <p className="text-sm text-gray-500 mb-8">Your password has been reset successfully.</p>
            <div className="flex items-center justify-center gap-3 py-3 px-6 bg-gray-50 rounded-full inline-flex mx-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Redirecting to login</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Link Invalid or Expired</h3>
            <p className="text-sm text-gray-500 mb-8">This reset link is no longer valid. Please request a new one.</p>
            <Link
              to="/forgot-password"
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              Request New Link
            </Link>
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

export default ResetPassword;
