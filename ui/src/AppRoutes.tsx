import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies"
        element={
          <ProtectedRoute>
            <Policies />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
