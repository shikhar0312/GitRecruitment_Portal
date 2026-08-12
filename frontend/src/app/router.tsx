import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { RequirementsPage } from '../features/requirements/pages/RequirementsPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CandidatesPage } from '../features/candidates/pages/CandidatesPage';
import { AllocationsPage } from '../features/allocations/pages/AllocationsPage';
import { TrackerPage } from '../features/tracker/pages/TrackerPage';
import { RolesPage } from '../features/roles/pages/RolesPage';
import { WorkTrackerEmbedPage } from '../features/tracker/pages/WorkTrackerEmbedPage';
import { ProtectedRoute, PermissionRoute, RouteAccessGuard, RoleRoute } from './guards';

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/worktracker-app" element={<WorkTrackerEmbedPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <PermissionRoute permission="view_dashboard">
              <DashboardPage />
            </PermissionRoute>
          }
        />
        <Route
          path="requirements"
          element={
            <PermissionRoute permission="view_requirements">
              <RequirementsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="candidates"
          element={
            <PermissionRoute permission="view_candidates">
              <CandidatesPage />
            </PermissionRoute>
          }
        />
        <Route
          path="allocations"
          element={
            <PermissionRoute permission="view_allocations">
              <AllocationsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="customers"
          element={
            <PermissionRoute permission="view_customers">
              <CustomersPage />
            </PermissionRoute>
          }
        />
        <Route
          path="tracker"
          element={
            <RouteAccessGuard path="/tracker">
              <PermissionRoute permission="view_tracker">
                <TrackerPage />
              </PermissionRoute>
            </RouteAccessGuard>
          }
        />
        <Route
          path="admin/roles"
          element={
            <RoleRoute roles={['admin']}>
              <RolesPage />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>
);
