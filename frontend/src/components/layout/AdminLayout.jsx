import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { section: 'Overview' },
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'Operations' },
  { to: '/admin/orders', icon: '📋', label: 'Orders' },
  { to: '/admin/tables', icon: '🪑', label: 'Tables' },
  { to: '/admin/reservations', icon: '📅', label: 'Reservations' },
  { section: 'Menu' },
  { to: '/admin/menu', icon: '🍽️', label: 'Menu Management' },
  { section: 'Admin Only', adminOnly: true },
  { to: '/admin/users', icon: '👥', label: 'Users', adminOnly: true },
  { to: '/admin/reports', icon: '📈', label: 'Reports', adminOnly: true },
]

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🍽️</div>
          <div>
            <h1>Restaurant MS</h1>
            <span>{isAdmin ? '⚙️ Admin Panel' : '👨‍🍳 Staff Panel'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {adminNav.map((item, i) => {
            if (item.section) {
              if (item.adminOnly && !isAdmin) return null
              return <div key={i} className="nav-section-title">{item.section}</div>
            }
            if (item.adminOnly && !isAdmin) return null
            return (
              <NavLink key={item.to} to={item.to} className={({isActive})=>`nav-item${isActive?' active':''}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <div className="avatar" style={{background:'var(--primary)',color:'#fff'}}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{flex:1,overflow:'hidden'}}>
              <div style={{fontSize:'13px',fontWeight:600,color:'#e5e7eb',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {user?.fullName}
              </div>
              <div style={{fontSize:'11px',color:'#6b7280'}}>{user?.role}</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{width:'100%',color:'#f87171'}}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
