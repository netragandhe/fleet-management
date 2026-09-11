import React, { useState } from 'react';
import { Truck, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@fleetflow.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate short network delay for premium feel
    setTimeout(() => {
      if (email === 'admin@fleetflow.com' && password === 'admin123') {
        onLogin({ email, name: 'Alexander Mercer', role: 'Fleet Manager' });
      } else {
        setError('Invalid email or password. Hint: admin@fleetflow.com / admin123');
        setLoading(false);
      }
    }, 800);
  };

  const handleDemoFill = () => {
    setEmail('admin@fleetflow.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse-subtle" style={{ animationDelay: '1s' }} />

      {/* Main Login Card */}
      <div className="w-full max-w-md p-8 sm:p-10 mx-4 rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20 mb-3 transform hover:rotate-6 transition-transform">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Fleet<span className="text-sky-400">Flow</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Fleet Operations Dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-6 text-sm rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fleetflow.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-sky-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-sky-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-8 pt-6 border-t border-slate-900 text-center">
          <p className="text-slate-500 text-xs">
            Want to explore quickly?
          </p>
          <button
            onClick={handleDemoFill}
            className="mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
          >
            Auto-fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
