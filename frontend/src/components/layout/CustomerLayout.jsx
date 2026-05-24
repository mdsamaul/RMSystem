import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const { totalUnreadChat, totalUnreadOrders } = useNotifications() || {}

  const totalBadge = (totalUnreadChat || 0)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🍽️</div>
          <div><h1>Restaurant MS</h1><span>🛒 Customer Portal</span></div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Browse</div>
          <NavLink to="/menu" className={({isActive})=>`nav-item${isActive?' active':''}`}>
            <span className="nav-icon">🍽️</span> Menu
          </NavLink>
          <div className="nav-section-title">My Account</div>
          <NavLink to="/my-orders" className={({isActive})=>`nav-item${isActive?' active':''}`}>
            <span className="nav-icon">📋</span>
            My Orders
            {totalBadge > 0 && (
              <span className="badge" style={{
                marginLeft:'auto', background:'var(--danger)', color:'#fff',
                borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:700
              }}>{totalBadge}</span>
            )}
          </NavLink>
          <NavLink to="/my-reservations" className={({isActive})=>`nav-item${isActive?' active':''}`}>
            <span className="nav-icon">📅</span> My Reservations
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <div className="avatar" style={{background:'var(--success)',color:'#fff'}}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:600,color:'#e5e7eb'}}>{user?.fullName}</div>
              <div style={{fontSize:'11px',color:'#6b7280'}}>Customer</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{width:'100%',color:'#f87171'}}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}
