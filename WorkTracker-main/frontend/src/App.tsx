import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AttendanceHistory from './pages/AttendanceHistory'
import EmployeeReports from './pages/EmployeeReports'
import EmployeeManagement from './pages/EmployeeManagement'
import AttendanceMonitoring from './pages/AttendanceMonitoring'
import TaskMonitoring from './pages/TaskMonitoring'
import WeeklyReports from './pages/WeeklyReports'
import LeaveManagement from './pages/LeaveManagement'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

function HomeRedirect() {
  const { token, user } = useAuth();
  if (token && user) {
    return user.role === 'Admin' 
      ? <Navigate to="/admin/dashboard" replace /> 
      : <Navigate to="/employee/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employee/attendance-history" 
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <AttendanceHistory />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employee/reports" 
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <EmployeeReports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/employees" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <EmployeeManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/attendance-monitoring" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AttendanceMonitoring />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/task-monitoring" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <TaskMonitoring />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/weekly-reports" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
              <WeeklyReports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/leaves" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
              <LeaveManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  )
}

export default App
