// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CustomerIndex from './components/customers/CustomerIndex';
import InstallButton from './components/pwa/InstallButton';
import OrderIndex from './components/orders/OrderIndex';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerIndex />} />
          <Route path="/orders" element={<OrderIndex />} />
          <Route path="/orders/create" element={
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Order</h2>
              {/* <p className="text-gray-600">Coming Soon...</p> */}
            </div>
          } />
          <Route path="/orders/:id" element={
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Detail</h2>
              {/* <p className="text-gray-600">Coming Soon...</p> */}
            </div>
          } />
          <Route path="/process" element={
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Process Page</h2>
              <p className="text-gray-600">Coming Soon...</p>
            </div>
          } />
          <Route path="/services" element={
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Services Page</h2>
              <p className="text-gray-600">Coming Soon...</p>
            </div>
          } />
        </Routes>
        <InstallButton />
      </Layout>
    </Router>
  );
};

export default App;