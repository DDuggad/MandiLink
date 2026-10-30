import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { adminLogin } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await adminLogin(username, password);
    setLoading(false);

    if (res.success && res.token) {
      if (onLoginSuccess) onLoginSuccess(res.admin);
    } else {
      setError(res.error?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-700/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
            🏛️
          </div>
          <h2 className="text-2xl font-bold text-slate-900">MandiLink Admin</h2>
          <p className="text-xs text-slate-500">
            APMC Market Operations & Price Ingestion Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-xl border border-emerald-200">
            <strong>Default dev credentials:</strong> username:{' '}
            <code className="bg-emerald-100 px-1 py-0.5 rounded">admin</code>, password:{' '}
            <code className="bg-emerald-100 px-1 py-0.5 rounded">admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
