import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  date: string;
  login_time: string;
  logout_time: string | null;
  working_hours: number | null;
  status: string;
}

export const AttendanceMonitoring: React.FC = () => {
  const { token, user, logout } = useAuth();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchAttendance = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let query = `page=${page}&size=${size}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (startDate) query += `&start_date=${startDate}`;
      if (endDate) query += `&end_date=${endDate}`;

      const res = await fetch(`${API_URL}/api/admin/attendance?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setTotalCount(data.total_count);
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to query attendance logs.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, token, search, startDate, endDate]);

  const applyPreset = (preset: 'today' | 'week' | 'month' | 'all') => {
    setPage(1);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleExportCSV = async () => {
    if (!token) return;
    setExporting(true);
    try {
      let query = `page=1&size=10000`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (startDate) query += `&start_date=${startDate}`;
      if (endDate) query += `&end_date=${endDate}`;

      const res = await fetch(`${API_URL}/api/admin/attendance?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const list: AttendanceRecord[] = data.records;

        const headers = ['Employee Name', 'Email', 'Date', 'Clock In', 'Clock Out', 'Working Hours', 'Status'];
        const csvRows = [headers.map(h => `"${h}"`).join(',')];

        list.forEach(r => {
          const row = [
            r.employee_name,
            r.employee_email,
            r.date,
            r.login_time ? (parseUTCString(r.login_time)?.toLocaleTimeString() || '') : '',
            r.logout_time ? (parseUTCString(r.logout_time)?.toLocaleTimeString() || '') : '',
            r.working_hours !== null ? r.working_hours.toString() : 'Active Shift',
            r.status
          ];
          csvRows.push(row.map(val => `"${val.replace(/"/g, '""')}"`).join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `staff_attendance_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to generate export file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error during CSV compile.');
    } finally {
      setExporting(false);
    }
  };

  const parseUTCString = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    if (isoString.includes('T') && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString + 'Z');
    }
    return new Date(isoString);
  };

  const formatTime = (isoString: string | null) => {
    const dateObj = parseUTCString(isoString);
    if (!dateObj) return '--:--';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const dateObj = parseUTCString(dateStr);
    if (!dateObj) return '--/--/----';
    return dateObj.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const totalPages = Math.ceil(totalCount / size);

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
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <Link to="/admin/dashboard" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO DASHBOARD
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Attendance Monitoring</h2>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={exporting || records.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exporting ? 'Compiling CSV...' : 'Export CSV'}
          </button>
        </div>

        {/* Filters and Presets */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 font-mono text-xs shadow-sm text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 block text-[10px] uppercase font-bold">Search Staff</label>
              <input 
                type="text"
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                placeholder="Search name or email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => { setPage(1); setStartDate(e.target.value); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 block text-[10px] uppercase font-bold">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => { setPage(1); setEndDate(e.target.value); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
            <button 
              onClick={() => applyPreset('today')} 
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              Today
            </button>
            <button 
              onClick={() => applyPreset('week')} 
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              Weekly
            </button>
            <button 
              onClick={() => applyPreset('month')} 
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
            >
              Monthly
            </button>
            <button 
              onClick={() => applyPreset('all')} 
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md text-left">
          {loading && records.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono">
              <div className="w-6 h-6 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-2"></div>
              Querying staff shifts logs...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 font-mono bg-rose-50">
              Query failed: {error}
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono italic">
              No shift logs found matching queries. Adjust filters to search.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">EMPLOYEE NAME</th>
                      <th className="px-6 py-3.5 font-semibold">DATE</th>
                      <th className="px-6 py-3.5 font-semibold">CLOCK IN</th>
                      <th className="px-6 py-3.5 font-semibold">CLOCK OUT</th>
                      <th className="px-6 py-3.5 font-semibold">WORKING HOURS</th>
                      <th className="px-6 py-3.5 font-semibold text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 font-sans text-sm">{r.employee_name}</div>
                          <div className="text-[10px] text-slate-505 text-slate-500 mt-0.5">{r.employee_email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{formatDate(r.date)}</td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">{formatTime(r.login_time)}</td>
                        <td className="px-6 py-4 text-amber-600 font-semibold">{formatTime(r.logout_time)}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {r.working_hours !== null ? `${r.working_hours} hours` : 'Active Shift'}
                        </td>
                        <td className="px-6 py-4 text-right shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            r.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {r.status === 'Active' ? 'Working' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">
                    Showing {(page - 1) * size + 1}-{Math.min(page * size, totalCount)} of {totalCount} entries
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(p - 1, 1))} 
                      disabled={page === 1}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-slate-500">Page {page} of {totalPages}</span>
                    <button 
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                      disabled={page === totalPages}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Admin Panel &bull; Environment Live
      </footer>
    </div>
  )
}
export default AttendanceMonitoring
