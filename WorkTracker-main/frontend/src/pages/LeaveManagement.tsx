import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LeaveRecord {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_email?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

export const LeaveManagement: React.FC = () => {
  const { token, user, logout } = useAuth();

  // Employee states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Loaded logs states
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState(''); // Admin filter
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchLeaves = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (user?.role === 'Admin') {
        url = `${API_URL}/api/admin/leaves`;
        if (statusFilter) {
          url += `?status_filter=${statusFilter}`;
        }
      } else {
        url = `${API_URL}/api/leaves`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      } else {
        throw new Error('Failed to retrieve leave history logs.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [token, user, statusFilter]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      start_date: startDate,
      end_date: endDate,
      reason
    };

    try {
      const res = await fetch(`${API_URL}/api/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess('Leave application submitted successfully!');
        setStartDate('');
        setEndDate('');
        setReason('');
        await fetchLeaves();
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to submit leave.');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleApprove = async (leaveId: number) => {
    if (!token) return;
    setActionLoading(leaveId);
    try {
      const res = await fetch(`${API_URL}/api/admin/leaves/${leaveId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchLeaves();
      } else {
        alert('Failed to approve request.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leaveId: number) => {
    if (!token) return;
    setActionLoading(leaveId);
    try {
      const res = await fetch(`${API_URL}/api/admin/leaves/${leaveId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchLeaves();
      } else {
        alert('Failed to reject request.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const parseUTCString = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    if (isoString.includes('T') && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString + 'Z');
    }
    return new Date(isoString);
  };

  const formatDate = (dateStr: string) => {
    const dateObj = parseUTCString(dateStr);
    if (!dateObj) return '--/--/----';
    return dateObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-55 text-slate-800 bg-slate-50 flex flex-col justify-between font-sans relative">
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
            className="bg-rose-55 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
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
            <Link 
              to={user?.role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'} 
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO DASHBOARD
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management Center</h2>
            <p className="text-xs text-slate-500">Apply for time off and manage leave requests.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-600 font-mono text-xs text-left no-print">
            Error: {error}
          </div>
        )}

        {/* Dashboard split for Employee */}
        {user?.role === 'Employee' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Leave application form */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 font-mono text-xs shadow-md lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wide text-left">
                Apply for Leave
              </h3>
              <form onSubmit={handleApplyLeave} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Start Date</label>
                  <input 
                    type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">End Date</label>
                  <input 
                    type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Reason for Leave</label>
                  <textarea 
                    required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the reason for leave..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans resize-none"
                  />
                </div>
                
                <button type="submit" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2 font-bold cursor-pointer transition shadow-sm">
                  Submit Application
                </button>

                {formError && <div className="text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded text-[10px]">{formError}</div>}
                {formSuccess && <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded text-[10px]">{formSuccess}</div>}
              </form>
            </div>

            {/* Leave History Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md lg:col-span-2 text-left">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">Leave History</h3>
              </div>
              {loading && leaves.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono">
                  Loading leaves log...
                </div>
              ) : leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono italic">
                  No leave requests submitted yet. Use the form to apply.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">DATE RANGE</th>
                        <th className="px-6 py-3 font-semibold">REASON</th>
                        <th className="px-6 py-3 font-semibold">SUBMITTED ON</th>
                        <th className="px-6 py-3 font-semibold text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {leaves.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {formatDate(l.start_date)} - {formatDate(l.end_date)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Duration: {Math.round((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate font-sans text-slate-500" title={l.reason}>
                            {l.reason}
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {formatDate(l.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              l.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {l.status}
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
        ) : (
          /* Admin audit list view */
          <div className="space-y-6 text-left">
            
            {/* Filter buttons */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-wrap gap-2.5 font-mono text-xs items-center justify-between shadow-sm">
              <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">Leave Requests Audit:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStatusFilter('')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    !statusFilter ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All Requests
                </button>
                <button 
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    statusFilter === 'Pending' ? 'bg-[#f59e0b] border-amber-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setStatusFilter('Approved')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    statusFilter === 'Approved' ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Approved
                </button>
                <button 
                  onClick={() => setStatusFilter('Rejected')}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    statusFilter === 'Rejected' ? 'bg-rose-600 border-rose-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              {loading && leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono">
                  Loading leave ledger...
                </div>
              ) : leaves.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono italic">
                  No leave requests found matching filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">EMPLOYEE NAME</th>
                        <th className="px-6 py-3.5 font-semibold">LEAVE RANGE</th>
                        <th className="px-6 py-3.5 font-semibold">REASON</th>
                        <th className="px-6 py-3.5 font-semibold">STATUS</th>
                        <th className="px-6 py-3.5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {leaves.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 font-sans text-sm">{l.employee_name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{l.employee_email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">
                              {formatDate(l.start_date)} - {formatDate(l.end_date)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Duration: {Math.round((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate font-sans text-slate-500" title={l.reason}>
                            {l.reason}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              l.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3 shrink-0">
                            {l.status === 'Pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApprove(l.id)}
                                  disabled={actionLoading === l.id}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(l.id)}
                                  disabled={actionLoading === l.id}
                                  className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-400 font-semibold italic font-mono">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Audit Center &bull; Environment Live
      </footer>
    </div>
  )
}
export default LeaveManagement
