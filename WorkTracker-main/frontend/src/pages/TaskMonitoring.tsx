import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface EmployeeTaskSummary {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  assigned_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
}

interface TaskItem {
  id: number;
  employee_id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export const TaskMonitoring: React.FC = () => {
  const { token, user, logout } = useAuth();

  const [summaries, setSummaries] = useState<EmployeeTaskSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail drawer / modal states
  const [selectedEmp, setSelectedEmp] = useState<EmployeeTaskSummary | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchSummaries = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/api/admin/tasks/summary`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummaries(data);
      } else {
        throw new Error('Failed to retrieve task monitoring summaries.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTasks = async (emp: EmployeeTaskSummary) => {
    if (!token) return;
    setSelectedEmp(emp);
    setLoadingTasks(true);
    setTasksError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/tasks/employee/${emp.employee_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        throw new Error('Failed to fetch detailed employee tasks.');
      }
    } catch (err: any) {
      setTasksError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [token, search]);

  const closeDrawer = () => {
    setSelectedEmp(null);
    setTasks([]);
  };

  const parseUTCString = (isoString: string | null | undefined) => {
    if (!isoString) return null;
    if (isoString.includes('T') && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString)) {
      return new Date(isoString + 'Z');
    }
    return new Date(isoString);
  };

  const formatDateTime = (isoString: string | null) => {
    const dateObj = parseUTCString(isoString);
    if (!dateObj) return '--:--';
    return dateObj.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <Link to="/admin/dashboard" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold font-mono flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO DASHBOARD
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Task Monitoring</h2>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl font-mono text-xs shadow-sm text-left">
          <div className="space-y-1">
            <label className="text-slate-500 block uppercase font-bold text-[10px]">Filter Staff Members</label>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name or email address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
            />
          </div>
        </div>

        {/* Audit Table Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md text-left">
          {loading && summaries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono">
              <div className="w-6 h-6 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-2"></div>
              Calculating staff task ratios...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 font-mono bg-rose-50">
              Query failed: {error}
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono italic">
              No staff members found matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">EMPLOYEE</th>
                    <th className="px-6 py-3.5 font-semibold">DEPARTMENT</th>
                    <th className="px-6 py-3.5 font-semibold">ASSIGNED TASKS</th>
                    <th className="px-6 py-3.5 font-semibold">COMPLETED</th>
                    <th className="px-6 py-3.5 font-semibold">PENDING</th>
                    <th className="px-6 py-3.5 font-semibold text-right">COMPLETION RATIO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {summaries.map((emp) => {
                    const ratio = emp.assigned_tasks > 0 ? Math.round((emp.completed_tasks / emp.assigned_tasks) * 100) : 0;
                    return (
                      <tr 
                        key={emp.employee_id} 
                        onClick={() => fetchEmployeeTasks(emp)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors font-sans text-sm">{emp.employee_name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-sans">{emp.designation}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-sans">{emp.department}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{emp.assigned_tasks}</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">{emp.completed_tasks}</td>
                        <td className="px-6 py-4 text-rose-600 font-bold">{emp.pending_tasks}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-3 justify-end">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all" 
                                style={{ width: `${ratio}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{ratio}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* --- TASK DETAILS DRAWER / MODAL --- */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative font-mono text-xs max-h-[85vh] flex flex-col justify-between text-left">
            
            {/* Drawer Header */}
            <div className="border-b border-slate-200 pb-3 flex justify-between items-start shrink-0">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Detailed Tasks History</span>
                <h3 className="text-md font-bold text-slate-900 mt-0.5">
                  {selectedEmp.employee_name} ({selectedEmp.employee_email})
                </h3>
              </div>
              <button 
                onClick={closeDrawer}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer font-bold"
              >
                Close View
              </button>
            </div>

            {/* Drawer tasks logs body */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-3 my-2 min-h-[30vh]">
              {loadingTasks ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-5 h-5 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-2"></div>
                  Querying detailed sheets...
                </div>
              ) : tasksError ? (
                <div className="py-8 text-center text-rose-600">
                  Error loading records: {tasksError}
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">
                  No tasks assigned to this employee.
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-slate-900 font-bold text-sm tracking-tight font-sans">{task.title}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            task.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-slate-600 leading-relaxed text-[11px] font-sans">{task.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2 text-[9px] text-slate-400">
                        <div>
                          <span className="text-slate-400 block font-bold">STARTED AT</span>
                          <span className="text-slate-800 font-semibold">{formatDateTime(task.start_time)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">COMPLETED AT</span>
                          <span className="text-slate-800 font-semibold">{formatDateTime(task.end_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
              <span>Total rows: {tasks.length}</span>
              <span>WorkTracker Audit Center</span>
            </div>

          </div>
        </div>
      )}

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Admin Panel &bull; Environment Live
      </footer>
    </div>
  )
}
export default TaskMonitoring
