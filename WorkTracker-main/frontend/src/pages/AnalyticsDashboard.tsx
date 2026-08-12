import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

interface ChartData {
  attendance_trend: { date: string; Present: number; Absent: number }[];
  employee_working_hours: { name: string; hours: number }[];
  department_productivity: { department: string; hours: number; tasks: number }[];
  task_completion: { name: string; value: number }[];
  weekly_performance: { week: string; hours: number; tasks: number }[];
  monthly_performance: { month: string; hours: number; tasks: number }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      } else {
        throw new Error('Failed to retrieve analytics payload.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Completed, In Progress, To Do

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans relative">
      {/* Purple brand gradient top strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-950 via-purple-700 to-indigo-950 z-50"></div>
      
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center z-20 shadow-sm relative">
        <div className="flex items-center gap-3 select-none">
          <svg className="w-8 h-8 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <button 
          onClick={logout} 
          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10 animate-fade-in">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <Link 
              to="/admin/dashboard" 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO DASHBOARD
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Analytics Center</h2>
            <p className="text-xs text-slate-500">Review attendance trends, departmental output, and productivity summaries.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 font-mono flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin"></div>
            <span>Generating analytical charts...</span>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-600 text-xs font-mono text-center">
            Failed to build analytics: {error}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Chart 1: Attendance Trend */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                14-Day Attendance Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.attendance_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Employee Working Hours */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                Top Employees clocked Hours (Last 30 Days)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.employee_working_hours} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'sans-serif' }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Bar dataKey="hours" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Department Productivity */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                Departmental Output & hours (Last 30 Days)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.department_productivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="department" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Bar dataKey="hours" fill="#8b5cf6" name="Hours Worked" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tasks" fill="#10b981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Task Completion Status */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                Overall Task Completion Ratio
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.task_completion.filter(t => t.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.task_completion.filter(t => t.value > 0).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Weekly Performance */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                4-Week Work hours & output trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.weekly_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" name="Clocked Hours" strokeWidth={2} />
                    <Line type="monotone" dataKey="tasks" stroke="#10b981" name="Completed Tasks" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Monthly Performance */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide mb-4">
                6-Month Historical Summary
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthly_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Bar dataKey="hours" fill="#4f46e5" name="Clocked Hours" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tasks" fill="#f59e0b" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono italic">
            No analytics data compiled.
          </div>
        )}

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Executive BI Analytics &bull; Live
      </footer>
    </div>
  )
}
export default AnalyticsDashboard
