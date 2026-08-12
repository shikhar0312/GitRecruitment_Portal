import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
  created_at: string;
}

export const EmployeeManagement: React.FC = () => {
  const { token, user, logout } = useAuth();

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    return dateObj.toLocaleDateString();
  };

  const fetchEmployees = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let query = '';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (deptFilter) query += `&department=${encodeURIComponent(deptFilter)}`;
      
      const res = await fetch(`${API_URL}/api/admin/employees?${query.slice(1)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else {
        throw new Error('Failed to load employee list.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token, search, deptFilter]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      name,
      email,
      password,
      role: 'Employee',
      department: department || null,
      designation: designation || null
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess('Employee added successfully!');
        await fetchEmployees();
        setTimeout(() => closeModal(), 1000);
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to add employee.');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEmp) return;
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      name,
      email,
      department: department || null,
      designation: designation || null
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/employees/${selectedEmp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess('Profile updated successfully!');
        await fetchEmployees();
        setTimeout(() => closeModal(), 1000);
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Failed to update employee.');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEmp) return;
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/employees/${selectedEmp.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setFormSuccess('Password reset successful!');
        setTimeout(() => closeModal(), 1000);
      } else {
        const errDetail = await res.json();
        throw new Error(errDetail.detail || 'Password reset failed.');
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteEmployee = async (empId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this employee? This will permanently remove all their tasks and clock-in history.')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/employees/${empId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchEmployees();
      } else {
        const errDetail = await res.json();
        alert(errDetail.detail || 'Delete operation failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPassword('');
    setDepartment('');
    setDesignation('');
    setFormError(null);
    setFormSuccess(null);
    setShowAddModal(true);
  };

  const openEditModal = (emp: EmployeeRecord) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department || '');
    setDesignation(emp.designation || '');
    setFormError(null);
    setFormSuccess(null);
    setShowEditModal(true);
  };

  const openResetModal = (emp: EmployeeRecord) => {
    setSelectedEmp(emp);
    setPassword('');
    setFormError(null);
    setFormSuccess(null);
    setShowResetModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowResetModal(false);
    setSelectedEmp(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const uniqueDepartments = Array.from(
    new Set(employees.map(e => e.department).filter(Boolean))
  ) as string[];

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
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Management Cockpit</h2>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition flex items-center gap-1 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Employee
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs shadow-sm text-left">
          <div className="space-y-1">
            <label className="text-slate-500 block uppercase font-bold text-[10px]">Search Employee</label>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or email address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-500 block uppercase font-bold text-[10px]">Filter by Department</label>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans cursor-pointer"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Table Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md text-left">
          {loading && employees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono">
              <div className="w-6 h-6 border-2 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-2"></div>
              Loading employees database...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-600 font-mono bg-rose-50">
              Query failed: {error}
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono italic">
              No staff profiles found. Click "Add Employee" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">NAME / DESIGNATION</th>
                    <th className="px-6 py-3.5 font-semibold">EMAIL</th>
                    <th className="px-6 py-3.5 font-semibold">DEPARTMENT</th>
                    <th className="px-6 py-3.5 font-semibold">JOIN DATE</th>
                    <th className="px-6 py-3.5 text-right font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 font-sans text-sm">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-sans">{emp.designation || 'Staff Lead'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{emp.email}</td>
                      <td className="px-6 py-4 text-slate-800">{emp.department || 'Operations'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(emp.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3 shrink-0">
                        <button 
                          onClick={() => openEditModal(emp)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => openResetModal(emp)}
                          className="text-[#f59e0b] hover:text-[#d97706] font-bold cursor-pointer"
                        >
                          Reset Pass
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
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

      </main>

      {/* --- ADD EMPLOYEE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative font-mono text-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Add Staff Employee</span>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
            </h3>
            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Connor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">Initial Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Department</label>
                  <input 
                    type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Designation</label>
                  <input 
                    type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Developer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2 font-bold cursor-pointer transition mt-2 shadow-sm">
                Submit Profile
              </button>

              {formError && <div className="text-rose-650 bg-rose-50 border border-rose-100 p-2 rounded text-[10px]">{formError}</div>}
              {formSuccess && <div className="text-emerald-650 bg-emerald-50 border border-emerald-100 p-2 rounded text-[10px]">{formSuccess}</div>}
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EMPLOYEE MODAL --- */}
      {showEditModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative font-mono text-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Edit Staff Profile</span>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
            </h3>
            <form onSubmit={handleEditEmployee} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">Full Name</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Connor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Department</label>
                  <input 
                    type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block uppercase font-bold text-[9px]">Designation</label>
                  <input 
                    type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Developer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                  />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2 font-bold cursor-pointer transition mt-2 shadow-sm">
                Save Changes
              </button>

              {formError && <div className="text-rose-650 bg-rose-50 border border-rose-100 p-2 rounded text-[10px]">{formError}</div>}
              {formSuccess && <div className="text-emerald-650 bg-emerald-50 border border-emerald-100 p-2 rounded text-[10px]">{formSuccess}</div>}
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD MODAL --- */}
      {showResetModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative font-mono text-xs text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Reset Staff Password</span>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
            </h3>
            <p className="text-slate-500 leading-normal text-[11px] font-sans">
              Set a new password for employee profile: <strong className="text-slate-900">{selectedEmp.name}</strong> ({selectedEmp.email}).
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-500 block uppercase font-bold text-[9px]">New Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] text-xs font-sans"
                />
              </div>
              
              <button type="submit" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg py-2 font-bold cursor-pointer transition mt-2 shadow-sm">
                Overwrite Password
              </button>

              {formError && <div className="text-rose-655 bg-rose-50 border border-rose-100 p-2 rounded text-[10px]">{formError}</div>}
              {formSuccess && <div className="text-emerald-655 bg-emerald-50 border border-emerald-100 p-2 rounded text-[10px]">{formSuccess}</div>}
            </form>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 py-4 text-center text-xs text-slate-400 border-t border-slate-800 mt-10">
        WorkTracker Admin Panel &bull; Environment Live
      </footer>
    </div>
  )
}
export default EmployeeManagement
