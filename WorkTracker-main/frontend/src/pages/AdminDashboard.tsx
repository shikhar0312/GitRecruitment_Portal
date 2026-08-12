import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface AdminSummary {
  total_employees: number;
  present_today: number;
  absent_today: number;
  currently_working: number;
  total_hours_today: number;
  staff_list: {
    id: number;
    name: string;
    email: string;
    department: string | null;
    designation: string | null;
    status: string;
    clock_in: string | null;
    clock_out: string | null;
    hours: number | null;
  }[];
  daily_hours_company: { day: string; date: string; hours: number }[];
}

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  
  const [summary, setSummary] = useState<AdminSummary>({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    currently_working: 0,
    total_hours_today: 0.0,
    staff_list: [],
    daily_hours_company: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchAdminSummary = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        throw new Error('Failed to load admin summary report.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
  }, [token]);

  const presentRate = summary.total_employees > 0
    ? Math.round((summary.present_today / summary.total_employees) * 100)
    : 0;

  const maxWeeklyHour = summary.daily_hours_company.length > 0
    ? Math.max(...summary.daily_hours_company.map(w => w.hours))
    : 0;

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

      {/* Main content grid */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10 text-left">
        
        {/* Welcome Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-left">
          <div className="space-y-1 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Control Center</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Manage trackers, monitor live staff logs, and check configuration integrity.</p>
            <div className="pt-2">
              <button 
                onClick={fetchAdminSummary}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 9H18.2" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <Link 
              to="/admin/employees" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-indigo-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span>Manage Employees</span>
            </Link>
            <Link 
              to="/admin/attendance-monitoring" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
                </svg>
              </div>
              <span>Monitor Attendance</span>
            </Link>
            <Link 
              to="/admin/task-monitoring" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-violet-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span>Monitor Tasks</span>
            </Link>
            <Link 
              to="/admin/weekly-reports" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-amber-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Weekly Reports</span>
            </Link>
            <Link 
              to="/leaves" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-rose-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Manage Leaves</span>
            </Link>
            <Link 
              to="/admin/analytics" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-sky-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Executive Analytics</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-mono text-left">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin"></div>
            <span>Syncing summary log...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">TOTAL STAFF</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{summary.total_employees} Employees</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Registered accounts</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">PRESENT TODAY</p>
                <h3 className="text-xl font-bold text-emerald-600 mt-1">{summary.present_today} Present</h3>
                <p className="text-[10px] text-emerald-500 font-mono">{presentRate}% presence rate</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ABSENT TODAY</p>
                <h3 className="text-xl font-bold text-rose-600 mt-1">{summary.absent_today} Absent</h3>
                <p className="text-[10px] text-rose-400 font-mono">{summary.total_employees - summary.present_today} inactive staff</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">LIVE WORKING</p>
                <h3 className="text-xl font-bold text-indigo-600 mt-1">{summary.currently_working} Active</h3>
                <p className="text-[10px] text-indigo-500 font-mono">Clocked-in right now</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">TOTAL HOURS TODAY</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{summary.total_hours_today} hrs</h3>
                <p className="text-[10px] text-slate-400 font-mono">Accumulated hours</p>
              </div>
            </div>

            {/* Split analytics grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Weekly chart & Gauges */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* SVG Hours Worked Bar Chart */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">Company Hours (Last 7 Days)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sum of daily employee timesheet logs</p>
                  </div>
                  {summary.daily_hours_company.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">No timesheet records logged.</p>
                  ) : (
                    <div className="flex items-end justify-between gap-1 h-36 pt-4 font-mono text-[9px] text-slate-400">
                      {summary.daily_hours_company.map((w, idx) => {
                        const pct = maxWeeklyHour > 0 ? (w.hours / maxWeeklyHour) * 100 : 0;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 flex-grow">
                            <div className="text-[8px] text-slate-500">{w.hours}h</div>
                            <div 
                              style={{ height: `${Math.max(4, Math.round(pct * 0.8))}px` }} 
                              className="w-full bg-[#f59e0b] hover:bg-[#d97706] rounded-t-sm transition-all"
                            />
                            <div className="text-[8px] tracking-tighter uppercase font-bold mt-1 text-slate-400">{w.day}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* SVG Circular Attendance Rate Gauge */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wide">Present Rate</h3>
                    <p className="text-[10px] text-slate-400">Active worker ratio today</p>
                    <div className="text-xl font-bold text-slate-900 pt-1">{presentRate}%</div>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path 
                        className="text-emerald-500" 
                        strokeWidth="3.5" 
                        strokeDasharray={`${presentRate}, 100`} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="none" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                    </svg>
                    <span className="absolute font-bold font-mono text-xs text-slate-900">{presentRate}%</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Working Staff list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">Live Staff Activity</h3>
                  </div>
                  {summary.staff_list.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-mono italic">
                      No employees are currently clocked in.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-3.5 font-semibold">EMPLOYEE</th>
                            <th className="px-6 py-3.5 font-semibold">DEPARTMENT</th>
                            <th className="px-6 py-3.5 font-semibold">DESIGNATION</th>
                            <th className="px-6 py-3.5 font-semibold text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {summary.staff_list.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900 font-sans text-sm">{emp.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{emp.email}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-sans">{emp.department || '--'}</td>
                              <td className="px-6 py-4 text-slate-600 font-sans">{emp.designation || '--'}</td>
                              <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                  emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  emp.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    emp.status === 'Active' ? 'bg-emerald-500' :
                                    emp.status === 'Completed' ? 'bg-indigo-500' :
                                    'bg-slate-400'
                                  }`}></span>
                                  {emp.status === 'Active' ? 'Working' : emp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Administrator summary system &bull; Live
      </footer>
    </div>
  )
}
export default AdminDashboard
