import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface DailyHour {
  day: string;
  date: string;
  hours: number;
}

interface ReportsSummary {
  weekly_hours: number;
  monthly_hours: number;
  attendance_percentage: number;
  completed_tasks: number;
  pending_tasks: number;
  daily_hours_week: DailyHour[];
}

export const EmployeeReports: React.FC = () => {
  const { token, user, logout } = useAuth();
  
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchReports = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/reports/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to query reports.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center font-sans">
        <div className="w-8 h-8 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono text-slate-400">Aggregating analytics data...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center font-sans p-6">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-600 text-xs max-w-md w-full space-y-3">
          <p className="font-bold font-mono text-sm uppercase">Reports Inquiry Failed</p>
          <p>{error || 'Analytics summary not loaded.'}</p>
          <button onClick={fetchReports} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition">
            Retry fetch
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = summary.completed_tasks + summary.pending_tasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((summary.completed_tasks / totalTasks) * 100) : 0;

  const maxHours = Math.max(...summary.daily_hours_week.map(d => d.hours), 8);
  const chartHeight = 120;
  const chartWidth = 460;
  const paddingX = 40;
  const paddingY = 20;

  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (taskCompletionRate / 100) * circumference;

  const attCircumference = 2 * Math.PI * radius;
  const attStrokeDashoffset = circumference - (summary.attendance_percentage / 100) * attCircumference;

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
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
            <p className="text-[10px] text-slate-500">{user?.email}</p>
          </div>
          <button 
            onClick={logout} 
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10 animate-fade-in">
        
        {/* Navigation / Header */}
        <div className="space-y-1 text-left">
          <Link 
            to={user?.role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'} 
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO DASHBOARD
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Performance Reports & Charts</h2>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">WEEKLY HOURS WORKING</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary.weekly_hours} Hours</h3>
            <p className="text-[10px] text-slate-400 mt-1">Logged over the last 7 days</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">MONTHLY TOTAL HOURS</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{summary.monthly_hours} Hours</h3>
            <p className="text-[10px] text-indigo-500 mt-1">Logged over the last 30 days</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">COMPLETED VS PENDING TASKS</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{summary.completed_tasks} / {totalTasks} Done</h3>
            <p className="text-[10px] text-emerald-500 mt-1">{taskCompletionRate}% task completion rate</p>
          </div>
        </div>

        {/* Charts Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Chart 1: Bar Chart (Weekly working hours splits) */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between shadow-md space-y-4 text-left">
            <div>
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">DAILY HOUR CHART (PAST 7 DAYS)</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Hover on bars to inspect specific date details</p>
            </div>
            
            {/* Custom React Bar Chart SVG */}
            <div className="w-full overflow-hidden flex justify-center">
              <svg viewBox={`0 0 ${chartWidth} 170`} className="w-full max-w-[480px] text-xs font-mono select-none">
                
                {/* Horizontal Guide Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = paddingY + (1 - ratio) * chartHeight;
                  const labelVal = Math.round(maxHours * ratio);
                  return (
                    <g key={index} className="opacity-40">
                      <line x1={paddingX} y1={y} x2={chartWidth - 20} y2={y} stroke="#cbd5e1" strokeDasharray="3" strokeWidth="0.8" />
                      <text x={10} y={y + 4} fill="#64748b" textAnchor="start">{labelVal}h</text>
                    </g>
                  );
                })}

                {/* Draw Columns */}
                {summary.daily_hours_week.map((item, index) => {
                  const colWidth = 40;
                  const colSpacing = (chartWidth - paddingX - 40) / 7;
                  const x = paddingX + 15 + index * colSpacing;
                  
                  const barH = item.hours > 0 ? (item.hours / maxHours) * chartHeight : 2;
                  const y = paddingY + chartHeight - barH;

                  const isHovered = activeBar === index;

                  return (
                    <g 
                      key={index}
                      onMouseEnter={() => setActiveBar(index)}
                      onMouseLeave={() => setActiveBar(null)}
                      className="cursor-pointer group"
                    >
                      {/* Interactive hover background columns */}
                      <rect 
                        x={x - 8} 
                        y={paddingY} 
                        width={colWidth + 16} 
                        height={chartHeight + 10} 
                        fill="transparent" 
                      />

                      {/* Working hours bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={colWidth} 
                        height={barH} 
                        rx={4}
                        fill={isHovered ? 'url(#amberGlow)' : 'url(#amberBar)'}
                        className="transition-all duration-300"
                      />

                      {/* Day Label */}
                      <text 
                        x={x + colWidth / 2} 
                        y={paddingY + chartHeight + 18} 
                        fill={isHovered ? '#d97706' : '#64748b'} 
                        textAnchor="middle"
                        className="font-bold transition-colors duration-200"
                      >
                        {item.day}
                      </text>

                      {/* Hover Tooltip Box */}
                      {isHovered && (
                        <g>
                          <rect 
                            x={Math.min(x - 20, chartWidth - 110)} 
                            y={Math.max(y - 35, 2)} 
                            width={90} 
                            height={26} 
                            rx={4} 
                            fill="#ffffff" 
                            stroke="#f59e0b" 
                            strokeWidth="0.8" 
                          />
                          <text 
                            x={Math.min(x - 20, chartWidth - 110) + 45} 
                            y={Math.max(y - 35, 2) + 16} 
                            fill="#0f172a" 
                            textAnchor="middle" 
                            className="font-bold text-[9px]"
                          >
                            {item.hours} hrs ({new Date(item.date).getDate()} {new Date(item.date).toLocaleString('default', { month: 'short' })})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* SVG Color Gradients */}
                <defs>
                  <linearGradient id="amberBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Chart 2: Circular Gauges (Attendance & Tasks) */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between shadow-md space-y-6 text-left">
            
            {/* Attendance Circular Chart */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">ATTENDANCE RATE</h3>
              <div className="flex items-center gap-6 justify-center">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      stroke="#10b981" 
                      strokeWidth={strokeWidth} 
                      fill="transparent" 
                      strokeDasharray={attCircumference} 
                      strokeDashoffset={attStrokeDashoffset} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-md font-bold text-slate-900">{summary.attendance_percentage}%</span>
                    <span className="text-[8px] text-slate-500 uppercase">Rate</span>
                  </div>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-500">
                  <p className="text-emerald-600 font-bold">Target: 100%</p>
                  <p>Period: Last 30 Days</p>
                  <p>Ref: Weekdays Mon-Fri</p>
                </div>
              </div>
            </div>

            {/* Task Doughnut Chart */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">TASK COMPLETE RATE</h3>
              <div className="flex items-center gap-6 justify-center">
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      stroke="#3b82f6" 
                      strokeWidth={strokeWidth} 
                      fill="transparent" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-md font-bold text-slate-900">{taskCompletionRate}%</span>
                    <span className="text-[8px] text-slate-500 uppercase">Done</span>
                  </div>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-500">
                  <p className="text-indigo-600 font-bold">Total: {totalTasks} Tasks</p>
                  <p className="text-slate-800">Completed: {summary.completed_tasks}</p>
                  <p className="text-slate-500">Pending: {summary.pending_tasks}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Text descriptions */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono leading-normal text-left shadow-sm">
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[10px]">Attendance Rate Computation</h4>
            <p className="text-slate-500">
              Computed by taking your total check-in count over the last 30 calendar days and dividing by total business weekdays (Monday through Friday) inside that window. Shift overtime hours on weekends are logged but do not artificially increase the days count denominator.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[10px]">Performance Log Note</h4>
            <p className="text-slate-500">
              Charts aggregate data in real-time. For changes to register (e.g. clocking out today or marking active checklist tasks complete), return to the dashboard control center and re-query pages.
            </p>
          </div>
        </div>

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Staff Portal &bull; Environment Live
      </footer>
    </div>
  )
}
export default EmployeeReports
