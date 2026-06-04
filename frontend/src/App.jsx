import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import AuthPage from './pages/auth/AuthPage'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MenuManagement from './pages/admin/MenuManagement'
import OrdersPage from './pages/admin/OrdersPage'
import TablesPage from './pages/admin/TablesPage'
import ReservationsPage from './pages/admin/ReservationsPage'
import UsersPage from './pages/admin/UsersPage'
import ReportsPage from './pages/admin/ReportsPage'
import CustomerLayout from './components/layout/CustomerLayout'
import MenuPage from './pages/customer/MenuPage'
import MyOrders from './pages/customer/MyOrders'
import MyReservations from './pages/customer/MyReservations'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN' || user.role === 'STAFF') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/menu" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<AuthPage />} />

      {/* Admin / Staff Routes */}
      <Route path="/admin" element={<PrivateRoute roles={['ADMIN','STAFF']}><AdminLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="users" element={<PrivateRoute roles={['ADMIN']}><UsersPage /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute roles={['ADMIN']}><ReportsPage /></PrivateRoute>} />
      </Route>

      {/* Customer Routes */}
      <Route path="/" element={<PrivateRoute roles={['CUSTOMER']}><CustomerLayout /></PrivateRoute>}>
        <Route path="menu" element={<MenuPage />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="my-reservations" element={<MyReservations />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthProvider><NotificationProvider><AppRoutes /></NotificationProvider></AuthProvider>
}
