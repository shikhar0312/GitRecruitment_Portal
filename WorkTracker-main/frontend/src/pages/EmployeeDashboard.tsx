import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface AttendanceRecord {
  id: number;
  date: string;
  login_time: string;
  logout_time: string | null;
  working_hours: number | null;
}

interface TaskRecord {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export const EmployeeDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  
  // Attendance States
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Task States
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Task Form States
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Notification States
  const [notifications, setNotifications] = useState<{ id: string; type: string; category: string; message: string; date: string }[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Attendance Actions ---
  const fetchTodayAttendance = async () => {
    if (!token) return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      } else {
        throw new Error('Failed to load attendance log.');
      }
    } catch (err: any) {
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!token) return;
    setActionLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
        fetchNotifications();
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Clock in request failed.');
      }
    } catch (err: any) {
      setAttendanceError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!token) return;
    setActionLoading(true);
    setAttendanceError(null);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-out`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
        fetchNotifications();
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Clock out request failed.');
      }
    } catch (err: any) {
      setAttendanceError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Task Actions ---
  const fetchTasks = async () => {
    if (!token) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        throw new Error('Failed to load tasks.');
      }
    } catch (err: any) {
      setTasksError(err.message);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);

    const buildIso = (dateVal: string) => {
      if (!dateVal) return null;
      const d = new Date(`${dateVal}T00:00:00`);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    };

    const payload = {
      title: taskTitle,
      description: taskDesc || null,
      priority: taskPriority,
      status: taskStatus,
      start_time: buildIso(taskStartDate),
      end_time: buildIso(taskEndDate),
    };

    try {
      let res;
      if (editingTask) {
        // Update
        res = await fetch(`${API_URL}/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch(`${API_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await fetchTasks();
        resetTaskForm();
        fetchNotifications();
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to submit task.');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleQuickComplete = async (taskId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchTasks();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchTasks();
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task: TaskRecord) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    
    if (task.start_time) {
      const d = parseUTCString(task.start_time) || new Date();
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      setTaskStartDate(dateStr);
    } else {
      setTaskStartDate('');
    }
    
    if (task.end_time) {
      const d = parseUTCString(task.end_time) || new Date();
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      setTaskEndDate(dateStr);
    } else {
      setTaskEndDate('');
    }
    setShowForm(true);
  };

  const resetTaskForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskStatus('To Do');
    setTaskStartDate('');
    setTaskEndDate('');
    setFormError(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchTasks();
    fetchNotifications();
  }, [token]);

  const parseUTCString = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    if (isoString.includes('T') && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString + 'Z');
    }
    return new Date(isoString);
  };

  // Format Helper
  const formatTime = (isoString: string | null | undefined) => {
    const dateObj = parseUTCString(isoString);
    if (!dateObj) return '--:--';
    return dateObj.toLocaleTimeString();
  };

  const formatDate = (isoString: string) => {
    const dateObj = parseUTCString(isoString);
    if (!dateObj) return '--/--/----';
    return dateObj.toLocaleDateString();
  };

  // Filter for today's tasks
  const todayString = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => {
    const createdDate = t.created_at.split('T')[0];
    const startDate = t.start_time ? t.start_time.split('T')[0] : '';
    return createdDate === todayString || startDate === todayString || t.status !== 'Completed';
  });

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
          {/* Notification bell widget */}
          <div className="relative z-20 no-print">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg text-slate-500 hover:text-slate-900 transition relative cursor-pointer flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown details card */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 space-y-3 z-30 font-mono text-[11px] text-left">
                <h4 className="font-bold text-slate-900 uppercase border-b border-slate-100 pb-1.5 flex justify-between items-center text-[10px]">
                  <span>Notifications</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotifDropdown(false); }} 
                    className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
                  >
                    Close
                  </button>
                </h4>
                {notifications.length === 0 ? (
                  <p className="text-slate-400 italic py-2 text-center">No new notifications.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                    {notifications.map((n, i) => (
                      <div key={n.id || i} className={`p-2.5 rounded-lg border ${
                        n.type === 'warning' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}>
                        <div className="font-bold uppercase text-[9px] tracking-wider mb-0.5 text-[8px]">
                          {n.category.replace('_', ' ')}
                        </div>
                        <p className="leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 flex-grow space-y-6 z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-left">
          <div className="space-y-1 max-w-md">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Track your working hours, check your checklist, and update task statuses.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <Link 
              to="/employee/attendance-history" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-violet-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>View History</span>
            </Link>
            <Link 
              to="/employee/reports" 
              className="inline-flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-800 transition shadow-sm font-sans shrink-0"
            >
              <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <span>Performance Reports</span>
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
          </div>
        </div>

        {/* Dashboard Status Row */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 w-full text-left">
          {/* Clock In / Out Toggle Widget */}
          <div className="bg-white border border-slate-200/80 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm flex-grow">
            {attendanceLoading ? (
              <div className="flex items-center gap-2 px-6 py-1">
                <div className="w-4 h-4 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-mono">Syncing...</span>
              </div>
            ) : (
              <>
                <div className="font-mono">
                  <p className="text-[9px] text-slate-400 uppercase font-bold">ATTENDANCE LOG STATUS</p>
                  {!attendance && (
                    <p className="text-sm text-slate-500 font-bold font-sans mt-0.5">NOT CLOCKED IN TODAY</p>
                  )}
                  {attendance && !attendance.logout_time && (
                    <p className="text-sm text-emerald-600 font-bold font-sans mt-0.5">ACTIVE WORK SESSION (In: {formatTime(attendance.login_time)})</p>
                  )}
                  {attendance && attendance.logout_time && (
                    <p className="text-sm text-slate-700 font-bold font-sans mt-0.5">SESSION COMPLETED ({attendance.working_hours} hours logged)</p>
                  )}
                </div>
                
                {!attendance && (
                  <button 
                    onClick={handleClockIn}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold font-mono cursor-pointer transition-all disabled:opacity-50 shadow-sm"
                  >
                    {actionLoading ? 'Clocking In...' : 'Clock In'}
                  </button>
                )}

                {attendance && !attendance.logout_time && (
                  <button 
                    onClick={handleClockOut}
                    disabled={actionLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-semibold font-mono cursor-pointer transition-all disabled:opacity-50 shadow-sm"
                  >
                    {actionLoading ? 'Clocking Out...' : 'Clock Out'}
                  </button>
                )}

                {attendance && attendance.logout_time && (
                  <button 
                    disabled
                    className="bg-slate-100 border border-slate-200 px-5 py-2 rounded-xl text-xs font-semibold font-mono cursor-not-allowed text-slate-400"
                  >
                    Clocked Out
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dynamic warning notifications block */}
          {notifications.some(n => n.type === 'warning') && (
            <div className="bg-rose-50 border border-rose-200/80 p-5 rounded-2xl space-y-2 no-print flex-grow md:w-1/3">
              <h4 className="text-[10px] font-extrabold text-rose-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-rose-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Urgent Alerts
              </h4>
              <ul className="space-y-1 text-rose-600 text-xs font-mono">
                {notifications.filter(n => n.type === 'warning').map((n, i) => (
                  <li key={n.id || i} className="flex items-start gap-1">
                    <span>&bull;</span>
                    <span>{n.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Display Error if attendance request fails */}
        {attendanceError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-mono text-left">
            Error: {attendanceError}
          </div>
        )}

        {/* Dynamic split grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Panel: Stats and metadata */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Clock-in Details summary card */}
            {attendance && (
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-md font-mono text-xs text-left">
                <h3 className="text-slate-900 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                  Daily Timesheet details
                </h3>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold text-[9px] uppercase">Clock Date:</span>
                  <span className="text-slate-800 font-semibold">{formatDate(attendance.date)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold text-[9px] uppercase">Clock-In Time:</span>
                  <span className="text-slate-800 font-semibold">{formatTime(attendance.login_time)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold text-[9px] uppercase">Clock-Out Time:</span>
                  <span className="text-slate-800 font-semibold">{formatTime(attendance.logout_time)}</span>
                </div>
                {attendance.working_hours !== null && (
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-slate-900 font-semibold">
                    <span>Computed hours:</span>
                    <span className="font-bold text-sm">{attendance.working_hours} hours</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-white p-4 rounded-xl text-slate-500 text-xs border border-slate-200/80 shadow-sm text-left">
              <strong className="text-slate-800 block mb-1 font-bold">Assigned Rights:</strong>
              You are signed in as an employee. This grants capabilities to submit daily timesheets, log specific work descriptions, and update project tracker states.
            </div>
          </div>

          {/* Right Panel: Task Management Table */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Task Form (Create/Edit) */}
            {showForm && (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-md text-left">
                <h3 className="text-sm font-bold text-slate-900 font-mono flex justify-between items-center border-b border-slate-100 pb-2">
                  <span>{editingTask ? 'EDIT TASK DETAILS' : 'CREATE NEW WORK TASK'}</span>
                  <button onClick={resetTaskForm} className="text-slate-400 hover:text-slate-600 text-xs uppercase cursor-pointer">Cancel</button>
                </h3>
                <form onSubmit={handleCreateOrUpdateTask} noValidate className="space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 block uppercase font-bold text-[9px]">Task Title</label>
                    <input 
                      type="text" 
                      required 
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Verify deployment logs..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block uppercase font-bold text-[9px]">Description (Optional)</label>
                    <textarea 
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      placeholder="Add brief details about the task tasking details..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 block uppercase font-bold text-[9px]">Priority</label>
                      <select 
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block uppercase font-bold text-[9px]">Status</label>
                      <select 
                        value={taskStatus}
                        onChange={(e) => setTaskStatus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Start Date (Optional)</label>
                      <input 
                        type="date" 
                        value={taskStartDate}
                        onChange={(e) => setTaskStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider font-mono">End Date (Optional)</label>
                      <input 
                        type="date" 
                        value={taskEndDate}
                        onChange={(e) => setTaskEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2 font-bold cursor-pointer transition"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>

                  {formError && (
                    <div className="text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded text-[10px]">
                      {formError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Tasks checklist container */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-md text-left">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
                  Project Checklist
                </h3>
                {!showForm && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-3.5 py-1 rounded-lg text-xs font-semibold font-mono cursor-pointer transition shadow-sm"
                  >
                    + ADD TASK
                  </button>
                )}
              </div>

              {tasksLoading && tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono">
                  Loading Checklist...
                </div>
              ) : tasksError ? (
                <div className="p-8 text-center text-rose-600 font-mono">
                  Error loading checklist: {tasksError}
                </div>
              ) : todaysTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono italic">
                  No active checklist logs. Click + ADD TASK to begin tracking.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">TASK</th>
                        <th className="px-6 py-3 font-semibold">DATES</th>
                        <th className="px-6 py-3 font-semibold">PRIORITY</th>
                        <th className="px-6 py-3 font-semibold">STATUS</th>
                        <th className="px-6 py-3 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {todaysTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900 font-sans text-sm">{task.title}</p>
                            <p className="text-[11px] text-slate-500 font-sans mt-0.5">{task.description || 'No description provided'}</p>
                          </td>
                          <td className="px-6 py-4 text-[10px] text-slate-500">
                            <div>START: {task.start_time ? formatDate(task.start_time) : 'Immediate'}</div>
                            <div className="mt-0.5">DUE: {task.end_time ? formatDate(task.end_time) : 'No deadline'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                task.status === 'Completed' ? 'bg-emerald-500' :
                                task.status === 'In Progress' ? 'bg-indigo-500' :
                                'bg-slate-400'
                              }`}></span>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3 shrink-0">
                            {task.status !== 'Completed' && (
                              <button 
                                onClick={() => handleQuickComplete(task.id)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                                title="Mark Completed"
                              >
                                Done
                              </button>
                            )}
                            <button 
                              onClick={() => startEdit(task)}
                              className="text-[#f59e0b] hover:text-[#d97706] font-bold cursor-pointer"
                              title="Edit Task"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                              title="Delete Task"
                            >
                              Delete
                            </button>
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

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Tracker Control Dashboard &bull; Live
      </footer>
    </div>
  )
}
export default EmployeeDashboard
