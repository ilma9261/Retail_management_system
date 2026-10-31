import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Layers, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Retail<span className="text-blue-400">Flow</span>
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-400">
          Enterprise Retail & Warehouse Inventory Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Work Email Address"
              name="email"
              type="email"
              placeholder="admin@retailflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={Mail}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 text-xs"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-sm font-semibold py-3"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Register here
              </Link>
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Preserved Demo Accounts
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60"
                >
                  Auto-Fill Admin
                </button>
              </div>
              <div className="text-xs space-y-1 font-mono text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60">
                <p>
                  <span className="text-slate-400 select-none">Admin: </span>
                  <span className="text-slate-900 font-semibold">{DEMO_CREDENTIALS.email}</span>
                </p>
                <p>
                  <span className="text-slate-400 select-none">Password: </span>
                  <span className="text-slate-900 font-semibold">{DEMO_CREDENTIALS.password}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Connected to MySQL database with bcrypt salted password hashing and JWT sessions.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
