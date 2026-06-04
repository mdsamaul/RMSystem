import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({ fullName: '', email: '', password: '', phone: '' })
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const role = await login(loginData.email, loginData.password)
      navigate(role === 'CUSTOMER' ? '/menu' : '/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleRegister = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await register(regData)
      navigate('/menu')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const quickLogin = async (email, pass) => {
    setLoading(true)
    try {
      const role = await login(email, pass)
      navigate(role === 'CUSTOMER' ? '/menu' : '/admin/dashboard')
    } catch { toast.error('Login failed') } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon">🍽️</div>
          <h1>Restaurant MS</h1>
          <p>Manage your restaurant with ease</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>Register</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="admin@rms.com" required
                value={loginData.email} onChange={e=>setLoginData({...loginData,email:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})}/>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your Name" required
                value={regData.fullName} onChange={e=>setRegData({...regData,fullName:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" required
                value={regData.email} onChange={e=>setRegData({...regData,email:e.target.value})}/>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min 6 chars" required
                  value={regData.password} onChange={e=>setRegData({...regData,password:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="01XXXXXXXXX"
                  value={regData.phone} onChange={e=>setRegData({...regData,phone:e.target.value})}/>
              </div>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
              {loading ? '⏳ Creating...' : '✨ Create Account'}
            </button>
          </form>
        )}

        <div className="divider"></div>
        <p style={{textAlign:'center',fontSize:'12px',color:'var(--text-muted)',marginBottom:'10px',fontWeight:600}}>QUICK LOGIN — DEMO ACCOUNTS</p>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}} onClick={()=>quickLogin('admin@rms.com','admin123')} disabled={loading}>
            🔴 Admin
          </button>
          <button className="btn btn-secondary btn-sm" style={{flex:1,justifyContent:'center'}} onClick={()=>quickLogin('staff@rms.com','staff123')} disabled={loading}>
            🟡 Staff
          </button>
        </div>
      </div>
    </div>
  )
}
