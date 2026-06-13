import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const data = await register(name, email, password);

      if (data.session) {
        toast.success('Welcome to FileDrive!', { icon: '🎉' });
        navigate('/dashboard');
      } else {
        toast.success('Account created! Please check your email to confirm.', { duration: 5000 });
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4">
      <Link to="/" className="mb-8 text-center block cursor-pointer group">
        <img src={logo} alt="FileDrive Logo" className="w-12 h-12 object-cover rounded-xl mx-auto mb-4 shadow-lg transform group-hover:-translate-y-1 transition-all duration-300" />
        <h1 className="text-2xl font-bold tracking-tight text-black">Create account</h1>
        <p className="text-sm text-gray-400 mt-1">Join your organization on FileDrive</p>
      </Link>

      <div className="animate-slide-up w-full max-w-[400px]">
        <div className="bg-white p-10 rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 12px 32px rgba(15,17,21,0.08), 0 2px 8px rgba(15,17,21,0.04)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="cc-text-mono block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

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

            <div>
              <label htmlFor="password" className="cc-text-mono block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#5B5BD6' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
