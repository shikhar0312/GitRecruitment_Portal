import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const payloadBase64 = data.access_token.split('.')[1];
        const decodedPayload = JSON.parse(window.atob(payloadBase64));
        const role = decodedPayload.role;

        await login(data.access_token);

        if (role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Purple brand gradient top strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-950 via-purple-700 to-indigo-950 z-50"></div>
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl relative z-10 space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2 select-none">
            <svg className="w-9 h-9 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M70,30 C70,18 60,12 48,12 C28,12 14,28 14,48 C14,68 28,84 48,84 C65,84 70,72 70,60 L70,45 L48,45" 
                stroke="#2c3e50" 
                strokeWidth="14" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M62,18 L76,6 L76,28 Z" 
                fill="#f59e0b" 
              />
            </svg>
            <div className="text-left font-sans">
              <div className="text-sm font-extrabold tracking-tight text-slate-800 flex items-center leading-none">
                <span>GIT S</span>
                <span className="inline-flex items-center mx-0.5">
                  <svg className="w-3 h-4" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9,3 L4,7 L4,17 L9,21" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11,3 L16,7 L16,17 L11,21" stroke="#2c3e50" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>FTWARE</span>
              </div>
              <div className="text-[8px] text-slate-400 font-bold tracking-[0.28em] uppercase mt-0.5 leading-none">
                Technologies
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">WorkTracker Portal</h2>
          <p className="text-xs text-slate-500 font-medium">Access your track logs and dashboard metrics</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-rose-600 text-xs flex gap-2">
            <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-slate-800 transition-colors font-sans"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Password</label>
              <a href="#" className="text-[10px] text-slate-400 hover:text-[#f59e0b] transition-colors font-mono">Forgot?</a>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-slate-800 transition-colors font-sans"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2.5 text-sm font-semibold transition cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Navigation bottom */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 font-sans">
          New to the platform?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
export default Login
