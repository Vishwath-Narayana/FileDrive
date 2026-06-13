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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4">
      <Link to="/" className="mb-8 text-center block cursor-pointer group">
        <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg transform group-hover:-translate-y-1 transition-all duration-300" />
        <h1 className="text-2xl font-bold tracking-tight text-black">Welcome back</h1>
        <p className="text-sm text-gray-400 mt-1">Enter your credentials to continue</p>
      </Link>

      <div className="animate-slide-up w-full max-w-[400px]">
        <div className="bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex justify-center text-sm group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#FAFAFA] text-center">
            <p className="text-sm text-gray-400">
              New to FileDrive?{' '}
              <Link to="/register" className="font-bold text-black hover:underline">
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
