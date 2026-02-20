
import React, { useState } from 'react';
import { AppState, Employee } from '../types';

interface LoginProps {
  state: AppState;
  onLogin: (user: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ state, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Hardcoded Check
    if (email === 'mizgin.oil.duhok@gmail.com' && password === '@@##2323@#@#') {
      onLogin({
        id: 'admin-root',
        name: 'Super Admin',
        role: 'admin',
        email,
        password: '',
        jobTitle: 'Director',
        categoryId: 'admin'
      });
      return;
    }

    // Employee Check
    const found = state.employees.find(e => e.email === email && e.password === password);
    if (found) {
      onLogin(found);
    } else {
      setError('Invalid credentials. Please try again or contact your administrator.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Mizgin Oil Portal</h2>
          <p className="text-blue-100 mt-2 text-sm">Secure employee access</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Email Address</label>
              <input
                required
                type="email"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="name@mizgin-oil.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Password</label>
              <input
                required
                type="password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
          
          <div className="text-center">
            <p className="text-slate-400 text-xs">
              Mizgin Oil © {new Date().getFullYear()} • Authorized Access Only
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
