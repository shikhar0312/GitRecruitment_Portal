import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface DailyDetail {
  date: string;
  day: string;
  status: string; // 'Present' or 'Absent'
  hours: number;
  tasks_completed: number;
}

interface DetailedReport {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  total_tasks_completed: number;
  attendance_percentage: number;
  daily_details: DailyDetail[];
}

interface SummaryReport {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  total_hours: number;
  total_tasks_completed: number;
  attendance_percentage: number;
}

export const WeeklyReports: React.FC = () => {
  const { token, user, logout } = useAuth();

  // Selected state options
  const [startDate, setStartDate] = useState(() => {
    // Default to the start of current week (Monday)
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  // Admin selection state
  const [selectedEmpId, setSelectedEmpId] = useState<string>('all');
  const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);

  // Loaded reports data
  const [reportDetail, setReportDetail] = useState<DetailedReport | null>(null);
  const [summaryList, setSummaryList] = useState<SummaryReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchStaffList = async () => {
    if (!token || user?.role !== 'Admin') return;
    try {
      const res = await fetch(`${API_URL}/api/admin/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setReportDetail(null);
    setSummaryList([]);

    try {
      if (user?.role === 'Admin') {
        if (selectedEmpId === 'all') {
          // Fetch summary for all employees
          const res = await fetch(`${API_URL}/api/admin/reports/weekly?start_date=${startDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSummaryList(data);
            setReportDetail(null);
          } else {
            throw new Error('Failed to load admin summary reports.');
          }
        } else {
          // Fetch detailed report for single employee
          const res = await fetch(`${API_URL}/api/admin/reports/weekly?start_date=${startDate}&employee_id=${selectedEmpId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setReportDetail(data);
            setSummaryList([]);
          } else {
            throw new Error('Failed to load employee detailed report.');
          }
        }
      } else {
        // Fetch detailed report for logged-in employee
        const res = await fetch(`${API_URL}/api/reports/weekly?start_date=${startDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReportDetail(data);
          setSummaryList([]);
        } else {
          throw new Error('Failed to load weekly report.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, [token, user]);

  useEffect(() => {
    fetchReport();
  }, [token, startDate, selectedEmpId]);

  const handleExportExcel = () => {
    let csvContent = '';
    let fileName = '';

    if (reportDetail) {
      fileName = `weekly_report_${reportDetail.employee_name.replace(/\s+/g, '_')}_${startDate}.csv`;
      const headers = ['Date', 'Day', 'Presence Status', 'Clocked Hours', 'Tasks Completed'];
      const rows = [headers.map(h => `"${h}"`).join(',')];
      
      reportDetail.daily_details.forEach(d => {
        rows.push([
          `"${d.date}"`,
          `"${d.day}"`,
          `"${d.status}"`,
          `"${d.hours}"`,
          `"${d.tasks_completed}"`
        ].join(','));
      });
      csvContent = rows.join('\n');
    } else {
      fileName = `weekly_summary_report_${startDate}.csv`;
      const headers = ['Employee ID', 'Name', 'Email Address', 'Total Hours', 'Tasks Completed', 'Attendance Rate'];
      const rows = [headers.map(h => `"${h}"`).join(',')];
      
      summaryList.forEach(s => {
        rows.push([
          `"${s.employee_id}"`,
          `"${s.employee_name}"`,
          `"${s.employee_email}"`,
          `"${s.total_hours}"`,
          `"${s.total_tasks_completed}"`,
          `"${s.attendance_percentage}%"`
        ].join(','));
      });
      csvContent = rows.join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans relative">
      {/* Purple brand gradient top strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-950 via-purple-700 to-indigo-950 z-50"></div>
      
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center z-20 shadow-sm relative no-print">
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
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print text-left">
          <div className="space-y-1">
            <Link 
              to={user?.role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO DASHBOARD
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weekly Performance reports</h2>
            <p className="text-xs text-slate-500">Generate printable performance, timesheet summaries and export checklist history logs.</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20 px-4 py-1.5 rounded-lg text-xs font-semibold font-mono cursor-pointer transition flex items-center gap-1.5 shadow-sm"
            >
              Export CSV
            </button>
            <button 
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold font-mono cursor-pointer transition flex items-center gap-1.5 shadow-sm"
            >
              Print Report
            </button>
          </div>
        </div>

        {/* Filter Selection Panel */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-wrap gap-4 font-mono text-xs items-center shadow-sm no-print text-left">
          <div className="space-y-1">
            <label className="text-slate-400 block font-bold text-[9px] uppercase">Week Starting (Monday)</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
            />
          </div>

          {user?.role === 'Admin' && (
            <div className="space-y-1">
              <label className="text-slate-400 block font-bold text-[9px] uppercase">Employee scope</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
              >
                <option value="all">All Employees (Summary list)</option>
                {staffList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-600 font-mono text-xs text-left no-print">
            Error: {error}
          </div>
        )}

        {/* Print Layout Header */}
        <div className="hidden print:block text-left border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold text-slate-900">GIT SOFTWARE TECHNOLOGIES</h1>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Weekly performance audit log</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <div>Week starting: {startDate}</div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 font-mono flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin"></div>
            <span>Compiling weekly aggregates...</span>
          </div>
        ) : reportDetail ? (
          /* Case 1: Detailed Report for single employee */
          <div className="space-y-6 text-left">
            
            {/* Metadata Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">STAFF DETAIL</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1 font-sans">{reportDetail.employee_name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{reportDetail.employee_email}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">TOTAL LOGGED HOURS</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{reportDetail.total_hours} hrs</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Completed timesheets</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">TASKS COMPLETED</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{reportDetail.total_tasks_completed} Tasks</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">From weekly checklist</p>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ATTENDANCE RATE</p>
                <h3 className="text-2xl font-bold text-[#f59e0b] mt-1">{reportDetail.attendance_percentage}%</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Weekly completion ratio</p>
              </div>
            </div>

            {/* Daily detail breakdown table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">Daily Timesheet Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">DATE</th>
                      <th className="px-6 py-3.5 font-semibold">DAY</th>
                      <th className="px-6 py-3.5 font-semibold">PRESENCE STATUS</th>
                      <th className="px-6 py-3.5 font-semibold">HOURS CLOCKED</th>
                      <th className="px-6 py-3.5 text-right font-semibold">TASKS COMPLETED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportDetail.daily_details.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-semibold">{d.date}</td>
                        <td className="px-6 py-4 text-slate-600 font-sans">{d.day}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-950 font-semibold">{d.hours} hrs</td>
                        <td className="px-6 py-4 text-right text-slate-950 font-semibold">{d.tasks_completed} tasks</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : summaryList.length > 0 ? (
          /* Case 2: Summary Report for all employees */
          <div className="space-y-4 text-left">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">Staff Weekly Output Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">EMPLOYEE</th>
                      <th className="px-6 py-3.5 font-semibold">TOTAL WORK HOURS</th>
                      <th className="px-6 py-3.5 font-semibold">CHECKLIST TASKS</th>
                      <th className="px-6 py-3.5 font-semibold">ATTENDANCE RATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {summaryList.map((s) => (
                      <tr key={s.employee_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 font-sans text-sm">{s.employee_name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{s.employee_email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">{s.total_hours} hrs</td>
                        <td className="px-6 py-4 text-slate-950 font-semibold">{s.total_tasks_completed} completed tasks</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.attendance_percentage >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            s.attendance_percentage >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {s.attendance_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl shadow-sm text-center text-slate-400 font-mono italic text-sm">
            No timesheet logs tracked for week beginning {startDate}.
          </div>
        )}

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10 no-print">
        WorkTracker Performance Audit &bull; Generated Live
      </footer>
    </div>
  )
}
export default WeeklyReports
