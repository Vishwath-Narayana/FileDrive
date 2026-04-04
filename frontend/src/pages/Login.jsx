import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
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
      <div className="animate-slide-up">
        <Link to="/" className="mb-10 text-center block cursor-pointer group">
          <div className="relative inline-block">
            <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg transform group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">FileDrive</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">Secure file management for teams</p>
        </Link>

        <div className="w-full max-w-[400px] bg-white p-10 rounded-[24px] shadow-xl border border-[#EDEDED] hover:shadow-2xl transition-shadow duration-500">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-black mb-1">Welcome back</h2>
            <p className="text-sm text-gray-400">Enter your credentials to continue</p>
          </div>

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
              <div className="flex w-full items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-[11px] font-bold text-black hover:text-gray-600 transition-colors inline-block"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-200 focus:outline-none border-none bg-transparent p-0"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex justify-center text-sm group relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#EDEDED] text-center">
            <p className="text-xs text-gray-500">
              New to FileDrive?{' '}
              <Link to="/register" className="font-bold text-black hover:underline underline-offset-4 transition-colors">
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
