// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CustomerIndex from './components/customers/CustomerIndex';
import InstallButton from './components/pwa/InstallButton';
import OrderIndex from './components/orders/OrderIndex';
import CreateOrder from './components/orders/CreateOrder';
import OrderDetail from './components/orders/OrderDetail';
import Login from './components/auth/Login';
import Profile from './components/profile/Profile';
import ServicesIndex from './components/services/servicesIndex';
import ProcessIndex from './components/process/ProcessIndex';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomerIndex />} />
                  <Route path="/orders" element={<OrderIndex />} />
                  <Route path="/orders/create" element={<CreateOrder />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/process" element={<ProcessIndex />} />
                  <Route path="/services" element={<ServicesIndex />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                <InstallButton />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;