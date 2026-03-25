import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: '', email: '', password: '', phone: '', address: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, val) => setForm({ ...form, [field]: val });

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">StockFlow</h1>
        </div>

        <div className="bg-surface-900/60 backdrop-blur-xl rounded-2xl border border-surface-700/50 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
          <p className="text-surface-400 mb-6">Set up your shop in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Shop Name</label>
              <input id="register-shop" type="text" required value={form.shopName} onChange={(e) => update('shopName', e.target.value)} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="My Awesome Shop" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input id="register-email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="you@shop.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input id="register-password" type={showPwd ? 'text' : 'password'} required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all pr-12" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone <span className="text-surface-500">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="+91 12345 67890" />
            </div>
            <button id="register-submit" type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 transform hover:scale-[1.02]">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
