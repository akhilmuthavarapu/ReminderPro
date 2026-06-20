import React from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Templates } from './pages/Templates';
import { Scheduler } from './pages/Scheduler';
import { Reports } from './pages/Reports';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import { CustomerPortal } from './pages/CustomerPortal';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, roles = ['admin', 'owner', 'staff'] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Basic guard against unknown roles
  if (user && !roles.includes(user.role)) {
    // Determine the safest place to send them
    // If they were on dashboard, don't send them there or it will loop
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

export const appRoutes = [
  // Auth
  { path: '/login', element: <Login />, isPublic: true },
  { path: '/signup', element: <Signup />, isPublic: true },
  
  // Public Portal for End-Customers (Clients)
  { path: '/portal/:id', element: <CustomerPortal />, isPublic: true },
  
  // Dashboard Home
  { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  
  // Modules
  { path: '/customers', element: <ProtectedRoute roles={['admin', 'owner', 'staff']}><Customers /></ProtectedRoute> },
  { path: '/templates', element: <ProtectedRoute roles={['owner']}><Templates /></ProtectedRoute> },
  { path: '/scheduler', element: <ProtectedRoute roles={['owner', 'staff']}><Scheduler /></ProtectedRoute> },
  { path: '/reports', element: <ProtectedRoute roles={['owner']}><Reports /></ProtectedRoute> },
  { path: '/billing', element: <ProtectedRoute roles={['owner']}><Subscription /></ProtectedRoute> },
  { path: '/settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
  
  // Admin
  { path: '/admin', element: <ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute> },
];
