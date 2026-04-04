import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import logo from '../assets/logo.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check if we have a valid session to reset password
    const checkSession = async () => {
      const hash = window.location.hash;
      const { data } = await supabase.auth.getSession();

      if (hash.includes("type=recovery")) {
        console.log("🔐 Password recovery mode explicitly detected via hash");
        setIsRecovery(true);
        setSessionValid(true);
      } else if (data.session) {
        // Fallback: If session exists and we are on this URL, they might have just refreshed
        setIsRecovery(true);
        setSessionValid(true);
      } else {
        setSessionValid(false);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      setIsSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionValid || (!isRecovery && !loading)) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED] text-center max-w-[400px] w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 font-bold text-2xl">
            !
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Invalid or expired link</h2>
          <p className="text-sm text-gray-500 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary py-3.5 w-full flex justify-center text-sm">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <div className="animate-slide-up w-full max-w-[400px]">
        <div className="text-center mb-8">
          <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
          <h1 className="text-2xl font-bold tracking-tight text-black">Create New Password</h1>
          <p className="text-sm text-gray-400 mt-1">Enter a new secure password for your account</p>
        </div>

        <div className="bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <CheckCircle size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Password Updated</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been successfully reset. Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-300 mt-2 font-medium">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 flex justify-center text-sm group"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Update Password
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
