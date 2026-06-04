import React, { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { section: 'Overview' },
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'Operations' },
  { to: '/admin/orders', icon: '📋', label: 'Orders' },
  { to: '/admin/tables', icon: '🪑', label: 'Tables' },
  { to: '/admin/reservations', icon: '🗓️', label: 'Reservations' },
  { section: 'Menu' },
  { to: '/admin/menu', icon: '🍽️', label: 'Menu Management' },
  { section: 'Admin Only', adminOnly: true },
  { to: '/admin/users', icon: '👥', label: 'Users', adminOnly: true },
  { to: '/admin/reports', icon: '📈', label: 'Reports', adminOnly: true },
]

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={`app-layout admin-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <aside
        className="sidebar"
        onClick={() => {
          if (!sidebarOpen) setSidebarOpen(true)
        }}
      >
        <div className="sidebar-logo">
          <div className="logo-icon">🍽️</div>
          <div className="sidebar-brand">
            <h1>Restaurant MS</h1>
            <span>{isAdmin ? '⚙️ Admin Panel' : '👨‍🍳 Staff Panel'}</span>
          </div>
          <button
            type="button"
            className="sidebar-logo-toggle"
            onClick={(event) => {
              event.stopPropagation()
              setSidebarOpen(false)
            }}
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {adminNav.map((item, i) => {
            if (item.section) {
              if (item.adminOnly && !isAdmin) return null
              return <div key={i} className="nav-section-title">{item.section}</div>
            }
            if (item.adminOnly && !isAdmin) return null
            return (
              <NavLink key={item.to} to={item.to} className={({isActive})=>`nav-item${isActive?' active':''}`} title={item.label}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
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
          <button className="nav-item" onClick={logout} style={{width:'100%',color:'#f87171'}} title="Logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
