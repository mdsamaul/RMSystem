import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rms_token')
    const saved = localStorage.getItem('rms_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      userAPI.getProfile().then(r => {
        const u = { ...r.data.data, token }
        setUser(u); localStorage.setItem('rms_user', JSON.stringify(u))
      }).catch(() => logout()).finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password })
    const d = r.data.data
    localStorage.setItem('rms_token', d.accessToken)
    const u = { email: d.email, fullName: d.fullName, role: d.role, token: d.accessToken }
    localStorage.setItem('rms_user', JSON.stringify(u))
    setUser(u)
    toast.success(`Welcome back, ${d.fullName}! 👋`)
    return d.role
  }

  const register = async (data) => {
    const r = await authAPI.register(data)
    const d = r.data.data
    localStorage.setItem('rms_token', d.accessToken)
    const u = { email: d.email, fullName: d.fullName, role: d.role, token: d.accessToken }
    localStorage.setItem('rms_user', JSON.stringify(u))
    setUser(u)
    toast.success('Account created successfully! 🎉')
    return d.role
  }

  const logout = () => {
    localStorage.clear(); setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN', isStaff: user?.role === 'STAFF', isCustomer: user?.role === 'CUSTOMER' }}>
      {children}
    </AuthContext.Provider>
  )
}
