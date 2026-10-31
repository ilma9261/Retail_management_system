import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';

import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Warehouses } from './pages/Warehouses';
import { Transfers } from './pages/Transfers';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Guard (prevents visiting login if already signed in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Public Register Route */}
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Management Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="warehouses" element={<Warehouses />} />
                <Route path="transfers" element={<Transfers />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Fallback to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
