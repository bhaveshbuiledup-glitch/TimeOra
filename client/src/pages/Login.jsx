import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      } else {
        setError(res.message);
      }
    } catch {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-[#121217] border border-[#242432] rounded-2xl p-8">
          <h1 className="font-bold text-2xl text-white text-center mb-6">Sign In</h1>
          {error && <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" className="w-full bg-[#171722] border border-[#2c2c3c] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]" />
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase rounded-xl disabled:opacity-50">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
