import React, { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const { totalUnreadChat } = useNotifications() || {}
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const totalBadge = totalUnreadChat || 0

  return (
    <div className={`app-layout customer-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
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
            <span>🛒 Customer Portal</span>
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
          <div className="nav-section-title">Browse</div>
          <NavLink to="/menu" className={({isActive})=>`nav-item${isActive?' active':''}`} title="Menu">
            <span className="nav-icon">🍽️</span>
            <span className="nav-label">Menu</span>
          </NavLink>

          <div className="nav-section-title">My Account</div>
          <NavLink to="/my-orders" className={({isActive})=>`nav-item${isActive?' active':''}`} title="My Orders">
            <span className="nav-icon">📋</span>
            <span className="nav-label">My Orders</span>
            {totalBadge > 0 && (
              <span className="badge" style={{
                marginLeft:'auto', background:'var(--danger)', color:'#fff',
                borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:700
              }}>{totalBadge}</span>
            )}
          </NavLink>
          <NavLink to="/my-reservations" className={({isActive})=>`nav-item${isActive?' active':''}`} title="My Reservations">
            <span className="nav-icon">🗓️</span>
            <span className="nav-label">My Reservations</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <div className="avatar" style={{background:'var(--success)',color:'#fff'}}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{flex:1,overflow:'hidden'}}>
              <div style={{fontSize:'13px',fontWeight:600,color:'#e5e7eb',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {user?.fullName}
              </div>
              <div style={{fontSize:'11px',color:'#6b7280'}}>Customer</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{width:'100%',color:'#f87171'}} title="Logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content"><Outlet /></main>
    </div>
  )
}
