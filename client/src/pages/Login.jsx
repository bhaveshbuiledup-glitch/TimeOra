import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Watch, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/account');
      } else {
        setError(res.message || 'Unable to sign in. Please verify your credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('patron@timeora.com');
    setPassword('TimeoraVIP2024');
    setIsLoading(true);
    await login('patron@timeora.com', 'TimeoraVIP2024');
    setIsLoading(false);
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        
        <div className="bg-[#121217] border border-[#242432] rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-[#c5a880]/40 mx-auto flex items-center justify-center text-[#c5a880] mb-3 bg-[#181822]">
              <Watch size={24} />
            </div>
            <h1 className="font-['Cinzel'] font-bold text-2xl text-white tracking-wider">
              Patron Sign In
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Access your bespoke TIMEORA portfolio & concierge
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-gray-400 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="uppercase tracking-wider text-gray-400 font-medium">
                  Password
                </label>
                <span className="text-gray-500 hover:text-[#c5a880] cursor-pointer text-[11px]">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 bg-[#c5a880] hover:bg-[#d8be98] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#c5a880]/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Instant VIP Demo Access */}
          <div className="mt-6 pt-6 border-t border-[#1f1f2a]">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 bg-[#1a1a24] hover:bg-[#252533] border border-[#303042] text-xs text-[#c5a880] font-semibold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Sparkles size={14} />
              <span>Instant VIP Demo Patron Sign-In</span>
            </button>
          </div>

          {/* Footer link */}
          <div className="text-center mt-6 text-xs text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#c5a880] font-semibold hover:underline">
              Create Patron Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
